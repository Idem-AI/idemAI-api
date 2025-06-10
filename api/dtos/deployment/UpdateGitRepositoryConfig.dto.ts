/**
 * @openapi
 * components:
 *   schemas:
 *     UpdateGitRepositoryConfigDto:
 *       type: object
 *       description: Data Transfer Object for updating Git repository configuration.
 *       properties:
 *         provider:
 *           type: string
 *           enum: [github, gitlab, bitbucket, azure-repos]
 *           description: The Git provider.
 *           example: github
 *         url:
 *           type: string
 *           format: url
 *           description: The URL of the Git repository.
 *           example: https://github.com/user/repo.git
 *         branch:
 *           type: string
 *           description: The branch to deploy from.
 *           example: main
 *         accessToken:
 *           type: string
 *           description: Personal Access Token or OAuth token for private repositories (will be stored encrypted).
 *           example: 'ghp_xxxxxxxxxxxxxxxxxxxx'
 *       required:
 *         - provider
 *         - url
 *         - branch
 */
export class UpdateGitRepositoryConfigDto {
  provider!: "github" | "gitlab" | "bitbucket" | "azure-repos";
  url!: string;
  branch!: string;
  accessToken?: string;
}
