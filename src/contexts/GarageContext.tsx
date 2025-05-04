
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { Vehicle } from '@/utils/mockData';

interface GarageContextType {
  garageId: string | null;
  loading: boolean;
  createGarage: () => void;
  accessGarage: (id: string) => void;
  leaveGarage: () => void;
  syncVehicles: (vehicles: Vehicle[]) => Promise<void>;
  fetchVehicles: () => Promise<Vehicle[]>;
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

  // Function to save vehicles to Supabase
  const syncVehicles = async (vehicles: Vehicle[]) => {
    if (!garageId) {
      console.error('No garage ID available');
      return;
    }

    try {
      // First, delete existing vehicles for this garage
      await supabase
        .from('vehicles')
        .delete()
        .eq('garage_id', garageId);
      
      // Then insert the new vehicles
      if (vehicles.length > 0) {
        // Convert vehicle objects to match the database schema
        const vehiclesToInsert = vehicles.map(vehicle => ({
          id: vehicle.id,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          mileage: vehicle.mileage || 0,
          plate: vehicle.plate || '',
          vin: vehicle.vin || null,
          image_url: vehicle.image || null,
          notes: vehicle.notes || null,
          garage_id: garageId,
          // Add any other necessary fields
        }));
        
        const { error } = await supabase
          .from('vehicles')
          .insert(vehiclesToInsert);
          
        if (error) {
          console.error('Error syncing vehicles to Supabase:', error);
          toast.error('Failed to sync vehicles to cloud storage');
        } else {
          console.log('Vehicles synced to Supabase successfully');
        }
      }
    } catch (error) {
      console.error('Error in syncVehicles:', error);
      toast.error('An error occurred while syncing vehicles');
    }
  };

  // Function to fetch vehicles from Supabase
  const fetchVehicles = async (): Promise<Vehicle[]> => {
    if (!garageId) {
      console.error('No garage ID available');
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('garage_id', garageId);
        
      if (error) {
        console.error('Error fetching vehicles from Supabase:', error);
        toast.error('Failed to fetch vehicles from cloud storage');
        return [];
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
          garage_id: record.garage_id,
          // Map any other necessary fields
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error in fetchVehicles:', error);
      toast.error('An error occurred while fetching vehicles');
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
    fetchVehicles
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
