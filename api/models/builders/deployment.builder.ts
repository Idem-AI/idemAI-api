import { DeploymentModel } from "../deployment.model";
import { v4 as uuidv4 } from "uuid";

/**
 * Builder for DeploymentModel
 */
export class DeploymentBuilder {
  
  /**
   * Creates an empty DeploymentModel with all required properties
   */
  static createEmpty(): DeploymentModel {
    return {
      id: uuidv4(),
      name: "",
      projectId: "",
      status: "configuring",
      environment: "development",
      mode: "beginner",
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Creates a partial DeploymentModel with specified properties
   */
  static createPartial(data: Partial<DeploymentModel>): DeploymentModel {
    return { ...this.createEmpty(), ...data };
  }
}
