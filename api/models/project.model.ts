import { AnalysisResultModel } from "./analysisResult.model";
import { ChatMessage, DeploymentModel } from "./deployment.model";

/**
 * @openapi
 * components:
 *   schemas:
 *     ProjectModel:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         type:
 *           type: string
 *           enum: [web, mobile, iot, desktop]
 *         constraints:
 *           type: array
 *           items:
 *             type: string
 *         teamSize:
 *           type: string
 *         scope:
 *           type: string
 *         budgetIntervals:
 *           type: string
 *           nullable: true
 *         targets:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         userId:
 *           type: string
 *           format: uuid
 *         selectedPhases:
 *           type: array
 *           items:
 *             type: string
 *         analysisResultModel:
 *           $ref: '#/components/schemas/AnalysisResultModel'
 *       required:
 *         - name
 *         - description
 *         - type
 *         - constraints
 *         - teamSize
 *         - scope
 *         - targets
 *         - createdAt
 *         - updatedAt
 *         - userId
 *         - selectedPhases
 *         - analysisResultModel
 */
export interface ProjectModel {
  id?: string;
  name: string;
  description: string;
  type: "web" | "mobile" | "iot" | "desktop";
  constraints: string[];
  teamSize: string;
  scope: string;
  budgetIntervals?: string;
  targets: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  selectedPhases: string[];
  analysisResultModel: AnalysisResultModel;
  deployments: DeploymentModel[];
  activeChatMessages: ChatMessage[];
}
