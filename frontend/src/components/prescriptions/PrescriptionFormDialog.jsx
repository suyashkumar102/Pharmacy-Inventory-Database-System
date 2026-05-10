import { useEffect, useState } from "react";
import { FileText, Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useRxPatients, usePrescriptionStatuses } from "../../hooks/usePrescriptions";
import { useDoctors } from "../../hooks/useDoctors";
import { useDrugs } from "../../hooks/useDrugs";
import { cn } from "../../lib/utils";

const emptyMedicine = () => ({ drugId: "", dosage: "", frequency: "", duration: "" });
const empty = {
  patientId: "",
  doctorId: "",
  issuedAt: new Date().toISOString().slice(0, 10),
  status: "pending",
  notes: "",
  medicines: [emptyMedicine()],
};

export const PrescriptionFormDialog = ({ open, onOpenChange, onSubmit }) => {
  const { data: patients } = useRxPatients();
  const { data: doctors } = useDoctors();
  const { data: drugs } = useDrugs();
  const { data: statuses } = usePrescriptionStatuses();

  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(empty);
      setErrors({});
    }
  }, [open]);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const setMedicine = (i, k, v) => {
    setForm((f) => ({
      ...f,
      medicines: f.medicines.map((m, idx) => (idx === i ? { ...m, [k]: v } : m)),
    }));
  };

  const addMedicine = () => setForm((f) => ({ ...f, medicines: [...f.medicines, emptyMedicine()] }));
  const removeMedicine = (i) =>
    setForm((f) => ({
      ...f,
      medicines: f.medicines.length > 1 ? f.medicines.filter((_, idx) => idx !== i) : f.medicines,
    }));

  const validate = () => {
    const e = {};
    if (!form.patientId) e.patientId = "Required";
    if (!form.doctorId) e.doctorId = "Required";
    if (!form.issuedAt) e.issuedAt = "Required";
    if (form.medicines.length === 0) e.medicines = "Add at least one medicine";
    form.medicines.forEach((m, i) => {
      if (!m.drugId) e[`medicine_${i}_drug`] = "Required";
      if (!m.dosage.trim()) e[`medicine_${i}_dosage`] = "Required";
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    onSubmit({
      patientId: form.patientId,
      doctorId: form.doctorId,
      issuedAt: new Date(form.issuedAt).toISOString(),
      status: form.status,
      notes: form.notes.trim(),
      medicines: form.medicines.map((m) => ({
        drugId: m.drugId,
        dosage: m.dosage.trim(),
        frequency: m.frequency.trim(),
        duration: m.duration.trim(),
      })),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="prescription-form-dialog"
        className="max-h-[90vh] overflow-y-auto sm:max-w-2xl rounded-2xl border-border/60 bg-card"
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/25">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>New Prescription</DialogTitle>
              <DialogDescription>Issue a new prescription for a patient.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Patient" error={errors.patientId}>
              <Select value={form.patientId} onValueChange={set("patientId")}>
                <SelectTrigger data-testid="rx-form-patient" className="h-11 rounded-xl">
                  <SelectValue placeholder="Select a patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Doctor" error={errors.doctorId}>
              <Select value={form.doctorId} onValueChange={set("doctorId")}>
                <SelectTrigger data-testid="rx-form-doctor" className="h-11 rounded-xl">
                  <SelectValue placeholder="Select a doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name} ({d.specialization})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Date" error={errors.issuedAt}>
              <Input
                data-testid="rx-form-date"
                type="date"
                value={form.issuedAt}
                onChange={(e) => set("issuedAt")(e.target.value)}
                className="h-11 rounded-xl"
              />
            </Field>
            <Field label="Status">
              <Select value={form.status} onValueChange={set("status")}>
                <SelectTrigger data-testid="rx-form-status" className="h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          {/* Medicines */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Medicines
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                data-testid="rx-form-add-medicine"
                onClick={addMedicine}
                className="h-8 rounded-lg text-xs"
              >
                <Plus className="mr-1 h-3 w-3" />
                Add medicine
              </Button>
            </div>
            <div className="space-y-3">
              {form.medicines.map((m, i) => (
                <div
                  key={i}
                  data-testid={`rx-form-medicine-${i}`}
                  className="rounded-xl border border-border/50 bg-secondary/20 p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">
                      Medicine {i + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeMedicine(i)}
                      disabled={form.medicines.length === 1}
                      data-testid={`rx-form-remove-medicine-${i}`}
                      className={cn(
                        "rounded-md p-1 text-chart-red transition-colors",
                        form.medicines.length === 1
                          ? "opacity-30"
                          : "hover:bg-chart-red/10"
                      )}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div>
                      <Select value={m.drugId} onValueChange={(v) => setMedicine(i, "drugId", v)}>
                        <SelectTrigger
                          data-testid={`rx-form-medicine-drug-${i}`}
                          className="h-10 rounded-lg"
                        >
                          <SelectValue placeholder="Select drug" />
                        </SelectTrigger>
                        <SelectContent>
                          {drugs.map((d) => (
                            <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors[`medicine_${i}_drug`] && <p className="mt-1 text-xs text-destructive">{errors[`medicine_${i}_drug`]}</p>}
                    </div>
                    <Input
                      data-testid={`rx-form-medicine-dosage-${i}`}
                      value={m.dosage}
                      onChange={(e) => setMedicine(i, "dosage", e.target.value)}
                      placeholder="Dosage (e.g. 1 tab)"
                      className="h-10 rounded-lg"
                    />
                    <Input
                      data-testid={`rx-form-medicine-frequency-${i}`}
                      value={m.frequency}
                      onChange={(e) => setMedicine(i, "frequency", e.target.value)}
                      placeholder="Frequency (e.g. Twice daily)"
                      className="h-10 rounded-lg"
                    />
                    <Input
                      data-testid={`rx-form-medicine-duration-${i}`}
                      value={m.duration}
                      onChange={(e) => setMedicine(i, "duration", e.target.value)}
                      placeholder="Duration (e.g. 5 days)"
                      className="h-10 rounded-lg"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Field label="Notes">
            <Textarea
              data-testid="rx-form-notes"
              value={form.notes}
              onChange={(e) => set("notes")(e.target.value)}
              placeholder="Optional notes..."
              className="min-h-[72px] rounded-xl"
            />
          </Field>

          <DialogFooter className="gap-2 pt-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              data-testid="rx-form-cancel"
              onClick={() => onOpenChange(false)}
              className="h-11 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-testid="rx-form-submit"
              className="h-11 rounded-xl bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Issue Prescription
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const Field = ({ label, error, children }) => (
  <div>
    <Label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {label}
    </Label>
    {children}
    {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
  </div>
);
