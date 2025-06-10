import { GitRepository } from '../../models/deployment.model'; // Assuming GitRepository is defined in deployment.model.ts
import { CloudProvider } from '../../models/deployment.model'; // Assuming CloudProvider is defined
import { InfrastructureConfig } from '../../models/deployment.model'; // Assuming InfrastructureConfig is defined
import { EnvironmentVariable } from '../../models/deployment.model'; // Assuming EnvironmentVariable is defined
import { DockerConfig } from '../../models/deployment.model'; // Assuming DockerConfig is defined
import { TerraformConfig } from '../../models/deployment.model'; // Assuming TerraformConfig is defined

/**
 * @openapi
 * components:
 *   schemas:
 *     UpdateDeploymentDto:
 *       type: object
 *       description: Data Transfer Object for updating an existing deployment.
 *       properties:
 *         name:
 *           type: string
 *           description: Friendly name for the deployment.
 *           nullable: true
 *         description:
 *           type: string
 *           description: Optional description for the deployment.
 *           nullable: true
 *         environment:
 *           type: string
 *           enum: [development, staging, production]
 *           nullable: true
 *         gitRepository:
 *           $ref: '#/components/schemas/GitRepository' # Or UpdateGitRepositoryConfigDto if preferred for updates
 *           nullable: true
 *         cloudProvider:
 *           $ref: '#/components/schemas/CloudProvider' # Or UpdateCloudProviderConfigDto
 *           nullable: true
 *         infrastructureConfig:
 *           $ref: '#/components/schemas/InfrastructureConfig' # Or UpdateInfrastructureConfigDto
 *           nullable: true
 *         environmentVariables:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/EnvironmentVariable'
 *           nullable: true
 *         dockerConfig:
 *           $ref: '#/components/schemas/DockerConfig' # Or UpdateDockerConfigDto
 *           nullable: true
 *         terraformConfig:
 *           $ref: '#/components/schemas/TerraformConfig' # Or UpdateTerraformConfigDto
 *           nullable: true
 *         version:
 *           type: string
 *           description: Version of the deployment (e.g., commit hash or semantic version).
 *           nullable: true
 */
export class UpdateDeploymentDto {
  name?: string;
  description?: string;
  environment?: 'development' | 'staging' | 'production';
  gitRepository?: GitRepository; // Consider using UpdateGitRepositoryConfigDto if partial updates are complex
  cloudProvider?: CloudProvider; // Consider UpdateCloudProviderConfigDto
  infrastructureConfig?: InfrastructureConfig; // Consider UpdateInfrastructureConfigDto
  environmentVariables?: EnvironmentVariable[];
  dockerConfig?: DockerConfig; // Consider UpdateDockerConfigDto
  terraformConfig?: TerraformConfig; // Consider UpdateTerraformConfigDto
  version?: string;
}
