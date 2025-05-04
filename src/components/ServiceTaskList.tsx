
import React from 'react';
import { ServiceTask } from '@/utils/mockData';
import { Check, Clock, FileText, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';
import TaskImageGallery from './TaskImageGallery';

interface ServiceTaskListProps {
  tasks?: ServiceTask[];
  className?: string;
}

const ServiceTaskList = ({ tasks, className }: ServiceTaskListProps) => {
  if (!tasks?.length) {
    return (
      <div className={cn("text-center p-4 text-mechanic-gray", className)}>
        No tasks recorded for this service
      </div>
    );
  }

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
            <div className={cn(
              "mt-1 p-1 rounded-full",
              task.completed ? "bg-green-100 text-green-600" : "bg-mechanic-red/20 text-mechanic-red"
            )}>
              {task.completed ? <Check size={16} /> : <Clock size={16} />}
            </div>
            
            <div className="flex-1">
              <div className="font-medium">{task.description}</div>
              
              {task.notes && (
                <div className="mt-2 flex items-start gap-1.5 text-sm text-mechanic-gray">
                  <FileText size={14} className="mt-0.5 flex-shrink-0" />
                  <div>{task.notes}</div>
                </div>
              )}
              
              {task.torqueSpec && (
                <div className="mt-2 text-xs bg-mechanic-blue/10 text-mechanic-blue inline-flex items-center px-2 py-1 rounded">
                  <span className="font-bold mr-1">Torque:</span> {task.torqueSpec}
                </div>
              )}
              
              {task.toolsRequired && task.toolsRequired.length > 0 && (
                <div className="mt-2">
                  <div className="text-xs font-medium text-mechanic-gray mb-1 flex items-center gap-1">
                    <Wrench size={12} /> Tools Required:
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
                  <div className="text-xs font-medium text-mechanic-gray mb-1">Receipt Information</div>
                  <div className="text-sm">{task.receipt.store}</div>
                  <div className="flex flex-wrap gap-x-4 text-xs text-mechanic-gray mt-1">
                    {task.receipt.invoiceNumber && (
                      <div>Invoice: {task.receipt.invoiceNumber}</div>
                    )}
                    {task.receipt.date && (
                      <div>Date: {task.receipt.date}</div>
                    )}
                    {task.receipt.amount !== undefined && (
                      <div>Amount: ${task.receipt.amount.toFixed(2)}</div>
                    )}
                  </div>
                </div>
              )}
              
              {task.images && task.images.length > 0 && (
                <TaskImageGallery images={task.images} />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ServiceTaskList;
