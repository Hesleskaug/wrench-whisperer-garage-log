
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VehicleSpecs } from "@/utils/mockData";
import { Wrench, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface VehicleSpecsCardProps {
  specs: VehicleSpecs | undefined;
}

// Helper component for displaying spec items with tooltips for additional info
const SpecItem = ({ label, value, tooltip }: { label: string; value: string; tooltip?: string }) => (
  <div key={label} className="border-b border-gray-100 pb-2">
    <div className="flex items-center gap-1">
      <p className="text-sm text-mechanic-gray">{label}</p>
      {tooltip && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Info size={14} className="text-mechanic-gray/70 cursor-help" />
          </TooltipTrigger>
          <TooltipContent>
            <p className="w-[200px] text-xs">{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
    <p className="font-medium">{value}</p>
  </div>
);

const VehicleSpecsCard = ({ specs }: VehicleSpecsCardProps) => {
  if (!specs) {
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

  // Organize specs into categories for better readability
  const engineSpecs = [
    { 
      label: "Engine Type", 
      value: specs.engineType || "N/A",
      tooltip: "The configuration and displacement of the engine"
    },
    { 
      label: "Engine Power", 
      value: specs.enginePower || "N/A",
      tooltip: "Maximum power output of the engine"
    },
    { 
      label: "Oil Capacity", 
      value: specs.oilCapacity,
      tooltip: "Total oil capacity for oil changes"
    },
    { 
      label: "Oil Type", 
      value: specs.oilType,
      tooltip: "Recommended oil viscosity grade"
    },
    { 
      label: "Spark Plug Gap", 
      value: specs.sparkPlugGap || "N/A",
      tooltip: "Optimal gap between spark plug electrodes"
    },
    { 
      label: "Coolant Type", 
      value: specs.coolantType || "N/A",
      tooltip: "Recommended coolant specification"
    },
  ];

  const wheelTireSpecs = [
    { 
      label: "Wheel Torque", 
      value: specs.wheelTorque,
      tooltip: "Recommended torque for wheel nuts/bolts"
    },
    { 
      label: "Tire Pressure (Front)", 
      value: specs.tirePressureFront,
      tooltip: "Recommended tire pressure for front tires"
    },
    { 
      label: "Tire Pressure (Rear)", 
      value: specs.tirePressureRear,
      tooltip: "Recommended tire pressure for rear tires"
    },
    { 
      label: "Tire Size", 
      value: specs.tireSize || "N/A",
      tooltip: "Standard tire size for this vehicle"
    },
    { 
      label: "Wheel Size", 
      value: specs.wheelSize || "N/A",
      tooltip: "Diameter and width of the wheel"
    },
  ];

  const electricalSpecs = [
    { 
      label: "Battery Size", 
      value: specs.batterySize,
      tooltip: "Battery capacity and cold cranking amps"
    },
    { 
      label: "Alternator Output", 
      value: specs.alternatorOutput || "N/A",
      tooltip: "Maximum amperage output of the alternator"
    },
    { 
      label: "Fuse Box Locations", 
      value: specs.fuseBoxLocations || "N/A",
      tooltip: "Primary locations of vehicle fuse boxes"
    },
  ];

  const brakeSpecs = [
    { 
      label: "Front Brake Type", 
      value: specs.frontBrakeType || "N/A",
      tooltip: "Type and size of front brakes"
    },
    { 
      label: "Rear Brake Type", 
      value: specs.rearBrakeType || "N/A",
      tooltip: "Type and size of rear brakes"
    },
    { 
      label: "Brake Fluid Type", 
      value: specs.brakeFluidType || "N/A",
      tooltip: "Recommended brake fluid specification"
    },
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Wrench size={18} className="mr-2" /> Vehicle Specifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-mechanic-blue mb-2 border-b pb-1">Engine</h3>
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
        </div>
        
        {specs.additionalNotes && (
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
