
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VehicleSpecs } from "@/utils/mockData";
import { Wrench, Info, Users, Database, AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface VehicleSpecsCardProps {
  specs: VehicleSpecs | undefined;
  isCommunityData?: boolean;
  vehicleDetails?: any; // Add vehicleDetails prop from API
}

// Helper component for displaying spec items with tooltips for additional info
const SpecItem = ({ label, value, tooltip }: { label: string; value: string; tooltip?: string }) => (
  <div key={label} className="border-b border-gray-100 pb-2">
    <div className="flex items-center gap-1">
      <p className="text-sm text-mechanic-gray">{label}</p>
      {tooltip && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info size={14} className="text-mechanic-gray/70 cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="w-[200px] text-xs">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
    <p className="font-medium">{value}</p>
  </div>
);

const VehicleSpecsCard = ({ specs, isCommunityData = false, vehicleDetails }: VehicleSpecsCardProps) => {
  // Check if we should use API data instead of community or mock data
  const hasApiData = !!vehicleDetails;
  
  if (!specs && !vehicleDetails) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Wrench size={18} className="mr-2" /> Vehicle Specifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-6">
            <p className="text-mechanic-gray">Specifications not available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Map API data to specs format where available
  const engineType = vehicleDetails?.fuelType || specs?.engineType || "N/A";
  const enginePower = vehicleDetails?.enginePower ? `${vehicleDetails.enginePower} kW` : specs?.enginePower || "N/A";
  const engineSize = vehicleDetails?.engineSize ? `${vehicleDetails.engineSize}cc` : specs?.engineSize || "N/A";
  const engineCode = vehicleDetails?.engineCode || specs?.engineCode || "N/A";
  const transmission = vehicleDetails?.transmission || specs?.transmission || "N/A";
  
  // Tire data from API
  const tireSizeFront = vehicleDetails?.tireSizeFront || specs?.tireSize || "N/A";
  const tireSizeRear = vehicleDetails?.tireSizeRear || (vehicleDetails?.tireSizeFront !== vehicleDetails?.tireSizeRear && vehicleDetails?.tireSizeRear) || specs?.tireSize || "N/A";
  
  // Organize specs into categories for better readability
  const engineSpecs = [
    { 
      label: "Engine Type", 
      value: engineType,
      tooltip: "The configuration and displacement of the engine"
    },
    { 
      label: "Engine Size", 
      value: engineSize,
      tooltip: "Engine displacement in cubic centimeters"
    },
    { 
      label: "Engine Power", 
      value: enginePower,
      tooltip: "Maximum power output of the engine"
    },
    { 
      label: "Engine Code", 
      value: engineCode,
      tooltip: "Manufacturer's engine code designation"
    },
    { 
      label: "Transmission", 
      value: transmission,
      tooltip: "Type of transmission system"
    },
    { 
      label: "Oil Capacity", 
      value: specs?.oilCapacity || "N/A",
      tooltip: "Total oil capacity for oil changes"
    },
    { 
      label: "Oil Type", 
      value: specs?.oilType || "N/A",
      tooltip: "Recommended oil viscosity grade"
    },
    { 
      label: "Spark Plug Gap", 
      value: specs?.sparkPlugGap || "N/A",
      tooltip: "Optimal gap between spark plug electrodes"
    },
    { 
      label: "Coolant Type", 
      value: specs?.coolantType || "N/A",
      tooltip: "Recommended coolant specification"
    },
  ];

  // Combine tire information from API or community data
  const wheelTireSpecs = [
    { 
      label: "Wheel Torque", 
      value: specs?.wheelTorque || "N/A",
      tooltip: "Recommended torque for wheel nuts/bolts"
    },
    { 
      label: "Tire Pressure (Front)", 
      value: specs?.tirePressureFront || "N/A",
      tooltip: "Recommended tire pressure for front tires"
    },
    { 
      label: "Tire Pressure (Rear)", 
      value: specs?.tirePressureRear || "N/A",
      tooltip: "Recommended tire pressure for rear tires"
    },
    { 
      label: "Tire Size (Front)", 
      value: tireSizeFront,
      tooltip: "Standard tire size for front wheels"
    },
    { 
      label: "Tire Size (Rear)", 
      value: tireSizeRear,
      tooltip: "Standard tire size for rear wheels"
    },
    { 
      label: "Wheel Size", 
      value: specs?.wheelSize || "N/A",
      tooltip: "Diameter and width of the wheel"
    },
  ];

  const electricalSpecs = [
    { 
      label: "Battery Size", 
      value: specs?.batterySize || "N/A",
      tooltip: "Battery capacity and cold cranking amps"
    },
    { 
      label: "Alternator Output", 
      value: specs?.alternatorOutput || "N/A",
      tooltip: "Maximum amperage output of the alternator"
    },
    { 
      label: "Fuse Box Locations", 
      value: specs?.fuseBoxLocations || "N/A",
      tooltip: "Primary locations of vehicle fuse boxes"
    },
  ];

  // Add brake information
  const brakeSpecs = [
    { 
      label: "Front Brake Type", 
      value: specs?.frontBrakeType || "N/A",
      tooltip: "Type and size of front brakes"
    },
    { 
      label: "Rear Brake Type", 
      value: specs?.rearBrakeType || "N/A",
      tooltip: "Type and size of rear brakes"
    },
    { 
      label: "Brake Fluid Type", 
      value: specs?.brakeFluidType || "N/A",
      tooltip: "Recommended brake fluid specification"
    },
  ];

  // Add dimensions from API data
  const dimensionsSpecs = vehicleDetails ? [
    { 
      label: "Length", 
      value: vehicleDetails.length ? `${vehicleDetails.length} mm` : "N/A",
      tooltip: "Overall vehicle length in millimeters"
    },
    { 
      label: "Width", 
      value: vehicleDetails.width ? `${vehicleDetails.width} mm` : "N/A", 
      tooltip: "Overall vehicle width in millimeters"
    },
    { 
      label: "Height", 
      value: vehicleDetails.height ? `${vehicleDetails.height} mm` : "N/A",
      tooltip: "Overall vehicle height in millimeters"
    },
    { 
      label: "Weight", 
      value: vehicleDetails.weight ? `${vehicleDetails.weight} kg` : "N/A",
      tooltip: "Vehicle weight in kilograms"
    },
    {
      label: "Seating Capacity",
      value: vehicleDetails.seatingCapacity ? `${vehicleDetails.seatingCapacity}` : "N/A",
      tooltip: "Number of seats in the vehicle"
    },
    {
      label: "Number of Doors",
      value: vehicleDetails.numberOfDoors ? `${vehicleDetails.numberOfDoors}` : "N/A",
      tooltip: "Number of doors on the vehicle"
    }
  ] : [];

  // Additional environmental information from API
  const environmentalSpecs = vehicleDetails?.emissionClass ? [
    { 
      label: "Emission Class", 
      value: vehicleDetails.emissionClass || "N/A",
      tooltip: "Vehicle emissions classification standard"
    },
    { 
      label: "CO2 Emissions", 
      value: vehicleDetails.co2Emission ? `${vehicleDetails.co2Emission} g/km` : "N/A",
      tooltip: "Carbon dioxide emissions in grams per kilometer"
    }
  ] : [];

  // Format inspection dates for display
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString();
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Wrench size={18} className="mr-2" /> Vehicle Specifications
          
          {hasApiData && (
            <div className="ml-auto">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">
                    <Database size={12} />
                    <span>Official Data</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="w-[250px] text-xs">These specifications were retrieved from official vehicle registration data</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
          
          {!hasApiData && isCommunityData && (
            <div className="ml-auto">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs">
                    <Users size={12} />
                    <span>Community Data</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="w-[250px] text-xs">These specifications were provided by the community based on similar vehicles</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isCommunityData && !hasApiData && (
          <Alert className="mb-4 bg-amber-50">
            <AlertDescription className="text-xs">
              <strong>Community Information:</strong> These specifications are shared by other users with the same make and model. 
              Always verify with your vehicle's manual or a professional mechanic before performing maintenance.
            </AlertDescription>
          </Alert>
        )}
        
        {hasApiData && (
          <Alert className="mb-4 bg-blue-50">
            <AlertDescription className="text-xs">
              <strong>Official Data:</strong> These specifications were retrieved from the vehicle registration database. 
              Maintenance-specific values might still need to be added manually.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Display inspection information if available from API data */}
        {vehicleDetails?.inspectionDue && (
          <div className="mt-2 mb-5 p-3 bg-amber-50 rounded-md border border-amber-200">
            <h4 className="font-medium text-amber-800 flex items-center mb-2">
              <AlertCircle size={16} className="mr-1" /> Inspection Information
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-amber-700">Next Inspection Due</span>
                <Badge variant="outline" className="bg-amber-100 text-amber-800">
                  {formatDate(vehicleDetails.inspectionDue)}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-amber-700">Last Inspection</span>
                <Badge variant="outline" className="bg-amber-100 text-amber-800">
                  {formatDate(vehicleDetails.lastInspection)}
                </Badge>
              </div>
            </div>
            
            {/* Alert for upcoming inspection */}
            {vehicleDetails.inspectionDue && new Date(vehicleDetails.inspectionDue) < new Date(new Date().setMonth(new Date().getMonth() + 2)) && (
              <div className="flex items-center mt-2 pt-2 border-t border-amber-200 text-xs text-red-700 gap-1">
                <AlertCircle size={12} />
                <span>Inspection due soon</span>
              </div>
            )}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-mechanic-blue mb-2 border-b pb-1">Engine & Drivetrain</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {engineSpecs.map((item) => (
                <SpecItem 
                  key={item.label}
                  label={item.label} 
                  value={item.value}
                  tooltip={item.tooltip} 
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-mechanic-blue mb-2 border-b pb-1">Wheels & Tires</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {wheelTireSpecs.map((item) => (
                <SpecItem 
                  key={item.label}
                  label={item.label} 
                  value={item.value}
                  tooltip={item.tooltip} 
                />
              ))}
            </div>
          </div>

          {/* Show dimensions section only if we have API data */}
          {dimensionsSpecs.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-mechanic-blue mb-2 border-b pb-1">Dimensions & Capacity</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {dimensionsSpecs.map((item) => (
                  <SpecItem 
                    key={item.label}
                    label={item.label} 
                    value={item.value}
                    tooltip={item.tooltip} 
                  />
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-mechanic-blue mb-2 border-b pb-1">Electrical</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {electricalSpecs.map((item) => (
                <SpecItem 
                  key={item.label}
                  label={item.label} 
                  value={item.value}
                  tooltip={item.tooltip} 
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-mechanic-blue mb-2 border-b pb-1">Brakes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {brakeSpecs.map((item) => (
                <SpecItem 
                  key={item.label}
                  label={item.label} 
                  value={item.value}
                  tooltip={item.tooltip} 
                />
              ))}
            </div>
          </div>

          {/* Show environmental section only if we have API data */}
          {environmentalSpecs.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-mechanic-blue mb-2 border-b pb-1">Environmental</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {environmentalSpecs.map((item) => (
                  <SpecItem 
                    key={item.label}
                    label={item.label} 
                    value={item.value}
                    tooltip={item.tooltip} 
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        
        {specs?.additionalNotes && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-mechanic-blue mb-2 border-b pb-1">Additional Notes</h3>
            <p className="text-sm mt-1">{specs.additionalNotes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VehicleSpecsCard;
