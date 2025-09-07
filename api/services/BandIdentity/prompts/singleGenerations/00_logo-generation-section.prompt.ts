export const LOGO_GENERATION_PROMPT = `
Generate 1 premium tech logo concept as compact JSON structure. Return JSON only:

{
  "id": "concept01",
  "name": "Logo Name",
  "concept": "Brief description",
  "colors": ["#HEX1", "#HEX2"],
  "fonts": ["FontName"],
  "icon": {
    "shapes": [
      {"type": "circle", "cx": 20, "cy": 20, "r": 15, "fill": "#HEX1"},
      {"type": "rect", "x": 10, "y": 10, "w": 20, "h": 20, "fill": "#HEX2"}
    ],
    "size": {"w": 40, "h": 40}
  },
  "text": {
    "elements": [
      {"type": "text", "x": 40, "y": 25, "text": "BRAND", "fontSize": 16, "fill": "#HEX1", "fontFamily": "FontName"}
    ],
    "size": {"w": 80, "h": 40}
  },
  "layout": {
    "textPosition": "right",
    "spacing": 8
  }
}

Rules:
- Generate geometric shapes (circle, rect, path, polygon) with coordinates
- Maximum 8 shapes for icon, 4 elements for text
- Use project colors/fonts from context
- Modern, geometric, premium style
- Coordinates relative to viewBox size
- Layout: textPosition "right" (horizontal) or "bottom" (vertical)
- Spacing: 2-4 pixels between icon and text (VERY tight spacing required)
- Choose layout based on text length: short text → "right", long text → "bottom"
- Single line JSON, no explanations
`;
