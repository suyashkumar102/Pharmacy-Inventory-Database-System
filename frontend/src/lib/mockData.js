// Mock data for the PIPMS Dashboard.
// The backend integration agent should replace these exports with real API calls
// (or swap the hooks in /src/hooks/useDashboard.js to fetch from the FastAPI backend).

export const MOCK_USER = {
  name: "Admin User",
  role: "Administrator",
  initials: "AU",
  email: "admin@pipms.local",
};

const sparkline = (seed) =>
  Array.from({ length: 14 }, (_, i) => ({
    x: i,
    y: Math.max(2, Math.round(Math.sin(i / 2 + seed) * 6 + seed * 3 + i / 2 + 8)),
  }));

export const MOCK_STATS = [
  {
    id: "drugs",
    label: "Total Drugs",
    value: 4,
    delta: 12.5,
    direction: "up",
    period: "from last month",
    color: "green",
    icon: "Pill",
    series: sparkline(2),
  },
  {
    id: "patients",
    label: "Patients",
    value: 2,
    delta: 8.3,
    direction: "up",
    period: "from last month",
    color: "blue",
    icon: "Users",
    series: sparkline(3),
  },
  {
    id: "pending",
    label: "Pending Prescriptions",
    value: 1,
    delta: 20,
    direction: "down",
    period: "from last month",
    color: "purple",
    icon: "FileText",
    series: sparkline(1),
  },
  {
    id: "alerts",
    label: "Low Stock Alerts",
    value: 2,
    delta: 100,
    direction: "up",
    period: "from last month",
    color: "orange",
    icon: "AlertTriangle",
    series: sparkline(4),
  },
];

export const MOCK_RECENT_PRESCRIPTIONS = [
  {
    id: 1,
    patient: "Rahul Sharma",
    doctor: "Dr. Meera Joshi",
    date: "7 May 2026",
    status: "pending",
  },
];

export const MOCK_LOW_STOCK = [
  { id: "atorva", name: "Atorvastatin 20mg", units: 8, status: "low" },
  { id: "metform", name: "Metformin 500mg", units: 15, status: "low" },
];

export const MOCK_QUICK_ACTIONS = [
  { id: "add-drug", label: "Add Drug", icon: "PlusCircle", color: "green" },
  { id: "add-patient", label: "Add Patient", icon: "UserPlus", color: "blue" },
  { id: "add-doctor", label: "Add Doctor", icon: "Stethoscope", color: "purple" },
  { id: "new-rx", label: "New Prescription", icon: "FileText", color: "orange" },
];

export const MOCK_INVENTORY = {
  total: 4,
  inStock: 2,
  lowStock: 2,
  outOfStock: 0,
};

export const MOCK_SYSTEM_SUMMARY = [
  { label: "Drugs", value: 4, color: "green" },
  { label: "Patients", value: 2, color: "blue" },
  { label: "Doctors", value: 2, color: "purple" },
  { label: "Prescriptions", value: 1, color: "orange" },
];

export const MOCK_NOTIFICATIONS = [
  { id: 1, title: "Atorvastatin 20mg low stock", time: "2m ago", type: "warning" },
  { id: 2, title: "New prescription from Dr. Meera Joshi", time: "1h ago", type: "info" },
];
