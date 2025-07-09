/**
 * Variables.tf file generation prompt
 */

export const VARIABLES_TF_PROMPT = `
Generate the variables.tf file for the Terraform configuration that works with the Idem-IA modules. This file should contain:

1. Input variables needed for the Idem-IA module configurations, specifically:
   - Variables required by terraform-aws-ec2 modules for instance types, AMIs, and configurations
   - Variables required by terraform-aws-vpc modules for network configurations
   - Variables required by terraform-aws-iam modules for permission settings

2. Proper variable descriptions, types, and default values that align with Idem-IA module requirements
3. Variables for environment-specific configurations (development, staging, production)
4. Variables for any sensitive data that should be passed securely
5. Variables for resource naming and tagging that include the deployment ID and project name
6. Variables that control module versioning and configuration options

For existing deployments, maintain consistency with any previously defined variables while extending or updating them as needed based on the current deployment configuration and environment variables.

For both new and existing deployments, ensure that variables:
- Follow a consistent naming convention aligned with Idem-IA module expectations
- Are well-documented with clear descriptions of how they affect the modules
- Provide appropriate default values aligned with the deployment's environment setting (development, staging, or production)
- Include all necessary variables required by the modules being used
`;
