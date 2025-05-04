import { useState, useEffect } from "react";
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
import { CalendarIcon, Receipt, Mic, Plus, X, Upload, Camera, Save, Copy, Clock, PackagePlus, Tag } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import TaskDialog from "./TaskDialog";

// Define service templates
const serviceTemplates = {
  "oil-change": {
    title: "Oil Change",
    description: "Changed engine oil and filter",
    parts: [
      { name: "Oil filter", quantity: 1, price: 15 },
      { name: "Engine oil", quantity: 5, price: 12 }
    ],
    reference: [
      { label: "Oil capacity", value: "4.2 L" },
      { label: "Filter torque", value: "25 Nm" }
    ]
  },
  "brake-pads": {
    title: "Brake Pads",
    description: "Replaced front and/or rear brake pads",
    parts: [
      { name: "Front brake pads (set)", quantity: 1, price: 45 },
      { name: "Brake cleaner", quantity: 1, price: 8 }
    ],
    reference: [
      { label: "Caliper bolt torque", value: "28 Nm" },
      { label: "Guide pin torque", value: "35 Nm" }
    ]
  },
  "tire-swap": {
    title: "Tire Swap",
    description: "Seasonal tire change and rotation",
    parts: [],
    reference: [
      { label: "Wheel torque", value: "103 Nm" },
      { label: "Tire pressure", value: "2.4 bar / 35 psi" }
    ]
  },
  "custom": {
    title: "Custom Service",
    description: "",
    parts: [],
    reference: []
  }
};

// Define the checklist item type
interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

// Define the part item type
interface PartItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

const formSchema = z.object({
  date: z.date({
    required_error: "A date is required.",
  }),
  mileage: z.coerce.number().int().min(0, "Mileage must be a positive number"),
  serviceType: z.string().min(1, "Service type is required"),
  description: z.string().min(1, "Description is required"),
  nextDueMileage: z.coerce.number().int().min(0, "Next due mileage must be a positive number").optional(),
  nextDueDate: z.date().optional(),
  totalCost: z.coerce.number().min(0).optional(),
});

interface ServiceLogFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle: Vehicle | null;
  onAddServiceLog: (serviceLog: ServiceLog) => void;
  editingLog?: ServiceLog;
}

