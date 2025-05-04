
import { Vehicle, ServiceLog } from "@/utils/mockData";
import { printServiceHistory } from "@/utils/printUtils";
import { useState } from 'react';
import ServiceLogForm from "@/components/ServiceLogForm";
import ServiceLogCard from "./ServiceLogCard";
import EmptyServiceHistory from "./EmptyServiceHistory";
import ServiceHistoryHeader from "./ServiceHistoryHeader";

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
    return <EmptyServiceHistory />;
  }

  const currentlyEditingLog = editingLogId ? sortedLogs.find(log => log.id === editingLogId) : null;

  return (
    <div>
      <ServiceHistoryHeader onPrint={handlePrint} />
      
      <div className="space-y-6">
        {sortedLogs.map((log) => (
          <ServiceLogCard 
            key={log.id}
            log={log}
            onEdit={handleEditLog}
            onUpdateServiceLog={onUpdateServiceLog}
          />
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
