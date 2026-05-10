// Mock drug catalog. Replace with API call when backend is wired.

export const DRUG_CATEGORIES = [
  { id: "antibiotic", label: "Antibiotic", color: "pink" },
  { id: "cardiovascular", label: "Cardiovascular", color: "blue" },
  { id: "painkiller", label: "Painkiller", color: "green" },
  { id: "antidiabetic", label: "Antidiabetic", color: "amber" },
  { id: "respiratory", label: "Respiratory", color: "cyan" },
  { id: "neurological", label: "Neurological", color: "purple" },
  { id: "vitamin", label: "Vitamin / Supplement", color: "orange" },
  { id: "other", label: "Other", color: "slate" },
];

export const STOCK_THRESHOLDS = { low: 20 };

export const deriveStatus = (stock) => {
  if (stock <= 0) return "out_of_stock";
  if (stock < STOCK_THRESHOLDS.low) return "low_stock";
  return "in_stock";
};

export const MOCK_DRUGS = [
  {
    id: "drg-001",
    name: "Amoxicillin 500mg",
    categoryId: "antibiotic",
    price: 12.5,
    stock: 120,
    addedAt: "2026-04-12",
  },
  {
    id: "drg-002",
    name: "Atorvastatin 20mg",
    categoryId: "cardiovascular",
    price: 20.0,
    stock: 8,
    addedAt: "2026-03-22",
  },
  {
    id: "drg-003",
    name: "Ibuprofen 400mg",
    categoryId: "painkiller",
    price: 8.0,
    stock: 200,
    addedAt: "2026-04-30",
  },
  {
    id: "drg-004",
    name: "Metformin 500mg",
    categoryId: "antidiabetic",
    price: 10.0,
    stock: 15,
    addedAt: "2026-04-02",
  },
];

const sparkline = (seed) =>
  Array.from({ length: 14 }, (_, i) => ({
    x: i,
    y: Math.max(2, Math.round(Math.sin(i / 1.7 + seed) * 5 + seed * 2 + i / 3 + 6)),
  }));

export const DRUG_KPI_SERIES = {
  total: sparkline(2),
  inStock: sparkline(3),
  lowStock: sparkline(4),
  outOfStock: Array.from({ length: 14 }, (_, i) => ({ x: i, y: 0 })),
  value: sparkline(5),
};
