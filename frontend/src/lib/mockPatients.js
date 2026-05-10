// Mock patient data. Backend agent: replace exports with API responses
// or swap the hook in /src/hooks/usePatients.js.

export const PATIENT_GENDERS = [
  { id: "male", label: "Male" },
  { id: "female", label: "Female" },
  { id: "other", label: "Other" },
];

export const PATIENT_STATUSES = [
  { id: "active", label: "Active", color: "green" },
  { id: "inactive", label: "Inactive", color: "slate" },
];

export const MOCK_PATIENTS = [
  {
    id: "P001",
    name: "Priya Patel",
    gender: "female",
    age: 28,
    phone: "9123456780",
    email: "priya.patel@email.com",
    addressLine: "12, Lake Gardens",
    city: "Kolkata",
    state: "West Bengal",
    registeredAt: "2026-05-07T10:30:00",
    status: "active",
  },
  {
    id: "P002",
    name: "Rahul Sharma",
    gender: "male",
    age: 32,
    phone: "9876543210",
    email: "rahul.sharma@email.com",
    addressLine: "44, MG Road",
    city: "Bangalore",
    state: "Karnataka",
    registeredAt: "2026-05-07T10:15:00",
    status: "active",
  },
];

// Deterministic avatar palette (cycles through these).
const AVATAR_COLORS = ["blue", "green", "purple", "orange", "pink", "cyan", "amber"];

export const avatarColorFor = (str) => {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
};

export const initialsOf = (name) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
