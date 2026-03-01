import { nanoid } from "nanoid";
import type {
  EHRDatabase,
  ExtendedPatient,
  DrugHistory,
  LabReport,
  Visit,
  VitalReading,
  Provider,
} from "@/types/ehr";
import initialDatabase from "@/data/ehr-database.json";

// Singleton instance
let serviceInstance: EHRService | null = null;

export class EHRService {
  private database: EHRDatabase | null = null;
  private initialized = false;

  constructor() {}

  static getInstance(): EHRService {
    if (!serviceInstance) {
      serviceInstance = new EHRService();
    }
    return serviceInstance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Load from bundled JSON data
    this.database = JSON.parse(JSON.stringify(initialDatabase)) as EHRDatabase;
    this.initialized = true;
  }

  private async saveDatabase(): Promise<void> {
    // In-memory only - changes persist for the session but not across deploys
    if (!this.database) return;
    this.database.lastUpdated = new Date().toISOString();
  }

  async resetDatabase(): Promise<void> {
    this.database = JSON.parse(JSON.stringify(initialDatabase)) as EHRDatabase;
  }

  // Patient Operations
  async getAllPatients(): Promise<ExtendedPatient[]> {
    await this.initialize();
    return this.database?.patients || [];
  }

  async searchPatients(query: string): Promise<ExtendedPatient[]> {
    await this.initialize();
    const lowerQuery = query.toLowerCase();

    return (
      this.database?.patients.filter(
        (p) =>
          p.name.toLowerCase().includes(lowerQuery) ||
          p.mrn.toLowerCase().includes(lowerQuery) ||
          p.dateOfBirth.includes(query)
      ) || []
    );
  }

  async getPatient(id: string): Promise<ExtendedPatient | null> {
    await this.initialize();
    return this.database?.patients.find((p) => p.id === id) || null;
  }

  async getPatientByMRN(mrn: string): Promise<ExtendedPatient | null> {
    await this.initialize();
    return this.database?.patients.find((p) => p.mrn === mrn) || null;
  }

  // Medication Operations
  async getPatientMedications(
    patientId: string,
    includeHistory = false
  ): Promise<{
    currentMedications: { name: string; dosage: string; frequency: string }[];
    drugHistory?: DrugHistory[];
  } | null> {
    await this.initialize();
    const patient = await this.getPatient(patientId);
    if (!patient) return null;

    return {
      currentMedications: patient.currentMedications,
      ...(includeHistory && { drugHistory: patient.drugHistory }),
    };
  }

  async addMedication(
    patientId: string,
    medication: Omit<DrugHistory, "id">
  ): Promise<DrugHistory | null> {
    await this.initialize();
    const patient = this.database?.patients.find((p) => p.id === patientId);
    if (!patient) return null;

    const newMedication: DrugHistory = {
      id: `drug-${nanoid(8)}`,
      ...medication,
    };

    patient.drugHistory.push(newMedication);

    // Update current medications if this is an active medication
    if (!medication.endDate) {
      // Check if already exists
      const existingIdx = patient.currentMedications.findIndex(
        (m) => m.name.toLowerCase() === medication.medicationName.toLowerCase()
      );
      if (existingIdx >= 0) {
        patient.currentMedications[existingIdx] = {
          name: medication.medicationName,
          dosage: medication.dosage,
          frequency: medication.frequency,
        };
      } else {
        patient.currentMedications.push({
          name: medication.medicationName,
          dosage: medication.dosage,
          frequency: medication.frequency,
        });
      }
    }

    await this.saveDatabase();
    return newMedication;
  }

  async discontinueMedication(
    patientId: string,
    medicationId: string,
    reason: string
  ): Promise<boolean> {
    await this.initialize();
    const patient = this.database?.patients.find((p) => p.id === patientId);
    if (!patient) return false;

    const medication = patient.drugHistory.find((m) => m.id === medicationId);
    if (!medication) return false;

    medication.endDate = new Date().toISOString().split("T")[0];
    medication.discontinuedReason = reason;

    // Remove from current medications
    patient.currentMedications = patient.currentMedications.filter(
      (m) => m.name.toLowerCase() !== medication.medicationName.toLowerCase()
    );

    await this.saveDatabase();
    return true;
  }

