/**
 * Providers.tf file generation prompt
 */

export const PROVIDERS_TF_PROMPT = `
Generate the providers.tf file for the Terraform configuration. This file should contain:

1. Required provider blocks for all cloud providers being used
2. Provider version constraints
3. Provider-specific configuration options
4. Any backend configuration for state management

Make sure to follow best practices for provider configuration and include appropriate authentication methods.
`;
