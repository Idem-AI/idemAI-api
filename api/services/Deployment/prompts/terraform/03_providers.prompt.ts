/**
 * Providers.tf file generation prompt
 */

export const PROVIDERS_TF_PROMPT = `
Generate the providers.tf file for the Terraform configuration. This file should contain:

1. Required provider blocks for all cloud providers being used in the deployment's architecture components
2. Provider version constraints using appropriate version pinning strategies
3. Provider-specific configuration options aligned with the deployment environment
4. Backend configuration for state management appropriate for a team environment
5. Any required provider features or aliases needed for the specific architecture

For existing deployments, ensure compatibility with the current infrastructure while maintaining or enhancing security best practices. Provider versions should be carefully chosen to avoid breaking changes.

For both new and existing deployments, follow best practices for provider configuration including:
- Appropriate authentication methods for CI/CD environments
- Least privilege provider configurations
- Proper organization of provider blocks
- Clear comments explaining provider selection rationale
`;
