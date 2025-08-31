import logger from "../../config/logger";

/**
 * Service pour optimiser les SVG générés
 * Réduit la taille des SVG en supprimant les éléments inutiles
 */
export class SvgOptimizerService {
  /**
   * Optimise un SVG en supprimant les éléments inutiles et en réduisant la taille
   * @param svgContent - Contenu SVG à optimiser
   * @returns SVG optimisé
   */
  static optimizeSvg(svgContent: string): string {
    try {
      logger.info("Starting SVG optimization");

      let optimized = svgContent;

      // Supprimer les commentaires
      optimized = optimized.replace(/<!--[\s\S]*?-->/g, "");

      // Supprimer les espaces inutiles entre les balises
      optimized = optimized.replace(/>\s+</g, "><");

      // Supprimer les attributs inutiles
      optimized = optimized.replace(/\s+id="[^"]*"/g, ""); // Garder seulement les IDs sémantiques
      optimized = optimized.replace(/\s+class="[^"]*"/g, "");
      optimized = optimized.replace(/\s+style="[^"]*"/g, "");
      optimized = optimized.replace(/\s+data-[^=]*="[^"]*"/g, "");

      // Optimiser les nombres (réduire la précision)
      optimized = optimized.replace(/(\d+\.\d{3,})/g, (match) => {
        return parseFloat(match).toFixed(2);
      });

      // Supprimer les espaces en début/fin
      optimized = optimized.trim();

      // Réduire les espaces multiples
      optimized = optimized.replace(/\s+/g, " ");

      // Optimiser les paths (supprimer les espaces inutiles)
      optimized = optimized.replace(/d="([^"]+)"/g, (match, pathData) => {
        const optimizedPath = pathData
          .replace(/\s+/g, " ")
          .replace(/,\s*/g, ",")
          .replace(/\s*([MLHVCSQTAZ])\s*/gi, "$1")
          .trim();
        return `d="${optimizedPath}"`;
      });

      // Restaurer les IDs sémantiques importants
      if (svgContent.includes('id="logo-icon"')) {
        optimized = optimized.replace(
          /<path([^>]*?)>/g,
          '<path id="logo-icon"$1>'
        );
      }
      if (svgContent.includes('id="logo-text"')) {
        optimized = optimized.replace(
          /<text([^>]*?)>/g,
          '<text id="logo-text"$1>'
        );
      }

      const originalSize = svgContent.length;
      const optimizedSize = optimized.length;
      const reduction = (
        ((originalSize - optimizedSize) / originalSize) *
        100
      ).toFixed(1);

      logger.info(
        `SVG optimized: ${originalSize} → ${optimizedSize} bytes (${reduction}% reduction)`
      );

      return optimized;
    } catch (error) {
      logger.error("Error optimizing SVG:", error);
      // En cas d'erreur, retourner le SVG original
      return svgContent;
    }
  }

  /**
   * Optimise un tableau de logos avec leurs variations
   * @param logos - Tableau de logos à optimiser
   * @returns Logos optimisés
   */
  static optimizeLogos(logos: any[]): any[] {
    logger.info(`Optimizing ${logos.length} logos`);

    return logos.map((logo) => {
      const optimizedLogo = {
        ...logo,
        svg: this.optimizeSvg(logo.svg),
      };

      // Optimiser les variations si elles existent
      if (logo.variations) {
        optimizedLogo.variations = {};
        if (logo.variations.lightBackground) {
          optimizedLogo.variations.lightBackground = this.optimizeSvg(
            logo.variations.lightBackground
          );
        }
        if (logo.variations.darkBackground) {
          optimizedLogo.variations.darkBackground = this.optimizeSvg(
            logo.variations.darkBackground
          );
        }
        if (logo.variations.monochrome) {
          optimizedLogo.variations.monochrome = this.optimizeSvg(
            logo.variations.monochrome
          );
        }
      }

      return optimizedLogo;
    });
  }
}
