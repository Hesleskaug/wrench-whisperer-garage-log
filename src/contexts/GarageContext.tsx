
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
  saveVehicle: (vehicle: Vehicle) => Promise<any>; 
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

  // Use this effect to update RLS context whenever garage ID changes
  useEffect(() => {
    if (garageId) {
      setCurrentGarageId(garageId).catch(error => {
        console.error('Failed to set garage ID for RLS:', error);
      });
    }
  }, [garageId]);

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

  // New function to save a single vehicle directly to the database
  const saveVehicle = async (vehicle: Vehicle) => {
    if (!garageId) {
      console.error('No garage ID available');
      return Promise.reject(new Error('No garage ID available'));
    }

    try {
      // Make sure we set the RLS context before any operations
      await setCurrentGarageId(garageId);
      
      // Prepare vehicle data for insert/update
      const vehicleData = {
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
      };

      // Save to Supabase - use upsert to handle both insert and update
      const { data, error } = await supabase
        .from('vehicles')
        .upsert(vehicleData)
        .select();
      
      if (error) {
        console.error('Error saving vehicle to database:', error);
        throw error;
      }
      
      console.log('Successfully saved vehicle to database:', data);

      // Also save to localStorage as a backup
      const existingVehicles = JSON.parse(localStorage.getItem(`vehicles_${garageId}`) || '[]');
      const updatedVehicles = existingVehicles
        .filter((v: Vehicle) => v.id !== vehicle.id)
        .concat([vehicle]);
      localStorage.setItem(`vehicles_${garageId}`, JSON.stringify(updatedVehicles));
      
      return data;
    } catch (error) {
      console.error('Error in saveVehicle:', error);
      throw error;
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
        const vehicles = data.map(record => ({
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
        
        // Update localStorage with the latest from Supabase
        localStorage.setItem(`vehicles_${garageId}`, JSON.stringify(vehicles));
        
        return vehicles;
      }
      
      // If no data in Supabase, try to get data from localStorage
      const storedVehicles = localStorage.getItem(`vehicles_${garageId}`);
      if (storedVehicles) {
        const parsedVehicles = JSON.parse(storedVehicles);
        return parsedVehicles;
      }
      
      // If no data anywhere, return empty array
      return [];
    } catch (error) {
      console.error('Error in fetchVehicles:', error);
      
      // Try to fall back to localStorage data
      const storedVehicles = localStorage.getItem(`vehicles_${garageId}`);
      if (storedVehicles) {
        return JSON.parse(storedVehicles);
      }
      
      throw error;
    }
  };

  const value = {
    garageId,
    loading,
    createGarage,
    accessGarage,
    leaveGarage,
    saveVehicle,
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
