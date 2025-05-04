
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
import TaskImageUploader from "@/components/TaskImageUploader";
import { ArrowLeft, Wrench, CarFront, FileText, Calendar, AlertTriangle, Edit, Trash2, Clock } from "lucide-react";
import { Vehicle, ServiceLog, VehicleSpecs, mockVehicleSpecs } from "@/utils/mockData";
import { toast } from "sonner";
import { useGarage } from '@/contexts/GarageContext';
import { Badge } from "@/components/ui/badge";
import NorwegianPlate from '@/components/NorwegianPlate';
import { useLanguage } from '@/contexts/LanguageContext';

const VehicleDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { garageId } = useGarage();
  const { t } = useLanguage();
  const [vehicle, setVehicle] = useState<Vehicle | undefined>();
  const [serviceLogs, setServiceLogs] = useState<ServiceLog[]>([]);
  const [specs, setSpecs] = useState<VehicleSpecs | undefined>();
  const [communitySpecs, setCommunitySpecs] = useState<VehicleSpecs | undefined>();
  const [serviceLogDialogOpen, setServiceLogDialogOpen] = useState(false);
  const [editVehicleDialogOpen, setEditVehicleDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  // State for vehicle details from the API
  const [vehicleDetails, setVehicleDetails] = useState<any>(null);
  // State for image management
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [vehicleImages, setVehicleImages] = useState<string[]>([]);

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
      
      // Check for saved vehicle images
      const storedVehicleImages = localStorage.getItem(`vehicle_images_${foundVehicle.id}`);
      if (storedVehicleImages) {
        setVehicleImages(JSON.parse(storedVehicleImages));
      } else if (foundVehicle.image) {
        // If no stored images but vehicle has a primary image, add it to the images array
        setVehicleImages([foundVehicle.image]);
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

  // Handle the new image uploads
  const handleImagesChange = (newImages: string[]) => {
    if (!vehicle || !garageId) return;
    
    setVehicleImages(newImages);
    localStorage.setItem(`vehicle_images_${vehicle.id}`, JSON.stringify(newImages));
    
    // If there's no primary image set, use the first image as primary
    if (newImages.length > 0 && !vehicle.image) {
      setMainVehicleImage(newImages[0]);
    }
    
    toast.success(t('vehicleImages') + " " + t('updated'));
  };

  // Set main vehicle image
  const setMainVehicleImage = (imageUrl: string) => {
    if (!vehicle || !garageId) return;
    
    // Update vehicle with new primary image
    const updatedVehicle = {
      ...vehicle,
      image: imageUrl
    };
    setVehicle(updatedVehicle);
    
    // Update the vehicle in localStorage
    const storedVehicles = localStorage.getItem(`vehicles_${garageId}`);
    if (storedVehicles) {
      const vehicles = JSON.parse(storedVehicles);
      const updatedVehicles = vehicles.map((v: Vehicle) => 
        v.id === vehicle.id ? updatedVehicle : v
      );
      localStorage.setItem(`vehicles_${garageId}`, JSON.stringify(updatedVehicles));
    }
    
    toast.success(t('mainImage') + " " + t('updated'));
  };

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
      
      toast.info(`${t('currentMileage')}: ${serviceLog.mileage} km`);
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
    
    toast.success(t('delete') + " " + t('successful'));
    navigate('/');
  };

  if (loading) {
    return (
      <div className="container py-8 text-center">
        <p>{t('loading')}</p>
      </div>
    );
  }

  if (!vehicle) return null;

  // Check if the vehicle is imported (has different first registration date than import date)
  const isImported = vehicleDetails && 
                     vehicleDetails.importDate && 
                     vehicleDetails.firstRegistrationDate && 
                     vehicleDetails.importDate !== vehicleDetails.firstRegistrationDate;

  return (
    <div className="container py-8">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/')}
        className="mb-6"
      >
        <ArrowLeft size={16} className="mr-1" /> {t('backToGarage')}
      </Button>
      
      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        <div className="lg:w-1/3">
          <Card className="overflow-hidden">
            {/* Vehicle Image Display */}
            <div className="relative">
              {vehicle.image ? (
                <img 
                  src={vehicle.image} 
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    // Fall back to car icon on error
                    const target = e.target as HTMLElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      const iconDiv = document.createElement('div');
                      iconDiv.className = 'h-48 bg-mechanic-gray/10 flex items-center justify-center';
                      iconDiv.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-car-front text-mechanic-gray/30"><path d="m21 8-2 2-1.5-3.7A2 2 0 0 0 15.646 5H8.4a2 2 0 0 0-1.903 1.257L5 10 3 8"/><path d="M7 14h.01"/><path d="M17 14h.01"/><rect width="18" height="8" x="3" y="10" rx="2"/><path d="M5 18v2"/><path d="M19 18v2"/></svg>';
                      parent.appendChild(iconDiv);
                    }
                  }}
                />
              ) : (
                <div className="h-48 bg-mechanic-gray/10 flex items-center justify-center">
                  <CarFront size={64} className="text-mechanic-gray/30" />
                </div>
              )}
              
              {/* Image gallery controls */}
              <div className="absolute bottom-2 right-2">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="bg-white bg-opacity-80 hover:bg-opacity-100"
                  onClick={() => setIsUploadingImage(!isUploadingImage)}
                >
                  {isUploadingImage ? t('close') : t('manageImages')}
                </Button>
              </div>
            </div>
            
            {/* Image upload interface */}
            {isUploadingImage && (
              <div className="p-4 border-b border-gray-100">
                <TaskImageUploader
                  title={t('vehicleImages')}
                  images={vehicleImages}
                  onImagesChange={handleImagesChange}
                  mainImage={vehicle.image}
                  onSetMainImage={setMainVehicleImage}
                />
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
              
              {/* Date information badges */}
              {vehicleDetails && (
                <div className="flex flex-wrap gap-2 my-3">
                  {vehicleDetails.firstRegistrationDate && (
                    <Badge variant="secondary" className="flex items-center gap-1 bg-blue-50 text-blue-700">
                      <Clock className="h-3 w-3" /> 
                      {t('firstReg')}: {formatDate(vehicleDetails.firstRegistrationDate)}
                    </Badge>
                  )}
                  {isImported && (
                    <Badge variant="secondary" className="bg-amber-50 text-amber-700">
                      {t('imported')}: {formatDate(vehicleDetails.importDate)}
                    </Badge>
                  )}
                </div>
              )}
              
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-mechanic-gray">{t('plate')}</span>
                  <NorwegianPlate plate={vehicle.plate} className="ml-2" />
                </div>
                <div className="flex justify-between">
                  <span className="text-mechanic-gray">{t('vin')}</span>
                  <span className="font-medium">{vehicle.vin || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-mechanic-gray">{t('currentMileage')}</span>
                  <span className="font-medium">{vehicle.mileage.toLocaleString()} km</span>
                </div>
              </div>
              
              {/* Technical specifications section */}
              {vehicleDetails && (
                <div className="mt-5 pt-4 border-t border-gray-200">
                  <h3 className="font-semibold text-mechanic-blue mb-2 flex items-center">
                    <Wrench size={16} className="mr-1" /> {t('technicalSpecifications')}
                  </h3>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-mechanic-gray">{t('engine')}</span>
                      <span className="font-medium">{vehicleDetails.engineSize ? `${vehicleDetails.engineSize}cc` : "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-mechanic-gray">{t('power')}</span>
                      <span className="font-medium">{vehicleDetails.enginePower ? `${vehicleDetails.enginePower} kW` : "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-mechanic-gray">{t('fuelType')}</span>
                      <span className="font-medium">{vehicleDetails.fuelType || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-mechanic-gray">{t('transmission')}</span>
                      <span className="font-medium">{vehicleDetails.transmission || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-mechanic-gray">{t('engineCode')}</span>
                      <span className="font-medium">{vehicleDetails.engineCode || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-mechanic-gray">{t('weight')}</span>
                      <span className="font-medium">{vehicleDetails.weight ? `${vehicleDetails.weight}kg` : "N/A"}</span>
                    </div>
                  </div>
                  
                  {/* Highlighted inspection information */}
                  <div className="mt-4 p-3 bg-amber-50 rounded-md border border-amber-200">
                    <h4 className="font-medium text-amber-800 flex items-center mb-2">
                      <Calendar size={16} className="mr-1" /> {t('inspectionDates')}
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-amber-700">{t('inspectionDue')}</span>
                        <Badge variant="outline" className="bg-amber-100 text-amber-800">
                          {vehicleDetails.inspectionDue ? formatDate(vehicleDetails.inspectionDue) : "N/A"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-amber-700">{t('lastInspection')}</span>
                        <Badge variant="outline" className="bg-amber-100 text-amber-800">
                          {vehicleDetails.lastInspection ? formatDate(vehicleDetails.lastInspection) : "N/A"}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Alert for upcoming inspection */}
                    {vehicleDetails.inspectionDue && new Date(vehicleDetails.inspectionDue) < new Date(new Date().setMonth(new Date().getMonth() + 2)) && (
                      <div className="flex items-center mt-2 pt-2 border-t border-amber-200 text-xs text-red-700 gap-1">
                        <AlertTriangle size={12} />
                        <span>{t('inspectionDueSoon')}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <Button 
                className="w-full mt-6 bg-mechanic-blue hover:bg-mechanic-blue/90"
                onClick={() => setServiceLogDialogOpen(true)}
              >
                <Wrench size={16} className="mr-1" /> {t('logService')}
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:w-2/3">
          <Tabs defaultValue="history">
            <TabsList className="mb-4">
              <TabsTrigger value="history" className="flex items-center">
                <FileText size={16} className="mr-1" /> {t('serviceHistory')}
              </TabsTrigger>
              <TabsTrigger value="specs" className="flex items-center">
                <Wrench size={16} className="mr-1" /> {t('specifications')}
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
