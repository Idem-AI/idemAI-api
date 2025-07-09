/**
 * Main.tf file generation prompt
 */

export const MAIN_TF_PROMPT = `
Generate the main.tf file for the Terraform configuration using Idem-IA modules. This file should contain:

1. Module references to the Idem-IA modules appropriate for the deployment architecture:
   - Use https://github.com/Idem-IA/terraform-aws-ec2 for EC2 instances and related resources
   - Use https://github.com/Idem-IA/terraform-aws-vpc for VPC networking components
   - Use https://github.com/Idem-IA/terraform-aws-iam for IAM policies and roles

2. Proper configuration of each module with appropriate variables from variables.tf and variables.map.tf
3. Properly organized module blocks with descriptive comments explaining architecture decisions
4. Resource and module configurations that match the architecture components and deployment requirements
5. Appropriate resource naming that aligns with the deployment ID and project context
6. Proper module versioning using git refs or version tags

If this is for an existing deployment, ensure that you maintain consistency with any previously defined resources and modules while incorporating any updated configuration. Use the deployment ID, environment setting, and architecture components to determine the appropriate infrastructure setup.

For both new and existing deployments, focus on creating a clean, modular main.tf file that follows Terraform best practices by leveraging the Idem-IA modules rather than creating resources directly. Properly implement the architecture specified in the deployment configuration.

Provide meaningful local variable definitions at the beginning of the file to improve readability and maintainability.
`;
