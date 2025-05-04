
import { ServiceLog } from "@/utils/mockData";
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Pencil } from "lucide-react";
import ServiceTaskList from "./ServiceTaskList";
import { useLanguage } from '@/contexts/LanguageContext';

interface ServiceLogCardProps {
  log: ServiceLog;
  onEdit: (logId: string) => void;
  onUpdateServiceLog?: (updatedLog: ServiceLog) => void;
}

const ServiceLogCard = ({ log, onEdit, onUpdateServiceLog }: ServiceLogCardProps) => {
  const { t } = useLanguage();
  
  return (
    <Card key={log.id} className="overflow-hidden border-mechanic-silver/30">
      <div className="p-4 bg-mechanic-silver/5">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-mechanic-blue">{log.serviceType}</h4>
              {log.cost && (
                <Badge variant="outline" className="border-mechanic-blue/20 bg-mechanic-blue/5 text-mechanic-blue">
                  {log.cost} kr
                </Badge>
              )}
            </div>
            <div className="text-sm text-mechanic-gray mt-0.5 flex items-center gap-2">
              <span>{new Date(log.date).toLocaleDateString()}</span>
              <span className="text-mechanic-gray/40">•</span>
              <span>{log.mileage.toLocaleString()} km</span>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-mechanic-gray hover:text-mechanic-blue self-start"
            onClick={() => onEdit(log.id)}
          >
            <Pencil size={15} className="mr-1" />
            <span className="sr-only sm:not-sr-only">{t('edit')}</span>
          </Button>
        </div>
        
        {log.description && (
          <p className="text-sm mb-3">{log.description}</p>
        )}
        
        {log.parts && log.parts.length > 0 && (
          <div className="mb-4">
            <div className="text-xs font-medium text-mechanic-gray mb-1.5">{t('parts')}</div>
            <div className="flex flex-wrap gap-1.5">
              {log.parts.map((part, index) => (
                <Badge 
                  key={index}
                  variant="outline" 
                  className="bg-mechanic-silver/10 text-mechanic-gray border-mechanic-silver/20 hover:bg-mechanic-silver/20"
                >
                  {part}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {log.tasks && log.tasks.length > 0 && (
          <div className="mt-4">
            <ServiceTaskList 
              tasks={log.tasks} 
              serviceLogId={log.id}
              onTaskUpdate={onUpdateServiceLog ? (task) => {
                const updatedLog = {
                  ...log,
                  tasks: log.tasks?.map(t => t.id === task.id ? task : t) || []
                };
                onUpdateServiceLog(updatedLog);
              } : undefined}
            />
          </div>
        )}
      </div>
    </Card>
  );
};

export default ServiceLogCard;
