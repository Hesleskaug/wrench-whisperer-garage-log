
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
          <div key={log.id} className="rounded-md border overflow-hidden">
            <div className="bg-mechanic-silver/10 p-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <div>
                  <h4 className="font-medium text-mechanic-blue">{log.serviceType}</h4>
                  <div className="text-sm text-mechanic-gray">
                    {new Date(log.date).toLocaleDateString()} • {log.mileage.toLocaleString()} km
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {log.cost && <div className="font-medium">{log.cost} kr</div>}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-mechanic-gray hover:text-mechanic-blue"
                    onClick={() => handleEditLog(log.id)}
                  >
                    <Pencil size={16} />
                  </Button>
                </div>
              </div>
              <p className="mt-2 text-sm">{log.description}</p>
              
              {log.parts && log.parts.length > 0 && (
                <div className="mt-3">
                  <div className="text-xs text-mechanic-gray font-medium mb-1">{t('parts')}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {log.parts.map((part, index) => (
                      <span key={index} className="bg-mechanic-silver/20 text-xs py-1 px-2 rounded">
                        {part}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-3">
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
            </div>
          </div>
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
