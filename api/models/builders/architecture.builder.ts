import { ArchitectureModel } from "../architecture.model";
import { v4 as uuidv4 } from "uuid";

/**
 * Builder for ArchitectureModel
 */
export class ArchitectureBuilder {
  
  /**
   * Creates an empty ArchitectureModel with all required properties
   */
  static createEmpty(): ArchitectureModel {
    return {
      id: uuidv4(),
      name: "",
      description: "",
      components: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Creates a partial ArchitectureModel with specified properties
   */
  static createPartial(data: Partial<ArchitectureModel>): ArchitectureModel {
    return { ...this.createEmpty(), ...data };
  }
}
