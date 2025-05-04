import { useState, useEffect } from 'react';
import AddVehicleForm from "@/components/AddVehicleForm";
import ServiceLogForm from "@/components/ServiceLogForm";
import { Vehicle, ServiceLog } from "@/utils/mockData";
import { toast } from "sonner";
import { useLanguage } from '@/contexts/LanguageContext';
import GarageHeader from '@/components/GarageHeader';
import VehicleList from '@/components/VehicleList';
import { useGarageData } from '@/hooks/useGarageData';
import { Button } from "@/components/ui/button";
import { CloudUpload, AlertCircle, Save, RefreshCw, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Index = () => {
  const { t } = useLanguage();
  const { 
    vehicles, 
    serviceLogs, 
    isLoading, 
    isSaving,
    syncError,
    pendingSaves,
    lastSyncAttempt,
    handleAddVehicle, 
    handleAddServiceLog,
    updateVehicleMileage,
    retrySave,
    syncAllVehicles
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

  // Define handleRetry function using the existing retrySave function
  const handleRetry = () => {
    if (selectedVehicle) {
      retrySave(selectedVehicle.id);
    } else {
      // If no vehicle is selected, sync all vehicles instead
      syncAllVehicles();
    }
  };

  // Check if the selected vehicle needs saving
  const isSelectedVehiclePendingSave = selectedVehicle && pendingSaves?.includes(selectedVehicle.id);

  return (
    <div className="container py-8">
      <GarageHeader onAddVehicle={() => setAddVehicleDialogOpen(true)} />
      
      {syncError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {syncError} 
            {pendingSaves && pendingSaves.length > 0 && (
              <span className="block mt-1">
                {pendingSaves.length} {pendingSaves.length === 1 ? 'vehicle' : 'vehicles'} pending sync
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="mb-4 flex items-center justify-end">
        <div className="flex items-center mr-2">
          <div className="text-xs text-muted-foreground">
            {lastSyncAttempt && !isSaving && (
              <span>Last database update: {formatLastSync()}</span>
            )}
            {pendingSaves && pendingSaves.length > 0 && (
              <span className="ml-2 text-amber-500 flex items-center">
                <AlertTriangle size={12} className="mr-1" /> 
                {pendingSaves.length} unsaved {pendingSaves.length === 1 ? 'vehicle' : 'vehicles'}
              </span>
            )}
          </div>
        </div>
        
        {(selectedVehicle || pendingSaves?.length > 0) && (
          <Button 
            variant={syncError ? "destructive" : "outline"}
            size="sm" 
            onClick={() => handleRetry()}
            disabled={isLoading || isSaving}
            className="flex items-center gap-1 mr-2"
          >
            <Save size={16} className={isSaving ? "animate-spin" : ""} />
            {isSaving ? "Saving..." : (isSelectedVehiclePendingSave ? "Save Vehicle" : "Retry Save")}
          </Button>
        )}
        
        <Button 
          variant="outline"
          size="sm" 
          onClick={() => syncAllVehicles()}
          disabled={isLoading || isSaving || vehicles.length === 0}
          className="flex items-center gap-1"
        >
          <RefreshCw size={16} className={isSaving ? "animate-spin" : ""} />
          Save All Vehicles
        </Button>
      </div>
      
      <VehicleList 
        vehicles={vehicles}
        onAddVehicle={() => setAddVehicleDialogOpen(true)}
        onServiceLog={handleServiceLog}
        isLoading={isLoading}
        pendingSaves={pendingSaves}
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
