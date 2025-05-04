
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VehicleSpecs } from "@/utils/mockData";
import { Wrench } from "lucide-react";

interface VehicleSpecsCardProps {
  specs: VehicleSpecs | undefined;
}

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

  const specItems = [
    { label: "Wheel Torque", value: specs.wheelTorque },
    { label: "Oil Capacity", value: specs.oilCapacity },
    { label: "Oil Type", value: specs.oilType },
    { label: "Tire Pressure (Front)", value: specs.tirePressureFront },
    { label: "Tire Pressure (Rear)", value: specs.tirePressureRear },
    { label: "Battery Size", value: specs.batterySize },
    { label: "Spark Plug Gap", value: specs.sparkPlugGap || "N/A" },
    { label: "Coolant Type", value: specs.coolantType || "N/A" },
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Wrench size={18} className="mr-2" /> Vehicle Specifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {specItems.map((item) => (
            <div key={item.label} className="border-b border-gray-100 pb-2">
              <p className="text-sm text-mechanic-gray">
                {item.label}
              </p>
              <p className="font-medium">{item.value}</p>
            </div>
          ))}
        </div>
        
        {specs.additionalNotes && (
          <div className="mt-4">
            <p className="text-sm text-mechanic-gray">Additional Notes</p>
            <p className="text-sm mt-1">{specs.additionalNotes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VehicleSpecsCard;