const ServiceLogForm = ({ 
  open, 
  onOpenChange, 
  vehicle, 
  onAddServiceLog, 
  editingLog 
}: ServiceLogFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tasks, setTasks] = useState<ServiceTask[]>([]);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptStore, setReceiptStore] = useState('');
  const [receiptInvoice, setReceiptInvoice] = useState('');
  const [receiptDate, setReceiptDate] = useState('');
  const [receiptAmount, setReceiptAmount] = useState<number | undefined>(undefined);
  const [receiptImages, setReceiptImages] = useState<string[]>([]);
  const [receiptNote, setReceiptNote] = useState('');
  const [receiptWebsiteUrl, setReceiptWebsiteUrl] = useState('');
  
  // New states for enhanced features
  const [parts, setParts] = useState<PartItem[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [serviceReferences, setServiceReferences] = useState<{label: string, value: string}[]>([]);
  const [totalCost, setTotalCost] = useState<number>(0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      mileage: vehicle?.mileage || 0,
      serviceType: "",
      description: "",
      nextDueMileage: undefined,
      nextDueDate: undefined,
      totalCost: 0,
    },
  });
  
  // Populate form when editing an existing service log
  useEffect(() => {
    if (editingLog && open) {
      // Set form values from the editing log
      form.setValue('date', new Date(editingLog.date));
      form.setValue('mileage', editingLog.mileage);
      form.setValue('serviceType', editingLog.serviceType);
      form.setValue('description', editingLog.description || '');
      
      if (editingLog.nextDueMileage) {
        form.setValue('nextDueMileage', editingLog.nextDueMileage);
      }
      
      if (editingLog.nextDueDate) {
        form.setValue('nextDueDate', new Date(editingLog.nextDueDate));
      }
      
      form.setValue('totalCost', editingLog.cost || 0);
      setTotalCost(editingLog.cost || 0);
      
      // Set parts from the editing log
      if (editingLog.parts && editingLog.parts.length) {
        const parsedParts = editingLog.parts.map((part, idx) => {
          // Try to extract quantity and name
          const matches = part.match(/(.*)\s*\((\d+)\)$/);
          if (matches && matches.length > 2) {
            return {
              id: `part-${Date.now()}-${idx}`,
              name: matches[1].trim(),
              quantity: parseInt(matches[2], 10) || 1,
              price: 0 // We don't store individual prices
            };
          }
          return {
            id: `part-${Date.now()}-${idx}`,
            name: part,
            quantity: 1,
            price: 0
          };
        });
        setParts(parsedParts);
      }
      
      // Extract tasks to the tasks state
      if (editingLog.tasks && editingLog.tasks.length) {
        setTasks(editingLog.tasks);
      }
    } else if (!editingLog && open) {
      // Reset form for a new service log entry
      form.setValue('date', new Date());
      form.setValue('mileage', vehicle?.mileage || 0);
      form.setValue('serviceType', '');
      form.setValue('description', '');
      form.setValue('nextDueMileage', undefined);
      form.setValue('nextDueDate', undefined);
      form.setValue('totalCost', 0);
      setTotalCost(0);
      setParts([]);
      setTasks([]);
    }
  }, [editingLog, open, form, vehicle]);

  const onSubmit = async (data: z.infer<typeof formSchema>, createAnother: boolean = false) => {
    setIsSubmitting(true);
    
    try {
      if (!vehicle) {
        toast.error("Vehicle is not selected");
        return;
      }
      
      // Create parts array from the parts state
      const partsArray = parts.map(part => `${part.name} (${part.quantity})`);
      
      // In a real app, you would call an API here
      const serviceLog: ServiceLog = {
        id: editingLog ? editingLog.id : Date.now().toString(), // Use existing ID or generate a new one
        vehicleId: vehicle.id,
        date: format(data.date, 'yyyy-MM-dd'),
        mileage: data.mileage,
        serviceType: data.serviceType,
        description: data.description,
        parts: partsArray,
        cost: totalCost,
        tasks: [...tasks, ...checklist.map(item => ({
          id: item.id,
          description: item.text,
          completed: item.checked
        } as ServiceTask))],
        nextDueMileage: data.nextDueMileage,
        nextDueDate: data.nextDueDate ? format(data.nextDueDate, 'yyyy-MM-dd') : undefined,
      };
      
      // Adding a small delay to simulate an API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onAddServiceLog(serviceLog);
      toast.success(editingLog ? "Service log updated successfully" : "Service log added successfully");
      
      if (!createAnother) {
        resetForm();
        onOpenChange(false);
      } else {
        // Reset form but keep the vehicle and date
        const currentDate = form.getValues('date');
        const currentMileage = form.getValues('mileage');
        resetForm();
        form.setValue('date', currentDate);
        form.setValue('mileage', currentMileage);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Error with service log:", error);
      toast.error(editingLog ? "Failed to update service log" : "Failed to add service log");
      setIsSubmitting(false);
    }
  };
  
  // Reset all form state
  const resetForm = () => {
    form.reset();
    setParts([]);
    setChecklist([]);
    setAttachments([]);
    setTasks([]);
    setServiceReferences([]);
    setIsSubmitting(false);
    setTotalCost(0);
  };
  
  // Handle service type template selection
  const handleServiceTypeChange = (value: string) => {
    form.setValue("serviceType", value);
    
    const template = serviceTemplates[value as keyof typeof serviceTemplates];
    if (template) {
      form.setValue("description", template.description);
      const templateParts = template.parts.map((part, idx) => ({
        id: `part-${Date.now()}-${idx}`,
        name: part.name,
        quantity: part.quantity,
        price: part.price
      }));
      setParts(templateParts);
      setServiceReferences(template.reference);
      
      // Calculate total cost from template parts
      const newTotalCost = templateParts.reduce((sum, part) => sum + (part.quantity * part.price), 0);
      setTotalCost(newTotalCost);
      form.setValue("totalCost", newTotalCost);
    } else {
      setServiceReferences([]);
    }
  };
  
  // Add a task using the TaskDialog component
  const addTask = (task: ServiceTask) => {
    setTasks([...tasks, task]);
    toast.success("Task added successfully");
  };
  
  // Update the total cost
  const updateTotalCost = (newCost: number) => {
    setTotalCost(newCost);
    form.setValue('totalCost', newCost);
  };
  
  // Toggle voice recording for description
  const toggleVoiceRecording = () => {
    // This would be implemented with the Web Speech API in a real app
    setIsRecording(!isRecording);
    if (isRecording) {
      toast.info("Voice recording feature would save transcript to description field");
    } else {
      toast.info("Voice recording started (simulated)");
    }
  };
  
  // Copy reference value to clipboard
  const copyToClipboard = (value: string) => {
    navigator.clipboard.writeText(value);
    toast.success("Copied to clipboard");
  };
  
  // Add a new part row
  const addPart = () => {
    const newPart: PartItem = {
      id: `part-${Date.now()}`,
      name: "",
      quantity: 1,
      price: 0
    };
    setParts([...parts, newPart]);
  };
  
  // Update a part
  const updatePart = (id: string, field: keyof PartItem, value: string | number) => {
    setParts(parts.map(part => 
      part.id === id ? { ...part, [field]: value } : part
    ));
    
    // Recalculate total cost whenever a part is updated
    const updatedParts = parts.map(part => 
      part.id === id ? { ...part, [field]: value } : part
    );
    const newTotalCost = updatedParts.reduce((sum, part) => sum + (part.quantity * part.price), 0);
    updateTotalCost(newTotalCost);
  };
  
  // Remove a part
  const removePart = (id: string) => {
    const filteredParts = parts.filter(part => part.id !== id);
    setParts(filteredParts);
    
    // Recalculate total cost
    const newTotalCost = filteredParts.reduce((sum, part) => sum + (part.quantity * part.price), 0);
    updateTotalCost(newTotalCost);
  };
  
  // Add a checklist item
  const addChecklistItem = () => {
    if (!newChecklistItem.trim()) return;
    
    const newItem: ChecklistItem = {
      id: `checklist-${Date.now()}`,
      text: newChecklistItem,
      checked: false
    };
    setChecklist([...checklist, newItem]);
    setNewChecklistItem('');
  };
  
  // Update a checklist item
  const updateChecklistItem = (id: string, checked: boolean) => {
    setChecklist(checklist.map(item => 
      item.id === id ? { ...item, checked } : item
    ));
  };
  
  // Remove a checklist item
  const removeChecklistItem = (id: string) => {
    setChecklist(checklist.filter(item => item.id !== id));
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-mechanic-blue">
              {editingLog ? "Edit Service Log" : "Log New Service"}
            </DialogTitle>
            <DialogDescription>
              {editingLog 
                ? "Update the details of this service record." 
                : "Enter the details of the service performed on this vehicle."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => onSubmit(data))} className="space-y-4">
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
                                "w-full pl-3 text-left font-normal",
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
                              date > new Date() // Only disable future dates, allow past dates
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

              {/* Service Tasks Section - Moved Higher */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="flex items-center gap-2">
                    <Tag size={16} className="text-mechanic-blue" />
                    Service Tasks <span className="text-xs text-muted-foreground">(Equipment needed for job shown as tags)</span>
                  </Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setTaskDialogOpen(true)}
                    className="flex items-center gap-1"
                  >
                    <Plus size={16} /> Add Task
                  </Button>
                </div>

                {tasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No tasks added yet.</p>
                ) : (
                  <div className="space-y-2">
                    {tasks.map((task) => (
                      <div key={task.id} className="p-3 border rounded-md bg-gray-50">
                        <p className="font-medium">{task.description}</p>
                        {task.toolsRequired && task.toolsRequired.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {task.toolsRequired.map((tool, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {tool}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <FormField
                control={form.control}
                name="serviceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Type</FormLabel>
                    <Select 
                      onValueChange={handleServiceTypeChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a service type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="oil-change">Oil Change</SelectItem>
                        <SelectItem value="brake-pads">Brake Pads</SelectItem>
                        <SelectItem value="tire-swap">Tire Swap</SelectItem>
                        <SelectItem value="custom">Custom Service</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Description</FormLabel>
                      <Button 
                        type="button" 
                        size="icon" 
                        variant="ghost" 
                        className="md:hidden" 
                        onClick={toggleVoiceRecording}
                      >
                        <Mic className={cn(isRecording ? "text-red-500" : "text-gray-500")} />
                      </Button>
                    </div>
                    <FormControl>
                      <Textarea 
                        placeholder="e.g. Changed oil and filter" 
                        className="resize-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Parts Used - Improved with Labels */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="flex items-center gap-2">
                    <PackagePlus size={16} className="text-mechanic-blue" />
                    Parts Used
                  </Label>
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="outline" 
                    onClick={addPart}
                    className="flex items-center gap-1"
                  >
                    <Plus size={16} /> Add Part
                  </Button>
                </div>
                
                {parts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No parts added yet.</p>
                ) : (
                  <>
                    {/* Parts table header */}
                    <div className="grid grid-cols-[3fr,1fr,1fr,auto] gap-2 mb-1 px-3 text-sm text-muted-foreground">
                      <div>Part Name</div>
                      <div>Quantity</div>
                      <div>Price</div>
                      <div></div>
                    </div>
                    
                    <div className="space-y-2">
                      {parts.map((part) => (
                        <div key={part.id} className="grid grid-cols-[3fr,1fr,1fr,auto] gap-2 items-center">
                          <Input
                            value={part.name}
                            onChange={(e) => updatePart(part.id, 'name', e.target.value)}
                            placeholder="Part name"
                          />
                          <Input
                            type="number"
                            value={part.quantity}
                            min="1"
                            onChange={(e) => updatePart(part.id, 'quantity', parseInt(e.target.value) || 1)}
                            placeholder="Qty"
                          />
                          <Input
                            type="number"
                            value={part.price}
                            min="0"
                            step="0.01"
                            onChange={(e) => updatePart(part.id, 'price', parseFloat(e.target.value) || 0)}
                            placeholder="Price"
                          />
                          <Button 
                            type="button" 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => removePart(part.id)}
                          >
                            <X size={16} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
              
              {/* Total cost input */}
              <FormField
                control={form.control}
                name="totalCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Cost</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        step="0.01"
                        min="0"
                        value={totalCost}
                        onChange={(e) => updateTotalCost(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Checklist */}
              <div>
                <Label>Checklist</Label>
                <div className="mt-2 space-y-2">
                  {checklist.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <Checkbox
                        checked={item.checked}
                        onCheckedChange={(checked) => 
                          updateChecklistItem(item.id, checked === true)
                        }
                        id={`checklist-${item.id}`}
                      />
                      <Label htmlFor={`checklist-${item.id}`} className="flex-grow">
                        {item.text}
                      </Label>
                      <Button 
                        type="button" 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => removeChecklistItem(item.id)}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  ))}
                  
                  <div className="flex items-center gap-2">
                    <Input
                      value={newChecklistItem}
                      onChange={(e) => setNewChecklistItem(e.target.value)}
                      placeholder="Add new checklist item"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addChecklistItem())}
                    />
                    <Button 
                      type="button" 
                      size="icon" 
                      variant="outline" 
                      onClick={addChecklistItem}
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Attachments */}
              <div>
                <Label>Attachments</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button type="button" variant="outline" className="flex items-center gap-1">
                    <Upload size={16} /> Upload
                  </Button>
                  <Button type="button" variant="outline" className="flex items-center gap-1">
                    <Camera size={16} /> Camera
                  </Button>
                  
                  {attachments.length > 0 && (
                    <div className="w-full mt-2 grid grid-cols-4 gap-2">
                      {/* Attachment thumbnails would go here */}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Next Due Reminder */}
              <div className="border p-3 rounded-md bg-gray-50">
                <div className="flex items-center gap-1 mb-3">
                  <Clock size={16} />
                  <Label>Next Service Due</Label>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nextDueMileage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Next Due (+km)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="nextDueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Next Due Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
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
                                date < new Date() // Only allow future dates
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              {/* Reference information */}
              {serviceReferences.length > 0 && (
                <div className="border-t pt-3">
                  <Label className="text-sm text-muted-foreground">Reference Information</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {serviceReferences.map((ref, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="flex items-center gap-1 cursor-pointer hover:bg-gray-100"
                        onClick={() => copyToClipboard(ref.value)}
                      >
                        {ref.label}: {ref.value}
                        <Copy size={12} />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <DialogFooter className="pt-4 flex flex-wrap gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-mechanic-blue hover:bg-mechanic-blue/90"
                  disabled={isSubmitting}
                  onClick={form.handleSubmit((data) => onSubmit(data))}
                >
                  <Save size={16} className="mr-1" />
                  {isSubmitting ? (editingLog ? "Updating..." : "Adding...") : (editingLog ? "Update" : "Save")}
                </Button>
                {!editingLog && (
                  <Button 
                    type="button" 
                    variant="secondary"
                    disabled={isSubmitting}
                    onClick={() => form.handleSubmit((data) => onSubmit(data, true))()}
                  >
                    <Save size={16} className="mr-1" />
                    Save & Create Another
                  </Button>
                )}
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Use TaskDialog component */}
      <TaskDialog 
        open={taskDialogOpen} 
        onOpenChange={setTaskDialogOpen} 
        onAddTask={addTask} 
      />
    </>
  );
};

export default ServiceLogForm;
