
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
import { Clipboard, Camera, Upload, LinkIcon, Copy, X, Plus } from "lucide-react";
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

// Define how-to step type
interface HowToStep {
  id: string;
  text: string;
}

// Define torque specification item type
interface TorqueSpecItem {
  id: string;
  description: string;
  value: string;
  unit: string;
}

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTask: (task: ServiceTask) => void;
  editingTask?: ServiceTask;
}

const difficultyOptions = [
  { value: "easy", label: "Easy", color: "bg-green-100 text-green-800" },
  { value: "moderate", label: "Moderate", color: "bg-yellow-100 text-yellow-800" },
  { value: "tough", label: "Tough", color: "bg-red-100 text-red-800" }
];

const TaskDialog = ({ open, onOpenChange, onAddTask, editingTask }: TaskDialogProps) => {
  // Task details
  const [taskPreset, setTaskPreset] = useState("custom");
  const [taskDescription, setTaskDescription] = useState('');
  const [howToSteps, setHowToSteps] = useState<HowToStep[]>([]);
  const [newStepInput, setNewStepInput] = useState('');
  const [taskTools, setTaskTools] = useState<string[]>([]);
  const [newToolInput, setNewToolInput] = useState('');
  const [torqueSpecs, setTorqueSpecs] = useState<TorqueSpecItem[]>([]);
  const [newTorqueDescription, setNewTorqueDescription] = useState('');
  const [newTorqueValue, setNewTorqueValue] = useState('');
  const [newTorqueUnit, setNewTorqueUnit] = useState('Nm');
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
        
        // Convert the single torque spec into the new format
        if (preset.torque) {
          setTorqueSpecs([{
            id: `torque-${Date.now()}`,
            description: preset.description,
            value: preset.torque,
            unit: preset.torqueUnit
          }]);
        }
      }
    }
  }, [taskPreset]);
  
  // Initialize form with editing task data if provided
  useEffect(() => {
    if (editingTask) {
      setTaskDescription(editingTask.description);
      
      // Convert notes to how-to steps if any exist
      if (editingTask.notes) {
        const steps = editingTask.notes.split('\n')
          .filter(step => step.trim().length > 0)
          .map((step, index) => ({
            id: `step-${Date.now()}-${index}`,
            text: step.trim().replace(/^\d+\.\s+/, '') // Remove number prefixes if they exist
          }));
        setHowToSteps(steps);
      }
      
      setTaskTools(editingTask.toolsRequired || []);
      
      // Convert torque spec to new format if it exists
      if (editingTask.torqueSpec) {
        const torqueParts = editingTask.torqueSpec.split(' ');
        if (torqueParts.length === 2) {
          setTorqueSpecs([{
            id: `torque-${Date.now()}`,
            description: editingTask.description || 'Default',
            value: torqueParts[0],
            unit: torqueParts[1]
          }]);
        }
      }
      
      setTaskImages(editingTask.images || []);
      
      if (editingTask.receipt) {
        setReceiptStore(editingTask.receipt.store || '');
        setReceiptImages(editingTask.receipt.images || []);
        setReceiptNote(editingTask.receipt.note || '');
        setReceiptWebsiteUrl(editingTask.receipt.websiteUrl || '');
      }
      
      if (editingTask.difficulty) {
        setDifficulty(editingTask.difficulty);
      }
      
      if (editingTask.estimatedTime) {
        setEstimatedTime(editingTask.estimatedTime);
      }
    }
  }, [editingTask]);
  
  // Handle how-to step input
  const addStep = () => {
    if (newStepInput.trim()) {
      const newStep: HowToStep = {
        id: `step-${Date.now()}`,
        text: newStepInput.trim()
      };
      setHowToSteps([...howToSteps, newStep]);
      setNewStepInput('');
    }
  };
  
  const removeStep = (id: string) => {
    setHowToSteps(howToSteps.filter(step => step.id !== id));
  };
  
  const moveStepUp = (index: number) => {
    if (index > 0) {
      const updatedSteps = [...howToSteps];
      [updatedSteps[index], updatedSteps[index - 1]] = [updatedSteps[index - 1], updatedSteps[index]];
      setHowToSteps(updatedSteps);
    }
  };
  
  const moveStepDown = (index: number) => {
    if (index < howToSteps.length - 1) {
      const updatedSteps = [...howToSteps];
      [updatedSteps[index], updatedSteps[index + 1]] = [updatedSteps[index + 1], updatedSteps[index]];
      setHowToSteps(updatedSteps);
    }
  };
  
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
  
  // Handle torque specification
  const addTorqueSpec = () => {
    if (newTorqueValue.trim()) {
      const newSpec: TorqueSpecItem = {
        id: `torque-${Date.now()}`,
        description: newTorqueDescription.trim() || 'General',
        value: newTorqueValue.trim(),
        unit: newTorqueUnit
      };
      setTorqueSpecs([...torqueSpecs, newSpec]);
      setNewTorqueDescription('');
      setNewTorqueValue('');
    }
  };
  
  const removeTorqueSpec = (id: string) => {
    setTorqueSpecs(torqueSpecs.filter(spec => spec.id !== id));
  };
  
  // Copy torque spec to clipboard
  const copyTorqueSpecToClipboard = (spec: TorqueSpecItem) => {
    const torqueText = `${spec.description}: ${spec.value} ${spec.unit}`;
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
    setHowToSteps([]);
    setNewStepInput('');
    setTaskTools([]);
    setNewToolInput('');
    setTorqueSpecs([]);
    setNewTorqueDescription('');
    setNewTorqueValue('');
    setNewTorqueUnit('Nm');
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
    
    // Convert how-to steps to a formatted string
    const formattedHowTo = howToSteps.length > 0 
      ? howToSteps.map((step, index) => `${index + 1}. ${step.text}`).join('\n')
      : undefined;
    
    // Combine all torque specifications
    const combinedTorqueSpec = torqueSpecs.length > 0 
      ? torqueSpecs.map(spec => `${spec.description}: ${spec.value} ${spec.unit}`).join('\n')
      : undefined;
    
    const newTask: ServiceTask = {
      id: editingTask?.id || `task-${Date.now()}`,
      description: taskDescription,
      completed: editingTask?.completed !== undefined ? editingTask.completed : true,
      notes: formattedHowTo,
      toolsRequired: taskTools.length > 0 ? [...taskTools] : undefined,
      torqueSpec: combinedTorqueSpec,
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
          <DialogTitle>{editingTask ? 'Edit Service Task' : 'Add Service Task'}</DialogTitle>
          <DialogDescription>
            {editingTask ? 'Edit details about this service task.' : 'Add details about a specific task performed during this service.'}
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
          
          {/* New How-to Steps UI */}
          <div className="space-y-2">
            <Label>How-to Steps</Label>
            <div className="space-y-2">
              {howToSteps.map((step, index) => (
                <div key={step.id} className="flex items-center gap-2">
                  <div className="bg-mechanic-blue/10 text-mechanic-blue rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-grow px-3 py-1.5 bg-gray-50 rounded-md border">
                    {step.text}
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      type="button" 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8"
                      onClick={() => moveStepUp(index)}
                      disabled={index === 0}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m18 15-6-6-6 6"/>
                      </svg>
                    </Button>
                    <Button 
                      type="button" 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8"
                      onClick={() => moveStepDown(index)}
                      disabled={index === howToSteps.length - 1}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m6 9 6 6 6-6"/>
                      </svg>
                    </Button>
                    <Button 
                      type="button" 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8"
                      onClick={() => removeStep(step.id)}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a step..."
                value={newStepInput}
                onChange={(e) => setNewStepInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addStep())}
              />
              <Button 
                type="button" 
                variant="outline"
                onClick={addStep}
              >
                Add
              </Button>
            </div>
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
          
          {/* Enhanced Torque Specifications */}
          <div className="space-y-2">
            <Label>Torque Specifications</Label>
            <div className="space-y-2">
              {torqueSpecs.map((spec) => (
                <div key={spec.id} className="bg-gray-50 rounded-md border p-2 flex justify-between items-center">
                  <div className="flex-grow">
                    <div className="font-medium text-sm">{spec.description}</div>
                    <div className="text-mechanic-blue font-bold">{spec.value} {spec.unit}</div>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      type="button" 
                      size="icon" 
                      variant="ghost"
                      onClick={() => copyTorqueSpecToClipboard(spec)}
                      title="Copy to clipboard"
                      className="h-8 w-8"
                    >
                      <Copy size={16} />
                    </Button>
                    <Button 
                      type="button" 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => removeTorqueSpec(spec.id)}
                      className="h-8 w-8"
                    >
                      <X size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="border rounded-md p-3 space-y-2 bg-gray-50/50">
              <div className="space-y-2">
                <Label htmlFor="torque-description">Description</Label>
                <Input
                  id="torque-description"
                  placeholder="e.g. Oil drain plug, Wheel lug nut"
                  value={newTorqueDescription}
                  onChange={(e) => setNewTorqueDescription(e.target.value)}
                />
              </div>
              <div className="flex gap-2 items-center">
                <div className="flex-grow">
                  <Label htmlFor="torque-value">Value</Label>
                  <Input
                    id="torque-value"
                    type="number"
                    placeholder="e.g. 25"
                    value={newTorqueValue}
                    onChange={(e) => setNewTorqueValue(e.target.value)}
                  />
                </div>
                <div className="w-24">
                  <Label htmlFor="torque-unit">Unit</Label>
                  <Select 
                    value={newTorqueUnit}
                    onValueChange={setNewTorqueUnit}
                  >
                    <SelectTrigger id="torque-unit" className="w-full">
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Nm">Nm</SelectItem>
                      <SelectItem value="ft-lb">ft-lb</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full mt-2"
                onClick={addTorqueSpec}
                disabled={!newTorqueValue.trim()}
              >
                <Plus size={16} className="mr-1" /> Add Torque Specification
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
                <LinkIcon size={16} /> Add URL
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
