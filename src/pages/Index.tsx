
import { useState } from 'react';
import AddVehicleForm from "@/components/AddVehicleForm";
import ServiceLogForm from "@/components/ServiceLogForm";
import { Vehicle, ServiceLog } from "@/utils/mockData";
import { toast } from "sonner";
import { useLanguage } from '@/contexts/LanguageContext';
import GarageHeader from '@/components/GarageHeader';
import VehicleList from '@/components/VehicleList';
import { useGarageData } from '@/hooks/useGarageData';
import { Button } from "@/components/ui/button";
import { CloudSync } from "lucide-react";

const Index = () => {
  const { t } = useLanguage();
  const { 
    vehicles, 
    serviceLogs, 
    isLoading, 
    isSyncing,
    handleAddVehicle, 
    handleAddServiceLog,
    updateVehicleMileage,
    triggerSync
  } = useGarageData();
  
  const [addVehicleDialogOpen, setAddVehicleDialogOpen] = useState(false);
  const [serviceLogDialogOpen, setServiceLogDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  
  const handleServiceLog = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setServiceLogDialogOpen(true);
  };

  const handleAddServiceLogWithMileageUpdate = (serviceLog: ServiceLog) => {
    handleAddServiceLog(serviceLog);
    
    // Update vehicle mileage if the service log has a higher mileage
    if (selectedVehicle && serviceLog.mileage > selectedVehicle.mileage) {
      updateVehicleMileage(selectedVehicle.id, serviceLog.mileage);
      
      // Update the selected vehicle reference
      setSelectedVehicle({
        ...selectedVehicle,
        mileage: serviceLog.mileage
      });
      
      toast.info(`${selectedVehicle.make} ${selectedVehicle.model} ${t('currentMileage')}: ${serviceLog.mileage} km`);
    }
  };

  return (
    <div className="container py-8">
      <GarageHeader onAddVehicle={() => setAddVehicleDialogOpen(true)} />
      
      <div className="mb-4 flex items-center justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={triggerSync} 
          disabled={isLoading || isSyncing}
          className="flex items-center gap-1"
        >
          <CloudSync size={16} className={isSyncing ? "animate-spin" : ""} />
          {isSyncing ? "Syncing..." : "Sync to Cloud"}
        </Button>
      </div>
      
      <VehicleList 
        vehicles={vehicles}
        onAddVehicle={() => setAddVehicleDialogOpen(true)}
        onServiceLog={handleServiceLog}
        isLoading={isLoading}
      />
      
      <AddVehicleForm
        open={addVehicleDialogOpen}
        onOpenChange={setAddVehicleDialogOpen}
        onAddVehicle={handleAddVehicle}
      />
      
      <ServiceLogForm
        open={serviceLogDialogOpen}
        onOpenChange={setServiceLogDialogOpen}
        vehicle={selectedVehicle}
        onAddServiceLog={handleAddServiceLogWithMileageUpdate}
      />
    </div>
  );
};

export default Index;
