
import React from "react";
import { ServiceTask } from "@/utils/mockData";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Wrench, Tool, AlertCircle, HelpCircle } from "lucide-react";

interface ServiceTaskListProps {
  tasks?: ServiceTask[];
}

const ServiceTaskList = ({ tasks }: ServiceTaskListProps) => {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-sm text-mechanic-gray italic mt-2">
        No task details recorded for this service.
      </div>
    );
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="tasks">
        <AccordionTrigger className="text-mechanic-blue hover:text-mechanic-blue/90">
          <div className="flex items-center gap-2">
            <Tool size={16} />
            <span>Service Procedure ({tasks.length} steps)</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <ol className="mt-2 space-y-3">
            {tasks.map((task) => (
              <li key={task.id} className="flex gap-3 text-sm">
                <div className="flex-shrink-0 mt-0.5">
                  <CheckCircle2 size={18} className="text-green-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{task.description}</span>
                    
                    {task.torqueSpec && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="outline" className="border-amber-500 text-amber-700">
                              {task.torqueSpec}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Torque Specification</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  
                  {task.notes && (
                    <div className="mt-1 flex gap-2 text-mechanic-gray">
                      <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                      <span className="italic">{task.notes}</span>
                    </div>
                  )}
                  
                  {task.toolsRequired && task.toolsRequired.length > 0 && (
                    <div className="mt-2">
                      <div className="flex items-center gap-1.5 text-xs text-mechanic-gray font-medium mb-1">
                        <Wrench size={12} />
                        <span>Tools required:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {task.toolsRequired.map((tool, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tool}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default ServiceTaskList;
