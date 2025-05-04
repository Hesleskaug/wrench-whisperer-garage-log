
import { useState, useEffect, useCallback } from 'react';
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
  const [pendingSaves, setPendingSaves] = useState<string[]>([]);

  // Utility function to validate UUID format
  const isValidUUID = (uuid: string | null | undefined): boolean => {
    if (!uuid) return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  // Generate valid UUID if needed
  const ensureValidUUID = (id?: string): string => {
    return (id && isValidUUID(id)) ? id : uuidv4();
  };

  // Load vehicles and service logs when garage ID changes
  useEffect(() => {
    const loadVehicles = async () => {
      if (!garageId) return;
      
      setIsLoading(true);
      setSyncError(null);
      
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
            id: ensureValidUUID(vehicle.id)
          }));
          
          setVehicles(mockVehiclesWithValidIds);
          
          // Try to save mock vehicles to database one by one for first-time setup
          console.log('Saving mock vehicles to database');
          await syncAllVehicles(mockVehiclesWithValidIds);
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

  // Improved vehicle add function with better error handling
  const handleAddVehicle = async (vehicle: Vehicle) => {
    if (!garageId) {
      toast.error('No active garage. Please create or access a garage first.');
      return;
    }
    
    // Ensure the vehicle has a valid UUID
    const vehicleWithValidId = {
      ...vehicle,
      id: ensureValidUUID(vehicle.id)
    };
    
    setIsSaving(true);
    setSyncError(null);
    
    try {
      console.log('Saving new vehicle to database:', vehicleWithValidId);
      
      // Optimistically update UI
      setVehicles(prev => [...prev, vehicleWithValidId]);
      
      // Try saving to the database
      const result = await saveVehicle(vehicleWithValidId);
      
      // Update with the returned data if available
      if (result && result.id) {
        // Update local state with the returned data
        setVehicles(prev => prev.map(v => 
          v.id === vehicleWithValidId.id ? {
            ...v,
            id: result.id // Use the ID from the database
          } : v
        ));
      }
      
      toast.success('Vehicle added successfully');
      setLastSyncAttempt(new Date());
    } catch (error: any) {
      console.error('Failed to save vehicle:', error);
      setSyncError('Failed to save to database. Please try saving your vehicles again.');
      
      // Add to pending saves
      setPendingSaves(prev => [...prev, vehicleWithValidId.id]);
      
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
      // Update local state first for responsive UI
      setVehicles(prev => 
        prev.map(v => v.id === vehicleId ? updatedVehicle : v)
      );
      
      // Save to database
      await saveVehicle(updatedVehicle);
      
      setLastSyncAttempt(new Date());
      console.log('Vehicle mileage updated successfully');
    } catch (error) {
      console.error('Failed to update vehicle mileage in database:', error);
      setSyncError('Failed to update database');
      
      // Add to pending saves
      if (!pendingSaves.includes(vehicleId)) {
        setPendingSaves(prev => [...prev, vehicleId]);
      }
      
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
      
      // Remove from pending saves
      setPendingSaves(prev => prev.filter(id => id !== vehicleId));
    } catch (error) {
      console.error('Manual save failed:', error);
      setSyncError('Save failed. Please try again later.');
      toast.error('Failed to save vehicle to database. Please try again later.');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Function to sync all vehicles to the database
  const syncAllVehicles = useCallback(async (vehiclesToSync?: Vehicle[]) => {
    const vehiclesToProcess = vehiclesToSync || vehicles;
    
    if (vehiclesToProcess.length === 0) return;
    
    setIsSaving(true);
    setSyncError(null);
    
    let successCount = 0;
    let errorCount = 0;
    let errorMessages: string[] = [];
    
    try {
      console.log('Saving all vehicles to database');
      // Save each vehicle one by one
      for (const vehicle of vehiclesToProcess) {
        try {
          // Ensure each vehicle has a valid UUID
          const vehicleWithValidId = {
            ...vehicle,
            id: ensureValidUUID(vehicle.id)
          };
          
          await saveVehicle(vehicleWithValidId);
          successCount++;
          
          // Remove from pending saves
          setPendingSaves(prev => prev.filter(id => id !== vehicle.id));
        } catch (error: any) {
          console.error(`Failed to sync vehicle ${vehicle.id}:`, error);
          errorCount++;
          
          // Add to pending saves if not already there
          if (!pendingSaves.includes(vehicle.id)) {
            setPendingSaves(prev => [...prev, vehicle.id]);
          }
          
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
  }, [vehicles, saveVehicle, pendingSaves]);

  return {
    vehicles,
    serviceLogs,
    isLoading,
    isSaving,
    syncError,
    lastSyncAttempt,
    pendingSaves,
    handleAddVehicle,
    handleAddServiceLog,
    updateVehicleMileage,
    retrySave,
    syncAllVehicles
  };
};
