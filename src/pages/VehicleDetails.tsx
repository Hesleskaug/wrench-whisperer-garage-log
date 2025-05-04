
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import ServiceHistoryTable from "@/components/ServiceHistoryTable";
import ServiceLogForm from "@/components/ServiceLogForm";
import VehicleSpecsCard from "@/components/VehicleSpecsCard";
import { ArrowLeft, Wrench, CarFront, FileText } from "lucide-react";
import { Vehicle, ServiceLog, VehicleSpecs, mockVehicles, mockServiceLogs, mockVehicleSpecs } from "@/utils/mockData";
import { toast } from "sonner";

const VehicleDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | undefined>();
  const [serviceLogs, setServiceLogs] = useState<ServiceLog[]>(mockServiceLogs);
  const [specs, setSpecs] = useState<VehicleSpecs | undefined>();
  const [serviceLogDialogOpen, setServiceLogDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would be an API call
    const foundVehicle = mockVehicles.find(v => v.id === id);
    const vehicleSpecs = mockVehicleSpecs.find(s => s.vehicleId === id);
    
    if (foundVehicle) {
      setVehicle(foundVehicle);
      setSpecs(vehicleSpecs);
    } else {
      toast.error("Vehicle not found");
      navigate('/');
    }
    
    setLoading(false);
  }, [id, navigate]);

  const handleAddServiceLog = (serviceLog: ServiceLog) => {
    setServiceLogs(prev => [...prev, serviceLog]);
    
    // Update vehicle mileage if the service log has a higher mileage
    if (vehicle && serviceLog.mileage > vehicle.mileage) {
      setVehicle({
        ...vehicle,
        mileage: serviceLog.mileage
      });
      
      toast.info(`Vehicle mileage updated to ${serviceLog.mileage} km`);
    }
  };

  if (loading) {
    return (
      <div className="container py-8 text-center">
        <p>Loading vehicle details...</p>
      </div>
    );
  }

  if (!vehicle) return null;

  return (
    <div className="container py-8">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/')}
        className="mb-6"
      >
        <ArrowLeft size={16} className="mr-1" /> Back to Garage
      </Button>
      
      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        <div className="lg:w-1/3">
          <Card className="overflow-hidden">
            {vehicle.image ? (
              <div className="h-48 overflow-hidden">
                <img 
                  src={vehicle.image} 
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="h-48 bg-mechanic-gray/10 flex items-center justify-center">
                <CarFront size={64} className="text-mechanic-gray/30" />
              </div>
            )}
            
            <CardContent className="p-6">
              <h1 className="text-2xl font-bold text-mechanic-blue">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h1>
              
              <div className="mt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-mechanic-gray">Plate Number</span>
                  <span className="font-medium">{vehicle.plate || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-mechanic-gray">VIN</span>
                  <span className="font-medium">{vehicle.vin || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-mechanic-gray">Current Mileage</span>
                  <span className="font-medium">{vehicle.mileage.toLocaleString()} km</span>
                </div>
              </div>
              
              <Button 
                className="w-full mt-6 bg-mechanic-blue hover:bg-mechanic-blue/90"
                onClick={() => setServiceLogDialogOpen(true)}
              >
                <Wrench size={16} className="mr-1" /> Log Service
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:w-2/3">
          <Tabs defaultValue="history">
            <TabsList className="mb-4">
              <TabsTrigger value="history" className="flex items-center">
                <FileText size={16} className="mr-1" /> Service History
              </TabsTrigger>
              <TabsTrigger value="specs" className="flex items-center">
                <Wrench size={16} className="mr-1" /> Specifications
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="history" className="mt-0">
              <ServiceHistoryTable 
                vehicle={vehicle}
                serviceLogs={serviceLogs.filter(log => log.vehicleId === vehicle.id)}
              />
            </TabsContent>
            
            <TabsContent value="specs" className="mt-0">
              <VehicleSpecsCard specs={specs} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <ServiceLogForm
        open={serviceLogDialogOpen}
        onOpenChange={setServiceLogDialogOpen}
        vehicle={vehicle}
        onAddServiceLog={handleAddServiceLog}
      />
    </div>
  );
};

export default VehicleDetails;
