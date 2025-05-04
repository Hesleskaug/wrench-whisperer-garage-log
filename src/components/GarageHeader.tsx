
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface GarageHeaderProps {
  onAddVehicle: () => void;
}

const GarageHeader = ({ onAddVehicle }: GarageHeaderProps) => {
  const { t } = useLanguage();
  
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div>
        <h1 className="text-3xl font-bold text-mechanic-blue">{t('yourGarage')}</h1>
        <p className="text-mechanic-gray">{t('trackMaintenance')}</p>
      </div>
      <Button 
        onClick={onAddVehicle}
        className="bg-mechanic-blue hover:bg-mechanic-blue/90"
      >
        <Plus size={16} className="mr-1" /> {t('addVehicle')}
      </Button>
    </div>
  );
};

export default GarageHeader;
