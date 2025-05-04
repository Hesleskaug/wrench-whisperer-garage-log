import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, PlusCircle, X, Wrench, Receipt } from "lucide-react";
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
import { Vehicle, ServiceLog, ServiceTask } from "@/utils/mockData";

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
  const [tasks, setTasks] = useState<ServiceTask[]>([]);
  const [currentTask, setCurrentTask] = useState({
    description: "",
    tools: "",
    torqueSpec: "",
    notes: "",
    receiptStore: "",
    receiptInvoice: "",
    receiptDate: "",
    receiptAmount: "",
  });
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showReceiptFields, setShowReceiptFields] = useState(false);

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

  const handleAddTask = () => {
    if (!currentTask.description.trim()) {
      toast.error("Task description is required");
      return;
    }

    const newTask: ServiceTask = {
      id: Date.now().toString(),
      description: currentTask.description,
      completed: true,
      notes: currentTask.notes || undefined,
      torqueSpec: currentTask.torqueSpec || undefined,
      toolsRequired: currentTask.tools ? currentTask.tools.split(',').map(tool => tool.trim()) : undefined
    };

    // Add receipt information if a store is provided
    if (currentTask.receiptStore.trim()) {
      newTask.receipt = {
        store: currentTask.receiptStore.trim(),
        invoiceNumber: currentTask.receiptInvoice.trim() || undefined,
        date: currentTask.receiptDate.trim() || undefined,
        amount: currentTask.receiptAmount ? Number(currentTask.receiptAmount) : undefined
      };
    }

    setTasks(prev => [...prev, newTask]);
    setCurrentTask({
      description: "",
      tools: "",
      torqueSpec: "",
      notes: "",
      receiptStore: "",
      receiptInvoice: "",
      receiptDate: "",
      receiptAmount: "",
    });
    toast.success("Task added");
  };

  const handleRemoveTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

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
        tasks: tasks.length > 0 ? tasks : undefined,
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
      setTasks([]);
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
      <DialogContent className="sm:max-w-[650px]">
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

              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <Wrench size={18} />
                    <h3 className="font-medium">Service Tasks</h3>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowTaskForm(!showTaskForm)}
                  >
                    <PlusCircle size={16} className="mr-1" />
                    Add Task
                  </Button>
                </div>

                {showTaskForm && (
                  <div className="space-y-3 mb-4 border-b pb-4">
                    <div>
                      <label className="text-sm font-medium">Task Description*</label>
                      <Textarea 
                        placeholder="e.g. Remove oil drain plug (17mm socket)" 
                        className="resize-none mt-1"
                        value={currentTask.description}
                        onChange={(e) => setCurrentTask(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Tools Required (comma separated)</label>
                      <Input 
                        placeholder="e.g. 17mm socket, Torque wrench" 
                        className="mt-1"
                        value={currentTask.tools}
                        onChange={(e) => setCurrentTask(prev => ({ ...prev, tools: e.target.value }))}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium">Torque Spec</label>
                        <Input 
                          placeholder="e.g. 25 Nm"
                          className="mt-1"
                          value={currentTask.torqueSpec}
                          onChange={(e) => setCurrentTask(prev => ({ ...prev, torqueSpec: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Notes</label>
                        <Input 
                          placeholder="Additional notes"
                          className="mt-1"
                          value={currentTask.notes}
                          onChange={(e) => setCurrentTask(prev => ({ ...prev, notes: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowReceiptFields(!showReceiptFields)}
                        className="flex items-center gap-1 mb-3"
                      >
                        <Receipt size={14} />
                        {showReceiptFields ? "Hide Receipt Details" : "Add Purchase Receipt"}
                      </Button>

                      {showReceiptFields && (
                        <div className="space-y-3 border-t pt-3">
                          <div>
                            <label className="text-sm font-medium">Store/Vendor*</label>
                            <Input 
                              placeholder="e.g. AutoZone, Amazon"
                              className="mt-1"
                              value={currentTask.receiptStore}
                              onChange={(e) => setCurrentTask(prev => ({ ...prev, receiptStore: e.target.value }))}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-sm font-medium">Invoice/Order #</label>
                              <Input 
                                placeholder="Optional"
                                className="mt-1"
                                value={currentTask.receiptInvoice}
                                onChange={(e) => setCurrentTask(prev => ({ ...prev, receiptInvoice: e.target.value }))}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Purchase Date</label>
                              <Input 
                                placeholder="YYYY-MM-DD (Optional)"
                                className="mt-1"
                                value={currentTask.receiptDate}
                                onChange={(e) => setCurrentTask(prev => ({ ...prev, receiptDate: e.target.value }))}
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Amount (kr)</label>
                            <Input 
                              type="number"
                              placeholder="Optional"
                              className="mt-1"
                              value={currentTask.receiptAmount}
                              onChange={(e) => setCurrentTask(prev => ({ ...prev, receiptAmount: e.target.value }))}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <Button 
                        type="button" 
                        onClick={handleAddTask}
                        size="sm"
                        className="bg-mechanic-blue hover:bg-mechanic-blue/90"
                      >
                        Add to List
                      </Button>
                    </div>
                  </div>
                )}

                {tasks.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {tasks.map((task, index) => (
                      <div key={task.id} className="flex items-start gap-2 bg-mechanic-silver/10 p-2 rounded text-sm">
                        <div className="mt-0.5 flex-shrink-0 text-mechanic-gray">{index + 1}.</div>
                        <div className="flex-1">
                          <div className="font-medium">{task.description}</div>
                          {task.toolsRequired && (
                            <div className="text-xs text-mechanic-gray mt-1">
                              Tools: {task.toolsRequired.join(', ')}
                            </div>
                          )}
                          {(task.torqueSpec || task.notes) && (
                            <div className="flex gap-2 mt-1">
                              {task.torqueSpec && (
                                <span className="text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                                  {task.torqueSpec}
                                </span>
                              )}
                              {task.notes && (
                                <span className="text-xs text-mechanic-gray italic">
                                  {task.notes}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-mechanic-gray"
                          onClick={() => handleRemoveTask(task.id)}
                        >
                          <X size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-sm text-mechanic-gray">
                    No tasks added yet. Add tasks to document your service procedure.
                  </div>
                )}
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
