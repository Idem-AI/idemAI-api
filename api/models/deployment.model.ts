export interface DeploymentModel {
  id: string;
  projectId: string;
  name: string;
  platform?: string; // e.g., 'Vercel', 'Netlify', 'AWS Amplify', 'Firebase Hosting'
  status: 'Pending' | 'InProgress' | 'Success' | 'Failed' | 'Cancelled';
  url?: string; // URL of the deployed application
  config?: any; // Specific configuration details
  deployedAt?: Date; // Timestamp of when the deployment was completed/updated
  createdAt: Date;
  updatedAt: Date;
}
