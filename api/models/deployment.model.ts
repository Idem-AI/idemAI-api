// Interfaces for each component of the deployment
/**
 * @openapi
 * components:
 *   schemas:
 *     GitRepository:
 *       type: object
 *       description: Git repository configuration details.
 *       properties:
 *         provider:
 *           type: string
 *           enum: [github, gitlab, bitbucket, azure-repos]
 *           description: The Git provider.
 *         url:
 *           type: string
 *           format: url
 *           description: The URL of the Git repository.
 *         branch:
 *           type: string
 *           description: The branch to deploy from.
 *         accessToken:
 *           type: string
 *           description: PAT or OAuth token (stored encrypted).
 *           nullable: true
 *         webhookId:
 *           type: string
 *           description: ID of the configured webhook.
 *           nullable: true
 *       required:
 *         - provider
 *         - url
 *         - branch
 */
export interface GitRepository {
  provider: "github" | "gitlab" | "bitbucket" | "azure-repos";
  url: string;
  branch: string;
  accessToken?: string; // PAT or OAuth token (stored encrypted)
  webhookId?: string; // ID of the configured webhook
}

/**
 * @openapi
 * components:
 *   schemas:
 *     EnvironmentVariable:
 *       type: object
 *       description: Environment variable configuration.
 *       properties:
 *         key:
 *           type: string
 *         value:
 *           type: string
 *         isSecret:
 *           type: boolean
 *           description: If true, the value is treated as a secret and handled accordingly.
 *       required:
 *         - key
 *         - value
 *         - isSecret
 */
export interface EnvironmentVariable {
  key: string;
  value: string;
  isSecret: boolean;
  // Secrets are encrypted at rest and in transit
}

/**
 * @openapi
 * components:
 *   schemas:
 *     PipelineStep:
 *       type: object
 *       description: Represents a single step in the deployment pipeline.
 *       properties:
 *         name:
 *           type: string
 *         status:
 *           type: string
 *           enum: [pending, in-progress, succeeded, failed, skipped]
 *         startedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         finishedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         logs:
 *           type: string
 *           description: URL of the logs or a snippet.
 *           nullable: true
 *         errorMessage:
 *           type: string
 *           nullable: true
 *         aiRecommendation:
 *           type: string
 *           description: AI recommendations if the step failed.
 *           nullable: true
 *       required:
 *         - name
 *         - status
 */
export interface PipelineStep {
  name: string;
  status: "pending" | "in-progress" | "succeeded" | "failed" | "skipped";
  startedAt?: Date;
  finishedAt?: Date;
  logs?: string; // URL of the logs or snippet
  errorMessage?: string; // Error message if failed
  aiRecommendation?: string; // AI recommendations if failed
}

/**
 * @openapi
 * components:
 *   schemas:
 *     CostEstimation:
 *       type: object
 *       description: Estimated cost of the deployment.
 *       properties:
 *         monthlyCost:
 *           type: number
 *           format: float
 *         currency:
 *           type: string
 *         breakdown:
 *           type: object
 *           additionalProperties:
 *             type: number
 *             format: float
 *           description: Cost breakdown by service.
 *         lastUpdated:
 *           type: string
 *           format: date-time
 *       required:
 *         - monthlyCost
 *         - currency
 *         - breakdown
 *         - lastUpdated
 */
export interface CostEstimation {
  monthlyCost: number;
  currency: string;
  breakdown: Record<string, number>; // Breakdown by service
  lastUpdated: Date;
}

