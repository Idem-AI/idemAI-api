/**
 * Main.tf file generation prompt
 */

export const MAIN_TF_PROMPT = `
Generate the main.tf file for the Terraform configuration. This file should contain:

1. Primary resource definitions
2. Core infrastructure components
3. Properly organized resources with descriptive comments
4. Resources that match the architecture components and deployment requirements
5. Appropriate resource naming that aligns with the deployment ID and project context

If this is for an existing deployment, ensure that you maintain consistency with any previously defined resources while incorporating any updated configuration. Use the deployment ID, environment setting, and architecture components to determine the appropriate infrastructure setup.

For both new and existing deployments, focus on creating a clean, modular main.tf file that follows Terraform best practices and properly implements the architecture specified in the deployment configuration.
`;
