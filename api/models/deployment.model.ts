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
 *     CloudProviderCredentials:
 *       type: object
 *       description: Credentials identifiers for cloud provider.
 *       properties:
 *         roleArn:
 *           type: string
 *           description: For AWS, ARN of the IAM role to assume.
 *           nullable: true
 *         serviceAccountId:
 *           type: string
 *           description: For GCP, ID of the service account.
 *           nullable: true
 *         servicePrincipalId:
 *           type: string
 *           description: For Azure, ID of the service principal.
 *           nullable: true
 *     CloudProvider:
 *       type: object
 *       description: Cloud provider configuration details.
 *       properties:
 *         type:
 *           type: string
 *           enum: [aws, gcp, azure, self-hosted]
 *           description: The cloud provider type.
 *         region:
 *           type: string
 *           description: The cloud region.
 *           nullable: true
 *         accountId:
 *           type: string
 *           description: Cloud account ID (AWS account ID, GCP project ID, etc.).
 *           nullable: true
 *         credentials:
 *           $ref: '#/components/schemas/CloudProviderCredentials'
 *           nullable: true
 *       required:
 *         - type
 */
export interface CloudProvider {
  type: "aws" | "gcp" | "azure" | "self-hosted";
  region?: string;
  accountId?: string; // Cloud account ID (AWS account ID, GCP project ID, etc.)
  credentials?: {
    roleArn?: string; // For AWS, ARN of the IAM role to assume
    serviceAccountId?: string; // For GCP, ID of the service account
    servicePrincipalId?: string; // For Azure, ID of the service principal
    // Credentials are never stored, only the identifiers to assume roles
  };
}

/**
 * @openapi
 * components:
 *   schemas:
 *     InfrastructureResources:
 *       type: object
 *       properties:
 *         cpu:
 *           type: string
 *           description: CPU allocation (e.g., '0.5' or '2').
 *           nullable: true
 *         memory:
 *           type: string
 *           description: Memory allocation (e.g., '512Mi' or '2Gi').
 *           nullable: true
 *         storage:
 *           type: string
 *           description: Storage allocation (e.g., '20Gi').
 *           nullable: true
 *         instances:
 *           type: integer
 *           description: Number of instances.
 *           nullable: true
 *     InfrastructureNetworking:
 *       type: object
 *       properties:
 *         vpcId:
 *           type: string
 *           nullable: true
 *         subnetIds:
 *           type: array
 *           items:
 *             type: string
 *           nullable: true
 *         securityGroupIds:
 *           type: array
 *           items:
 *             type: string
 *           nullable: true
 *         loadBalancer:
 *           type: boolean
 *           nullable: true
 *         highAvailability:
 *           type: boolean
 *           description: Multi-AZ or multi-region.
 *           nullable: true
 *         publicAccess:
 *           type: boolean
 *           nullable: true
 *     InfrastructureDatabase:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           enum: [mysql, postgres, mongodb, redis, dynamodb]
 *           nullable: true
 *         version:
 *           type: string
 *           nullable: true
 *         size:
 *           type: string
 *           nullable: true
 *         replicas:
 *           type: integer
 *           nullable: true
 *         highAvailability:
 *           type: boolean
 *           nullable: true
 *     InfrastructureConfig:
 *       type: object
 *       description: Infrastructure configuration details.
 *       properties:
 *         serviceType:
 *           type: string
 *           enum: [container, vm, kubernetes, serverless]
 *         resources:
 *           $ref: '#/components/schemas/InfrastructureResources'
 *           nullable: true
 *         networking:
 *           $ref: '#/components/schemas/InfrastructureNetworking'
 *           nullable: true
 *         database:
 *           $ref: '#/components/schemas/InfrastructureDatabase'
 *           nullable: true
 *       required:
 *         - serviceType
 */
