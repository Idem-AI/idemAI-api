/**
 * Variables.map.tf file generation prompt
 */

export const VARIABLES_MAP_TF_PROMPT = `
Generate a variables.map.tf file that contains a map of all environment variables used in the deployment with Idem-IA modules.
This file should:

1. Define comprehensive map variables that align with Idem-IA module requirements, specifically:
   - Maps for EC2 configuration options when using terraform-aws-ec2 modules
   - Maps for VPC and network settings when using terraform-aws-vpc modules
   - Maps for IAM policy configurations when using terraform-aws-iam modules

2. Structure variables hierarchically to reflect:
   - The architecture components in the deployment
   - The module structure of Idem-IA repositories
   - Nested configurations required by each module

3. Provide proper Terraform map structure with nested maps as needed for complex module configurations

4. Include default values that match:
   - The deployment's environment (development, staging, or production)
   - Best practices recommended for the Idem-IA modules being used

5. Use consistent naming conventions that:
   - Align with variables.tf file definitions
   - Match the input variable names expected by Idem-IA modules
   - Follow Terraform naming best practices

6. Include clear documentation for each map entry with descriptions of:
   - Their purpose in the deployment
   - Which Idem-IA module will consume them
   - Any special considerations for their values

7. Organize variables by:
   - Module type (EC2, VPC, IAM)
   - Service or component
   - Functional category within the architecture

For existing deployments, maintain consistency with any previously defined variable maps while extending or updating them as needed based on the current deployment configuration, architecture components, and Idem-IA module requirements.

For both new and existing deployments, ensure that variable maps are properly typed and formatted for use with the Idem-IA Terraform modules referenced in main.tf.
`;
