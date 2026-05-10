import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

export const DeleteDoctorDialog = ({ open, onOpenChange, doctor, onConfirm }) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent
      data-testid="delete-doctor-dialog"
      className="rounded-2xl border-border/60 bg-card"
    >
      <AlertDialogHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chart-red/15 text-chart-red ring-1 ring-chart-red/25">
            <Trash2 className="h-5 w-5" />
          </div>
          <div>
            <AlertDialogTitle>Remove doctor?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{" "}
              <span className="font-semibold text-foreground">{doctor?.name}</span> from the system.
              Existing prescriptions will remain unaffected.
            </AlertDialogDescription>
          </div>
        </div>
      </AlertDialogHeader>
      <AlertDialogFooter className="gap-2">
        <AlertDialogCancel data-testid="delete-doctor-cancel" className="h-11 rounded-xl">
          Cancel
        </AlertDialogCancel>
        <AlertDialogAction
          data-testid="delete-doctor-confirm"
          onClick={onConfirm}
          className="h-11 rounded-xl bg-chart-red font-semibold text-white hover:bg-chart-red/90"
        >
          Yes, remove
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
