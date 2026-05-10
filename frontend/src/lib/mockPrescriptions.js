import { MOCK_PATIENTS, avatarColorFor, initialsOf } from "./mockPatients";
import { MOCK_DOCTORS, SPECIALIZATIONS } from "./mockDoctors";
import { MOCK_DRUGS, DRUG_CATEGORIES } from "./mockDrugs";

export const PRESCRIPTION_STATUSES = [
  { id: "pending", label: "Pending", color: "orange" },
  { id: "completed", label: "Completed", color: "green" },
  { id: "cancelled", label: "Cancelled", color: "red" },
];

const PATIENT_LOOKUP = Object.fromEntries(MOCK_PATIENTS.map((p) => [p.id, p]));
const DOCTOR_LOOKUP = Object.fromEntries(MOCK_DOCTORS.map((d) => [d.id, d]));
const DRUG_LOOKUP = Object.fromEntries(MOCK_DRUGS.map((d) => [d.id, d]));
const SPEC_LOOKUP = Object.fromEntries(SPECIALIZATIONS.map((s) => [s.id, s]));
const CAT_LOOKUP = Object.fromEntries(DRUG_CATEGORIES.map((c) => [c.id, c]));

export { PATIENT_LOOKUP, DOCTOR_LOOKUP, DRUG_LOOKUP, SPEC_LOOKUP, CAT_LOOKUP };

// We need 28 to match the screenshot total; first 4 match the screenshot exactly.
// Pattern: 7 pending, 18 completed, 3 cancelled.
const EXTRA_PATIENTS = [
  { id: "P003", name: "Amit Mishra", phone: "9834567120" },
  { id: "P004", name: "Sneha Kapoor", phone: "9001234567" },
  { id: "P005", name: "Vikram Iyer", phone: "9011223344" },
  { id: "P006", name: "Anjali Reddy", phone: "9977665544" },
  { id: "P007", name: "Karan Mehta", phone: "9888777666" },
  { id: "P008", name: "Neha Verma", phone: "9876123450" },
];

const buildExtraPatient = (p) => ({
  ...p,
  initials: initialsOf(p.name),
  avatarColor: avatarColorFor(p.name),
});

const ALL_RX_PATIENTS = [
  ...MOCK_PATIENTS.map((p) => ({ ...p, initials: initialsOf(p.name), avatarColor: avatarColorFor(p.name) })),
  ...EXTRA_PATIENTS.map(buildExtraPatient),
];

const ALL_RX_DOCTORS = MOCK_DOCTORS;
const RX_DRUG_IDS = MOCK_DRUGS.map((d) => d.id);

const pickPatient = (i) => ALL_RX_PATIENTS[i % ALL_RX_PATIENTS.length];
const pickDoctor = (i) => ALL_RX_DOCTORS[i % ALL_RX_DOCTORS.length];

const buildMedicines = (n, seed) =>
  Array.from({ length: n }, (_, i) => {
    const drugId = RX_DRUG_IDS[(seed + i) % RX_DRUG_IDS.length];
    return {
      drugId,
      dosage: ["1 tab", "2 tabs", "5 ml", "1 cap"][(seed + i) % 4],
      frequency: ["Once daily", "Twice daily", "Thrice daily", "Every 8 hours"][(seed + i) % 4],
      duration: ["3 days", "5 days", "7 days", "10 days", "14 days"][(seed + i) % 5],
    };
  });

const dt = (year, month, day, hour, minute) =>
  new Date(year, month - 1, day, hour, minute, 0).toISOString();

// Order matches the screenshot's first 4 rows.
export const MOCK_PRESCRIPTIONS = [
  {
    id: "RX001",
    patientId: "P002", // Rahul Sharma
    doctorId: "D002", // Dr. Meera Joshi (General Practice)
    issuedAt: dt(2026, 5, 7, 10, 15),
    status: "pending",
    medicines: buildMedicines(3, 0),
    notes: "Follow up in 1 week.",
  },
  {
    id: "RX002",
    patientId: "P001", // Priya Patel
    doctorId: "D001", // Dr. Arjun Nair (Cardiology)
    issuedAt: dt(2026, 5, 6, 16, 30),
    status: "completed",
    medicines: buildMedicines(2, 1),
    notes: "Blood pressure stable.",
  },
  {
    id: "RX003",
    patientId: "P003", // Amit Mishra
    doctorId: "D002",
    issuedAt: dt(2026, 5, 5, 11, 20),
    status: "cancelled",
    medicines: buildMedicines(4, 2),
    notes: "Patient cancelled appointment.",
  },
  {
    id: "RX004",
    patientId: "P004", // Sneha Kapoor
    doctorId: "D001",
    issuedAt: dt(2026, 5, 4, 14, 45),
    status: "pending",
    medicines: buildMedicines(1, 3),
    notes: "Initial consultation.",
  },
];

// Generate the rest to reach 28 total with the right status distribution.
// Already: 2 pending, 1 completed, 1 cancelled.
// Need: 5 more pending, 17 more completed, 2 more cancelled = 24 more.
const fillerStatuses = [
  ...Array(5).fill("pending"),
  ...Array(17).fill("completed"),
  ...Array(2).fill("cancelled"),
];

for (let i = 0; i < fillerStatuses.length; i++) {
  const idx = i + 4;
  // Filler dates are OLDER than the 4 originals (which span May 4-7).
  // Place them from May 3 going backwards so the originals stay on page 1.
  const startDay = 3;
  const day = startDay - i;
  let month = 5;
  let realDay = day;
  if (day <= 0) {
    month = 4;
    realDay = 30 + day; // wrap into April
  }
  if (realDay <= 0) {
    month = 3;
    realDay = 31 + realDay;
  }
  MOCK_PRESCRIPTIONS.push({
    id: `RX${String(idx + 1).padStart(3, "0")}`,
    patientId: pickPatient(idx).id,
    doctorId: pickDoctor(idx).id,
    issuedAt: dt(2026, month, realDay, 9 + (i % 8), (i * 7) % 60),
    status: fillerStatuses[i],
    medicines: buildMedicines(1 + (i % 4), i),
    notes: "",
  });
}

const sparkline = (seed, len = 16) =>
  Array.from({ length: len }, (_, i) => ({
    x: i,
    y: Math.max(2, Math.round(Math.sin(i / 1.6 + seed) * 5 + seed * 1.5 + i / 2 + 6)),
  }));

export const RX_KPI_SERIES = {
  total: sparkline(2),
  pending: sparkline(4),
  completed: sparkline(3),
  cancelled: sparkline(5),
};

// Helper to enrich a prescription with patient/doctor objects (for UI).
export const enrichPrescription = (rx) => {
  const patient = ALL_RX_PATIENTS.find((p) => p.id === rx.patientId) ?? null;
  const doctor = ALL_RX_DOCTORS.find((d) => d.id === rx.doctorId) ?? null;
  return {
    ...rx,
    patient,
    doctor: doctor
      ? {
          ...doctor,
          specialization: SPEC_LOOKUP[doctor.specializationId]?.label ?? "",
        }
      : null,
    medicineDetails: rx.medicines.map((m) => ({
      ...m,
      drug: DRUG_LOOKUP[m.drugId] ?? null,
      categoryColor: DRUG_LOOKUP[m.drugId]
        ? CAT_LOOKUP[DRUG_LOOKUP[m.drugId].categoryId]?.color
        : "slate",
    })),
  };
};

export const ALL_RX_PATIENTS_ENRICHED = ALL_RX_PATIENTS;
