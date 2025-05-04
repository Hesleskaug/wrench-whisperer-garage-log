
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Vehicle, ServiceLog } from "@/utils/mockData";
import { printServiceHistory } from "@/utils/printUtils";
import { FileText, Printer, Edit, Pencil } from "lucide-react";
import ServiceTaskList from "@/components/ServiceTaskList";
import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';
import ServiceLogForm from "@/components/ServiceLogForm";
import { Badge } from '@/components/ui/badge';
import { Card } from './ui/card';

interface ServiceHistoryTableProps {
  vehicle: Vehicle;
  serviceLogs: ServiceLog[];
  onUpdateServiceLog?: (updatedLog: ServiceLog) => void;
}

const ServiceHistoryTable = ({ 
  vehicle, 
  serviceLogs,
  onUpdateServiceLog
}: ServiceHistoryTableProps) => {
  const { t } = useLanguage();
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  
  const sortedLogs = [...serviceLogs]
    .filter(log => log.vehicleId === vehicle.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const handlePrint = () => {
    printServiceHistory(vehicle, sortedLogs);
  };
  
  const handleEditLog = (logId: string) => {
    setEditingLogId(logId);
  };
  
  const handleUpdateServiceLog = (updatedLog: ServiceLog) => {
    setEditingLogId(null);
    if (onUpdateServiceLog) {
      onUpdateServiceLog(updatedLog);
    }
  };
  
  if (sortedLogs.length === 0) {
    return (
      <div className="text-center p-6 bg-mechanic-silver/20 rounded-md">
        <FileText size={40} className="mx-auto text-mechanic-gray/40 mb-2" />
        <h3 className="text-lg font-medium text-mechanic-gray">{t('noServiceRecords')}</h3>
        <p className="text-mechanic-gray/80 mt-1">
          {t('startLogging')}
        </p>
      </div>
    );
  }

  const currentlyEditingLog = editingLogId ? sortedLogs.find(log => log.id === editingLogId) : null;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">{t('serviceHistory')}</h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handlePrint}
          className="text-mechanic-blue hover:text-mechanic-blue/80"
        >
          <Printer size={16} className="mr-1" />
          {t('printHistory')}
        </Button>
      </div>
      
      <div className="space-y-6">
        {sortedLogs.map((log) => (
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
                  onClick={() => handleEditLog(log.id)}
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
        ))}
      </div>
      
      {currentlyEditingLog && (
        <ServiceLogForm
          open={!!currentlyEditingLog}
          onOpenChange={(open) => !open && setEditingLogId(null)}
          vehicle={vehicle}
          onAddServiceLog={handleUpdateServiceLog}
          editingLog={currentlyEditingLog}
        />
      )}
    </div>
  );
};

export default ServiceHistoryTable;
