/**
 * @openapi
 * components:
 *   schemas:
 *     UpdateTerraformConfigDto:
 *       type: object
 *       description: Data Transfer Object for updating Terraform configuration.
 *       properties:
 *         useCustomTerraform:
 *           type: boolean
 *         terraformFileLocation:
 *           type: string
 *           description: Relative path to the main Terraform file (e.g., main.tf) in the repository.
 *           nullable: true
 *         terraformVersion:
 *           type: string
 *           nullable: true
 *         variablesFileLocation:
 *           type: string
 *           description: Relative path to a .tfvars file, if used.
 *           nullable: true
 *       required:
 *         - useCustomTerraform
 */
export class UpdateTerraformConfigDto {
  useCustomTerraform!: boolean;
  terraformFileLocation?: string;
  terraformVersion?: string;
  variablesFileLocation?: string;
}
