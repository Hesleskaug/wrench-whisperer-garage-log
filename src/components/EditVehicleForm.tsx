
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Vehicle } from '@/utils/mockData';
import { z } from "zod";
import { toast } from "sonner";

const editableFieldsSchema = z.object({
  plate: z.string().optional(),
  vin: z.string().optional(),
  mileage: z.number().positive("Mileage must be positive").optional(),
  notes: z.string().optional(),
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
    plate: vehicle.plate || '',
    vin: vehicle.vin || '',
    mileage: vehicle.mileage,
    notes: '',
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
      
      // Update vehicle
      const updatedVehicle = {
        ...vehicle,
        plate: formData.plate,
        vin: formData.vin,
        mileage: formData.mileage || vehicle.mileage,
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
          <div className="space-y-2">
            <Label htmlFor="plate">License Plate</Label>
            <Input 
              id="plate" 
              name="plate" 
              value={formData.plate} 
              onChange={handleInputChange}
              placeholder="e.g. ABC123"
            />
            {errors.plate && <p className="text-sm text-red-500">{errors.plate}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="vin">VIN Number</Label>
            <Input 
              id="vin" 
              name="vin" 
              value={formData.vin} 
              onChange={handleInputChange}
              placeholder="Vehicle Identification Number"
            />
            {errors.vin && <p className="text-sm text-red-500">{errors.vin}</p>}
          </div>
          
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
