/**
 * Index file to export all Terraform prompt constants
 */

export { MAIN_TF_PROMPT } from './00_main.prompt';
export { VARIABLES_TF_PROMPT } from './01_variables.prompt';
export { VARIABLES_MAP_TF_PROMPT } from './04_variables_map.prompt';
export { TERRAFORM_SYSTEM_PROMPT } from './system.prompt';

// Note: OUTPUTS_TF_PROMPT and PROVIDERS_TF_PROMPT are no longer used
// in favor of generating variables.map.tf with a dedicated prompt

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
  variablesMap: string;
}
