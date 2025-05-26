export interface LandingModel {
  id: string;
  projectId: string;
  name: string;
  heroSection?: { title?: string; subtitle?: string; cta?: string };
  features?: Array<{ name?: string; description?: string; icon?: string }>;
  pricing?: Array<{ planName?: string; price?: string; features?: string[] }>;
  // Add other common landing page sections as needed
  createdAt: Date;
  updatedAt: Date;
}
