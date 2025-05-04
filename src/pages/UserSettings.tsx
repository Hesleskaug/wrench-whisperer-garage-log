
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useGarage } from '@/contexts/GarageContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from 'sonner';
import { ArrowLeft, Copy, Mail } from 'lucide-react';
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";

const UserSettings = () => {
  const { garageId, loading, leaveGarage } = useGarage();
  const navigate = useNavigate();
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const form = useForm({
    defaultValues: {
      email: '',
    },
  });
  
  // Redirect if no garage ID is present
  if (!loading && !garageId) {
    return <Navigate to="/garage" />;
  }
  
  const handleCopyGarageId = () => {
    if (garageId) {
      navigator.clipboard.writeText(garageId);
      toast.success('Garage ID copied to clipboard');
    }
  };
  
  const handleExitGarage = async () => {
    leaveGarage();
    navigate('/garage');
  };
  
  const handleSendEmail = async (values: { email: string }) => {
    if (!garageId) return;
    
    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-garage-id', {
        body: { email: values.email, garageId }
      });
      
      if (error) throw error;
      
      toast.success('Garage ID sent to your email');
      setEmailDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email. Please try again.');
    } finally {
      setIsSending(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/')}
        className="mb-6"
      >
        <ArrowLeft size={16} className="mr-1" /> Back to Garage
      </Button>
      
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-mechanic-blue">Settings</h1>
        
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Garage Information</CardTitle>
              <CardDescription>
                Your unique garage identifier
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-muted-foreground mb-1">Garage ID:</p>
                <div className="flex items-center justify-between bg-muted p-3 rounded">
                  <code className="text-sm break-all mr-2">{garageId}</code>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={handleCopyGarageId}
                  >
                    <Copy size={16} />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Save this ID to access your garage again in the future. Without it, you won't be able to access your data.
                </p>
                
                <Button 
                  variant="outline" 
                  className="mt-4 flex gap-2"
                  onClick={() => setEmailDialogOpen(true)}
                >
                  <Mail size={16} /> Email My Garage ID
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Actions here cannot be undone
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Exit garage</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  This will remove your garage ID from this device. Make sure you've saved your garage ID first!
                </p>
                <Button 
                  variant="outline" 
                  className="text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={handleExitGarage}
                >
                  Exit Garage
                </Button>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Reset all data</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  This will clear all your vehicle data from this browser
                </p>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="text-destructive border-destructive/30 hover:bg-destructive/10"
                    >
                      Reset Data
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete all your
                        locally saved vehicle data and service logs.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => {
                          // Clear all vehicle data from localStorage
                          localStorage.removeItem('mockVehicles');
                          localStorage.removeItem('mockServiceLogs');
                          toast.success('All data has been reset');
                        }}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Reset All Data
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Email Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Email your Garage ID</DialogTitle>
            <DialogDescription>
              Send your Garage ID to your email address for safekeeping.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSendEmail)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                rules={{ 
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email address</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="your.email@example.com" 
                        type="email" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEmailDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSending}>
                  {isSending ? "Sending..." : "Send Email"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserSettings;
