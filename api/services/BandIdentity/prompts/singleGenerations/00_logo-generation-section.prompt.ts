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
      {"type": "text", "x": 0, "y": 16, "text": "BRAND", "fontSize": 16, "fill": "#HEX1", "fontFamily": "FontName"}
    ],
    "size": {"w": 80, "h": 20}
  },
  "layout": {
    "textPosition": "right",
    "spacing": 6
  }
}

CRITICAL Layout Rules:
- ALWAYS analyze text vs icon dimensions to choose optimal layout
- If text width > icon width: use "bottom" layout (text below icon)
- If text width ≤ icon width: use "right" layout (text beside icon)
- Text coordinates should be relative to text container (starting at 0,0)
- Icon coordinates should be relative to icon container (starting at 0,0)
- Calculate realistic text dimensions: estimate ~10px per character for width
- Text height should match fontSize + small padding (fontSize * 1.2)
- Spacing: 4-8 pixels between icon and text for clear separation
- Ensure text never overlaps with icon by proper size calculation
- Single line JSON, no explanations
`;