/**
 * @openapi
 * components:
 *   schemas:
 *     DeploymentPipelineMonitoring:
 *       type: object
 *       properties:
 *         currentStage:
 *           type: string
 *         steps:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PipelineStep'
 *         startedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         estimatedCompletionTime:
 *           type: string
 *           format: date-time
 *           nullable: true
 *       required:
 *         - currentStage
 *         - steps
 *     DeploymentStaticCodeAnalysis:
 *       type: object
 *       properties:
 *         score:
 *           type: number
 *           format: integer
 *           description: Code quality score (0-100).
 *           nullable: true
 *         issues:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               severity:
 *                 type: string
 *               count:
 *                 type: integer
 *           nullable: true
 *         reportUrl:
 *           type: string
 *           format: url
 *           nullable: true
 *     DeploymentModel:
 *       type: object
 *       description: Represents a deployment configuration and its status.
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         projectId:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *           description: Friendly name for the deployment.
 *         environment:
 *           type: string
 *           enum: [development, staging, production]
 *         status:
 *           type: string
 *           enum: [configuring, pending, building, infrastructure-provisioning, deploying, deployed, rollback, failed, cancelled]
 *         gitRepository:
 *           $ref: '#/components/schemas/GitRepository'
 *           nullable: true
 *         cloudProvider:
 *           $ref: '#/components/schemas/CloudProvider'
 *           nullable: true
 *         infrastructureConfig:
 *           $ref: '#/components/schemas/InfrastructureConfig'
 *           nullable: true
 *         environmentVariables:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/EnvironmentVariable'
 *           nullable: true
 *         dockerConfig:
 *           $ref: '#/components/schemas/DockerConfig'
 *           nullable: true
 *         terraformConfig:
 *           $ref: '#/components/schemas/TerraformConfig'
 *           nullable: true
 *         pipeline:
 *           $ref: '#/components/schemas/DeploymentPipelineMonitoring'
 *           nullable: true
 *         securityScanResults:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SecurityScanResult'
 *           nullable: true
 *         staticCodeAnalysis:
 *           $ref: '#/components/schemas/DeploymentStaticCodeAnalysis'
 *           nullable: true
 *         costEstimation:
 *           $ref: '#/components/schemas/CostEstimation'
 *           nullable: true
 *         url:
 *           type: string
 *           format: url
 *           description: URL where the deployment can be accessed.
 *           nullable: true
 *         version:
 *           type: string
 *           description: Commit hash or semantic version.
 *           nullable: true
 *         logs:
 *           type: string
 *           format: url
 *           description: Link to the deployment logs.
 *           nullable: true
 *         deployedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         rollbackVersions:
 *           type: array
 *           items:
 *             type: string
 *           nullable: true
 *         lastSuccessfulDeployment:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       required:
 *         - id
 *         - projectId
 *         - name
 *         - environment
 *         - status
 *         - createdAt
 *         - updatedAt
 */
export interface DeploymentModel {
  id: string;
  projectId: string;
  name: string; // Friendly name for the deployment
  environment: "development" | "staging" | "production";
  status:
    | "configuring"
    | "pending"
    | "building"
    | "infrastructure-provisioning"
    | "deploying"
    | "deployed"
    | "rollback"
    | "failed"
    | "cancelled";

  // Configuration
  gitRepository?: GitRepository;
  environmentVariables?: EnvironmentVariable[];

  // Monitoring of the pipeline
  pipeline?: {
    currentStage: string;
    steps: PipelineStep[];
    startedAt?: Date;
    estimatedCompletionTime?: Date;
  };

  // Security and analysis
  staticCodeAnalysis?: {
    score?: number; // Code quality score (0-100)
    issues?: { severity: string; count: number }[];
    reportUrl?: string;
  };
  costEstimation?: CostEstimation;

  // Deployment details
  url?: string; // URL where the deployment can be accessed
  version?: string; // ex: commit hash or semantic version
  logs?: string; // Link to the deployment logs
  deployedAt?: Date; // Timestamp of the end of the deployment

  // Rollback management
  rollbackVersions?: string[]; // Previous versions for rollback
  lastSuccessfulDeployment?: string; // ID of the last successful deployment

  // Standard timestamps
  createdAt: Date;
  updatedAt: Date;

  // New fields using simplified interfaces
  chatMessages?: ChatMessage[];
  architectureTemplates?: ArchitectureTemplate[];
  cloudComponents?: CloudComponentDetailed[];
  architectureComponents?: ArchitectureComponent[];
}

export interface ChatMessage {
  sender: "user" | "ai";
  text: string;
}

export interface ArchitectureTemplate {
  id: string;
  provider: "aws" | "gcp" | "azure";
  category: string;
  name: string;
  description: string;
  tags: string[];
  icon: string;
}

interface FormOption {
  name: string;
  label: string;
  type: "text" | "number" | "select" | "toggle";
  required: boolean;
  defaultValue?: any;
  placeholder?: string;
  options?: { value: string; label: string }[];
  description?: string;
}

interface CloudComponentDetailed {
  id: string;
  provider: "aws" | "gcp" | "azure";
  category: string;
  name: string;
  icon: string;
  description: string;
  options: FormOption[];
}

interface ArchitectureComponent {
  instanceId: string;
  componentId: string;
  name: string;
  icon: string;
}