export interface InfrastructureConfig {
  serviceType: "container" | "vm" | "kubernetes" | "serverless";
  resources: {
    cpu?: string; // Ex: '0.5' or '2'
    memory?: string; // Ex: '512Mi' or '2Gi'
    storage?: string; // Ex: '20Gi'
    instances?: number; // Number of instances
  };
  networking: {
    vpcId?: string;
    subnetIds?: string[];
    securityGroupIds?: string[];
    loadBalancer?: boolean;
    highAvailability?: boolean; // Multi-AZ or multi-region
    publicAccess?: boolean;
  };
  database?: {
    type?: "mysql" | "postgres" | "mongodb" | "redis" | "dynamodb";
    version?: string;
    size?: string;
    replicas?: number;
    highAvailability?: boolean;
  };
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
 *     DockerConfig:
 *       type: object
 *       description: Docker configuration details.
 *       properties:
 *         useCustomDockerfile:
 *           type: boolean
 *         dockerfileLocation:
 *           type: string
 *           description: Relative path to the Dockerfile in the repository.
 *           nullable: true
 *         baseImage:
 *           type: string
 *           description: Base image if Dockerfile is generated by Idem.
 *           nullable: true
 *         registryUrl:
 *           type: string
 *           description: URL of the Docker registry (e.g., ECR, GCR, ACR).
 *           nullable: true
 *         imageName:
 *           type: string
 *         imageTag:
 *           type: string
 *       required:
 *         - useCustomDockerfile
 *         - imageName
 *         - imageTag
 */
export interface DockerConfig {
  useCustomDockerfile: boolean;
  dockerfileLocation?: string; // Relative path to the repo
  baseImage?: string; // If generated by Idem
  registryUrl?: string; // URL of the Docker registry (ECR, GCR, ACR, etc.)
  imageName: string;
  imageTag: string;
}

/**
 * @openapi
 * components:
 *   schemas:
 *     TerraformConfig:
 *       type: object
 *       description: Terraform configuration details.
 *       properties:
 *         stateBucketName:
 *           type: string
 *           description: Name of the S3/GCS bucket for the Terraform state.
 *           nullable: true
 *         stateKey:
 *           type: string
 *           description: Path to the Terraform state file in the bucket.
 *           nullable: true
 *         planApproved:
 *           type: boolean
 *           description: If the Terraform plan has been approved by the user.
 *           nullable: true
 *         lastPlanOutput:
 *           type: string
 *           description: Summary of the last Terraform plan.
 *           nullable: true
 */
export interface TerraformConfig {
  stateBucketName?: string; // Name of the S3/GCS bucket for the Terraform state
  stateKey?: string; // Path to the Terraform state file in the bucket
  planApproved?: boolean; // If the plan has been approved by the user
  lastPlanOutput?: string; // Summary of the last Terraform plan (operations planned)
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
 *     SecurityScanResult:
 *       type: object
 *       description: Result of a security scan.
 *       properties:
 *         severity:
 *           type: string
 *           enum: [critical, high, medium, low, info]
 *         category:
 *           type: string
 *         description:
 *           type: string
 *         file:
 *           type: string
 *           nullable: true
 *         line:
 *           type: integer
 *           nullable: true
 *         recommendation:
 *           type: string
 *           nullable: true
 *         reference:
 *           type: string
 *           format: url
 *           nullable: true
 *       required:
 *         - severity
 *         - category
 *         - description
 */
export interface SecurityScanResult {
  severity: "critical" | "high" | "medium" | "low" | "info";
  category: string;
  description: string;
  file?: string;
  line?: number;
  recommendation?: string;
  reference?: string;
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
  cloudProvider?: CloudProvider;
  infrastructureConfig?: InfrastructureConfig;
  environmentVariables?: EnvironmentVariable[];
  dockerConfig?: DockerConfig;
  terraformConfig?: TerraformConfig;

  // Monitoring of the pipeline
  pipeline?: {
    currentStage: string;
    steps: PipelineStep[];
    startedAt?: Date;
    estimatedCompletionTime?: Date;
  };

  // Security and analysis
  securityScanResults?: SecurityScanResult[];
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
}
