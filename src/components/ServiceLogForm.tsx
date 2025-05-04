
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Vehicle, ServiceLog } from "@/utils/mockData";

const formSchema = z.object({
  date: z.date(),
  mileage: z.coerce.number().int().min(0),
  serviceType: z.string().min(1, "Service type is required"),
  description: z.string().min(1, "Description is required"),
  parts: z.string().optional(),
  cost: z.coerce.number().min(0).optional(),
});

interface ServiceLogFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle: Vehicle | null;
  onAddServiceLog: (serviceLog: ServiceLog) => void;
}

const ServiceLogForm = ({ 
  open, 
  onOpenChange, 
  vehicle, 
  onAddServiceLog 
}: ServiceLogFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      mileage: vehicle?.mileage || 0,
      serviceType: "",
      description: "",
      parts: "",
      cost: undefined,
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!vehicle) return;
    
    setIsSubmitting(true);
    
    try {
      // Parse parts from comma-separated string to array
      const parts = data.parts ? data.parts.split(',').map(part => part.trim()) : undefined;
      
      // In a real app, you would call an API here
      const newServiceLog: ServiceLog = {
        id: Date.now().toString(), // Generate a temporary ID
        vehicleId: vehicle.id,
        date: data.date.toISOString().split('T')[0],
        mileage: data.mileage,
        serviceType: data.serviceType,
        description: data.description,
        parts,
        cost: data.cost,
      };
      
      // Adding a small delay to simulate an API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onAddServiceLog(newServiceLog);
      toast.success("Service log added successfully");
      
      // Update vehicle mileage if the service log has a higher mileage
      if (data.mileage > vehicle.mileage) {
        // In a real app, you would update the vehicle mileage in the database
        console.log(`Vehicle mileage updated from ${vehicle.mileage} to ${data.mileage}`);
      }
      
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding service log:", error);
      toast.error("Failed to add service log");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-mechanic-blue">Log Service</DialogTitle>
          <DialogDescription>
            {vehicle ? (
              <>Record maintenance for your {vehicle.year} {vehicle.make} {vehicle.model}</>
            ) : (
              <>Select a vehicle to log service</>
            )}
          </DialogDescription>
        </DialogHeader>

        {vehicle ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Service Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mileage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mileage (km)</FormLabel>
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
                name="serviceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Type</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Oil Change, Brake Service" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the service performed"
                        className="resize-none"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="parts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parts Used (comma separated)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Oil filter, Air filter" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cost (kr)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Optional" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                  {isSubmitting ? "Saving..." : "Save Service Log"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <div className="text-center py-6">
            <p className="text-mechanic-gray">No vehicle selected.</p>
            <Button 
              onClick={() => onOpenChange(false)} 
              className="mt-4"
            >
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ServiceLogForm;
