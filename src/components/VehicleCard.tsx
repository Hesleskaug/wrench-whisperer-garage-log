
import { useState } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Vehicle } from '@/utils/mockData';
import { CarFront, Wrench, Image } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface VehicleCardProps {
  vehicle: Vehicle;
  onServiceLog: () => void;
}

// Generic car images based on vehicle body type
const getGenericVehicleImage = (vehicle: Vehicle): string => {
  const type = vehicle.bodyType?.toLowerCase() || '';
  const make = vehicle.make?.toLowerCase() || '';

  // Return image based on body type or make
  if (type.includes('suv') || make.includes('suv')) {
    return "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1470&auto=format&fit=crop";
  } else if (type.includes('sedan') || type.includes('saloon')) {
    return "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=1470&auto=format&fit=crop";
  } else if (type.includes('hatch') || type.includes('compact')) {
    return "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1470&auto=format&fit=crop";
  } else if (type.includes('coupe') || type.includes('sport')) {
    return "https://images.unsplash.com/photo-1532581140115-3e355d1ed1de?q=80&w=1470&auto=format&fit=crop";
  } else if (type.includes('pickup') || type.includes('truck')) {
    return "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1470&auto=format&fit=crop";
  } else if (type.includes('convertible') || type.includes('cabrio')) {
    return "https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=1470&auto=format&fit=crop";
  } else if (type.includes('minivan') || type.includes('mpv')) {
    return "https://images.unsplash.com/photo-1543465077-db45d34b88a5?q=80&w=1470&auto=format&fit=crop";
  } else {
    // Default image if no specific type is detected
    return "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=1470&auto=format&fit=crop";
  }
};

const VehicleCard = ({ vehicle, onServiceLog }: VehicleCardProps) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  
  const handleViewDetails = () => {
    navigate(`/vehicle/${vehicle.id}`);
  };
  
  // Determine which image to show
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
    
    // If vehicle has bodyType or we can guess the type, use a generic image
    const genericImage = getGenericVehicleImage(vehicle);
    if (genericImage) {
      return (
        <img 
          src={genericImage} 
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
