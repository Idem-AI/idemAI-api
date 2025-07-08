/**
 * Index file to export all Terraform prompt constants
 */

export { MAIN_TF_PROMPT } from './00_main.prompt';
export { VARIABLES_TF_PROMPT } from './01_variables.prompt';
export { OUTPUTS_TF_PROMPT } from './02_outputs.prompt';
export { PROVIDERS_TF_PROMPT } from './03_providers.prompt';
export { TERRAFORM_SYSTEM_PROMPT } from './system.prompt';

/**
 * Interface for Terraform file generation result
 */
export interface TerraformFile {
  name: string;  // e.g., 'main.tf', 'variables.tf', etc.
  content: string;
}

/**
 * Interface matching the DeploymentModel.generatedTerraformFiles expected structure
 */
export interface TerraformFilesMap {
  main: string;
  variables: string;
  outputs: string;
  providers: string;
}
