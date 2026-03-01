export { EHRService, ehrService } from "./ehr-service";
export { ehrTools } from "./ehr-tools";
export {
  ehrTools as ehrLangChainTools,
  searchPatientsTool,
  getPatientTool,
  getPatientMedicationsTool,
  addMedicationTool,
  getLabResultsTool,
  getVisitHistoryTool,
  getVitalsTool,
  getVitalsTrendTool,
  addVitalReadingTool,
} from "./ehr-langchain-tools";
