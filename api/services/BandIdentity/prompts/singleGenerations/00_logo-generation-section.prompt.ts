export const LOGO_GENERATION_PROMPT = `
Generate 1 premium, ORIGINAL tech logo concept with sophisticated, professional design. Create a distinctive brand identity that stands out in the market. Return JSON only:

{
  "id": "concept01",
  "name": "Creative Professional Logo Name",
  "concept": "Detailed, compelling concept description explaining the design philosophy, symbolism, and brand values represented (40-60 words)",
  "colors": ["#HEX1", "#HEX2", "#HEX3", "#HEX4"],
  "fonts": ["Modern Professional FontName"],
  "icon": {
    "shapes": [
      {"type": "path", "d": "M20,8 Q35,2 50,8 Q58,25 50,42 Q35,48 20,42 Q12,25 20,8 Z", "fill": "#HEX1"},
      {"type": "circle", "cx": 35, "cy": 25, "r": 12, "fill": "#HEX2", "opacity": 0.85},
      {"type": "polygon", "points": "28,18 42,18 40,32 30,32", "fill": "#HEX3"},
      {"type": "path", "d": "M25,15 L45,15 L42,35 L28,35 Z", "fill": "#HEX4", "opacity": 0.7}
    ],
    "size": {"w": 70, "h": 50}
  },
  "text": {
    "elements": [
      {"type": "text", "x": 0, "y": 28, "text": "BRAND", "fontSize": 24, "fill": "#HEX1", "fontFamily": "FontName", "fontWeight": "700"}
    ],
    "size": {"w": 120, "h": 32}
  },
  "layout": {
    "textPosition": "right",
    "spacing": 8
  }
}

DESIGN EXCELLENCE REQUIREMENTS:
- DESCRIPTIONS MUST BE DETAILED AND COMPELLING: 40-60 words explaining design philosophy, symbolism, and brand values
- CREATE UNIQUE, MEMORABLE, PROFESSIONAL DESIGNS - avoid basic circles/rectangles
- Use sophisticated shapes: complex paths with curves, advanced polygons, overlapping elements
- Combine 3-5 shapes with different opacities (0.6-1.0) for depth and visual richness
- Create strong visual hierarchy with size variation, layering, and strategic positioning
- Use premium color palettes with 3-4 complementary colors for sophisticated gradients
- Implement golden ratio proportions and advanced geometric principles
- Add intricate geometric patterns, intersections, and visual effects
- Master negative space as a powerful design element
- Ensure shapes are precisely positioned with professional alignment and balance
- Create cohesive, premium color harmony that conveys brand sophistication
- Design should be scalable and work across all media formats
- Include subtle details that enhance professionalism without cluttering

TECHNICAL PRECISION:
- Path elements for organic/curved shapes (use advanced quadratic/cubic Bézier curves)
- Complex polygons for angular/geometric elements with precise point positioning
- Strategic use of opacity (0.6-1.0) and advanced layering techniques
- Pixel-perfect coordinate positioning for professional alignment
- Icon dimensions: MINIMUM 70x50px for better visibility and detail
- Text positioning relative to container (0,0 origin) with professional spacing
- Smart layout choice: text width > icon width → "bottom", else → "right"
- Calculate text width: ~12px per character + padding for larger fonts
- Text height: fontSize * 1.4 for proper spacing and readability
- Spacing: 8-12px for optimal separation and professional appearance
- Font size: MINIMUM 24px for better readability and professional impact
- Use font weights 600-700 for strong brand presence
- Ensure all elements are scalable and maintain quality at different sizes

AVOID: Basic shapes only, poor positioning, generic designs, overlapping text, small dimensions, weak typography
GOAL: Create distinctive, premium, professional logos that command attention, convey brand authority, and stand out in competitive markets. Each logo should be a masterpiece of design that clients would be proud to use across all their brand materials.
`;
