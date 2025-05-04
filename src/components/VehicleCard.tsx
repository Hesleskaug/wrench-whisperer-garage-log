
import { useState } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Vehicle } from '@/utils/mockData';
import { CarFront, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface VehicleCardProps {
  vehicle: Vehicle;
  onServiceLog: () => void;
}

const VehicleCard = ({ vehicle, onServiceLog }: VehicleCardProps) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  
  const handleViewDetails = () => {
    navigate(`/vehicle/${vehicle.id}`);
  };
  
  // Display vehicle image or fallback to icon
  const getImageToDisplay = () => {
    // If vehicle has an image and no error loading it, use that
    if (vehicle.image && !imageError) {
      return (
        <img 
          src={vehicle.image} 
          alt={`${vehicle.make} ${vehicle.model}`}
          className="w-full h-40 object-cover"
          onError={() => setImageError(true)}
        />
      );
    }
    
    // Fallback to icon
    return (
      <div className="h-40 bg-mechanic-gray/10 flex items-center justify-center">
        <CarFront size={50} className="text-mechanic-gray/30" />
      </div>
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
          </div>
          <div className="bg-mechanic-silver px-3 py-1 rounded-full text-xs font-medium text-mechanic-dark">
            {vehicle.plate || "No Plate"}
          </div>
        </div>
        <p className="mt-2 text-sm text-mechanic-gray/80">
          Current Mileage: <span className="font-semibold">{vehicle.mileage.toLocaleString()} km</span>
        </p>
      </CardContent>
      
      <CardFooter className="flex gap-2 justify-between pt-0">
        <Button 
          size="sm" 
          variant="outline" 
          className="flex-1"
          onClick={handleViewDetails}
        >
          Details
        </Button>
        <Button 
          size="sm" 
          className="flex-1 bg-mechanic-blue hover:bg-mechanic-blue/90"
          onClick={onServiceLog}
        >
          <Wrench size={16} className="mr-1" /> Log Service
        </Button>
      </CardFooter>
    </Card>
  );
};

export default VehicleCard;
