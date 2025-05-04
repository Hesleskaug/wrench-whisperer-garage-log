
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

  // Utility function to validate UUID format
  const isValidUUID = (uuid: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  // Use this effect to update RLS context whenever garage ID changes
  useEffect(() => {
    const updateRlsContext = async () => {
      if (!garageId) return;
      
      try {
        console.log('Setting RLS context for garage ID:', garageId);
        // Make sure we're setting a valid UUID format
        if (!isValidUUID(garageId)) {
          console.error('Invalid garage ID format for RLS context:', garageId);
          return;
        }

        const { error } = await supabase.rpc('set_current_garage_id', { 
          garage_id: garageId 
        });
        
        if (error) {
          console.error('Failed to set garage ID for RLS:', error);
        } else {
          console.log('Successfully set garage ID for RLS');
        }
      } catch (error) {
        console.error('Error setting garage ID for RLS:', error);
      }
    };
    
    updateRlsContext();
  }, [garageId]);

  const createGarage = () => {
    const newGarageId = uuidv4();
    localStorage.setItem(STORAGE_KEY, newGarageId);
    setGarageId(newGarageId);
    toast.success('New garage created! Save this ID to access your garage later.');
  };

  const accessGarage = (id: string) => {
    // Basic validation for UUID format
    if (!isValidUUID(id)) {
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

  // Function to save a single vehicle directly to the database
  const saveVehicle = async (vehicle: Vehicle) => {
    if (!garageId) {
      console.error('No garage ID available');
      return Promise.reject(new Error('No garage ID available'));
    }

    if (!isValidUUID(garageId)) {
      console.error('Invalid garage ID format:', garageId);
      return Promise.reject(new Error('Invalid garage ID format'));
    }

    try {
      // First ensure the RLS context is set immediately before operations
      console.log('Setting current garage ID before saving vehicle:', garageId);
      await supabase.rpc('set_current_garage_id', { garage_id: garageId });
      
      // Prepare vehicle data for insert/update
      const vehicleId = vehicle.id && isValidUUID(vehicle.id) ? vehicle.id : uuidv4();
      
      const vehicleData = {
        id: vehicleId,
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

      console.log('Saving vehicle with data:', vehicleData);
      
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
      return data;
    } catch (error) {
      console.error('Error in saveVehicle:', error);
      throw error;
    }
  };

  // Function to fetch vehicles from Supabase
  const fetchVehicles = async (): Promise<Vehicle[]> => {
    if (!garageId) {
      console.error('No garage ID available');
      return Promise.resolve([]);
    }

    if (!isValidUUID(garageId)) {
      console.error('Invalid garage ID format:', garageId);
      return Promise.resolve([]);
    }

    try {
      // Set the current garage ID for RLS
      console.log('Setting current garage ID before fetching vehicles:', garageId);
      await supabase.rpc('set_current_garage_id', { garage_id: garageId });
      
      // Try to fetch from Supabase with RLS context set
      console.log('Fetching vehicles with garage_id:', garageId);
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
        
        return vehicles;
      }
      
      // If no data in Supabase, return empty array
      console.log('No vehicles found in database');
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
