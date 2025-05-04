
import { useState, useEffect } from 'react';
import { Vehicle, ServiceLog, mockVehicles as defaultMockVehicles, mockServiceLogs as defaultMockServiceLogs } from "@/utils/mockData";
import { useGarage } from '@/contexts/GarageContext';
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';

export const useGarageData = () => {
  const { garageId, saveVehicle, fetchVehicles, syncServiceLogs, fetchServiceLogs } = useGarage();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [serviceLogs, setServiceLogs] = useState<ServiceLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSyncAttempt, setLastSyncAttempt] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Utility function to validate UUID format
  const isValidUUID = (uuid: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  // Load vehicles and service logs when garage ID changes
  useEffect(() => {
    const loadVehicles = async () => {
      if (!garageId) return;
      
      setIsLoading(true);
      try {
        console.log('Loading vehicles for garage ID:', garageId);
        // Try to fetch vehicles from the database
        const fetchedVehicles = await fetchVehicles();
        
        if (fetchedVehicles && fetchedVehicles.length > 0) {
          console.log('Vehicles loaded from database:', fetchedVehicles);
          setVehicles(fetchedVehicles);
          setSyncError(null);
        } else {
          // If no vehicles, use mock data for first-time users
          console.log('No vehicles found, using default mock vehicles');
          
          // Ensure all mock vehicles have valid UUIDs
          const mockVehiclesWithValidIds = defaultMockVehicles.map(vehicle => ({
            ...vehicle,
            id: isValidUUID(vehicle.id) ? vehicle.id : uuidv4()
          }));
          
          setVehicles(mockVehiclesWithValidIds);
          
          // Try to save mock vehicles to database one by one for first-time setup
          console.log('Saving mock vehicles to database');
          let savingErrors = 0;
          
          for (const vehicle of mockVehiclesWithValidIds) {
            try {
              await saveVehicle(vehicle);
            } catch (error) {
              console.error('Failed to save mock vehicle to database:', error);
              savingErrors++;
            }
          }
          
          if (savingErrors > 0) {
            setSyncError(`${savingErrors} vehicles failed to save to database`);
          } else {
            setSyncError(null);
          }
        }
        
        // Load service logs using the fetchServiceLogs method
        const storedServiceLogs = fetchServiceLogs();
        if (storedServiceLogs.length > 0) {
          setServiceLogs(storedServiceLogs);
        } else {
          // If no service logs, use mock data and save it
          setServiceLogs(defaultMockServiceLogs);
          syncServiceLogs(defaultMockServiceLogs);
        }
      } catch (error) {
        console.error('Error in loadVehicles function:', error);
        setSyncError('Failed to load garage data.');
        toast.error('There was a problem loading your garage data');
        
        // Final fallback to mock data for offline use
        setVehicles([]);
        setServiceLogs([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadVehicles();
  }, [garageId, fetchVehicles, saveVehicle, fetchServiceLogs, syncServiceLogs]);
  
  // Save service logs when they change
  useEffect(() => {
    if (garageId && serviceLogs.length > 0) {
      syncServiceLogs(serviceLogs);
    }
  }, [serviceLogs, garageId, syncServiceLogs]);

  const handleAddVehicle = async (vehicle: Vehicle) => {
    if (!garageId) {
      toast.error('No active garage. Please create or access a garage first.');
      return;
    }
    
    // Ensure the vehicle has a valid UUID
    const vehicleWithValidId = {
      ...vehicle,
      id: isValidUUID(vehicle.id || '') ? vehicle.id : uuidv4()
    };
    
    setIsSaving(true);
    setSyncError(null);
    
    try {
      console.log('Saving vehicle to database:', vehicleWithValidId);
      // Save directly to the database
      await saveVehicle(vehicleWithValidId);
      
      // Update our local state
      setVehicles(prev => [...prev, vehicleWithValidId]);
      
      toast.success('Vehicle saved successfully');
      setLastSyncAttempt(new Date());
    } catch (error) {
      console.error('Failed to save vehicle:', error);
      setSyncError('Failed to save to database');
      toast.error('Could not save vehicle to database');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddServiceLog = (serviceLog: ServiceLog) => {
    setServiceLogs(prev => [...prev, serviceLog]);
  };

  const updateVehicleMileage = async (vehicleId: string, newMileage: number) => {
    // Find the vehicle to update
    const vehicleToUpdate = vehicles.find(v => v.id === vehicleId);
    
    if (!vehicleToUpdate) {
      console.error('Vehicle not found:', vehicleId);
      return;
    }
    
    // Create updated vehicle object
    const updatedVehicle = {
      ...vehicleToUpdate,
      mileage: newMileage
    };
    
    setIsSaving(true);
    setSyncError(null);
    
    try {
      // Save directly to database
      await saveVehicle(updatedVehicle);
      
      // Update local state
      setVehicles(prev => 
        prev.map(v => v.id === vehicleId ? updatedVehicle : v)
      );
      
      setLastSyncAttempt(new Date());
      console.log('Vehicle mileage updated successfully');
    } catch (error) {
      console.error('Failed to update vehicle mileage in database:', error);
      setSyncError('Failed to update database');
      
      toast.error('Could not update vehicle mileage in database');
    } finally {
      setIsSaving(false);
    }
  };

  // Function to manually retry saving a vehicle to the database
  const retrySave = async (vehicleId: string) => {
    const vehicleToSave = vehicles.find(v => v.id === vehicleId);
    
    if (!vehicleToSave) {
      toast.error('Vehicle not found');
      return;
    }
    
    setIsSaving(true);
    setSyncError(null);
    
    try {
      console.log('Manually saving vehicle:', vehicleToSave);
      await saveVehicle(vehicleToSave);
      toast.success('Vehicle saved to database successfully');
      setLastSyncAttempt(new Date());
      setSyncError(null);
    } catch (error) {
      console.error('Manual save failed:', error);
      setSyncError('Save failed. Please try again later.');
      toast.error('Failed to save vehicle to database. Please try again later.');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Function to sync all vehicles to the database
  const syncAllVehicles = async () => {
    if (vehicles.length === 0) return;
    
    setIsSaving(true);
    setSyncError(null);
    
    let successCount = 0;
    let errorCount = 0;
    let errorMessages: string[] = [];
    
    try {
      console.log('Saving all vehicles to database');
      // Save each vehicle one by one
      for (const vehicle of vehicles) {
        try {
          // Ensure each vehicle has a valid UUID
          const vehicleWithValidId = {
            ...vehicle,
            id: isValidUUID(vehicle.id || '') ? vehicle.id : uuidv4()
          };
          
          await saveVehicle(vehicleWithValidId);
          successCount++;
        } catch (error: any) {
          console.error(`Failed to sync vehicle ${vehicle.id}:`, error);
          errorCount++;
          if (error.message) {
            errorMessages.push(`${vehicle.make} ${vehicle.model}: ${error.message}`);
          }
        }
      }
      
      setLastSyncAttempt(new Date());
      
      if (errorCount === 0) {
        toast.success(`All ${successCount} vehicles saved successfully`);
        setSyncError(null);
      } else {
        const detailedError = errorMessages.length > 0
          ? `${errorCount} vehicles failed to save: ${errorMessages.slice(0, 2).join(', ')}${errorMessages.length > 2 ? '...' : ''}`
          : `${errorCount} vehicles failed to save`;
          
        toast.warning(`Saved ${successCount} vehicles, ${errorCount} failed`);
        setSyncError(detailedError);
      }
    } catch (error) {
      console.error('Save all vehicles failed:', error);
      setSyncError('Save failed. Please try again later.');
      toast.error('Failed to save vehicles to database');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    vehicles,
    serviceLogs,
    isLoading,
    isSaving,
    syncError,
    lastSyncAttempt,
    handleAddVehicle,
    handleAddServiceLog,
    updateVehicleMileage,
    retrySave,
    syncAllVehicles
  };
};
