import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import VehicleCard from "@/components/VehicleCard";
import AddVehicleForm from "@/components/AddVehicleForm";
import ServiceLogForm from "@/components/ServiceLogForm";
import { Vehicle, ServiceLog, mockVehicles as defaultMockVehicles, mockServiceLogs as defaultMockServiceLogs } from "@/utils/mockData";
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';
import { useGarage } from '@/contexts/GarageContext';
import { useLanguage } from '@/contexts/LanguageContext';

const Index = () => {
  const navigate = useNavigate();
  const { garageId, syncVehicles, fetchVehicles, syncServiceLogs, fetchServiceLogs } = useGarage();
  const { t } = useLanguage();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [serviceLogs, setServiceLogs] = useState<ServiceLog[]>([]);
  const [addVehicleDialogOpen, setAddVehicleDialogOpen] = useState(false);
  const [serviceLogDialogOpen, setServiceLogDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
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
    
    // Update vehicle mileage if the service log has a higher mileage
    if (selectedVehicle && serviceLog.mileage > selectedVehicle.mileage) {
      const updatedVehicles = vehicles.map(v =>
        v.id === selectedVehicle.id
          ? { ...v, mileage: serviceLog.mileage }
          : v
      );
      
      setVehicles(updatedVehicles);
      
      // Sync updated vehicles to Supabase
      if (garageId) {
        syncVehicles(updatedVehicles).catch(error => {
          console.error('Failed to sync updated mileage to Supabase:', error);
        });
      }
      
      // Update the selected vehicle reference
      setSelectedVehicle({
        ...selectedVehicle,
        mileage: serviceLog.mileage
      });
      
      toast.info(`${selectedVehicle.make} ${selectedVehicle.model} ${t('currentMileage')}: ${serviceLog.mileage} km`);
    }
  };

  const handleServiceLog = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setServiceLogDialogOpen(true);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-mechanic-blue">{t('yourGarage')}</h1>
            <p className="text-mechanic-gray">{t('trackMaintenance')}</p>
          </div>
        </div>
        <div className="text-center p-12 bg-mechanic-silver/20 rounded-lg">
          <p className="text-mechanic-gray animate-pulse">Loading your garage...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-mechanic-blue">{t('yourGarage')}</h1>
          <p className="text-mechanic-gray">{t('trackMaintenance')}</p>
        </div>
        <Button 
          onClick={() => setAddVehicleDialogOpen(true)}
          className="bg-mechanic-blue hover:bg-mechanic-blue/90"
        >
          <Plus size={16} className="mr-1" /> {t('addVehicle')}
        </Button>
      </div>
      
      {vehicles.length === 0 ? (
        <div className="text-center p-12 bg-mechanic-silver/20 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">{t('welcomeGarage')}</h2>
          <p className="text-mechanic-gray mb-6">
            {t('addFirstVehicle')}
          </p>
          <Button 
            onClick={() => setAddVehicleDialogOpen(true)}
            className="bg-mechanic-blue hover:bg-mechanic-blue/90"
          >
            <Plus size={16} className="mr-1" /> {t('addVehicle')}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map(vehicle => (
            <VehicleCard 
              key={vehicle.id} 
              vehicle={vehicle} 
              onServiceLog={() => handleServiceLog(vehicle)} 
            />
          ))}
        </div>
      )}
      
      <AddVehicleForm
        open={addVehicleDialogOpen}
        onOpenChange={setAddVehicleDialogOpen}
        onAddVehicle={handleAddVehicle}
      />
      
      <ServiceLogForm
        open={serviceLogDialogOpen}
        onOpenChange={setServiceLogDialogOpen}
        vehicle={selectedVehicle}
        onAddServiceLog={handleAddServiceLog}
      />
    </div>
  );
};

export default Index;
