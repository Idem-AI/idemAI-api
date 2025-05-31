import { LogoModel } from "./logo.model";
import { SectionModel } from "./section.model";

export interface BrandIdentityModel {
  id?: string; // Added by repository
  createdAt?: Date; // Added by repository
  updatedAt?: Date; // Added by repository
  logo: { content: LogoModel; summary: string };
  brandIdentity: SectionModel[];
}
