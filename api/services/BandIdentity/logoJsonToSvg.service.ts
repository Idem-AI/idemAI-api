import logger from "../../config/logger";
import { 
  LogoJsonStructure, 
  LogoShape, 
  LogoTextElement, 
  LogoVariationStructure,
  LogoVariationsJson 
} from "./interfaces/logoJson.interface";
import { LogoModel } from "../../models/logo.model";

/**
 * Service for converting compact JSON logo structures to optimized SVG
 * Implements the token-saving strategy by generating SVG server-side
 */
export class LogoJsonToSvgService {
  
  /**
   * Convert JSON logo structure to complete LogoModel with optimized SVGs
   */
  convertJsonToLogoModel(logoJson: LogoJsonStructure): LogoModel {
    logger.info(`Converting JSON logo structure to LogoModel - ID: ${logoJson.id}`);
    
    try {
      // Generate main SVG (icon + text combined)
      const mainSvg = this.generateCombinedSvg(logoJson);
      
      // Generate icon-only SVG
      const iconSvg = this.generateIconSvg(logoJson.icon);
      
      const logoModel: LogoModel = {
        id: logoJson.id,
        name: logoJson.name,
        svg: mainSvg,
        iconSvg: iconSvg,
        concept: logoJson.concept,
        colors: logoJson.colors,
        fonts: logoJson.fonts
      };
      
      logger.info(`Successfully converted JSON to LogoModel - ID: ${logoJson.id}`);
      return logoModel;
      
    } catch (error) {
      logger.error(`Error converting JSON to LogoModel:`, error);
      throw new Error(`Failed to convert JSON logo structure: ${error}`);
    }
  }
  
  /**
   * Convert logo variations JSON to SVG variations
   */
  convertVariationsJsonToSvg(variationsJson: LogoVariationsJson): {
    withText: { lightBackground?: string; darkBackground?: string; monochrome?: string; };
    iconOnly: { lightBackground?: string; darkBackground?: string; monochrome?: string; };
  } {
    logger.info(`Converting logo variations JSON to SVG`);
    
    try {
      const iconOnly = {
        lightBackground: this.generateVariationSvg(variationsJson.variations.lightBackground),
        darkBackground: this.generateVariationSvg(variationsJson.variations.darkBackground),
        monochrome: this.generateVariationSvg(variationsJson.variations.monochrome)
      };
      
      // For now, withText uses the same as iconOnly since we're focusing on icon variations
      // This can be extended later for text variations
      const withText = { ...iconOnly };
      
      logger.info(`Successfully converted variations JSON to SVG`);
      return { withText, iconOnly };
      
    } catch (error) {
      logger.error(`Error converting variations JSON to SVG:`, error);
      throw new Error(`Failed to convert variations JSON: ${error}`);
    }
  }
  
  /**
   * Generate combined SVG (icon + text)
   */
  private generateCombinedSvg(logoJson: LogoJsonStructure): string {
    const totalWidth = logoJson.icon.size.w + logoJson.text.size.w;
    const maxHeight = Math.max(logoJson.icon.size.h, logoJson.text.size.h);
    
    const iconElements = this.generateShapeElements(logoJson.icon.shapes);
    const textElements = this.generateTextElements(logoJson.text.elements, logoJson.icon.size.w);
    
    return this.wrapInSvg(iconElements + textElements, totalWidth, maxHeight);
  }
  
  /**
   * Generate icon-only SVG
   */
  private generateIconSvg(iconStructure: { shapes: LogoShape[]; size: { w: number; h: number; } }): string {
    const elements = this.generateShapeElements(iconStructure.shapes);
    return this.wrapInSvg(elements, iconStructure.size.w, iconStructure.size.h);
  }
  
  /**
   * Generate variation SVG
   */
  private generateVariationSvg(variation: LogoVariationStructure): string {
    const elements = this.generateShapeElements(variation.shapes);
    return this.wrapInSvg(elements, variation.size.w, variation.size.h);
  }
  
  /**
   * Generate SVG elements from shapes array
   */
  private generateShapeElements(shapes: LogoShape[]): string {
    return shapes.map(shape => this.generateShapeElement(shape)).join('');
  }
  
  /**
   * Generate single SVG shape element
   */
  private generateShapeElement(shape: LogoShape): string {
    const commonAttrs = this.getCommonAttributes(shape);
    
    switch (shape.type) {
      case 'circle':
        return `<circle cx="${shape.cx}" cy="${shape.cy}" r="${shape.r}"${commonAttrs}/>`;
        
      case 'rect':
        const rectAttrs = shape.rx ? ` rx="${shape.rx}"` : '';
        return `<rect x="${shape.x}" y="${shape.y}" width="${shape.w}" height="${shape.h}"${rectAttrs}${commonAttrs}/>`;
        
      case 'ellipse':
        return `<ellipse cx="${shape.cx}" cy="${shape.cy}" rx="${shape.rx_ellipse}" ry="${shape.ry_ellipse}"${commonAttrs}/>`;
        
      case 'line':
        return `<line x1="${shape.x1}" y1="${shape.y1}" x2="${shape.x2}" y2="${shape.y2}"${commonAttrs}/>`;
        
      case 'polygon':
        return `<polygon points="${shape.points}"${commonAttrs}/>`;
        
      case 'path':
        return `<path d="${shape.d}"${commonAttrs}/>`;
        
      default:
        logger.warn(`Unknown shape type: ${shape.type}`);
        return '';
    }
  }
  
  /**
   * Generate SVG text elements
   */
  private generateTextElements(textElements: LogoTextElement[], offsetX: number = 0): string {
    return textElements.map(element => {
      const x = element.x + offsetX;
      const attrs = [
        `x="${x}"`,
        `y="${element.y}"`,
        `font-size="${element.fontSize}"`,
        element.fill ? `fill="${element.fill}"` : '',
        element.fontFamily ? `font-family="${element.fontFamily}"` : '',
        element.fontWeight ? `font-weight="${element.fontWeight}"` : '',
        element.textAnchor ? `text-anchor="${element.textAnchor}"` : '',
        element.dominantBaseline ? `dominant-baseline="${element.dominantBaseline}"` : ''
      ].filter(attr => attr).join(' ');
      
      return `<text ${attrs}>${element.text}</text>`;
    }).join('');
  }
  
  /**
   * Get common SVG attributes (fill, stroke, etc.)
   */
  private getCommonAttributes(shape: LogoShape): string {
    const attrs = [];
    
    if (shape.fill) attrs.push(`fill="${shape.fill}"`);
    if (shape.stroke) attrs.push(`stroke="${shape.stroke}"`);
    if (shape.strokeWidth) attrs.push(`stroke-width="${shape.strokeWidth}"`);
    if (shape.opacity) attrs.push(`opacity="${shape.opacity}"`);
    
    return attrs.length > 0 ? ' ' + attrs.join(' ') : '';
  }
  
  /**
   * Wrap elements in optimized SVG container
   */
  private wrapInSvg(elements: string, width: number, height: number): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">${elements}</svg>`;
  }
  
  /**
   * Optimize SVG by removing unnecessary whitespace and attributes
   * Basic optimization - can be enhanced with SVGO later
   */
  optimizeSvg(svg: string): string {
    return svg
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/>\s+</g, '><') // Remove spaces between tags
      .replace(/\s+\/>/g, '/>') // Clean self-closing tags
      .trim();
  }
}
