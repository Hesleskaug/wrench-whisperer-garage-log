
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Vehicle } from "@/utils/mockData";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertCircle, CheckCircle2, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// Extended form schema with additional fields
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

// Interface for the vehicle lookup response
interface VehicleLookupResponse {
  make: string;
  model: string;
  year: number | null;
  vin: string;
  plate: string;
  registrationDate: string | null;
  color: string;
  weight: number | null;
  engineSize: number | null;
  fuelType: string;
  length?: number | null;
  width?: number | null;
  height?: number | null;
  enginePower?: number | null;
  engineCode?: string;
  transmission?: string;
  vehicleCategory?: string;
  bodyType?: string;
  numberOfDoors?: number | null;
  seatingCapacity?: number | null;
  inspectionDue?: string | null;
  lastInspection?: string | null;
  tireSizeFront?: string;
  tireSizeRear?: string;
  emissionClass?: string;
  co2Emission?: number | null;
  rawData?: any;
  error?: string;
}

const AddVehicleForm = ({ open, onOpenChange, onAddVehicle }: AddVehicleFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lookupSuccess, setLookupSuccess] = useState<boolean>(false);
  const [vehicleDetails, setVehicleDetails] = useState<VehicleLookupResponse | null>(null);

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
        make: data.make,
        model: data.model,
        year: data.year,
        mileage: data.mileage,
        plate: data.plate || undefined, // Ensure undefined if empty string
        vin: data.vin || undefined, // Ensure undefined if empty string
        image: data.image || undefined,
      };
      
      // Adding a small delay to simulate an API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Store any additional vehicle details from the API lookup
      if (vehicleDetails) {
        localStorage.setItem(`vehicle_details_${newVehicle.id}`, JSON.stringify(vehicleDetails));
      }
      
      onAddVehicle(newVehicle);
      toast.success("Vehicle added successfully");
      form.reset();
      setVehicleDetails(null);
      setLookupSuccess(false);
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding vehicle:", error);
      toast.error("Failed to add vehicle");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLookupPlate = async () => {
    const plateValue = form.getValues("plate");
    setLookupError(null);
    setLookupSuccess(false);
    setVehicleDetails(null);
    
    if (!plateValue || plateValue.trim() === "") {
      toast.error("Please enter a license plate");
      return;
    }
    
    setIsLookingUp(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("vehicle-lookup", {
        body: { plate: plateValue }
      });
      
      console.log("Vehicle lookup response:", data);
      
      if (error) {
        console.error("Error from edge function:", error);
        setLookupError(error.message || "Failed to fetch vehicle data");
        toast.error(error.message || "Failed to fetch vehicle data");
        return;
      }
      
      if (data.error) {
        console.error("API error:", data.error);
        setLookupError(data.error);
        toast.error(data.error === "Vehicle not found" 
          ? "No vehicle found with that license plate" 
          : "Error looking up vehicle");
        return;
      }
      
      // Store the full vehicle details
      setVehicleDetails(data);
      
      // Check if we have meaningful basic data
      const hasBasicData = data.make || data.model || data.vin || data.year;
      
      if (!hasBasicData) {
        setLookupError("No vehicle details found for this plate");
        toast.error("No vehicle details found for this plate");
        return;
      }
      
      // Update form fields with fetched data
      let fieldsUpdated = 0;
      
      if (data.make) {
        form.setValue("make", data.make);
        fieldsUpdated++;
      }
      
      if (data.model) {
        form.setValue("model", data.model);
        fieldsUpdated++;
      }
      
      if (data.year) {
        form.setValue("year", data.year);
        fieldsUpdated++;
      }
      
      if (data.vin) {
        form.setValue("vin", data.vin);
        fieldsUpdated++;
      }
      
      // Trigger validation after setting values
      if (data.make) form.trigger("make");
      if (data.model) form.trigger("model");
      if (data.year) form.trigger("year");
      
      // Only show success toast if we actually filled in some data
      if (fieldsUpdated > 0) {
        setLookupSuccess(true);
        toast.success("Vehicle found! Information filled in automatically.");
      } else {
        setLookupError("Vehicle found, but limited information available");
        toast.info("Vehicle found, but limited information available.");
      }
      
    } catch (error) {
      console.error("Error looking up vehicle:", error);
      setLookupError("Failed to lookup vehicle");
      toast.error("Failed to lookup vehicle");
    } finally {
      setIsLookingUp(false);
    }
  };

  // Format date from API (YYYY-MM-DD) to local format
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-mechanic-blue">Add New Vehicle</DialogTitle>
          <DialogDescription>
            Enter your vehicle's details below to add it to your garage.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <FormField
                control={form.control}
                name="plate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License Plate</FormLabel>
                    <div className="flex space-x-2">
                      <FormControl>
                        <Input placeholder="e.g. AB12345" {...field} />
                      </FormControl>
                      <Button 
                        type="button"
                        variant="secondary"
                        onClick={handleLookupPlate}
                        disabled={isLookingUp}
                        className="whitespace-nowrap"
                      >
                        {isLookingUp ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : null}
                        Look Up
                      </Button>
                    </div>
                    {lookupError ? (
                      <div className="flex items-center gap-2 text-sm text-red-500 mt-1">
                        <AlertCircle className="h-4 w-4" />
                        <span>{lookupError}</span>
                      </div>
                    ) : lookupSuccess ? (
                      <div className="flex items-center gap-2 text-sm text-green-500 mt-1">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Vehicle details retrieved successfully</span>
                      </div>
                    ) : (
                      <FormDescription>
                        Enter a plate number to auto-fill vehicle details
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {vehicleDetails && (
              <Card className="border-dashed border-green-200 bg-green-50 mb-4">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">Vehicle Data Retrieved</span>
                    {vehicleDetails.registrationDate && (
                      <Badge variant="outline" className="ml-auto">
                        Reg: {formatDate(vehicleDetails.registrationDate)}
                      </Badge>
                    )}
                  </div>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="vehicle-details">
                      <AccordionTrigger className="text-sm">
                        View all retrieved vehicle details
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="space-y-2">
                            <h4 className="font-medium">Basic Information</h4>
                            <p><span className="font-medium">Make:</span> {vehicleDetails.make || "N/A"}</p>
                            <p><span className="font-medium">Model:</span> {vehicleDetails.model || "N/A"}</p>
                            <p><span className="font-medium">Year:</span> {vehicleDetails.year || "N/A"}</p>
                            <p><span className="font-medium">VIN:</span> {vehicleDetails.vin || "N/A"}</p>
                            <p><span className="font-medium">Color:</span> {vehicleDetails.color || "N/A"}</p>
                            <p><span className="font-medium">Category:</span> {vehicleDetails.vehicleCategory || "N/A"}</p>
                            <p><span className="font-medium">Body Type:</span> {vehicleDetails.bodyType || "N/A"}</p>
                          </div>
                          
                          <div className="space-y-2">
                            <h4 className="font-medium">Technical Data</h4>
                            <p><span className="font-medium">Engine:</span> {vehicleDetails.engineSize ? `${vehicleDetails.engineSize}cc` : "N/A"}</p>
                            <p><span className="font-medium">Power:</span> {vehicleDetails.enginePower ? `${vehicleDetails.enginePower}kW` : "N/A"}</p>
                            <p><span className="font-medium">Fuel Type:</span> {vehicleDetails.fuelType || "N/A"}</p>
                            <p><span className="font-medium">Weight:</span> {vehicleDetails.weight ? `${vehicleDetails.weight}kg` : "N/A"}</p>
                            <p><span className="font-medium">Transmission:</span> {vehicleDetails.transmission || "N/A"}</p>
                            <p><span className="font-medium">Engine Code:</span> {vehicleDetails.engineCode || "N/A"}</p>
                          </div>

                          <div className="space-y-2">
                            <h4 className="font-medium">Dimensions</h4>
                            <p><span className="font-medium">Length:</span> {vehicleDetails.length ? `${vehicleDetails.length}mm` : "N/A"}</p>
                            <p><span className="font-medium">Width:</span> {vehicleDetails.width ? `${vehicleDetails.width}mm` : "N/A"}</p>
                            <p><span className="font-medium">Height:</span> {vehicleDetails.height ? `${vehicleDetails.height}mm` : "N/A"}</p>
                            <p><span className="font-medium">Doors:</span> {vehicleDetails.numberOfDoors || "N/A"}</p>
                            <p><span className="font-medium">Seats:</span> {vehicleDetails.seatingCapacity || "N/A"}</p>
                          </div>
                          
                          <div className="space-y-2">
                            <h4 className="font-medium">Other Information</h4>
                            <p><span className="font-medium">Inspection Due:</span> {formatDate(vehicleDetails.inspectionDue || null)}</p>
                            <p><span className="font-medium">Last Inspection:</span> {formatDate(vehicleDetails.lastInspection || null)}</p>
                            <p><span className="font-medium">Tire Size (Front):</span> {vehicleDetails.tireSizeFront || "N/A"}</p>
                            <p><span className="font-medium">Tire Size (Rear):</span> {vehicleDetails.tireSizeRear || "N/A"}</p>
                            <p><span className="font-medium">Emission Class:</span> {vehicleDetails.emissionClass || "N/A"}</p>
                            <p><span className="font-medium">CO2 Emission:</span> {vehicleDetails.co2Emission ? `${vehicleDetails.co2Emission}g/km` : "N/A"}</p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            )}

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

            <FormField
              control={form.control}
              name="vin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>VIN</FormLabel>
                  <FormControl>
                    <Input placeholder="Vehicle Identification Number (optional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
