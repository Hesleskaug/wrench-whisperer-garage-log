
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Clipboard, Camera, Upload, Link as LinkIcon, Copy, X, Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import TaskImageUploader from './TaskImageUploader';
import { toast } from "sonner";
import { ServiceTask } from "@/utils/mockData";

// Define task presets
const taskPresets = {
  "oil-drain": {
    title: "Oil Drain & Refill",
    description: "Drain old engine oil and refill with fresh oil",
    tools: ["Oil filter wrench", "Oil catch pan", "Funnel"],
    torque: "25",
    torqueUnit: "Nm"
  },
  "brake-caliper": {
    title: "Brake Caliper Clean-up",
    description: "Clean and lubricate brake calipers",
    tools: ["Socket set", "Brake cleaner", "Wire brush"],
    torque: "28",
    torqueUnit: "Nm"
  },
  "wheel-torque": {
    title: "Wheel Torque",
    description: "Torque wheel lug nuts to specification",
    tools: ["Torque wrench", "Socket set"],
    torque: "103",
    torqueUnit: "Nm"
  },
  "custom": {
    title: "Custom Task",
    description: "",
    tools: [],
    torque: "",
    torqueUnit: "Nm"
  }
};

// Define part item type
interface PartItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTask: (task: ServiceTask) => void;
}

const difficultyOptions = [
  { value: "easy", label: "Easy", color: "bg-green-100 text-green-800" },
  { value: "moderate", label: "Moderate", color: "bg-yellow-100 text-yellow-800" },
  { value: "tough", label: "Tough", color: "bg-red-100 text-red-800" }
];

