
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

const Index = () => {
  const navigate = useNavigate();
  const { garageId } = useGarage();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [serviceLogs, setServiceLogs] = useState<ServiceLog[]>([]);
  const [addVehicleDialogOpen, setAddVehicleDialogOpen] = useState(false);
  const [serviceLogDialogOpen, setServiceLogDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  
  // Load vehicles and service logs from localStorage based on garage ID
  useEffect(() => {
    if (garageId) {
      const storedVehicles = localStorage.getItem(`vehicles_${garageId}`);
      const storedServiceLogs = localStorage.getItem(`serviceLogs_${garageId}`);
      
      setVehicles(storedVehicles ? JSON.parse(storedVehicles) : defaultMockVehicles);
      setServiceLogs(storedServiceLogs ? JSON.parse(storedServiceLogs) : defaultMockServiceLogs);
    }
  }, [garageId]);
  
  // Save vehicles and service logs to localStorage when they change
  useEffect(() => {
    if (garageId) {
      localStorage.setItem(`vehicles_${garageId}`, JSON.stringify(vehicles));
      localStorage.setItem(`serviceLogs_${garageId}`, JSON.stringify(serviceLogs));
    }
  }, [vehicles, serviceLogs, garageId]);

  const handleAddVehicle = (vehicle: Vehicle) => {
    setVehicles(prev => [...prev, vehicle]);
  };

  const handleAddServiceLog = (serviceLog: ServiceLog) => {
    setServiceLogs(prev => [...prev, serviceLog]);
    
    // Update vehicle mileage if the service log has a higher mileage
    if (selectedVehicle && serviceLog.mileage > selectedVehicle.mileage) {
      setVehicles(prev =>
        prev.map(v =>
          v.id === selectedVehicle.id
            ? { ...v, mileage: serviceLog.mileage }
            : v
        )
      );
      
      // Update the selected vehicle reference
      setSelectedVehicle({
        ...selectedVehicle,
        mileage: serviceLog.mileage
      });
      
      toast.info(`${selectedVehicle.make} ${selectedVehicle.model} mileage updated to ${serviceLog.mileage} km`);
    }
  };

  const handleServiceLog = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setServiceLogDialogOpen(true);
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-mechanic-blue">Your Garage</h1>
          <p className="text-mechanic-gray">Track and manage your vehicle maintenance</p>
        </div>
        <Button 
          onClick={() => setAddVehicleDialogOpen(true)}
          className="bg-mechanic-blue hover:bg-mechanic-blue/90"
        >
          <Plus size={16} className="mr-1" /> Add Vehicle
        </Button>
      </div>
      
      {vehicles.length === 0 ? (
        <div className="text-center p-12 bg-mechanic-silver/20 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Welcome to Your Garage</h2>
          <p className="text-mechanic-gray mb-6">
            Add your first vehicle to start tracking maintenance history
          </p>
          <Button 
            onClick={() => setAddVehicleDialogOpen(true)}
            className="bg-mechanic-blue hover:bg-mechanic-blue/90"
          >
            <Plus size={16} className="mr-1" /> Add Vehicle
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
