/**
 * Variables.tf file generation prompt
 */

export const VARIABLES_TF_PROMPT = `
Generate the variables.tf file for the Terraform configuration. This file should contain:

1. Input variables needed for the infrastructure configuration
2. Proper variable descriptions, types, and default values where appropriate
3. Variables for environment-specific configurations (development, staging, production)
4. Variables for any sensitive data that should be passed securely
5. Variables for resource naming and tagging that include the deployment ID and project name

For existing deployments, maintain consistency with any previously defined variables while extending or updating them as needed based on the current deployment configuration and environment variables.

For both new and existing deployments, ensure that variables follow a consistent naming convention, are well-documented, and provide appropriate default values aligned with the deployment's environment setting (development, staging, or production).
`;