const TaskDialog = ({ open, onOpenChange, onAddTask }: TaskDialogProps) => {
  // Task details
  const [taskPreset, setTaskPreset] = useState("custom");
  const [taskDescription, setTaskDescription] = useState('');
  const [taskHowTo, setTaskHowTo] = useState('');
  const [taskTools, setTaskTools] = useState<string[]>([]);
  const [newToolInput, setNewToolInput] = useState('');
  const [taskTorque, setTaskTorque] = useState('');
  const [torqueUnit, setTorqueUnit] = useState('Nm');
  const [taskImages, setTaskImages] = useState<string[]>([]);
  const [saveAsPreset, setSaveAsPreset] = useState(false);
  
  // Cost and parts
  const [parts, setParts] = useState<PartItem[]>([]);
  const [receiptStore, setReceiptStore] = useState('');
  const [receiptImages, setReceiptImages] = useState<string[]>([]);
  const [receiptNote, setReceiptNote] = useState('');
  const [receiptWebsiteUrl, setReceiptWebsiteUrl] = useState('');
  
  // Planning metadata
  const [estimatedTime, setEstimatedTime] = useState(15);
  const [difficulty, setDifficulty] = useState("easy");
  
  // Apply preset when selected
  useEffect(() => {
    if (taskPreset) {
      const preset = taskPresets[taskPreset as keyof typeof taskPresets];
      if (preset) {
        setTaskDescription(preset.description);
        setTaskTools(preset.tools);
        setTaskTorque(preset.torque);
        setTorqueUnit(preset.torqueUnit);
      }
    }
  }, [taskPreset]);
  
  // Handle tool input
  const addTool = () => {
    if (newToolInput.trim() && !taskTools.includes(newToolInput.trim())) {
      setTaskTools([...taskTools, newToolInput.trim()]);
      setNewToolInput('');
    }
  };
  
  const removeTool = (tool: string) => {
    setTaskTools(taskTools.filter(t => t !== tool));
  };
  
  // Simulate paste from clipboard
  const pasteFromClipboard = () => {
    navigator.clipboard.readText()
      .then(text => {
        setTaskHowTo(prev => prev + text);
        toast.success("Content pasted from clipboard");
      })
      .catch(() => {
        toast.error("Could not read clipboard contents");
      });
  };
  
  // Handle copy torque to clipboard
  const copyTorqueToClipboard = () => {
    const torqueText = `${taskTorque} ${torqueUnit}`;
    navigator.clipboard.writeText(torqueText);
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
  };
  
  // Remove a part
  const removePart = (id: string) => {
    setParts(parts.filter(part => part.id !== id));
  };
  
  // Calculate total cost
  const calculateTotalCost = () => {
    return parts.reduce((sum, part) => sum + (part.quantity * part.price), 0);
  };
  
  // Handle receipt data changes
  const handleReceiptDataChange = (data: { note: string; websiteUrl: string }) => {
    setReceiptNote(data.note);
    setReceiptWebsiteUrl(data.websiteUrl);
  };
  
  // Reset form
  const resetForm = () => {
    setTaskPreset('custom');
    setTaskDescription('');
    setTaskHowTo('');
    setTaskTools([]);
    setNewToolInput('');
    setTaskTorque('');
    setTorqueUnit('Nm');
    setTaskImages([]);
    setParts([]);
    setReceiptStore('');
    setReceiptImages([]);
    setReceiptNote('');
    setReceiptWebsiteUrl('');
    setEstimatedTime(15);
    setDifficulty('easy');
    setSaveAsPreset(false);
  };
  
  // Add task
  const addTask = (andNew: boolean = false) => {
    const totalCost = calculateTotalCost();
    
    const newTask: ServiceTask = {
      id: `task-${Date.now()}`,
      description: taskDescription,
      completed: true,
      notes: taskHowTo || undefined,
      toolsRequired: taskTools.length > 0 ? [...taskTools] : undefined,
      torqueSpec: taskTorque ? `${taskTorque} ${torqueUnit}` : undefined,
      receipt: parts.length > 0 ? {
        store: receiptStore,
        images: receiptImages.length > 0 ? [...receiptImages] : undefined,
        note: receiptNote || undefined,
        websiteUrl: receiptWebsiteUrl || undefined,
        amount: totalCost || undefined,
      } : undefined,
      images: taskImages.length > 0 ? [...taskImages] : undefined,
      difficulty: difficulty,
      estimatedTime: estimatedTime || undefined,
    };
    
    onAddTask(newTask);
    
    if (andNew) {
      resetForm();
    } else {
      resetForm();
      onOpenChange(false);
    }
    
    // Save as preset functionality would be implemented here
    // connecting to a user's preset storage
    if (saveAsPreset && taskDescription) {
      toast.success(`"${taskDescription}" saved as a preset`);
    }
  };
  
  // Determine if a tool is "owned" or "missing" (simulated for now)
  const getToolStatus = (tool: string) => {
    // In a real app, this would check against a user's inventory
    const ownedTools = ["Oil filter wrench", "Funnel", "Socket set", "Torque wrench"];
    return ownedTools.includes(tool) ? "owned" : "missing";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Service Task</DialogTitle>
          <DialogDescription>
            Add details about a specific task performed during this service.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="task-preset">Task Preset</Label>
            <Select 
              value={taskPreset}
              onValueChange={setTaskPreset}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a task preset" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="oil-drain">Oil Drain & Refill</SelectItem>
                <SelectItem value="brake-caliper">Brake Caliper Clean-up</SelectItem>
                <SelectItem value="wheel-torque">Wheel Torque</SelectItem>
                <SelectItem value="custom">Custom Task</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
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
            <div className="flex justify-between items-center">
              <Label htmlFor="task-howto">How-to Tips</Label>
              <Button 
                type="button" 
                size="icon" 
                variant="ghost"
                onClick={pasteFromClipboard}
                title="Paste from clipboard"
              >
                <Clipboard size={16} />
              </Button>
            </div>
            <Textarea
              id="task-howto"
              placeholder="e.g. Start by loosening the drain plug..."
              value={taskHowTo}
              onChange={(e) => setTaskHowTo(e.target.value)}
              className="resize-none"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="task-tools">Tools Required</Label>
            <div className="flex gap-2 mb-2 flex-wrap">
              {taskTools.map((tool, index) => (
                <Badge
                  key={index}
                  variant={getToolStatus(tool) === "owned" ? "outline" : "secondary"}
                  className={`flex items-center gap-1 ${
                    getToolStatus(tool) === "missing" ? "border-red-500" : ""
                  }`}
                >
                  {tool}
                  <button 
                    type="button" 
                    className="ml-1 hover:bg-gray-200 rounded-full p-0.5" 
                    onClick={() => removeTool(tool)}
                  >
                    <X size={12} />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                id="task-tools"
                placeholder="Add a tool..."
                value={newToolInput}
                onChange={(e) => setNewToolInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTool())}
              />
              <Button type="button" variant="outline" onClick={addTool}>Add</Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="task-torque">Torque Specification</Label>
            <div className="flex gap-2 items-center">
              <Input
                id="task-torque"
                type="number"
                placeholder="e.g. 25"
                value={taskTorque}
                onChange={(e) => setTaskTorque(e.target.value)}
                className="w-24"
              />
              <Select 
                value={torqueUnit}
                onValueChange={setTorqueUnit}
              >
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Nm">Nm</SelectItem>
                  <SelectItem value="ft-lb">ft-lb</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                type="button" 
                size="icon" 
                variant="ghost"
                onClick={copyTorqueToClipboard}
                disabled={!taskTorque}
                title="Copy to clipboard"
              >
                <Copy size={16} />
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Task Images</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              <Button type="button" variant="outline" className="flex items-center gap-1">
                <Camera size={16} /> Take Photo
              </Button>
              <Button type="button" variant="outline" className="flex items-center gap-1">
                <Upload size={16} /> Upload
              </Button>
              <Button type="button" variant="outline" className="flex items-center gap-1">
                <Link size={16} /> Add URL
              </Button>
            </div>
            <TaskImageUploader 
              images={taskImages} 
              onImagesChange={setTaskImages} 
            />
          </div>
          
          {/* Parts and Costs */}
          <div className="space-y-2 border-t pt-3">
            <div className="flex justify-between items-center">
              <Label>Parts & Costs</Label>
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
              <div className="space-y-2">
                {parts.map((part) => (
                  <div key={part.id} className="flex items-center gap-2">
                    <Input
                      value={part.name}
                      onChange={(e) => updatePart(part.id, 'name', e.target.value)}
                      placeholder="Part name"
                      className="flex-grow"
                    />
                    <Input
                      type="number"
                      value={part.quantity}
                      onChange={(e) => updatePart(part.id, 'quantity', parseInt(e.target.value) || 0)}
                      placeholder="Qty"
                      className="w-16"
                    />
                    <Input
                      type="number"
                      value={part.price}
                      onChange={(e) => updatePart(part.id, 'price', parseFloat(e.target.value) || 0)}
                      placeholder="Price"
                      className="w-24"
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
                
                <div className="bg-gray-50 p-2 rounded-md">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Task Cost:</span>
                    <span className="font-semibold">{calculateTotalCost().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-2 mt-4">
              <Label htmlFor="receipt-store">Purchased From (Store/Website)</Label>
              <Input
                id="receipt-store"
                placeholder="e.g. AutoZone, RockAuto"
                value={receiptStore}
                onChange={(e) => setReceiptStore(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Receipt Images</Label>
              <TaskImageUploader 
                images={receiptImages} 
                onImagesChange={setReceiptImages}
                title="Upload Receipt"
                isReceiptMode={true}
                onReceiptDataChange={handleReceiptDataChange}
                initialReceiptData={{ note: receiptNote, websiteUrl: receiptWebsiteUrl }}
              />
            </div>
          </div>
          
          {/* Planning metadata */}
          <div className="space-y-4 border-t pt-3">
            <div className="space-y-2">
              <Label className="flex justify-between">
                Estimated Time: <span>{estimatedTime} min</span>
              </Label>
              <Slider
                value={[estimatedTime]}
                min={0}
                max={240}
                step={15}
                onValueChange={([value]) => setEstimatedTime(value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <div className="flex gap-2">
                {difficultyOptions.map(option => (
                  <Badge 
                    key={option.value}
                    variant={difficulty === option.value ? "default" : "outline"}
                    className={`cursor-pointer ${difficulty === option.value ? option.color : ""}`}
                    onClick={() => setDifficulty(option.value)}
                  >
                    {option.label}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="save-preset" 
                checked={saveAsPreset} 
                onCheckedChange={(checked) => setSaveAsPreset(checked === true)}
              />
              <Label htmlFor="save-preset">Save as preset for future use</Label>
            </div>
          </div>
        </div>
        
        <DialogFooter className="space-x-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="secondary"
            onClick={() => addTask(true)}
          >
            Save & New
          </Button>
          <Button type="button" onClick={() => addTask(false)}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDialog;
