export interface DevelopmentModel {
  id: string;
  projectId: string;
  name: string;
  description?: string; // Optional description
  status?: string; // e.g., 'in-progress', 'completed'
  details: any; // Could be tasks, code snippets, etc.
  createdAt: Date;
  updatedAt: Date;
}
