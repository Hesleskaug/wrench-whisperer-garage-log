
import React, { useState } from 'react';
import { ServiceTask } from '@/utils/mockData';
import { Check, Clock, FileText, Wrench, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import TaskImageGallery from './TaskImageGallery';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from './ui/button';
import TaskDialog from './TaskDialog';
import { Badge } from './ui/badge';

interface ServiceTaskListProps {
  tasks?: ServiceTask[];
  className?: string;
  serviceLogId?: string;
  onTaskUpdate?: (task: ServiceTask) => void;
}

const ServiceTaskList = ({ tasks, className, serviceLogId, onTaskUpdate }: ServiceTaskListProps) => {
  const { t } = useLanguage();
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  
  if (!tasks?.length) {
    return (
      <div className={cn("text-center p-4 text-mechanic-gray", className)}>
        {t('noTasks')}
      </div>
    );
  }
  
  const handleTaskComplete = (task: ServiceTask) => {
    if (onTaskUpdate) {
      onTaskUpdate({
        ...task,
        completed: !task.completed
      });
    }
  };
  
  const handleUpdateTask = (updatedTask: ServiceTask) => {
    if (onTaskUpdate) {
      onTaskUpdate(updatedTask);
    }
    setEditingTaskId(null);
  };
  
  const currentlyEditingTask = editingTaskId ? tasks.find(task => task.id === editingTaskId) : null;

  // Helper function to format torque specifications into readable format
  const formatTorqueSpec = (spec: string) => {
    // Split by line breaks or semicolons to handle multiple torque specs
    const specs = spec.split(/[;\n]/);
    
    return (
      <div className="space-y-1">
        {specs.map((item, index) => {
          const parts = item.split(':').map(part => part.trim());
          if (parts.length > 1 && parts[0] && parts[1]) {
            return (
              <div key={index} className="flex items-center gap-1">
                <span className="font-medium">{parts[0]}:</span>
                <span>{parts.slice(1).join(':')}</span>
              </div>
            );
          }
          return item ? <div key={index}>{item}</div> : null;
        })}
      </div>
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      {tasks.map(task => (
        <div 
          key={task.id}
          className={cn(
            "border rounded-lg shadow-sm",
            task.completed 
              ? "bg-mechanic-silver/5 border-mechanic-silver/20" 
              : "bg-mechanic-red/5 border-mechanic-red/20"
          )}
        >
          <div className="flex flex-col">
            {/* Task header */}
            <div className="p-3 sm:p-4 flex items-center gap-3">
              <div 
                className={cn(
                  "p-1.5 rounded-full cursor-pointer flex-shrink-0",
                  task.completed ? "bg-green-100 text-green-600" : "bg-mechanic-red/20 text-mechanic-red"
                )}
                onClick={() => handleTaskComplete(task)}
              >
                {task.completed ? <Check size={18} /> : <Clock size={18} />}
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <h3 className="font-medium text-base">{task.description}</h3>
                  {onTaskUpdate && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0 -mt-1 -mr-1" 
                      onClick={() => setEditingTaskId(task.id)}
                    >
                      <Pencil size={15} />
                    </Button>
                  )}
                </div>
                
                {task.difficulty && (
                  <div className="mt-1">
                    <Badge className={cn(
                      "text-xs",
                      task.difficulty === 'easy' ? "bg-green-100 text-green-700 hover:bg-green-200" :
                      task.difficulty === 'moderate' ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" :
                      "bg-red-100 text-red-700 hover:bg-red-200"
                    )}>
                      {task.difficulty}
                    </Badge>
                    {task.estimatedTime && (
                      <span className="text-xs text-mechanic-gray ml-2">
                        {task.estimatedTime} {t('min')}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Task details - conditionally rendered */}
            {(task.notes || task.toolsRequired?.length > 0 || task.torqueSpec || task.receipt || task.images?.length > 0) && (
              <div className="border-t border-mechanic-silver/20 px-4 py-3 space-y-3">
                {/* Notes */}
                {task.notes && (
                  <div className="flex items-start gap-2">
                    <FileText size={16} className="mt-0.5 flex-shrink-0 text-mechanic-gray" />
                    <div className="text-sm whitespace-pre-line">{task.notes}</div>
                  </div>
                )}
                
                {/* Torque Specifications - Enhanced */}
                {task.torqueSpec && (
                  <div className="mt-3">
                    <div className="bg-mechanic-blue/10 text-mechanic-blue px-3 py-2 rounded-md">
                      <div className="text-xs font-medium uppercase tracking-wide mb-1">
                        {t('torque')}
                      </div>
                      <div className="text-sm">
                        {formatTorqueSpec(task.torqueSpec)}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Tools Required - Enhanced */}
                {task.toolsRequired && task.toolsRequired.length > 0 && (
                  <div className="mt-3">
                    <div className="bg-mechanic-silver/10 px-3 py-2 rounded-md">
                      <div className="text-xs font-medium uppercase tracking-wide mb-2 flex items-center gap-1.5 text-mechanic-gray">
                        <Wrench size={14} className="text-mechanic-gray" /> 
                        {t('equipmentNeeded')}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {task.toolsRequired.map((tool, index) => (
                          <Badge 
                            key={index}
                            variant="outline"
                            className="bg-white text-mechanic-gray border-mechanic-silver/40 px-2.5 py-1 hover:bg-mechanic-silver/20"
                          >
                            {tool}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Receipt */}
                {task.receipt && (
                  <div className="mt-3 border border-mechanic-silver/20 rounded-md p-2 bg-mechanic-silver/5">
                    <div className="text-xs font-medium text-mechanic-gray mb-1">{t('receiptInformation')}</div>
                    <div className="text-sm font-medium">{task.receipt.store}</div>
                    <div className="flex flex-wrap gap-x-4 text-xs text-mechanic-gray mt-1">
                      {task.receipt.invoiceNumber && (
                        <div>{t('invoice')}: {task.receipt.invoiceNumber}</div>
                      )}
                      {task.receipt.date && (
                        <div>{t('date')}: {task.receipt.date}</div>
                      )}
                      {task.receipt.amount !== undefined && (
                        <div>{t('amount')}: ${task.receipt.amount.toFixed(2)}</div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Images */}
                {task.images && task.images.length > 0 && (
                  <div className="mt-3">
                    <TaskImageGallery images={task.images} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
      
      {currentlyEditingTask && serviceLogId && (
        <TaskDialog
          open={!!currentlyEditingTask}
          onOpenChange={(open) => !open && setEditingTaskId(null)}
          onAddTask={handleUpdateTask}
          editingTask={currentlyEditingTask}
        />
      )}
    </div>
  );
};

export default ServiceTaskList;
