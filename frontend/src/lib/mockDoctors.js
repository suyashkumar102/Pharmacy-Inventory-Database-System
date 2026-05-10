// Mock doctor data + reference catalogues. Backend agent: replace with API.

import { avatarColorFor, initialsOf } from "./mockPatients";

export { avatarColorFor, initialsOf };

export const SPECIALIZATIONS = [
  { id: "cardiology", label: "Cardiology", color: "red" },
  { id: "general", label: "General Practice", color: "blue" },
  { id: "pediatrics", label: "Pediatrics", color: "pink" },
  { id: "dermatology", label: "Dermatology", color: "amber" },
  { id: "neurology", label: "Neurology", color: "purple" },
  { id: "orthopedics", label: "Orthopedics", color: "cyan" },
  { id: "gynecology", label: "Gynecology", color: "rose" },
  { id: "psychiatry", label: "Psychiatry", color: "teal" },
  { id: "endocrinology", label: "Endocrinology", color: "orange" },
  { id: "ent", label: "ENT", color: "green" },
];

export const DOCTOR_STATUSES = [
  { id: "active", label: "Active" },
  { id: "on_leave", label: "On Leave" },
  { id: "inactive", label: "Inactive" },
];

export const MOCK_DOCTORS = [
  {
    id: "D001",
    name: "Dr. Arjun Nair",
    qualification: "MBBS, MD",
    specializationId: "cardiology",
    phone: "9000200030",
    email: "arjun.nair@hospital.com",
    addedAt: "2026-05-01T11:00:00",
    status: "active",
  },
  {
    id: "D002",
    name: "Dr. Meera Joshi",
    qualification: "MBBS",
    specializationId: "general",
    phone: "9000100020",
    email: "meera.joshi@clinic.com",
    addedAt: "2026-05-03T09:30:00",
    status: "active",
  },
];

const sparkline = (seed) =>
  Array.from({ length: 14 }, (_, i) => ({
    x: i,
    y: Math.max(2, Math.round(Math.sin(i / 1.6 + seed) * 4 + seed * 2 + i / 3 + 6)),
  }));

export const DOCTOR_KPI_SERIES = {
  total: sparkline(2),
  specializations: sparkline(3),
  active: sparkline(4),
  thisMonth: sparkline(5),
};
