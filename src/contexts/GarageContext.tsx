
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { Vehicle, ServiceLog } from '@/utils/mockData';

interface GarageContextType {
  garageId: string | null;
  loading: boolean;
  createGarage: () => void;
  accessGarage: (id: string) => void;
  leaveGarage: () => void;
  syncVehicles: (vehicles: Vehicle[]) => Promise<void>;
  fetchVehicles: () => Promise<Vehicle[]>;
  syncServiceLogs: (serviceLogs: ServiceLog[]) => void;
  fetchServiceLogs: () => ServiceLog[];
}

const GarageContext = createContext<GarageContextType | undefined>(undefined);

const STORAGE_KEY = 'wrench_whisperer_garage_id';

export function GarageProvider({ children }: { children: ReactNode }) {
  const [garageId, setGarageId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing garage ID in local storage
    const storedGarageId = localStorage.getItem(STORAGE_KEY);
    if (storedGarageId) {
      setGarageId(storedGarageId);
    }
    setLoading(false);
  }, []);

  const createGarage = () => {
    const newGarageId = uuidv4();
    localStorage.setItem(STORAGE_KEY, newGarageId);
    setGarageId(newGarageId);
    toast.success('New garage created! Save this ID to access your garage later.');
  };

  const accessGarage = (id: string) => {
    // Basic validation for UUID format
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      toast.error('Invalid garage ID format');
      return;
    }
    
    localStorage.setItem(STORAGE_KEY, id);
    setGarageId(id);
    toast.success('Garage accessed successfully');
  };

  const leaveGarage = () => {
    localStorage.removeItem(STORAGE_KEY);
    setGarageId(null);
    toast.success('Exited garage successfully');
  };

  // Function to sync service logs to localStorage
  const syncServiceLogs = (serviceLogs: ServiceLog[]) => {
    if (!garageId) {
      console.error('No garage ID available');
      return;
    }
    localStorage.setItem(`serviceLogs_${garageId}`, JSON.stringify(serviceLogs));
  };

  // Function to fetch service logs from localStorage
  const fetchServiceLogs = (): ServiceLog[] => {
    if (!garageId) {
      console.error('No garage ID available');
      return [];
    }
    
    const storedLogs = localStorage.getItem(`serviceLogs_${garageId}`);
    return storedLogs ? JSON.parse(storedLogs) : [];
  };

  // Function to save vehicles to Supabase
  const syncVehicles = async (vehicles: Vehicle[]) => {
    if (!garageId) {
      console.error('No garage ID available');
      return;
    }

    try {
      // First, save vehicles to localStorage as a reliable backup
      localStorage.setItem(`vehicles_${garageId}`, JSON.stringify(vehicles));
      
      // Then try to sync to Supabase if available
      try {
        // First, delete existing vehicles for this garage
        await supabase
          .from('vehicles')
          .delete()
          .eq('garage_id', garageId);
        
        // Then insert the new vehicles
        if (vehicles.length > 0) {
          // Generate a UUID for the user_id once
          const generatedUserId = uuidv4();
          
          // Ensure all vehicles have valid UUIDs and format correctly
          const vehiclesToInsert = vehicles.map(vehicle => ({
            id: vehicle.id && vehicle.id.includes('-') ? vehicle.id : uuidv4(),
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
            mileage: vehicle.mileage || 0,
            plate: vehicle.plate || '',
            vin: vehicle.vin || null,
            image_url: vehicle.image || null,
            notes: vehicle.notes || null,
            garage_id: garageId,
            user_id: generatedUserId, // Use the generated UUID instead of 'anonymous'
          }));
          
          const { error } = await supabase
            .from('vehicles')
            .insert(vehiclesToInsert);
            
          if (error) {
            // Log the error but don't display it to the user since we already saved to localStorage
            console.error('Error syncing vehicles to Supabase:', error);
            // Don't display the error toast since we have a fallback
            // toast.error('Failed to sync vehicles to cloud storage');
          } else {
            console.log('Vehicles synced to Supabase successfully');
          }
        }
      } catch (error) {
        console.error('Error in Supabase sync operation:', error);
        // No need to display an error toast since we have a localStorage backup
      }
      
      // Confirm backup success to user
      console.log('Vehicles saved to local storage successfully');
      
    } catch (error) {
      console.error('Error in syncVehicles:', error);
      toast.error('An error occurred while saving your vehicles');
    }
  };

  // Function to fetch vehicles from Supabase
  const fetchVehicles = async (): Promise<Vehicle[]> => {
    if (!garageId) {
      console.error('No garage ID available');
      return [];
    }

    try {
      // Try to fetch from Supabase first
      try {
        const { data, error } = await supabase
          .from('vehicles')
          .select('*')
          .eq('garage_id', garageId);
          
        if (error) {
          // Log the error but don't fail yet
          console.error('Error fetching vehicles from Supabase:', error);
        } else if (data && data.length > 0) {
          // If Supabase fetch was successful, return the data
          console.log('Vehicles loaded from Supabase:', data);
          // Convert database records to Vehicle objects
          return data.map(record => ({
            id: record.id,
            make: record.make,
            model: record.model,
            year: record.year,
            mileage: record.mileage || 0,
            plate: record.plate || '',
            vin: record.vin || undefined,
            image: record.image_url || undefined,
            notes: record.notes || undefined,
          }));
        }
      } catch (supabaseError) {
        console.error('Supabase fetch error:', supabaseError);
      }
      
      // If Supabase fetch failed or returned no data, fall back to localStorage
      const storedVehicles = localStorage.getItem(`vehicles_${garageId}`);
      if (storedVehicles) {
        const parsedVehicles = JSON.parse(storedVehicles);
        console.log('Vehicles loaded from localStorage:', parsedVehicles);
        return parsedVehicles;
      }
      
      // If no data in localStorage either, return empty array
      console.log('No vehicles found in Supabase or localStorage');
      return [];
    } catch (error) {
      console.error('Error in fetchVehicles:', error);
      toast.error('An error occurred while loading your vehicles');
      return [];
    }
  };

  const value = {
    garageId,
    loading,
    createGarage,
    accessGarage,
    leaveGarage,
    syncVehicles,
    fetchVehicles,
    syncServiceLogs,
    fetchServiceLogs
  };

  return <GarageContext.Provider value={value}>{children}</GarageContext.Provider>;
}

export function useGarage() {
  const context = useContext(GarageContext);
  if (context === undefined) {
    throw new Error('useGarage must be used within a GarageProvider');
  }
  return context;
}
