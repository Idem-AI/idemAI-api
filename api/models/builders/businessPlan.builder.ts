import { BusinessPlanModel } from "../businessPlan.model";
import { v4 as uuidv4 } from "uuid";

/**
 * Builder for BusinessPlanModel
 */
export class BusinessPlanBuilder {
  
  /**
   * Creates an empty BusinessPlanModel with all required properties
   */
  static createEmpty(): BusinessPlanModel {
    return {
      id: uuidv4(),
      title: "",
      executiveSummary: "",
      sections: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Creates a partial BusinessPlanModel with specified properties
   */
  static createPartial(data: Partial<BusinessPlanModel>): BusinessPlanModel {
    return { ...this.createEmpty(), ...data };
  }
}
