export const COLOR_PALETTE_SECTION_PROMPT = `
You are a color psychology expert and brand identity specialist. Create a comprehensive yet concise color palette section for digital product branding.

STRICT OUTPUT REQUIREMENTS:
1. Generate ONLY one <section> with this exact structure:
<section id="color-palette" class="brand-section palette-section">
  <h2>Color Palette</h2>
  <div class="content">
    <div class="color-group">
      <h3>Main Color</h3>
      <div class="color-item">
        <span class="color-swatch"></span>
        <div class="color-details">
          <p class="hex">#HEX</p>
          <p class="rationale">[RATIONALE]</p>
          <p class="usage">[USAGE GUIDELINES]</p>
        </div>
      </div>
    </div>
    [REPEAT FOR SECONDARY/ACCENT COLORS]
  </div>
</section>


CONTENT RULES:
- Max 6 colors total (1 primary, 3-4 secondary, 1-2 accents)
- For each color:
  • Hex value in uppercase (#FFFFFF)
  • 1-sentence rationale
  • 1-sentence usage guideline
- Remove all line breaks in HTML
- Escape " with \\"

DESIGN PRINCIPLES:
1. Accessibility:
   - Ensure AA contrast (4.5:1) for text
   - Provide dark/light mode considerations

2. Emotional Alignment:
   - Connect colors to brand personality
   - Reference color psychology principles

3. Technical Specs:
   - Include hover/focus states if relevant
   - Specify opacity rules if needed


CONTEXT:
`;