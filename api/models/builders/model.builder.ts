import { AnalysisResultModel } from "../analysisResult.model";
import { ArchetypeModel } from "../archetypes.model";
import { ArchitectureModel } from "../architecture.model";
import { BrandIdentityModel, ColorModel, TypographyModel } from "../brand-identity.model";
import { BusinessPlanModel } from "../businessPlan.model";
import { ChatHistoryItemModel } from "../chatHistortyItem.model";
import { DeploymentModel } from "../deployment.model";
import { DevelopmentConfigsModel } from "../development.model";
import { DiagramModel } from "../diagram.model";
import { LandingModel } from "../landing.model";
import { LogoModel } from "../logo.model";
import { MessageModel } from "../message.model";
import { ProjectModel } from "../project.model";
import { SectionModel } from "../section.model";
import { UserModel } from "../userModel";
import { WebContainerModel } from "../webcontainer.model";
import { v4 as uuidv4 } from "uuid";

/**
 * Builder pattern for creating empty/default instances of all models
 * Provides type-safe initialization with all required properties
 */
export class ModelBuilder {
  
  /**
   * Creates an empty AnalysisResultModel with all required properties
   */
  static createEmptyAnalysisResult(): AnalysisResultModel {
    return {
      architectures: [],
      design: this.createEmptyDiagram(),
      development: { configs: this.createEmptyDevelopmentConfigs() },
      branding: this.createEmptyBrandIdentity(),
      landing: this.createEmptyLanding(),
      testing: "",
      generatedDeployment: [{ name: "", content: "" }],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Creates an empty BrandIdentityModel with all required properties
   */
  static createEmptyBrandIdentity(): BrandIdentityModel {
    return {
      logo: this.createEmptyLogo(),
      generatedLogos: [],
      colors: this.createEmptyColor(),
      generatedColors: [],
      typography: this.createEmptyTypography(),
      generatedTypography: [],
      sections: []
    };
  }

  /**
   * Creates an empty LogoModel with all required properties
   */
  static createEmptyLogo(): LogoModel {
    return {
      id: uuidv4(),
      name: "",
      svg: "",
      concept: "",
      colors: [],
      fonts: []
    };
  }

  /**
   * Creates an empty ColorModel with all required properties
   */
  static createEmptyColor(): ColorModel {
    return {
      id: uuidv4(),
      name: "",
      url: "",
      colors: {
        primary: "#000000",
        secondary: "#666666",
        accent: "#0066cc",
        background: "#ffffff",
        text: "#333333"
      }
    };
  }

  /**
   * Creates an empty TypographyModel with all required properties
   */
  static createEmptyTypography(): TypographyModel {
    return {
      id: uuidv4(),
      name: "",
      url: "",
      primaryFont: "",
      secondaryFont: ""
    };
  }

  /**
   * Creates an empty ProjectModel with all required properties
   */
  static createEmptyProject(): ProjectModel {
    return {
      id: uuidv4(),
      name: "",
      description: "",
      userId: "",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Creates an empty DiagramModel with all required properties
   */
  static createEmptyDiagram(): DiagramModel {
    return {
      id: uuidv4(),
      name: "",
      type: "",
      content: "",
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Creates an empty LandingModel with all required properties
   */
  static createEmptyLanding(): LandingModel {
    return {
      id: uuidv4(),
      title: "",
      subtitle: "",
      description: "",
      features: [],
      sections: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Creates an empty BusinessPlanModel with all required properties
   */
  static createEmptyBusinessPlan(): BusinessPlanModel {
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
   * Creates an empty DeploymentModel with all required properties
   */
  static createEmptyDeployment(): DeploymentModel {
    return {
      id: uuidv4(),
      name: "",
      projectId: "",
      userId: "",
      status: "configuring",
      environment: "development",
      mode: "beginner",
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Creates an empty WebContainerModel with all required properties
   */
  static createEmptyWebContainer(): WebContainerModel {
    return {
      id: uuidv4(),
      name: "",
      projectId: "",
      userId: "",
      metadata: {
        files: [],
        fileContents: {},
        dependencies: {},
        scripts: {}
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Creates an empty UserModel with all required properties
   */
  static createEmptyUser(): UserModel {
    return {
      uid: "",
      email: "",
      displayName: "",
      photoURL: "",
      createdAt: new Date(),
      updatedAt: new Date(),
      dailyUsage: 0,
      weeklyUsage: 0,
      lastResetDaily: new Date().toISOString(),
      lastResetWeekly: new Date().toISOString(),
      quotaUpdatedAt: new Date().toISOString()
    };
  }

  /**
   * Creates an empty SectionModel with all required properties
   */
  static createEmptySection(): SectionModel {
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
   * Creates an empty MessageModel with all required properties
   */
  static createEmptyMessage(): MessageModel {
    return {
      id: uuidv4(),
      content: "",
      role: "user",
      timestamp: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Creates an empty ArchitectureModel with all required properties
   */
  static createEmptyArchitecture(): ArchitectureModel {
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
   * Creates an empty ArchetypeModel with all required properties
   */
  static createEmptyArchetype(): ArchetypeModel {
    return {
      id: uuidv4(),
      name: "",
      description: "",
      provider: "aws",
      category: "web",
      terraformVariables: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Creates an empty DevelopmentConfigsModel with all required properties
   */
  static createEmptyDevelopmentConfigs(): DevelopmentConfigsModel {
    return {
      framework: "",
      dependencies: {},
      scripts: {},
      environment: {}
    };
  }

  /**
   * Creates an empty ChatHistoryItemModel with all required properties
   */
  static createEmptyChatHistoryItem(): ChatHistoryItemModel {
    return {
      id: uuidv4(),
      message: "",
      role: "user",
      timestamp: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Utility method to create a partial model with only specified properties
   * Useful when you only need to initialize certain fields
   */
  static createPartial<T>(partialData: Partial<T>, emptyModel: T): T {
    return { ...emptyModel, ...partialData };
  }

  /**
   * Creates a deep copy of any model to avoid reference issues
   */
  static deepCopy<T>(model: T): T {
    return JSON.parse(JSON.stringify(model));
  }
}

/**
 * Convenience exports for direct access to builders
 */
export const EmptyModels = {
  AnalysisResult: () => ModelBuilder.createEmptyAnalysisResult(),
  BrandIdentity: () => ModelBuilder.createEmptyBrandIdentity(),
  Logo: () => ModelBuilder.createEmptyLogo(),
  Color: () => ModelBuilder.createEmptyColor(),
  Typography: () => ModelBuilder.createEmptyTypography(),
  Project: () => ModelBuilder.createEmptyProject(),
  Diagram: () => ModelBuilder.createEmptyDiagram(),
  Landing: () => ModelBuilder.createEmptyLanding(),
  BusinessPlan: () => ModelBuilder.createEmptyBusinessPlan(),
  Deployment: () => ModelBuilder.createEmptyDeployment(),
  WebContainer: () => ModelBuilder.createEmptyWebContainer(),
  User: () => ModelBuilder.createEmptyUser(),
  Section: () => ModelBuilder.createEmptySection(),
  Message: () => ModelBuilder.createEmptyMessage(),
  Architecture: () => ModelBuilder.createEmptyArchitecture(),
  Archetype: () => ModelBuilder.createEmptyArchetype(),
  DevelopmentConfigs: () => ModelBuilder.createEmptyDevelopmentConfigs(),
  ChatHistoryItem: () => ModelBuilder.createEmptyChatHistoryItem()
};
