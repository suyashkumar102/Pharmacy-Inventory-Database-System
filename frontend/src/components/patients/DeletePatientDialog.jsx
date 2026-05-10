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

export const DeletePatientDialog = ({ open, onOpenChange, patient, onConfirm }) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent
      data-testid="delete-patient-dialog"
      className="rounded-2xl border-border/60 bg-card"
    >
      <AlertDialogHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chart-red/15 text-chart-red ring-1 ring-chart-red/25">
            <Trash2 className="h-5 w-5" />
          </div>
          <div>
            <AlertDialogTitle>Delete patient?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{" "}
              <span className="font-semibold text-foreground">{patient?.name}</span> from your records.
              This action cannot be undone.
            </AlertDialogDescription>
          </div>
        </div>
      </AlertDialogHeader>
      <AlertDialogFooter className="gap-2">
        <AlertDialogCancel data-testid="delete-patient-cancel" className="h-11 rounded-xl">
          Cancel
        </AlertDialogCancel>
        <AlertDialogAction
          data-testid="delete-patient-confirm"
          onClick={onConfirm}
          className="h-11 rounded-xl bg-chart-red font-semibold text-white hover:bg-chart-red/90"
        >
          Yes, delete
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
