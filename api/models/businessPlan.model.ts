import { SectionModel } from "./section.model";

export interface BusinessPlanModel {
  id?: string; 
  createdAt?: Date; 
  updatedAt?: Date; 
  sections: SectionModel[];
}
