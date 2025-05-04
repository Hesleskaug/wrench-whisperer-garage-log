
import React, { useState } from 'react';
import { ServiceTask } from '@/utils/mockData';
import { Check, Clock, FileText, Wrench, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import TaskImageGallery from './TaskImageGallery';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from './ui/button';
import TaskDialog from './TaskDialog';

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

  return (
    <div className={cn("space-y-4", className)}>
      {tasks.map(task => (
        <div 
          key={task.id}
          className={cn(
            "border rounded-md p-4",
            task.completed 
              ? "bg-mechanic-silver/10 border-mechanic-silver/20" 
              : "bg-mechanic-red/5 border-mechanic-red/20"
          )}
        >
          <div className="flex items-start gap-2">
            <div 
              className={cn(
                "mt-1 p-1 rounded-full cursor-pointer",
                task.completed ? "bg-green-100 text-green-600" : "bg-mechanic-red/20 text-mechanic-red"
              )}
              onClick={() => handleTaskComplete(task)}
            >
              {task.completed ? <Check size={16} /> : <Clock size={16} />}
            </div>
            
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div className="font-medium">{task.description}</div>
                {onTaskUpdate && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0" 
                    onClick={() => setEditingTaskId(task.id)}
                  >
                    <Pencil size={14} />
                  </Button>
                )}
              </div>
              
              {task.notes && (
                <div className="mt-2 flex items-start gap-1.5 text-sm text-mechanic-gray">
                  <FileText size={14} className="mt-0.5 flex-shrink-0" />
                  <div>{task.notes}</div>
                </div>
              )}
              
              {task.torqueSpec && (
                <div className="mt-2 text-xs bg-mechanic-blue/10 text-mechanic-blue inline-flex items-center px-2 py-1 rounded">
                  <span className="font-bold mr-1">{t('torque')}:</span> {task.torqueSpec}
                </div>
              )}
              
              {task.toolsRequired && task.toolsRequired.length > 0 && (
                <div className="mt-2">
                  <div className="text-xs font-medium text-mechanic-gray mb-1 flex items-center gap-1">
                    <Wrench size={12} /> {t('toolsRequired')}:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {task.toolsRequired.map((tool, index) => (
                      <span 
                        key={index}
                        className="px-2 py-0.5 bg-mechanic-gray/10 text-mechanic-gray text-xs rounded"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {task.receipt && (
                <div className="mt-2 border border-mechanic-silver/20 rounded-md p-2 bg-mechanic-silver/5">
                  <div className="text-xs font-medium text-mechanic-gray mb-1">{t('receiptInformation')}</div>
                  <div className="text-sm">{task.receipt.store}</div>
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
              
              {task.images && task.images.length > 0 && (
                <TaskImageGallery images={task.images} />
              )}
              
              {task.difficulty && (
                <div className="mt-2">
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded",
                    task.difficulty === 'easy' ? "bg-green-100 text-green-700" :
                    task.difficulty === 'moderate' ? "bg-yellow-100 text-yellow-700" :
                    "bg-red-100 text-red-700"
                  )}>
                    {task.difficulty}
                  </span>
                </div>
              )}
              
              {task.estimatedTime && (
                <div className="mt-2 text-xs text-mechanic-gray">
                  {t('estimatedTime')}: {task.estimatedTime} min
                </div>
              )}
            </div>
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
