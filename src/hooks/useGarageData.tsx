
import { useState, useEffect } from 'react';
import { Vehicle, ServiceLog, mockVehicles as defaultMockVehicles, mockServiceLogs as defaultMockServiceLogs } from "@/utils/mockData";
import { useGarage } from '@/contexts/GarageContext';
import { toast } from "sonner";

export const useGarageData = () => {
  const { garageId, saveVehicle, fetchVehicles, syncServiceLogs, fetchServiceLogs } = useGarage();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [serviceLogs, setServiceLogs] = useState<ServiceLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSyncAttempt, setLastSyncAttempt] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Load vehicles and service logs when garage ID changes
  useEffect(() => {
    const loadVehicles = async () => {
      if (!garageId) return;
      
      setIsLoading(true);
      try {
        // Try to fetch vehicles from the database
        const fetchedVehicles = await fetchVehicles();
        
        if (fetchedVehicles && fetchedVehicles.length > 0) {
          console.log('Vehicles loaded from database:', fetchedVehicles);
          setVehicles(fetchedVehicles);
          setSyncError(null);
        } else {
          // If no vehicles, use mock data
          console.log('Using default mock vehicles');
          setVehicles(defaultMockVehicles);
          
          // Try to save mock vehicles to database one by one
          for (const vehicle of defaultMockVehicles) {
            try {
              await saveVehicle(vehicle);
            } catch (error) {
              console.error('Failed to save mock vehicle to database:', error);
              setSyncError('Could not save to database. Try manual save later.');
            }
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
        
        // Final fallback to mock data
        setVehicles(defaultMockVehicles);
        setServiceLogs(defaultMockServiceLogs);
        
        // Save fallback data to localStorage
        localStorage.setItem(`vehicles_${garageId}`, JSON.stringify(defaultMockVehicles));
        syncServiceLogs(defaultMockServiceLogs);
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
    setIsSaving(true);
    setSyncError(null);
    
    try {
      // Save directly to the database
      await saveVehicle(vehicle);
      
      // Update our local state
      setVehicles(prev => [...prev, vehicle]);
      
      toast.success('Vehicle saved successfully');
      setLastSyncAttempt(new Date());
    } catch (error) {
      console.error('Failed to save vehicle:', error);
      setSyncError('Failed to save to database. Vehicle saved locally.');
      
      // Add to local state anyway
      setVehicles(prev => [...prev, vehicle]);
      
      // Ensure it's saved to localStorage at least
      if (garageId) {
        const existingVehicles = JSON.parse(localStorage.getItem(`vehicles_${garageId}`) || '[]');
        localStorage.setItem(`vehicles_${garageId}`, JSON.stringify([...existingVehicles, vehicle]));
      }
      
      toast.error('Could not save vehicle to database. Saved locally only.');
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
      setSyncError('Failed to update database. Mileage updated locally.');
      
      // Update local state anyway
      setVehicles(prev => 
        prev.map(v => v.id === vehicleId ? updatedVehicle : v)
      );
      
      // Ensure it's saved to localStorage at least
      if (garageId) {
        const storedVehicles = JSON.parse(localStorage.getItem(`vehicles_${garageId}`) || '[]');
        const updatedVehicles = storedVehicles.map((v: Vehicle) => 
          v.id === vehicleId ? updatedVehicle : v
        );
        localStorage.setItem(`vehicles_${garageId}`, JSON.stringify(updatedVehicles));
      }
      
      toast.info('Vehicle mileage updated locally. Could not update in database.');
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
    retrySave
  };
};
