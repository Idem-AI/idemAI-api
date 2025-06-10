/**
 * @openapi
 * components:
 *   schemas:
 *     UpdateInfrastructureResourcesDto:
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
 *     UpdateInfrastructureNetworkingDto:
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
 *     UpdateInfrastructureDatabaseDto:
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
 *     UpdateInfrastructureConfigDto:
 *       type: object
 *       description: Data Transfer Object for updating infrastructure configuration.
 *       properties:
 *         serviceType:
 *           type: string
 *           enum: [container, vm, kubernetes, serverless]
 *         resources:
 *           $ref: '#/components/schemas/UpdateInfrastructureResourcesDto'
 *           nullable: true
 *         networking:
 *           $ref: '#/components/schemas/UpdateInfrastructureNetworkingDto'
 *           nullable: true
 *         database:
 *           $ref: '#/components/schemas/UpdateInfrastructureDatabaseDto'
 *           nullable: true
 *       required:
 *         - serviceType
 */
export class UpdateInfrastructureConfigDto {
  serviceType!: "container" | "vm" | "kubernetes" | "serverless";
  resources?: {
    cpu?: string;
    memory?: string;
    storage?: string;
    instances?: number;
  };
  networking?: {
    vpcId?: string;
    subnetIds?: string[];
    securityGroupIds?: string[];
    loadBalancer?: boolean;
    highAvailability?: boolean;
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
