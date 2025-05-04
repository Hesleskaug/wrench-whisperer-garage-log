
import { Vehicle } from "@/utils/mockData";
import VehicleCard from "@/components/VehicleCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface VehicleListProps {
  vehicles: Vehicle[];
  onAddVehicle: () => void;
  onServiceLog: (vehicle: Vehicle) => void;
  isLoading: boolean;
  pendingSaves?: string[];
}

const VehicleList = ({ vehicles, onAddVehicle, onServiceLog, isLoading, pendingSaves = [] }: VehicleListProps) => {
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="text-center p-12 bg-mechanic-silver/20 rounded-lg">
        <p className="text-mechanic-gray animate-pulse">Loading your garage...</p>
      </div>
    );
  }
  
  if (vehicles.length === 0) {
    return (
      <div className="text-center p-12 bg-mechanic-silver/20 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">{t('welcomeGarage')}</h2>
        <p className="text-mechanic-gray mb-6">
          {t('addFirstVehicle')}
        </p>
        <Button 
          onClick={onAddVehicle}
          className="bg-mechanic-blue hover:bg-mechanic-blue/90"
        >
          <Plus size={16} className="mr-1" /> {t('addVehicle')}
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {vehicles.map(vehicle => (
        <VehicleCard 
          key={vehicle.id} 
          vehicle={vehicle} 
          onServiceLog={() => onServiceLog(vehicle)} 
          needsSave={pendingSaves.includes(vehicle.id)}
        />
      ))}
    </div>
  );
};

export default VehicleList;
