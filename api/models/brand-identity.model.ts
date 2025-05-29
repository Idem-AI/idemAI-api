import { LogoModel } from './logo.model';

export interface BrandIdentityModel {
  id?: string; // Added by repository
  createdAt?: Date; // Added by repository
  updatedAt?: Date; // Added by repository
  logo: { content: LogoModel; summary: string };
  brandIdentity: {
    id: string;
    name: string;
    data: any;
    summary: string;
  }[];
}
