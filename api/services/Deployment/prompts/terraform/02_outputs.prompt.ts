/**
 * Outputs.tf file generation prompt
 */

export const OUTPUTS_TF_PROMPT = `
Generate the outputs.tf file for the Terraform configuration. This file should contain:

1. Output values that will be accessible after applying the configuration
2. Important information like endpoint URLs, IP addresses, etc.
3. Properly documented outputs with descriptions
4. Any sensitive outputs should be marked as sensitive

Focus on outputs that would be useful for connecting to or using the provisioned infrastructure.
`;
