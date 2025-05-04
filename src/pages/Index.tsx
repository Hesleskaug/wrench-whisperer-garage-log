
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
import { CloudUpload, AlertCircle } from "lucide-react";

const Index = () => {
  const { t } = useLanguage();
  const { 
    vehicles, 
    serviceLogs, 
    isLoading, 
    isSyncing,
    syncError,
    lastSyncAttempt,
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

  // Format the last sync time for display
  const formatLastSync = () => {
    if (!lastSyncAttempt) return null;
    
    // If less than 1 minute ago, show 'Just now'
    const diffMs = new Date().getTime() - lastSyncAttempt.getTime();
    if (diffMs < 60000) return 'Just now';
    
    // For times less than an hour ago, show minutes
    if (diffMs < 3600000) {
      const mins = Math.floor(diffMs / 60000);
      return `${mins}m ago`;
    }
    
    // Otherwise show the time
    return lastSyncAttempt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="container py-8">
      <GarageHeader onAddVehicle={() => setAddVehicleDialogOpen(true)} />
      
      <div className="mb-4 flex items-center justify-end">
        <div className="flex items-center mr-2">
          {syncError && (
            <div className="text-xs text-destructive flex items-center mr-2">
              <AlertCircle size={14} className="mr-1" />
              <span>{syncError}</span>
            </div>
          )}
          
          <div className="text-xs text-muted-foreground">
            {lastSyncAttempt && !isSyncing && (
              <span>Last sync: {formatLastSync()}</span>
            )}
          </div>
        </div>
        
        <Button 
          variant={syncError ? "destructive" : "outline"}
          size="sm" 
          onClick={triggerSync} 
          disabled={isLoading || isSyncing}
          className="flex items-center gap-1"
        >
          <CloudUpload size={16} className={isSyncing ? "animate-spin" : ""} />
          {isSyncing ? "Syncing..." : syncError ? "Retry Sync" : "Sync to Cloud"}
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
