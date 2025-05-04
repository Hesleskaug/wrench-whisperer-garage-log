
import { useState, useEffect } from 'react';
import { Vehicle, ServiceLog, mockVehicles as defaultMockVehicles, mockServiceLogs as defaultMockServiceLogs } from "@/utils/mockData";
import { useGarage } from '@/contexts/GarageContext';
import { toast } from "sonner";

export const useGarageData = () => {
  const { garageId, syncVehicles, fetchVehicles, syncServiceLogs, fetchServiceLogs } = useGarage();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [serviceLogs, setServiceLogs] = useState<ServiceLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load vehicles and service logs when garage ID changes
  useEffect(() => {
    const loadVehicles = async () => {
      if (!garageId) return;
      
      setIsLoading(true);
      try {
        // Try to fetch vehicles from localStorage first as a reliable fallback
        const storedVehicles = localStorage.getItem(`vehicles_${garageId}`);
        let localVehicles: Vehicle[] = [];
        
        if (storedVehicles) {
          try {
            localVehicles = JSON.parse(storedVehicles);
            console.log('Found vehicles in localStorage:', localVehicles);
          } catch (e) {
            console.error('Error parsing localStorage vehicles:', e);
          }
        }
        
        // Try to fetch vehicles from Supabase
        try {
          const supabaseVehicles = await fetchVehicles();
          
          if (supabaseVehicles && supabaseVehicles.length > 0) {
            console.log('Vehicles loaded from Supabase:', supabaseVehicles);
            setVehicles(supabaseVehicles);
            
            // Update localStorage with the latest from Supabase
            localStorage.setItem(`vehicles_${garageId}`, JSON.stringify(supabaseVehicles));
          } else if (localVehicles.length > 0) {
            // If no vehicles in Supabase but we have them in localStorage, use those
            console.log('Using vehicles from localStorage:', localVehicles);
            setVehicles(localVehicles);
            
            // Try to sync localStorage vehicles to Supabase
            syncVehicles(localVehicles).catch(error => {
              console.error('Failed to sync localStorage vehicles to Supabase:', error);
              // Don't show error toast since we have a working fallback
            });
          } else {
            // If no vehicles anywhere, use mock data
            console.log('Using default mock vehicles');
            setVehicles(defaultMockVehicles);
            
            // Save mock vehicles to localStorage
            localStorage.setItem(`vehicles_${garageId}`, JSON.stringify(defaultMockVehicles));
            
            // Try to sync default vehicles to Supabase
            syncVehicles(defaultMockVehicles).catch(error => {
              console.error('Failed to sync mock vehicles to Supabase:', error);
            });
          }
        } catch (supabaseError) {
          console.error('Error fetching from Supabase:', supabaseError);
          
          // Fall back to localStorage or mock data
          if (localVehicles.length > 0) {
            console.log('Falling back to localStorage vehicles after Supabase error');
            setVehicles(localVehicles);
          } else {
            console.log('Falling back to mock vehicles after Supabase error');
            setVehicles(defaultMockVehicles);
            localStorage.setItem(`vehicles_${garageId}`, JSON.stringify(defaultMockVehicles));
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
  }, [garageId, fetchVehicles, syncVehicles, fetchServiceLogs, syncServiceLogs]);
  
  // Save service logs when they change
  useEffect(() => {
    if (garageId && serviceLogs.length > 0) {
      syncServiceLogs(serviceLogs);
    }
  }, [serviceLogs, garageId, syncServiceLogs]);

  const handleAddVehicle = async (vehicle: Vehicle) => {
    const updatedVehicles = [...vehicles, vehicle];
    setVehicles(updatedVehicles);
    
    // Always save to localStorage first for reliability
    if (garageId) {
      localStorage.setItem(`vehicles_${garageId}`, JSON.stringify(updatedVehicles));
      
      // Then try to sync to Supabase
      syncVehicles(updatedVehicles).catch(error => {
        console.error('Failed to sync updated vehicles to Supabase:', error);
        toast.info('Vehicle saved to local storage. Will try to sync to cloud later.');
      });
    }
  };

  const handleAddServiceLog = (serviceLog: ServiceLog) => {
    setServiceLogs(prev => [...prev, serviceLog]);
  };

  const updateVehicleMileage = async (vehicleId: string, newMileage: number) => {
    const updatedVehicles = vehicles.map(v =>
      v.id === vehicleId
        ? { ...v, mileage: newMileage }
        : v
    );
    
    setVehicles(updatedVehicles);
    
    // Always save to localStorage first
    if (garageId) {
      localStorage.setItem(`vehicles_${garageId}`, JSON.stringify(updatedVehicles));
      
      // Then try to sync to Supabase
      syncVehicles(updatedVehicles).catch(error => {
        console.error('Failed to sync updated mileage to Supabase:', error);
        toast.info('Vehicle mileage updated locally. Will try to sync to cloud later.');
      });
    }
  };

  return {
    vehicles,
    serviceLogs,
    isLoading,
    handleAddVehicle,
    handleAddServiceLog,
    updateVehicleMileage
  };
};
