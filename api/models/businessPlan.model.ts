export interface BusinessPlanModel {
  id: string;
  projectId: string;
  name: string; // e.g., 'Initial Feasibility Study', 'Q3 Risk Register'
  type: string; // e.g., 'FeasibilityStudy', 'RiskAnalysis', 'RequirementsDoc', 'MeetingNotes'
  content: any; // Could be structured JSON, markdown text, etc.
  status?: string; // e.g., 'Draft', 'Approved', 'Archived'
  createdAt: Date;
  updatedAt: Date;
}
