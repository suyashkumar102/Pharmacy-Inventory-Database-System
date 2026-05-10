import { useEffect, useState } from "react";
import { Pill } from "lucide-react";
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
import { useDrugCategories } from "../../hooks/useDrugs";

const empty = { name: "", categoryId: "", price: "", stock: "" };

export const DrugFormDialog = ({ open, onOpenChange, drug, onSubmit }) => {
  const { data: categories } = useDrugCategories();
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const editing = Boolean(drug);

  useEffect(() => {
    if (open) {
      if (drug) {
        setForm({
          name: drug.name,
          categoryId: drug.categoryId,
          price: String(drug.price),
          stock: String(drug.stock),
        });
      } else {
        setForm(empty);
      }
      setErrors({});
    }
  }, [open, drug]);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.categoryId) e.categoryId = "Required";
    const price = Number(form.price);
    if (form.price === "" || Number.isNaN(price) || price < 0) e.price = "Enter a valid price";
    const stock = Number(form.stock);
    if (form.stock === "" || !Number.isInteger(stock) || stock < 0) e.stock = "Enter a valid quantity";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    onSubmit({
      name: form.name.trim(),
      categoryId: form.categoryId,
      price: Number(form.price),
      stock: Number(form.stock),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="drug-form-dialog"
        className="sm:max-w-md rounded-2xl border-border/60 bg-card"
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/25">
              <Pill className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>{editing ? "Edit Drug" : "Add New Drug"}</DialogTitle>
              <DialogDescription>
                {editing ? "Update the drug details below." : "Add a new medicine to your inventory."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <Field label="Drug Name" error={errors.name}>
            <Input
              data-testid="drug-form-name"
              value={form.name}
              onChange={(e) => set("name")(e.target.value)}
              placeholder="e.g. Amoxicillin 500mg"
              className="h-11 rounded-xl"
            />
          </Field>

          <Field label="Category" error={errors.categoryId}>
            <Select value={form.categoryId} onValueChange={set("categoryId")}>
              <SelectTrigger data-testid="drug-form-category" className="h-11 rounded-xl">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Price (INR)" error={errors.price}>
              <Input
                data-testid="drug-form-price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => set("price")(e.target.value)}
                placeholder="0.00"
                className="h-11 rounded-xl tabular-nums"
              />
            </Field>
            <Field label="Stock Qty" error={errors.stock}>
              <Input
                data-testid="drug-form-stock"
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={(e) => set("stock")(e.target.value)}
                placeholder="0"
                className="h-11 rounded-xl tabular-nums"
              />
            </Field>
          </div>

          <DialogFooter className="gap-2 pt-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              data-testid="drug-form-cancel"
              onClick={() => onOpenChange(false)}
              className="h-11 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-testid="drug-form-submit"
              className="h-11 rounded-xl bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
            >
              {editing ? "Save changes" : "Add Drug"}
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
