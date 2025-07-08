/**
 * Variables.tf file generation prompt
 */

export const VARIABLES_TF_PROMPT = `
Generate the variables.tf file for the Terraform configuration. This file should contain:

1. Input variables needed for the infrastructure configuration
2. Proper variable descriptions, types, and default values where appropriate
3. Variables for environment-specific configurations
4. Variables for any sensitive data that should be passed securely

Ensure that variables follow a consistent naming convention and are well-documented.
`;
