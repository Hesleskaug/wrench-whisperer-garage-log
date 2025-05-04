
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
        // Try to fetch vehicles from Supabase
        const supabaseVehicles = await fetchVehicles();
        
        if (supabaseVehicles.length > 0) {
          setVehicles(supabaseVehicles);
          console.log('Vehicles loaded from Supabase:', supabaseVehicles);
        } else {
          // If no vehicles in Supabase, check localStorage as fallback
          const storedVehicles = localStorage.getItem(`vehicles_${garageId}`);
          
          if (storedVehicles) {
            const parsedVehicles = JSON.parse(storedVehicles);
            setVehicles(parsedVehicles);
            console.log('Vehicles loaded from localStorage:', parsedVehicles);
            
            // Sync localStorage vehicles to Supabase for future cross-device access
            await syncVehicles(parsedVehicles);
          } else {
            // If no vehicles anywhere, use mock data
            setVehicles(defaultMockVehicles);
            console.log('Using default mock vehicles');
            
            // Sync default vehicles to Supabase
            await syncVehicles(defaultMockVehicles);
          }
        }
        
        // Load service logs using the new fetchServiceLogs method
        const storedServiceLogs = fetchServiceLogs();
        if (storedServiceLogs.length > 0) {
          setServiceLogs(storedServiceLogs);
        } else {
          // If no service logs, use mock data and save it
          setServiceLogs(defaultMockServiceLogs);
          syncServiceLogs(defaultMockServiceLogs);
        }
      } catch (error) {
        console.error('Error loading vehicles:', error);
        toast.error('Failed to load your vehicles');
        
        // Fallback to mock data
        setVehicles(defaultMockVehicles);
        setServiceLogs(defaultMockServiceLogs);
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
    
    // Sync to Supabase
    if (garageId) {
      await syncVehicles(updatedVehicles);
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
    
    // Sync updated vehicles to Supabase
    if (garageId) {
      syncVehicles(updatedVehicles).catch(error => {
        console.error('Failed to sync updated mileage to Supabase:', error);
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
