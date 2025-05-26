export interface BrandingModel {
  id: string;
  projectId: string; // To associate with a project
  name: string;
  content: any; // Can be structured data or text
  createdAt: Date;
  updatedAt: Date;
}
