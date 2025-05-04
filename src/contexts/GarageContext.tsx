
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

  // Set the current garage ID in Supabase for RLS 
  const setCurrentGarageId = async (garageId: string) => {
    try {
      console.log('Setting current garage ID to:', garageId);
      const { error } = await supabase.rpc('set_current_garage_id', { garage_id: garageId });
      
      if (error) {
        console.error('Error setting current garage ID:', error);
        throw error;
      }
      
      console.log('Successfully set current garage ID for RLS');
      return true;
    } catch (error) {
      console.error('Exception setting current garage ID:', error);
      throw error;
    }
  };

  // Function to delete existing vehicles for a garage
  const deleteExistingVehicles = async (garageId: string) => {
    try {
      // Set the RLS context first
      await setCurrentGarageId(garageId);
      
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('garage_id', garageId);
      
      if (error) {
        console.error('Error deleting existing vehicles:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Exception during vehicle delete:', error);
      return false;
    }
  };

  // Improved function to insert vehicles in batches with proper RLS context
  const insertVehicleBatch = async (vehicles: any[], garageId: string) => {
    try {
      // Ensure we set the RLS context before each operation
      await setCurrentGarageId(garageId);
      
      // Insert vehicles with proper RLS context
      const { data, error } = await supabase
        .from('vehicles')
        .insert(vehicles)
        .select();
      
      if (error) {
        console.error('Error inserting vehicles batch:', error);
        throw error;
      }
      
      console.log('Successfully inserted vehicles batch:', data);
      return data;
    } catch (error) {
      console.error('Exception during vehicle batch insert:', error);
      throw error;
    }
  };

  // Improved function to save vehicles to Supabase
  const syncVehicles = async (vehicles: Vehicle[]) => {
    if (!garageId) {
      console.error('No garage ID available');
      return Promise.reject(new Error('No garage ID available'));
    }

    // First, save vehicles to localStorage as a reliable backup
    localStorage.setItem(`vehicles_${garageId}`, JSON.stringify(vehicles));
    console.log('Vehicles saved to localStorage:', vehicles);
    
    try {
      // Make sure we set the RLS context before any operations
      await setCurrentGarageId(garageId);
      
      // Format vehicles for Supabase insert
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
        user_id: garageId, // Using garageId as user_id for RLS purposes
      }));
      
      // Try to delete existing vehicles for this garage first
      const deleteSuccessful = await deleteExistingVehicles(garageId);
      if (!deleteSuccessful) {
        console.log('Could not delete existing vehicles, will attempt to insert/update anyway');
      }
      
      // Insert in batches to avoid payload size issues
      if (vehicles.length > 0) {
        const batchSize = 3; // Smaller batch size for better reliability
        let results = [];
        
        for (let i = 0; i < vehiclesToInsert.length; i += batchSize) {
          // Set RLS context again to ensure it persists
          await setCurrentGarageId(garageId);
          
          const batch = vehiclesToInsert.slice(i, i + batchSize);
          const batchResult = await insertVehicleBatch(batch, garageId);
          results.push(batchResult);
          
          // Small delay between batches
          if (i + batchSize < vehiclesToInsert.length) {
            await new Promise(resolve => setTimeout(resolve, 300));
          }
        }
        
        console.log('All vehicle batches processed successfully:', results);
        return Promise.resolve(results);
      }
      
      return Promise.resolve([]);
    } catch (error) {
      console.error('Error in syncVehicles:', error);
      return Promise.reject(error);
    }
  };

  // Improved function to fetch vehicles from Supabase
  const fetchVehicles = async (): Promise<Vehicle[]> => {
    if (!garageId) {
      console.error('No garage ID available');
      return Promise.resolve([]);
    }

    try {
      // Set the current garage ID for RLS
      await setCurrentGarageId(garageId);
      
      // Try to fetch from Supabase with RLS context set
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('garage_id', garageId);
        
      if (error) {
        console.error('Error fetching vehicles from Supabase:', error);
        throw error;
      }
      
      if (data && data.length > 0) {
        console.log('Retrieved vehicles from Supabase:', data);
        
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
      
      // If no data in Supabase, return empty array
      console.log('No vehicles found in Supabase');
      return [];
    } catch (error) {
      console.error('Error in fetchVehicles:', error);
      throw error;
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
