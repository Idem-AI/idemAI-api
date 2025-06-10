/**
 * @openapi
 * components:
 *   schemas:
 *     LogoVariations:
 *       type: object
 *       properties:
 *         lightBackground:
 *           type: string
 *           format: svg
 *           description: SVG content of the logo version optimized for light backgrounds.
 *           nullable: true
 *         darkBackground:
 *           type: string
 *           format: svg
 *           description: SVG content of the logo version optimized for dark backgrounds.
 *           nullable: true
 *         monochrome:
 *           type: string
 *           format: svg
 *           description: SVG content of the simplified monochrome version (black or white).
 *           nullable: true
 *     LogoModel:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         svg:
 *           type: string
 *           format: svg
 *           description: Main SVG logo content (default full version).
 *         concept:
 *           type: string
 *           description: Branding story or meaning behind the logo.
 *         colors:
 *           type: array
 *           items:
 *             type: string
 *             format: hex-color
 *           description: Array of HEX color codes used in the logo.
 *         fonts:
 *           type: array
 *           items:
 *             type: string
 *           description: Fonts used in the logo (if any).
 *         variations:
 *           $ref: '#/components/schemas/LogoVariations'
 *           nullable: true
 *       required:
 *         - id
 *         - name
 *         - svg
 *         - concept
 *         - colors
 *         - fonts
 */
export interface LogoModel {
  id: string;
  name: string;
  svg: string; // Main SVG logo (default full version)
  concept: string; // Branding story or meaning behind the logo
  colors: string[]; // Array of HEX color codes used in the logo
  fonts: string[]; // Fonts used in the logo (if any)

  variations?: {
    lightBackground?: string; // Version optimized for light backgrounds
    darkBackground?: string; // Version optimized for dark backgrounds
    monochrome?: string; // Simplified version in black or white
  };
}
