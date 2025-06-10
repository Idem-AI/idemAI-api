/**
 * @openapi
 * components:
 *   schemas:
 *     EnvironmentVariableDto: # Re-defining for clarity within DTO context, could also reference model's one if preferred
 *       type: object
 *       properties:
 *         key:
 *           type: string
 *         value:
 *           type: string
 *         isSecret:
 *           type: boolean
 *           description: If true, the value is treated as a secret.
 *       required:
 *         - key
 *         - value
 *         - isSecret
 *     UpdateEnvironmentVariablesDto:
 *       type: object
 *       description: Data Transfer Object for updating environment variables. Expects a list of variables.
 *       properties:
 *         variables:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/EnvironmentVariableDto'
 *       required:
 *         - variables
 */
export class UpdateEnvironmentVariablesDto {
  variables!: Array<{ key: string; value: string; isSecret: boolean }>;
}
