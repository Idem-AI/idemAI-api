/**
 * Outputs.tf file generation prompt
 */

export const OUTPUTS_TF_PROMPT = `
Generate the outputs.tf file for the Terraform configuration. This file should contain:

1. Output values that will be accessible after applying the configuration
2. Important information like endpoint URLs, IP addresses, resource identifiers
3. Properly documented outputs with clear descriptions
4. Any sensitive outputs should be marked as sensitive
5. Outputs that reflect the specific architecture components in the deployment

For existing deployments, maintain consistency with any previously defined outputs while ensuring they remain compatible with any changes in the architecture components or configuration.

For both new and existing deployments, focus on outputs that would be useful for:
- Connecting to or using the provisioned infrastructure
- Integration with CI/CD pipelines
- Providing meaningful data for downstream services
- Monitoring and troubleshooting the deployment
`;
