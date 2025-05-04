
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

interface GarageContextType {
  garageId: string | null;
  loading: boolean;
  createGarage: () => void;
  accessGarage: (id: string) => void;
  leaveGarage: () => void;
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

  const value = {
    garageId,
    loading,
    createGarage,
    accessGarage,
    leaveGarage,
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
