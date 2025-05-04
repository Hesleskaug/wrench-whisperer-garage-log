
import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useGarage } from '@/contexts/GarageContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const GarageAccess = () => {
  const { garageId, loading, createGarage, accessGarage } = useGarage();
  const navigate = useNavigate();
  const [garageIdInput, setGarageIdInput] = useState('');
  const [activeTab, setActiveTab] = useState('access');
  
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
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-4">
                <Button 
                  onClick={createGarage} 
                  className="w-full bg-mechanic-blue hover:bg-mechanic-blue/90"
                >
                  Create New Garage
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Make sure to save your garage ID somewhere safe
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GarageAccess;
