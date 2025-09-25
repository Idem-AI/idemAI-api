export const LOGO_GENERATION_PROMPT = `
Generate 1 premium, ORIGINAL tech logo concept with sophisticated, professional design. Create a distinctive brand identity that stands out in the market. Return JSON with complete SVG content:

{
  "id": "concept01",
  "name": "Creative Professional Logo Name",
  "concept": "Detailed, compelling concept description explaining the design philosophy, symbolism, and brand values represented (40-60 words)",
  "colors": ["#HEX1", "#HEX2", "#HEX3", "#HEX4"],
  "fonts": ["Modern Professional FontName"],
  "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 200 80\" width=\"200\" height=\"80\"><defs><style>.text-font{font-family:'Inter',Arial,sans-serif;font-weight:700;}</style></defs><g id=\"icon\"><path d=\"M20,8 Q35,2 50,8 Q58,25 50,42 Q35,48 20,42 Q12,25 20,8 Z\" fill=\"#HEX1\"/><circle cx=\"35\" cy=\"25\" r=\"12\" fill=\"#HEX2\" opacity=\"0.85\"/><polygon points=\"28,18 42,18 40,32 30,32\" fill=\"#HEX3\"/><path d=\"M25,15 L45,15 L42,35 L28,35 Z\" fill=\"#HEX4\" opacity=\"0.7\"/></g><g id=\"text\"><text x=\"78\" y=\"45\" class=\"text-font\" font-size=\"24\" fill=\"#HEX1\">BRAND</text></g></svg>",
  "layout": {
    "textPosition": "right",
    "spacing": 8,
    "totalWidth": 200,
    "totalHeight": 80
  }
}

SVG GENERATION REQUIREMENTS:
- GENERATE COMPLETE, PROFESSIONAL SVG CODE with proper XML structure
- Use viewBox="0 0 200 80" for consistent scaling and professional proportions
- Include proper xmlns="http://www.w3.org/2000/svg" declaration
- Create sophisticated icon designs using advanced SVG elements:
  * Complex <path> elements with Bézier curves for organic shapes
  * Strategic <circle>, <ellipse>, <polygon> for geometric precision
  * Advanced <g> grouping for logical organization
  * Proper opacity and layering for depth and visual richness
- Position icon elements in the left portion (0-70px width)
- Position text elements starting around x="78" for proper spacing
- Use professional typography with Inter font family and fallbacks
- Include CSS styles in <defs><style> for consistent formatting
- Ensure text is properly aligned and sized (font-size: 24px minimum)
- Create 3-5 sophisticated shapes with varying opacities (0.6-1.0)
- Use premium color palettes with 3-4 complementary hex colors
- Implement proper spacing between icon and text (8px minimum)
- Ensure scalable design that works at any size
- Add subtle gradients or effects using SVG <defs> when appropriate

LAYOUT INTELLIGENCE:
- Analyze text length vs icon complexity to choose optimal layout
- For long brand names (>8 characters): consider vertical "bottom" layout
- For short names (≤8 characters): use horizontal "right" layout  
- Adjust viewBox dimensions accordingly: horizontal=200x80, vertical=120x120
- Ensure no overlapping between icon and text elements
- Maintain professional spacing and visual balance
- don't change project name. take it from the project description that is provided to you

SVG STRUCTURE EXAMPLE:
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 80" width="200" height="80">
  <defs>
    <style>.text-font{font-family:'Inter',Arial,sans-serif;font-weight:700;}</style>
  </defs>
  <g id="icon">
    <!-- Sophisticated icon shapes here -->
  </g>
  <g id="text">
    <text x="78" y="45" class="text-font" font-size="24" fill="#COLOR">BRAND</text>
  </g>
</svg>

AVOID: Broken XML, missing namespaces, overlapping elements, poor spacing, basic shapes only
GOAL: Generate production-ready SVG logos that are immediately usable, professionally designed, and scalable across all media formats.
`;
