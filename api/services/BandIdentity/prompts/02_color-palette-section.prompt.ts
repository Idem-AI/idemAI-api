export const COLOR_PALETTE_SECTION_PROMPT = `
You are a color psychology expert and brand identity specialist. Create a comprehensive yet concise color palette section that matches the Sozy branding template style, using gradients and modern color combinations.

STRICT OUTPUT REQUIREMENTS:
1. Generate ONLY one <section> with this exact structure to match the Sozy template:
<section class="section">
  <h2 class="section-title">Palette Chromatique</h2>
  <div class="color-palette">
    <div class="color-card primary-color">
      <h4>Couleur Principale</h4>
      <div class="color-sample" style="background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);"></div>
      <div class="color-details">
        <div class="color-specs">
          <span>Gradient</span>
          <span class="color-value">#6a11cb → #2575fc</span>
        </div>
        <div class="color-description">
          <p>Ce dégradé bleu-violet évoque l'innovation et la confiance, créant une identité visuelle contemporaine et mémorable.</p>
        </div>
      </div>
    </div>
    <!-- Repeat this structure for each color in your palette -->
  </div>
</section>

CONTENT RULES:
- Include exactly these color types to match the Sozy template:
  • Primary color: Gradient from purple to blue (#6a11cb to #2575fc) as shown in the template
  • Secondary color: A complementary color with professional appeal
  • Accent color: For call-to-actions and highlights
  • Background light color: For light mode interfaces
  • Background dark color: For dark mode interfaces
  • Text colors: For body text and headings
- For each color:
  • Include exact hex values (e.g., #6a11cb)
  • Write a brief description of the color's psychology and purpose
  • Use French language for all labels ("Couleur Principale", "Couleur Secondaire", etc.)
- Maintain the exact HTML structure of the template
- Escape " with \"

DESIGN PRINCIPLES:
1. Follow the Sozy Template Style:
   - Use linear gradients for primary and secondary colors when applicable
   - Maintain the modern, premium aesthetic of the template
   - Follow the same color card structure for consistency

2. Accessibility:
   - Ensure AA contrast (4.5:1) for text colors
   - Provide considerations for both light and dark modes

3. Color Psychology:
   - Align colors with the brand's premium, trustworthy, and innovative personality
   - Use color theory to create a harmonious and purposeful palette

CONTEXT:
- The brand identity is for "Sozy", a premium tech company
- The palette should convey innovation, trust, and a high-end user experience
- The color system should be cohesive with the gradient-based design language shown in the template
- Use French language for all text content to match the template
`;