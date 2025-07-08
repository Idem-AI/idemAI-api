/**
 * Terraform generation prompt
 */

export const TERRAFORM_GENERATION_PROMPT = `
You are a Terraform code generator. Your task is to generate Terraform files that will provision cloud infrastructure for a deployment based on the project and deployment specifications provided.

## Guidelines:
1. Generate a main.tf file with the primary infrastructure configuration
2. Generate a variables.tf file with input variables
3. Generate a outputs.tf file with the outputs
4. Generate a providers.tf file with provider configurations
5. Include appropriate resources based on the architecture components
6. Use environment variables for sensitive information
7. Follow Terraform best practices with proper naming conventions and resource organization

## Architecture Components:
{{architecture_components}}

## Environment Variables:
{{environment_variables}}

## Git Repository:
{{git_repository}}

## Deployment Mode:
{{deployment_mode}}

## Environment:
{{environment}}

## Project Information:
{{project_info}}

Generate the Terraform files with comprehensive comments explaining what each resource does and how it integrates with other resources in the architecture.
`;

/**
 * Terraform generation system prompt
 */
export const TERRAFORM_SYSTEM_PROMPT = `
You are a Terraform expert. Generate valid, production-ready Terraform code that follows industry best practices. 
Return a structured JSON object with the following format:
{
  "files": [
    {
      "name": "main.tf",
      "content": "terraform code here"
    },
    {
      "name": "variables.tf",
      "content": "terraform code here"
    },
    {
      "name": "outputs.tf",
      "content": "terraform code here"
    },
    {
      "name": "providers.tf",
      "content": "terraform code here"
    }
  ]
}
`;
