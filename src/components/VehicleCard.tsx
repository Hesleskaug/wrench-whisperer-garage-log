
import { Vehicle } from "@/utils/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { HistoryIcon, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface VehicleCardProps {
  vehicle: Vehicle;
  onServiceLog: () => void;
  needsSave?: boolean;
}

const VehicleCard = ({ vehicle, onServiceLog, needsSave = false }: VehicleCardProps) => {
  const { t } = useLanguage();
  
  return (
    <Card className="overflow-hidden relative">
      {needsSave && (
        <div className="absolute top-2 right-2 bg-amber-100 text-amber-800 px-2 py-1 rounded-md flex items-center gap-1.5 text-xs font-medium border border-amber-300">
          <AlertTriangle size={12} />
          Unsaved
        </div>
      )}
      
      <div className="h-36 bg-gray-200 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-bold">{vehicle.make} {vehicle.model}</p>
          <p className="text-sm text-gray-600">{vehicle.year} · {vehicle.licensePlate}</p>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h3 className="font-semibold">{t('currentMileage')}</h3>
            <p className="text-lg">{vehicle.mileage} km</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">{t('fuelType')}</p>
            <p>{vehicle.fuelType}</p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="bg-gray-50 p-4">
        <Button 
          variant="outline" 
          className="w-full flex gap-2 items-center"
          onClick={onServiceLog}
        >
          <HistoryIcon size={16} />
          {t('serviceHistory')}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default VehicleCard;
