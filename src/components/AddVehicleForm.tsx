
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Vehicle } from "@/utils/mockData";

const formSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 1),
  plate: z.string().optional(),
  vin: z.string().optional(),
  mileage: z.coerce.number().int().min(0, "Mileage must be a positive number"),
  image: z.string().url().optional().or(z.literal("")),
});

interface AddVehicleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddVehicle: (vehicle: Vehicle) => void;
}

const AddVehicleForm = ({ open, onOpenChange, onAddVehicle }: AddVehicleFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      make: "",
      model: "",
      year: new Date().getFullYear(),
      plate: "",
      vin: "",
      mileage: 0,
      image: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      // In a real app, you would call an API here
      const newVehicle: Vehicle = {
        id: Date.now().toString(), // Generate a temporary ID
        ...data,
      };
      
      // Adding a small delay to simulate an API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onAddVehicle(newVehicle);
      toast.success("Vehicle added successfully");
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding vehicle:", error);
      toast.error("Failed to add vehicle");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-mechanic-blue">Add New Vehicle</DialogTitle>
          <DialogDescription>
            Enter your vehicle's details below to add it to your garage.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="make"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Make</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Toyota" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Corolla" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="mileage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Mileage (km)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="plate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License Plate</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="vin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>VIN</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="Optional - paste an image URL" {...field} />
                  </FormControl>
                  <FormDescription>
                    Leave blank to use the default vehicle icon
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-mechanic-blue hover:bg-mechanic-blue/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Adding..." : "Add Vehicle"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddVehicleForm;
