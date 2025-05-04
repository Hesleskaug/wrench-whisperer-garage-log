
import { useState } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Vehicle } from '@/utils/mockData';
import { CarFront, Wrench, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NorwegianPlate from './NorwegianPlate';
import { useLanguage } from '@/contexts/LanguageContext';
import { Badge } from "@/components/ui/badge";

interface VehicleCardProps {
  vehicle: Vehicle;
  onServiceLog: () => void;
}

const VehicleCard = ({ vehicle, onServiceLog }: VehicleCardProps) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const { t } = useLanguage();
  
  const handleViewDetails = () => {
    navigate(`/vehicle/${vehicle.id}`);
  };
  
  // Get fuel badge color based on fuel type
  const getFuelBadgeColor = (fuelType: string | undefined) => {
    if (!fuelType) return "bg-gray-100 text-gray-800";
    
    const fuelType_lower = fuelType.toLowerCase();
    if (fuelType_lower.includes("diesel")) return "bg-black text-white";
    if (fuelType_lower.includes("e5")) return "bg-green-100 text-green-800";
    if (fuelType_lower.includes("e10")) return "bg-yellow-100 text-yellow-800";
    if (fuelType_lower.includes("ev") || fuelType_lower.includes("electric")) return "bg-blue-100 text-blue-800";
    if (fuelType_lower.includes("hybrid")) return "bg-purple-100 text-purple-800";
    if (fuelType_lower.includes("lpg")) return "bg-orange-100 text-orange-800";
    return "bg-gray-100 text-gray-800";
  };
  
  // Display vehicle image or fallback to icon
  const getImageToDisplay = () => {
    // If vehicle has an image and no error loading it, use that
    if (vehicle.image && !imageError) {
      return (
        <div className="relative">
          <img 
            src={vehicle.image} 
            alt={`${vehicle.make} ${vehicle.model}`}
            className="w-full h-40 object-cover"
            onError={() => setImageError(true)}
          />
          
          {/* Mobile camera button overlay */}
          <div className="absolute bottom-2 right-2 md:hidden">
            <Button 
              variant="secondary"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/vehicle/${vehicle.id}`);
              }}
              className="bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full shadow-md"
            >
              <Camera size={20} />
            </Button>
          </div>
        </div>
      );
    }
    
    // Fallback to icon
    return (
      <div className="relative h-40 bg-mechanic-gray/10 flex items-center justify-center">
        <CarFront size={50} className="text-mechanic-gray/30" />
        
        {/* Mobile camera button overlay */}
        <div className="absolute bottom-2 right-2 md:hidden">
          <Button 
            variant="secondary"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/vehicle/${vehicle.id}`);
            }}
            className="bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full shadow-md"
          >
            <Camera size={20} />
          </Button>
        </div>
      </div>
    );
  };

  // Determine fuel type for display
  const getFuelTypeDisplay = () => {
    if (!vehicle.specs?.fuelType) return null;
    
    return (
      <Badge className={getFuelBadgeColor(vehicle.specs.fuelType)}>
        {vehicle.specs.fuelType}
      </Badge>
    );
  };

  return (
    <Card className="overflow-hidden hover:mechanic-shadow transition-all duration-300">
      <div className="relative">
        {getImageToDisplay()}
      </div>
      
      <CardContent className="pt-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-mechanic-blue">
              {vehicle.make} {vehicle.model}
            </h3>
            <p className="text-mechanic-gray">{vehicle.year}</p>
            
            {/* Display fuel type badge if available */}
            {getFuelTypeDisplay()}
          </div>
          <NorwegianPlate plate={vehicle.plate} />
        </div>
        <p className="mt-2 text-sm text-mechanic-gray/80">
          {t('currentMileage')}: <span className="font-semibold">{vehicle.mileage.toLocaleString()} km</span>
        </p>
      </CardContent>
      
      <CardFooter className="flex gap-2 justify-between pt-0">
        <Button 
          size="sm" 
          variant="outline" 
          className="flex-1"
          onClick={handleViewDetails}
        >
          {t('details')}
        </Button>
        <Button 
          size="sm" 
          className="flex-1 bg-mechanic-blue hover:bg-mechanic-blue/90"
          onClick={onServiceLog}
        >
          <Wrench size={16} className="mr-1" /> {t('logService')}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default VehicleCard;
