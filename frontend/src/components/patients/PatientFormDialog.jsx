import { useEffect, useState } from "react";
import { UserPlus } from "lucide-react";
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
import { usePatientGenders } from "../../hooks/usePatients";

const empty = {
  name: "",
  gender: "",
  age: "",
  phone: "",
  email: "",
  addressLine: "",
  city: "",
  state: "",
};

export const PatientFormDialog = ({ open, onOpenChange, patient, onSubmit }) => {
  const { data: genders } = usePatientGenders();
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const editing = Boolean(patient);

  useEffect(() => {
    if (open) {
      if (patient) {
        setForm({
          name: patient.name,
          gender: patient.gender,
          age: String(patient.age),
          phone: patient.phone,
          email: patient.email,
          addressLine: patient.addressLine ?? "",
          city: patient.city,
          state: patient.state,
        });
      } else {
        setForm(empty);
      }
      setErrors({});
    }
  }, [open, patient]);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.gender) e.gender = "Required";
    const age = Number(form.age);
    if (!Number.isInteger(age) || age <= 0 || age > 130) e.age = "Enter a valid age";
    if (!/^\d{7,15}$/.test(form.phone.replace(/\D/g, ""))) e.phone = "Enter a valid phone";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    if (!form.city.trim()) e.city = "Required";
    if (!form.state.trim()) e.state = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    onSubmit({
      name: form.name.trim(),
      gender: form.gender,
      age: Number(form.age),
      phone: form.phone.trim(),
      email: form.email.trim(),
      addressLine: form.addressLine.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="patient-form-dialog"
        className="sm:max-w-lg rounded-2xl border-border/60 bg-card"
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/25">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>{editing ? "Edit Patient" : "Add New Patient"}</DialogTitle>
              <DialogDescription>
                {editing ? "Update the patient record." : "Register a new patient in the system."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <Field label="Full Name" error={errors.name}>
            <Input
              data-testid="patient-form-name"
              value={form.name}
              onChange={(e) => set("name")(e.target.value)}
              placeholder="e.g. Priya Patel"
              className="h-11 rounded-xl"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Gender" error={errors.gender}>
              <Select value={form.gender} onValueChange={set("gender")}>
                <SelectTrigger data-testid="patient-form-gender" className="h-11 rounded-xl">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {genders.map((g) => (
                    <SelectItem key={g.id} value={g.id}>{g.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Age" error={errors.age}>
              <Input
                data-testid="patient-form-age"
                type="number"
                min="0"
                max="130"
                value={form.age}
                onChange={(e) => set("age")(e.target.value)}
                placeholder="0"
                className="h-11 rounded-xl tabular-nums"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Phone" error={errors.phone}>
              <Input
                data-testid="patient-form-phone"
                value={form.phone}
                onChange={(e) => set("phone")(e.target.value)}
                placeholder="9876543210"
                className="h-11 rounded-xl tabular-nums"
              />
            </Field>
            <Field label="Email" error={errors.email}>
              <Input
                data-testid="patient-form-email"
                type="email"
                value={form.email}
                onChange={(e) => set("email")(e.target.value)}
                placeholder="name@email.com"
                className="h-11 rounded-xl"
              />
            </Field>
          </div>

          <Field label="Address Line">
            <Input
              data-testid="patient-form-address"
              value={form.addressLine}
              onChange={(e) => set("addressLine")(e.target.value)}
              placeholder="House / Street"
              className="h-11 rounded-xl"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="City" error={errors.city}>
              <Input
                data-testid="patient-form-city"
                value={form.city}
                onChange={(e) => set("city")(e.target.value)}
                placeholder="e.g. Bangalore"
                className="h-11 rounded-xl"
              />
            </Field>
            <Field label="State" error={errors.state}>
              <Input
                data-testid="patient-form-state"
                value={form.state}
                onChange={(e) => set("state")(e.target.value)}
                placeholder="e.g. Karnataka"
                className="h-11 rounded-xl"
              />
            </Field>
          </div>

          <DialogFooter className="gap-2 pt-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              data-testid="patient-form-cancel"
              onClick={() => onOpenChange(false)}
              className="h-11 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-testid="patient-form-submit"
              className="h-11 rounded-xl bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
            >
              {editing ? "Save changes" : "Add Patient"}
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
