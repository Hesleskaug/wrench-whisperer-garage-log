
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
import { FileText, Printer } from "lucide-react";

interface ServiceHistoryTableProps {
  vehicle: Vehicle;
  serviceLogs: ServiceLog[];
}

const ServiceHistoryTable = ({ vehicle, serviceLogs }: ServiceHistoryTableProps) => {
  const sortedLogs = [...serviceLogs]
    .filter(log => log.vehicleId === vehicle.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const handlePrint = () => {
    printServiceHistory(vehicle, sortedLogs);
  };
  
  if (sortedLogs.length === 0) {
    return (
      <div className="text-center p-6 bg-mechanic-silver/20 rounded-md">
        <FileText size={40} className="mx-auto text-mechanic-gray/40 mb-2" />
        <h3 className="text-lg font-medium text-mechanic-gray">No Service Records</h3>
        <p className="text-mechanic-gray/80 mt-1">
          Start logging maintenance to build service history
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Service History</h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handlePrint}
          className="text-mechanic-blue hover:text-mechanic-blue/80"
        >
          <Printer size={16} className="mr-1" />
          Print History
        </Button>
      </div>
      
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Mileage</TableHead>
              <TableHead>Service Type</TableHead>
              <TableHead className="hidden md:table-cell">Description</TableHead>
              <TableHead className="hidden md:table-cell">Parts</TableHead>
              <TableHead>Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{new Date(log.date).toLocaleDateString()}</TableCell>
                <TableCell>{log.mileage.toLocaleString()} km</TableCell>
                <TableCell>{log.serviceType}</TableCell>
                <TableCell className="hidden md:table-cell max-w-[200px] truncate">
                  {log.description}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {log.parts ? log.parts.join(", ") : "-"}
                </TableCell>
                <TableCell>{log.cost ? `${log.cost} kr` : "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ServiceHistoryTable;
