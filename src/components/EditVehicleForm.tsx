
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Vehicle } from '@/utils/mockData';
import { z } from "zod";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

const editableFieldsSchema = z.object({
  notes: z.string().optional(),
  mileage: z.number().positive("Mileage must be positive").optional(),
  oilCapacity: z.string().optional(),
  oilType: z.string().optional(),
  sparkPlugGap: z.string().optional(),
  coolantType: z.string().optional(),
  tirePressureFront: z.string().optional(),
  tirePressureRear: z.string().optional(),
});

type EditableFields = z.infer<typeof editableFieldsSchema>;

interface EditVehicleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle: Vehicle;
  onUpdateVehicle: (updatedVehicle: Vehicle) => void;
}

const EditVehicleForm = ({ open, onOpenChange, vehicle, onUpdateVehicle }: EditVehicleFormProps) => {
  const [formData, setFormData] = useState<EditableFields>({
    mileage: vehicle.mileage,
    notes: '',
    oilCapacity: vehicle.specs?.oilCapacity || '',
    oilType: vehicle.specs?.oilType || '',
    sparkPlugGap: vehicle.specs?.sparkPlugGap || '',
    coolantType: vehicle.specs?.coolantType || '',
    tirePressureFront: vehicle.specs?.tirePressureFront || '',
    tirePressureRear: vehicle.specs?.tirePressureRear || '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle mileage as a number
    if (name === 'mileage') {
      const numValue = value === '' ? 0 : parseInt(value, 10);
      setFormData(prev => ({ ...prev, [name]: numValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate form data
      editableFieldsSchema.parse(formData);
      
      // Update vehicle specs
      const updatedSpecs = {
        ...vehicle.specs,
        oilCapacity: formData.oilCapacity,
        oilType: formData.oilType,
        sparkPlugGap: formData.sparkPlugGap,
        coolantType: formData.coolantType,
        tirePressureFront: formData.tirePressureFront,
        tirePressureRear: formData.tirePressureRear,
      };
      
      // Update vehicle
      const updatedVehicle = {
        ...vehicle,
        mileage: formData.mileage || vehicle.mileage,
        specs: updatedSpecs,
      };
      
      onUpdateVehicle(updatedVehicle);
      onOpenChange(false);
      toast.success("Vehicle details updated successfully");
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path[0] as string;
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
      } else {
        console.error("Error updating vehicle:", error);
        toast.error("Failed to update vehicle details");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Vehicle Details</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Read-only fields */}
          <div className="space-y-2">
            <Label htmlFor="plate">License Plate</Label>
            <Input 
              id="plate" 
              name="plate" 
              value={vehicle.plate || 'N/A'} 
              readOnly
              disabled
              className="bg-gray-100"
            />
            <p className="text-xs text-muted-foreground">License plate cannot be edited</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="vin">VIN Number</Label>
            <Input 
              id="vin" 
              name="vin" 
              value={vehicle.vin || 'N/A'} 
              readOnly
              disabled
              className="bg-gray-100"
            />
            <p className="text-xs text-muted-foreground">VIN number cannot be edited</p>
          </div>
          
          {/* Editable fields */}
          <div className="space-y-2">
            <Label htmlFor="mileage">Current Mileage (km)</Label>
            <Input 
              id="mileage" 
              name="mileage" 
              type="number"
              min="0"
              value={formData.mileage || ''} 
              onChange={handleInputChange}
              placeholder="e.g. 45000"
            />
            {errors.mileage && <p className="text-sm text-red-500">{errors.mileage}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="oilCapacity">Oil Capacity</Label>
            <Input 
              id="oilCapacity" 
              name="oilCapacity" 
              value={formData.oilCapacity} 
              onChange={handleInputChange}
              placeholder="e.g. 5.2 L"
            />
            {errors.oilCapacity && <p className="text-sm text-red-500">{errors.oilCapacity}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="oilType">Oil Type</Label>
            <Input 
              id="oilType" 
              name="oilType" 
              value={formData.oilType} 
              onChange={handleInputChange}
              placeholder="e.g. 5W-30"
            />
            {errors.oilType && <p className="text-sm text-red-500">{errors.oilType}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="sparkPlugGap">Spark Plug Gap</Label>
            <Input 
              id="sparkPlugGap" 
              name="sparkPlugGap" 
              value={formData.sparkPlugGap} 
              onChange={handleInputChange}
              placeholder="e.g. 0.7-0.8 mm"
            />
            {errors.sparkPlugGap && <p className="text-sm text-red-500">{errors.sparkPlugGap}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="coolantType">Coolant Type</Label>
            <Input 
              id="coolantType" 
              name="coolantType" 
              value={formData.coolantType} 
              onChange={handleInputChange}
              placeholder="e.g. Long Life Coolant"
            />
            {errors.coolantType && <p className="text-sm text-red-500">{errors.coolantType}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tirePressureFront">Tire Pressure Front</Label>
            <Input 
              id="tirePressureFront" 
              name="tirePressureFront" 
              value={formData.tirePressureFront} 
              onChange={handleInputChange}
              placeholder="e.g. 2.4 bar (35 psi)"
            />
            {errors.tirePressureFront && <p className="text-sm text-red-500">{errors.tirePressureFront}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tirePressureRear">Tire Pressure Rear</Label>
            <Input 
              id="tirePressureRear" 
              name="tirePressureRear" 
              value={formData.tirePressureRear} 
              onChange={handleInputChange}
              placeholder="e.g. 2.4 bar (35 psi)"
            />
            {errors.tirePressureRear && <p className="text-sm text-red-500">{errors.tirePressureRear}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea 
              id="notes" 
              name="notes" 
              value={formData.notes} 
              onChange={handleInputChange}
              placeholder="Additional notes about your vehicle"
              className="min-h-[100px]"
            />
            {errors.notes && <p className="text-sm text-red-500">{errors.notes}</p>}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditVehicleForm;
