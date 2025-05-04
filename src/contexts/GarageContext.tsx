
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

  // Set the current garage ID in Supabase for RLS with proper error handling
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

  // Function to delete existing vehicles for a garage with proper RLS context
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

  // Function to insert vehicles in batches with proper RLS context
  const insertVehicleBatch = async (vehicles: any[], garageId: string) => {
    try {
      // Set the RLS context first
      await setCurrentGarageId(garageId);
      
      const { error } = await supabase
        .from('vehicles')
        .insert(vehicles);
      
      if (error) {
        console.error('Error inserting vehicles batch:', error);
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Exception during vehicle batch insert:', error);
      throw error;
    }
  };

  // Function to save vehicles to Supabase with improved RLS handling
  const syncVehicles = async (vehicles: Vehicle[]) => {
    if (!garageId) {
      console.error('No garage ID available');
      return Promise.reject(new Error('No garage ID available'));
    }

    // First, save vehicles to localStorage as a reliable backup
    localStorage.setItem(`vehicles_${garageId}`, JSON.stringify(vehicles));
    console.log('Vehicles saved to localStorage:', vehicles);
    
    try {
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
      await deleteExistingVehicles(garageId);
      
      // Insert in batches to avoid payload size issues
      if (vehicles.length > 0) {
        const batchSize = 5;
        let syncSuccessful = false;
        
        for (let i = 0; i < vehiclesToInsert.length; i += batchSize) {
          const batch = vehiclesToInsert.slice(i, i + batchSize);
          await insertVehicleBatch(batch, garageId);
          syncSuccessful = true;
        }
        
        if (syncSuccessful) {
          console.log('Vehicles synced to Supabase successfully');
        }
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error in syncVehicles:', error);
      return Promise.reject(error);
    }
  };

  // Function to fetch vehicles from Supabase with better error handling
  const fetchVehicles = async (): Promise<Vehicle[]> => {
    if (!garageId) {
      console.error('No garage ID available');
      return Promise.resolve([]);
    }

    try {
      // Set the current garage ID for RLS
      await setCurrentGarageId(garageId);
      
      // Try to fetch from Supabase
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('garage_id', garageId);
        
      if (error) {
        console.error('Error fetching vehicles from Supabase:', error);
        throw error;
      }
      
      if (data && data.length > 0) {
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
