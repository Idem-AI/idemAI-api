import { SectionModel } from "./section.model";

export interface BusinessPlanModel {
  id?: string; // Added by repository
  createdAt?: Date; // Added by repository
  updatedAt?: Date; // Added by repository
  sections: SectionModel[];
}
