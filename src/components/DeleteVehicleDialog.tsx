
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Vehicle } from "@/utils/mockData";

interface DeleteVehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle: Vehicle;
  onDeleteVehicle: () => void;
}

const DeleteVehicleDialog = ({
  open,
  onOpenChange,
  vehicle,
  onDeleteVehicle,
}: DeleteVehicleDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete{" "}
            <span className="font-semibold">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </span>{" "}
            and all its service history from your garage. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onDeleteVehicle} className="bg-red-600 hover:bg-red-700">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteVehicleDialog;
