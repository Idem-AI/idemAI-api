export const LOGO_GENERATION_PROMPT = `
Generate 1 premium, ORIGINAL tech logo concept with sophisticated design. Return JSON only:

{
  "id": "concept01",
  "name": "Creative Logo Name",
  "concept": "Innovative design description",
  "colors": ["#HEX1", "#HEX2", "#HEX3"],
  "fonts": ["Modern FontName"],
  "icon": {
    "shapes": [
      {"type": "path", "d": "M15,5 Q25,0 35,5 Q40,15 35,25 Q25,30 15,25 Q10,15 15,5 Z", "fill": "#HEX1"},
      {"type": "circle", "cx": 25, "cy": 15, "r": 8, "fill": "#HEX2", "opacity": 0.8},
      {"type": "polygon", "points": "20,10 30,10 28,18 22,18", "fill": "#HEX3"}
    ],
    "size": {"w": 50, "h": 35}
  },
  "text": {
    "elements": [
      {"type": "text", "x": 0, "y": 18, "text": "BRAND", "fontSize": 18, "fill": "#HEX1", "fontFamily": "FontName", "fontWeight": "600"}
    ],
    "size": {"w": 85, "h": 22}
  },
  "layout": {
    "textPosition": "right",
    "spacing": 6
  }
}

DESIGN EXCELLENCE REQUIREMENTS:
- CREATE UNIQUE, MEMORABLE DESIGNS - avoid basic circles/rectangles
- Use sophisticated shapes: paths with curves, polygons, overlapping elements
- Combine 2-4 shapes with different opacities (0.6-1.0) for depth
- Create visual hierarchy with size variation and layering
- Use gradients via multiple colors and strategic positioning
- Implement golden ratio proportions where possible
- Add subtle geometric patterns or intersections
- Consider negative space as design element
- Ensure shapes are precisely positioned and well-balanced
- Create cohesive color harmony with 2-3 complementary colors

TECHNICAL PRECISION:
- Path elements for organic/curved shapes (use quadratic/cubic curves)
- Polygons for angular/geometric elements
- Strategic use of opacity and layering
- Precise coordinate positioning for professional alignment
- Icon dimensions should be proportional and well-composed
- Text positioning relative to container (0,0 origin)
- Smart layout choice: text width > icon width → "bottom", else → "right"
- Calculate text width: ~11px per character + padding
- Text height: fontSize * 1.3 for proper spacing
- Spacing: 5-8px for optimal separation

AVOID: Basic shapes only, poor positioning, generic designs, overlapping text
GOAL: Create distinctive, professional logos that stand out visually
`;
