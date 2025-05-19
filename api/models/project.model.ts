import { AnalysisResultModel } from './analysisResult.model';

export interface ProjectModel {
  id?: string;
  name: string;
  description: string;
  type: string;
  constraints: string[];
  teamSize: string;
  scope: string;
  budgetIntervals?: string;
  targets: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  selectedPhases: string[];
  analysisResultModel: AnalysisResultModel;
}
