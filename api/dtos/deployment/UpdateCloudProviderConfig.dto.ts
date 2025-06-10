/**
 * @openapi
 * components:
 *   schemas:
 *     UpdateCloudProviderConfigDto:
 *       type: object
 *       description: Data Transfer Object for updating cloud provider configuration.
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
 *           type: object
 *           description: 'Credentials identifiers for the cloud provider. Note: Actual secrets are not stored here.'
 *           properties:
 *             roleArn:
 *               type: string
 *               description: For AWS, ARN of the IAM role to assume.
 *               nullable: true
 *             serviceAccountId:
 *               type: string
 *               description: For GCP, ID of the service account.
 *               nullable: true
 *             servicePrincipalId:
 *               type: string
 *               description: For Azure, ID of the service principal.
 *               nullable: true
 *           nullable: true
 *       required:
 *         - type
 */
export class UpdateCloudProviderConfigDto {
  type!: "aws" | "gcp" | "azure" | "self-hosted";
  region?: string;
  accountId?: string;
  credentials?: {
    roleArn?: string;
    serviceAccountId?: string;
    servicePrincipalId?: string;
  };
}