  // Lab Operations
  async getLabResults(
    patientId: string,
    startDate?: string,
    endDate?: string
  ): Promise<LabReport[]> {
    await this.initialize();
    const patient = await this.getPatient(patientId);
    if (!patient) return [];

    let reports = patient.labReports;

    if (startDate) {
      reports = reports.filter((r) => r.reportDate >= startDate);
    }
    if (endDate) {
      reports = reports.filter((r) => r.reportDate <= endDate);
    }

    return reports.sort(
      (a, b) =>
        new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime()
    );
  }

  async addLabReport(
    patientId: string,
    report: Omit<LabReport, "id">
  ): Promise<LabReport | null> {
    await this.initialize();
    const patient = this.database?.patients.find((p) => p.id === patientId);
    if (!patient) return null;

    const newReport: LabReport = {
      id: `lab-${nanoid(8)}`,
      ...report,
    };

    patient.labReports.push(newReport);
    await this.saveDatabase();
    return newReport;
  }

  // Visit Operations
  async getVisitHistory(
    patientId: string,
    limit?: number
  ): Promise<Visit[]> {
    await this.initialize();
    const patient = await this.getPatient(patientId);
    if (!patient) return [];

    const sorted = patient.visits.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return limit ? sorted.slice(0, limit) : sorted;
  }

  async addVisit(
    patientId: string,
    visit: Omit<Visit, "id">
  ): Promise<Visit | null> {
    await this.initialize();
    const patient = this.database?.patients.find((p) => p.id === patientId);
    if (!patient) return null;

    const newVisit: Visit = {
      id: `visit-${nanoid(8)}`,
      ...visit,
    };

    patient.visits.push(newVisit);
    patient.lastVisit = visit.date;
    await this.saveDatabase();
    return newVisit;
  }

  // Vitals Operations
  async getVitals(
    patientId: string,
    vitalType?: VitalReading["type"],
    startDate?: string,
    endDate?: string
  ): Promise<VitalReading[]> {
    await this.initialize();
    const patient = await this.getPatient(patientId);
    if (!patient) return [];

    let vitals = patient.vitals;

    if (vitalType) {
      vitals = vitals.filter((v) => v.type === vitalType);
    }
    if (startDate) {
      vitals = vitals.filter((v) => v.date >= startDate);
    }
    if (endDate) {
      vitals = vitals.filter((v) => v.date <= endDate);
    }

    return vitals.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  async addVitalReading(
    patientId: string,
    vital: Omit<VitalReading, "id">
  ): Promise<VitalReading | null> {
    await this.initialize();
    const patient = this.database?.patients.find((p) => p.id === patientId);
    if (!patient) return null;

    const newVital: VitalReading = {
      id: `vital-${nanoid(8)}`,
      ...vital,
    };

    patient.vitals.push(newVital);
    await this.saveDatabase();
    return newVital;
  }

  async getVitalsTrend(
    patientId: string,
    vitalType: VitalReading["type"],
    startDate?: string,
    endDate?: string
  ): Promise<{
    data: Array<{
      date: string;
      value: number;
      systolic?: number;
      diastolic?: number;
    }>;
    type: VitalReading["type"];
    unit: string;
    referenceRange?: { min?: number; max?: number };
  } | null> {
    const vitals = await this.getVitals(patientId, vitalType, startDate, endDate);
    if (vitals.length === 0) return null;

    const referenceRanges: Record<
      VitalReading["type"],
      { min?: number; max?: number }
    > = {
      blood_pressure: { max: 120 }, // systolic
      heart_rate: { min: 60, max: 100 },
      temperature: { min: 97, max: 99 },
      weight: {},
      oxygen_saturation: { min: 95, max: 100 },
      respiratory_rate: { min: 12, max: 20 },
    };

    return {
      data: vitals.map((v) => ({
        date: v.date,
        value: v.numericValue || v.systolic || parseFloat(v.value) || 0,
        ...(v.systolic && { systolic: v.systolic }),
        ...(v.diastolic && { diastolic: v.diastolic }),
      })),
      type: vitalType,
      unit: vitals[0]?.unit || "",
      referenceRange: referenceRanges[vitalType],
    };
  }

  // Provider Operations
  async getAllProviders(): Promise<Provider[]> {
    await this.initialize();
    return this.database?.providers || [];
  }

  async getProvider(id: string): Promise<Provider | null> {
    await this.initialize();
    return this.database?.providers.find((p) => p.id === id) || null;
  }
}

export const ehrService = EHRService.getInstance();
