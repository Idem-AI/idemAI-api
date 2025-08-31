import { SectionModel } from "../section.model";
import { v4 as uuidv4 } from "uuid";

/**
 * Builder for SectionModel
 */
export class SectionBuilder {
  
  /**
   * Creates an empty SectionModel with all required properties
   */
  static createEmpty(): SectionModel {
    return {
      id: uuidv4(),
      name: "",
      title: "",
      summary: "",
      data: "",
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Creates a partial SectionModel with specified properties
   */
  static createPartial(data: Partial<SectionModel>): SectionModel {
    return { ...this.createEmpty(), ...data };
  }
}
