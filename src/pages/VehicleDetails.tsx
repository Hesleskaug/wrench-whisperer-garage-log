import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import ServiceHistoryTable from "@/components/ServiceHistoryTable";
import ServiceLogForm from "@/components/ServiceLogForm";
import EditVehicleForm from "@/components/EditVehicleForm";
import DeleteVehicleDialog from "@/components/DeleteVehicleDialog";
import VehicleSpecsCard from "@/components/VehicleSpecsCard";
import { ArrowLeft, Wrench, CarFront, FileText, Calendar, AlertTriangle, Edit, Trash2 } from "lucide-react";
import { Vehicle, ServiceLog, VehicleSpecs, mockVehicleSpecs } from "@/utils/mockData";
import { toast } from "sonner";
import { useGarage } from '@/contexts/GarageContext';
import { Badge } from "@/components/ui/badge";

const VehicleDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { garageId } = useGarage();
  const [vehicle, setVehicle] = useState<Vehicle | undefined>();
  const [serviceLogs, setServiceLogs] = useState<ServiceLog[]>([]);
  const [specs, setSpecs] = useState<VehicleSpecs | undefined>();
  const [communitySpecs, setCommunitySpecs] = useState<VehicleSpecs | undefined>();
  const [serviceLogDialogOpen, setServiceLogDialogOpen] = useState(false);
  const [editVehicleDialogOpen, setEditVehicleDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  // New state for vehicle details from the API
  const [vehicleDetails, setVehicleDetails] = useState<any>(null);

  // Format date for better display
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString();
    } catch (e) {
      return dateStr;
    }
  };

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
      // Find vehicle specs (still using mock data for now)
      const vehicleSpecs = mockVehicleSpecs.find(s => s.vehicleId === id);
      
      // Attach specs to vehicle if found
      if (vehicleSpecs) {
        foundVehicle.specs = vehicleSpecs;
      }
      
      setVehicle(foundVehicle);

      // Check for additional vehicle details that might be saved
      const storedVehicleDetails = localStorage.getItem(`vehicle_details_${foundVehicle.id}`);
      if (storedVehicleDetails) {
        setVehicleDetails(JSON.parse(storedVehicleDetails));
      }
      
      // Look for specs in existing data
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

  const handleUpdateVehicle = (updatedVehicle: Vehicle) => {
    if (!garageId || !vehicle) return;
    
    // Update vehicle in state
    setVehicle(updatedVehicle);
    
    // Update the vehicle in localStorage
    const storedVehicles = localStorage.getItem(`vehicles_${garageId}`);
    const vehicles = storedVehicles ? JSON.parse(storedVehicles) : [];
    const updatedVehicles = vehicles.map((v: Vehicle) => 
      v.id === updatedVehicle.id ? updatedVehicle : v
    );
    localStorage.setItem(`vehicles_${garageId}`, JSON.stringify(updatedVehicles));
    
    // If specs were updated, refresh the specs state to show updated data
    if (updatedVehicle.specs) {
      setSpecs(updatedVehicle.specs);
    }
    
    // Update vehicle details in localStorage if plate was added
    if (vehicle.plate !== updatedVehicle.plate && vehicleDetails) {
      const updatedDetails = { ...vehicleDetails, plate: updatedVehicle.plate };
      setVehicleDetails(updatedDetails);
      localStorage.setItem(`vehicle_details_${vehicle.id}`, JSON.stringify(updatedDetails));
    }
  };

  const handleDeleteVehicle = () => {
    if (!garageId || !vehicle) return;
    
    // Delete vehicle from localStorage
    const storedVehicles = localStorage.getItem(`vehicles_${garageId}`);
    const vehicles = storedVehicles ? JSON.parse(storedVehicles) : [];
    const updatedVehicles = vehicles.filter((v: Vehicle) => v.id !== vehicle.id);
    localStorage.setItem(`vehicles_${garageId}`, JSON.stringify(updatedVehicles));
    
    // Delete all service logs for this vehicle
    const storedServiceLogs = localStorage.getItem(`serviceLogs_${garageId}`);
    const logs = storedServiceLogs ? JSON.parse(storedServiceLogs) : [];
    const updatedLogs = logs.filter((log: ServiceLog) => log.vehicleId !== vehicle.id);
    localStorage.setItem(`serviceLogs_${garageId}`, JSON.stringify(updatedLogs));
    
    // Delete vehicle details if stored
    localStorage.removeItem(`vehicle_details_${vehicle.id}`);
    
    toast.success("Vehicle and its service history deleted");
    navigate('/');
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
              <div className="flex justify-between items-start mb-2">
                <h1 className="text-2xl font-bold text-mechanic-blue">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </h1>
                <div className="flex space-x-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => setEditVehicleDialogOpen(true)}
                  >
                    <Edit size={16} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
              
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
              
              {/* Technical specifications section */}
              {vehicleDetails && (
                <div className="mt-5 pt-4 border-t border-gray-200">
                  <h3 className="font-semibold text-mechanic-blue mb-2 flex items-center">
                    <Wrench size={16} className="mr-1" /> Technical Specifications
                  </h3>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-mechanic-gray">Engine</span>
                      <span className="font-medium">{vehicleDetails.engineSize ? `${vehicleDetails.engineSize}cc` : "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-mechanic-gray">Power</span>
                      <span className="font-medium">{vehicleDetails.enginePower ? `${vehicleDetails.enginePower} kW` : "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-mechanic-gray">Fuel Type</span>
                      <span className="font-medium">{vehicleDetails.fuelType || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-mechanic-gray">Transmission</span>
                      <span className="font-medium">{vehicleDetails.transmission || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-mechanic-gray">Engine Code</span>
                      <span className="font-medium">{vehicleDetails.engineCode || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-mechanic-gray">Weight</span>
                      <span className="font-medium">{vehicleDetails.weight ? `${vehicleDetails.weight}kg` : "N/A"}</span>
                    </div>
                  </div>
                  
                  {/* Highlighted inspection information */}
                  <div className="mt-4 p-3 bg-amber-50 rounded-md border border-amber-200">
                    <h4 className="font-medium text-amber-800 flex items-center mb-2">
                      <Calendar size={16} className="mr-1" /> Inspection Dates
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-amber-700">Inspection Due</span>
                        <Badge variant="outline" className="bg-amber-100 text-amber-800">
                          {vehicleDetails.inspectionDue ? formatDate(vehicleDetails.inspectionDue) : "N/A"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-amber-700">Last Inspection</span>
                        <Badge variant="outline" className="bg-amber-100 text-amber-800">
                          {vehicleDetails.lastInspection ? formatDate(vehicleDetails.lastInspection) : "N/A"}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Alert for upcoming inspection */}
                    {vehicleDetails.inspectionDue && new Date(vehicleDetails.inspectionDue) < new Date(new Date().setMonth(new Date().getMonth() + 2)) && (
                      <div className="flex items-center mt-2 pt-2 border-t border-amber-200 text-xs text-red-700 gap-1">
                        <AlertTriangle size={12} />
                        <span>Inspection due soon</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
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
                <VehicleSpecsCard specs={specs} isCommunityData={false} vehicleDetails={vehicleDetails} />
              ) : communitySpecs ? (
                <VehicleSpecsCard specs={communitySpecs} isCommunityData={true} vehicleDetails={vehicleDetails} />
              ) : (
                <VehicleSpecsCard specs={undefined} vehicleDetails={vehicleDetails} />
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
      
      <EditVehicleForm
        open={editVehicleDialogOpen}
        onOpenChange={setEditVehicleDialogOpen}
        vehicle={vehicle}
        onUpdateVehicle={handleUpdateVehicle}
      />
      
      <DeleteVehicleDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        vehicle={vehicle}
        onDeleteVehicle={handleDeleteVehicle}
      />
    </div>
  );
};

export default VehicleDetails;
