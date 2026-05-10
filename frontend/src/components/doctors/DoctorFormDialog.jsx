import { useEffect, useState } from "react";
import { Stethoscope } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useSpecializations, useDoctorStatuses } from "../../hooks/useDoctors";

const empty = {
  name: "",
  qualification: "",
  specializationId: "",
  phone: "",
  email: "",
  status: "active",
};

export const DoctorFormDialog = ({ open, onOpenChange, doctor, onSubmit }) => {
  const { data: specs } = useSpecializations();
  const { data: statuses } = useDoctorStatuses();
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const editing = Boolean(doctor);

  useEffect(() => {
    if (open) {
      if (doctor) {
        setForm({
          name: doctor.name,
          qualification: doctor.qualification,
          specializationId: doctor.specializationId,
          phone: doctor.phone,
          email: doctor.email,
          status: doctor.status,
        });
      } else {
        setForm(empty);
      }
      setErrors({});
    }
  }, [open, doctor]);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.qualification.trim()) e.qualification = "Required";
    if (!form.specializationId) e.specializationId = "Required";
    if (!/^\d{7,15}$/.test(form.phone.replace(/\D/g, ""))) e.phone = "Enter a valid phone";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    let name = form.name.trim();
    if (!/^Dr\.?\s+/i.test(name)) name = `Dr. ${name}`;
    onSubmit({
      name,
      qualification: form.qualification.trim(),
      specializationId: form.specializationId,
      phone: form.phone.trim(),
      email: form.email.trim(),
      status: form.status,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="doctor-form-dialog"
        className="sm:max-w-lg rounded-2xl border-border/60 bg-card"
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/25">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>{editing ? "Edit Doctor" : "Add New Doctor"}</DialogTitle>
              <DialogDescription>
                {editing ? "Update the doctor's profile." : "Register a new doctor in the system."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <Field label="Doctor Name" error={errors.name}>
            <Input
              data-testid="doctor-form-name"
              value={form.name}
              onChange={(e) => set("name")(e.target.value)}
              placeholder="e.g. Arjun Nair (Dr. prefix added automatically)"
              className="h-11 rounded-xl"
            />
          </Field>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Qualification" error={errors.qualification}>
              <Input
                data-testid="doctor-form-qualification"
                value={form.qualification}
                onChange={(e) => set("qualification")(e.target.value)}
                placeholder="e.g. MBBS, MD"
                className="h-11 rounded-xl"
              />
            </Field>
            <Field label="Specialization" error={errors.specializationId}>
              <Select value={form.specializationId} onValueChange={set("specializationId")}>
                <SelectTrigger data-testid="doctor-form-specialization" className="h-11 rounded-xl">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {specs.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Phone" error={errors.phone}>
              <Input
                data-testid="doctor-form-phone"
                value={form.phone}
                onChange={(e) => set("phone")(e.target.value)}
                placeholder="9876543210"
                className="h-11 rounded-xl tabular-nums"
              />
            </Field>
            <Field label="Email" error={errors.email}>
              <Input
                data-testid="doctor-form-email"
                type="email"
                value={form.email}
                onChange={(e) => set("email")(e.target.value)}
                placeholder="name@hospital.com"
                className="h-11 rounded-xl"
              />
            </Field>
          </div>

          <Field label="Status">
            <Select value={form.status} onValueChange={set("status")}>
              <SelectTrigger data-testid="doctor-form-status" className="h-11 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <DialogFooter className="gap-2 pt-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              data-testid="doctor-form-cancel"
              onClick={() => onOpenChange(false)}
              className="h-11 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-testid="doctor-form-submit"
              className="h-11 rounded-xl bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
            >
              {editing ? "Save changes" : "Add Doctor"}
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
