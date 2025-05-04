
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useGarage } from '@/contexts/GarageContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from 'sonner';
import { ArrowLeft, Copy } from 'lucide-react';

const UserSettings = () => {
  const { garageId, loading, leaveGarage } = useGarage();
  const navigate = useNavigate();
  
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
    </div>
  );
};

export default UserSettings;
