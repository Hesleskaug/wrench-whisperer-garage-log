
import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useGarage } from '@/contexts/GarageContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from 'sonner';
import { Mail } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

const GarageAccess = () => {
  const { garageId, loading, createGarage, accessGarage } = useGarage();
  const navigate = useNavigate();
  const [garageIdInput, setGarageIdInput] = useState('');
  const [activeTab, setActiveTab] = useState('access');
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }
  
  if (garageId) {
    return <Navigate to="/" />;
  }
  
  const handleCreateGarage = async () => {
    createGarage();
    // After garage creation, we wait a bit for the state to update before attempting to email
    setTimeout(() => {
      toast.info("Remember to save your garage ID! You'll need it to access your garage later.");
    }, 500);
  };

  const handleSendEmail = async () => {
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSending(true);
    try {
      // We need to get the latest garageId from local storage
      const storedGarageId = localStorage.getItem('wrench_whisperer_garage_id');
      
      if (!storedGarageId) {
        toast.error("No garage ID available to send");
        setIsSending(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('send-garage-id', {
        body: { email, garageId: storedGarageId }
      });
      
      if (error) throw error;
      
      toast.success('Garage ID sent to your email');
      setEmail('');
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email. Please try again.');
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <div className="container flex items-center justify-center min-h-screen py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-mechanic-blue">Wrench Whisperer</h1>
          <p className="text-mechanic-gray">Track and manage your vehicle maintenance</p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="access">Access Garage</TabsTrigger>
            <TabsTrigger value="create">Create New</TabsTrigger>
          </TabsList>
          
          <TabsContent value="access">
            <Card>
              <CardHeader>
                <CardTitle>Access Your Garage</CardTitle>
                <CardDescription>
                  Enter your garage ID to access your vehicles
                </CardDescription>
              </CardHeader>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                accessGarage(garageIdInput);
              }}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="garageId">Garage ID</Label>
                    <Input 
                      id="garageId" 
                      type="text" 
                      placeholder="Enter your garage ID" 
                      value={garageIdInput}
                      onChange={(e) => setGarageIdInput(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full bg-mechanic-blue hover:bg-mechanic-blue/90"
                  >
                    Access Garage
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>Create New Garage</CardTitle>
                <CardDescription>
                  Start fresh with a new garage to track your vehicles
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Click below to create a new garage. You'll receive a unique ID that you can use to access your garage later.
                </p>
                <div className="space-y-2 pt-2">
                  <p className="text-sm font-medium text-destructive">⚠️ Important!</p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Make sure to save your garage ID somewhere safe</strong>. Without it, 
                    you won't be able to access your garage and vehicle information later.
                  </p>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-4">
                <Button 
                  onClick={handleCreateGarage} 
                  className="w-full bg-mechanic-blue hover:bg-mechanic-blue/90"
                >
                  Create New Garage
                </Button>

                <div className="border-t w-full pt-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email your Garage ID for safekeeping</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <Button 
                        type="button" 
                        onClick={handleSendEmail}
                        disabled={isSending}
                        variant="outline"
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        {isSending ? 'Sending...' : 'Send'}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      We'll email you your garage ID so you won't lose it
                    </p>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GarageAccess;
