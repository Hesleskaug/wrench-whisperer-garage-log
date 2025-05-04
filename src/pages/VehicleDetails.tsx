
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import ServiceHistoryTable from "@/components/ServiceHistoryTable";
import ServiceLogForm from "@/components/ServiceLogForm";
import VehicleSpecsCard from "@/components/VehicleSpecsCard";
import { ArrowLeft, Wrench, CarFront, FileText } from "lucide-react";
import { Vehicle, ServiceLog, VehicleSpecs, mockVehicleSpecs } from "@/utils/mockData";
import { toast } from "sonner";
import { useGarage } from '@/contexts/GarageContext';

const VehicleDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { garageId } = useGarage();
  const [vehicle, setVehicle] = useState<Vehicle | undefined>();
  const [serviceLogs, setServiceLogs] = useState<ServiceLog[]>([]);
  const [specs, setSpecs] = useState<VehicleSpecs | undefined>();
  const [communitySpecs, setCommunitySpecs] = useState<VehicleSpecs | undefined>();
  const [serviceLogDialogOpen, setServiceLogDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!garageId) {
      navigate('/garage');
      return;
    }
    
    // Load vehicles and service logs from localStorage based on garage ID
    const storedVehicles = localStorage.getItem(`vehicles_${garageId}`);
    const storedServiceLogs = localStorage.getItem(`serviceLogs_${garageId}`);
    
    const vehicles = storedVehicles ? JSON.parse(storedVehicles) : [];
    const logs = storedServiceLogs ? JSON.parse(storedServiceLogs) : [];
    
    // Find the vehicle with the matching ID
    const foundVehicle = vehicles.find((v: Vehicle) => v.id === id);
    
    // Filter service logs for this vehicle
    const vehicleLogs = logs.filter((log: ServiceLog) => log.vehicleId === id);
    setServiceLogs(vehicleLogs);
    
    if (foundVehicle) {
      setVehicle(foundVehicle);
      
      // Find vehicle specs (still using mock data for now)
      const vehicleSpecs = mockVehicleSpecs.find(s => s.vehicleId === id);
      setSpecs(vehicleSpecs);
      
      // Simulate finding "community" specs based on make and model
      // In a real app, this would come from a database of community-contributed specs
      if (foundVehicle) {
        // Look for other mock specs with same make/model but different vehicle ID
        const similarVehicleSpecs = mockVehicleSpecs.find(s => {
          // Get the vehicle associated with this spec
          const specVehicle = vehicles.find((v: Vehicle) => v.id === s.vehicleId);
          // Check if it's a different vehicle with the same make/model
          return specVehicle && 
                 s.vehicleId !== id && 
                 specVehicle.make === foundVehicle.make &&
                 specVehicle.model === foundVehicle.model;
        });
        
        // If we don't have specific specs for this vehicle but found community specs
        if (!vehicleSpecs && similarVehicleSpecs) {
          setCommunitySpecs(similarVehicleSpecs);
          toast.info("Using community-provided specifications for this vehicle model", {
            duration: 5000
          });
        }
      }
    } else {
      toast.error("Vehicle not found");
      navigate('/');
    }
    
    setLoading(false);
  }, [id, navigate, garageId]);

  const handleAddServiceLog = (serviceLog: ServiceLog) => {
    if (!garageId) return;
    
    // Add the new service log
    const updatedServiceLogs = [...serviceLogs, serviceLog];
    setServiceLogs(updatedServiceLogs);
    
    // Update localStorage with the new service logs
    const storedServiceLogs = localStorage.getItem(`serviceLogs_${garageId}`);
    const allServiceLogs = storedServiceLogs ? JSON.parse(storedServiceLogs) : [];
    const updatedAllServiceLogs = [...allServiceLogs.filter((log: ServiceLog) => log.vehicleId !== serviceLog.vehicleId || log.id !== serviceLog.id), serviceLog];
    localStorage.setItem(`serviceLogs_${garageId}`, JSON.stringify(updatedAllServiceLogs));
    
    // Update vehicle mileage if the service log has a higher mileage
    if (vehicle && serviceLog.mileage > vehicle.mileage) {
      const updatedVehicle = {
        ...vehicle,
        mileage: serviceLog.mileage
      };
      setVehicle(updatedVehicle);
      
      // Update the vehicle in localStorage as well
      const storedVehicles = localStorage.getItem(`vehicles_${garageId}`);
      const vehicles = storedVehicles ? JSON.parse(storedVehicles) : [];
      const updatedVehicles = vehicles.map((v: Vehicle) => v.id === vehicle.id ? updatedVehicle : v);
      localStorage.setItem(`vehicles_${garageId}`, JSON.stringify(updatedVehicles));
      
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
                serviceLogs={serviceLogs}
              />
            </TabsContent>
            
            <TabsContent value="specs" className="mt-0">
              {specs ? (
                <VehicleSpecsCard specs={specs} isCommunityData={false} />
              ) : communitySpecs ? (
                <VehicleSpecsCard specs={communitySpecs} isCommunityData={true} />
              ) : (
                <VehicleSpecsCard specs={undefined} />
              )}
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
