import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Vehicle, ServiceLog, ServiceTask } from "@/utils/mockData";
import { toast } from "sonner";
import TaskImageUploader from './TaskImageUploader';

const formSchema = z.object({
  date: z.date({
    required_error: "A date is required.",
  }),
  mileage: z.coerce.number().int().min(0, "Mileage must be a positive number"),
  serviceType: z.string().min(1, "Service type is required"),
  description: z.string().min(1, "Description is required"),
  parts: z.string().optional(),
  cost: z.coerce.number().optional(),
});

interface ServiceLogFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle: Vehicle | null;
  onAddServiceLog: (serviceLog: ServiceLog) => void;
}

const ServiceLogForm = ({ open, onOpenChange, vehicle, onAddServiceLog }: ServiceLogFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tasks, setTasks] = useState<ServiceTask[]>([]);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [taskDescription, setTaskDescription] = useState('');
  const [taskNotes, setTaskNotes] = useState('');
  const [taskTools, setTaskTools] = useState<string[]>([]);
  const [taskTorque, setTaskTorque] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptStore, setReceiptStore] = useState('');
  const [receiptInvoice, setReceiptInvoice] = useState('');
  const [receiptDate, setReceiptDate] = useState('');
  const [receiptAmount, setReceiptAmount] = useState<number | undefined>(undefined);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      mileage: 0,
      serviceType: "",
      description: "",
      parts: "",
      cost: undefined,
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      if (!vehicle) {
        toast.error("Vehicle is not selected");
        return;
      }
      
      // In a real app, you would call an API here
      const newServiceLog: ServiceLog = {
        id: Date.now().toString(), // Generate a temporary ID
        vehicleId: vehicle.id,
        date: format(data.date, 'yyyy-MM-dd'),
        mileage: data.mileage,
        serviceType: data.serviceType,
        description: data.description,
        parts: data.parts?.split(',').map(part => part.trim()),
        cost: data.cost,
        tasks: tasks.length > 0 ? tasks : undefined,
      };
      
      // Adding a small delay to simulate an API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onAddServiceLog(newServiceLog);
      toast.success("Service log added successfully");
      form.reset();
      setTasks([]);
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding service log:", error);
      toast.error("Failed to add service log");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const addTask = () => {
    const newTask: ServiceTask = {
      id: `task-${Date.now()}`,
      description: taskDescription,
      completed: true,
      notes: taskNotes || undefined,
      toolsRequired: taskTools.length > 0 ? taskTools : undefined,
      torqueSpec: taskTorque || undefined,
      receipt: showReceipt ? {
        store: receiptStore,
        invoiceNumber: receiptInvoice || undefined,
        date: receiptDate || undefined,
        amount: receiptAmount || undefined,
      } : undefined,
      images: taskImages.length > 0 ? [...taskImages] : undefined,
    };
    
    setTasks([...tasks, newTask]);
    
    // Reset form fields
    setTaskDescription('');
    setTaskNotes('');
    setTaskTorque('');
    setTaskTools([]);
    setTaskImages([]);
    setShowReceipt(false);
    setReceiptStore('');
    setReceiptInvoice('');
    setReceiptDate('');
    setReceiptAmount(undefined);
    setTaskDialogOpen(false);
  };
  
  // Add state for task images
  const [taskImages, setTaskImages] = useState<string[]>([]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-mechanic-blue">Log New Service</DialogTitle>
          <DialogDescription>
            Enter the details of the service performed on this vehicle.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[240px] pl-3 text-left font-normal",
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
              name="serviceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Type</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Oil Change" {...field} />
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
                    <Textarea placeholder="e.g. Changed oil and filter" className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="parts"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parts Used (comma separated)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Oil filter, 5L Castrol Edge 5W-30" {...field} />
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
                  <FormLabel>Cost</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g. 1200" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div>
              <Label>Tasks</Label>
              {tasks.length > 0 ? (
                <ul className="mt-2 space-y-2">
                  {tasks.map((task) => (
                    <li key={task.id} className="flex items-center justify-between border rounded-md p-2">
                      <span>{task.description}</span>
                      <Button variant="ghost" size="sm" onClick={() => setTasks(tasks.filter(t => t.id !== task.id))}>
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground mt-2">No tasks added yet.</p>
              )}
              <Button 
                type="button" 
                variant="secondary" 
                size="sm" 
                className="mt-2"
                onClick={() => setTaskDialogOpen(true)}
              >
                Add Task
              </Button>
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
                {isSubmitting ? "Adding..." : "Add Service Log"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
      
      <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Service Task</DialogTitle>
            <DialogDescription>
              Add details about a specific task performed during this service.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="task-description">Description</Label>
              <Input
                id="task-description"
                placeholder="e.g. Changed oil"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="task-notes">Notes</Label>
              <Textarea
                id="task-notes"
                placeholder="e.g. Used synthetic oil"
                value={taskNotes}
                onChange={(e) => setTaskNotes(e.target.value)}
                className="resize-none"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="task-tools">Tools Required (comma separated)</Label>
              <Input
                id="task-tools"
                placeholder="e.g. 17mm socket, wrench"
                value={taskTools.join(', ')}
                onChange={(e) => setTaskTools(e.target.value.split(',').map(tool => tool.trim()))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="task-torque">Torque Specification</Label>
              <Input
                id="task-torque"
                placeholder="e.g. 25 Nm"
                value={taskTorque}
                onChange={(e) => setTaskTorque(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="task-images">Task Images</Label>
              <TaskImageUploader 
                images={taskImages} 
                onImagesChange={setTaskImages} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="receipt">Receipt Information</Label>
              <Button variant="secondary" size="sm" onClick={() => setShowReceipt(!showReceipt)}>
                {showReceipt ? 'Hide Receipt' : 'Add Receipt'}
              </Button>
              
              {showReceipt && (
                <div className="mt-2 space-y-2">
                  <Input
                    placeholder="Store Name"
                    value={receiptStore}
                    onChange={(e) => setReceiptStore(e.target.value)}
                  />
                  <Input
                    placeholder="Invoice Number"
                    value={receiptInvoice}
                    onChange={(e) => setReceiptInvoice(e.target.value)}
                  />
                  <Input
                    placeholder="Date"
                    value={receiptDate}
                    onChange={(e) => setReceiptDate(e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={receiptAmount || ''}
                    onChange={(e) => setReceiptAmount(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                  />
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setTaskDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={addTask}>Add Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

export default ServiceLogForm;
