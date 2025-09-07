export const LOGO_VARIATIONS_GENERATION_PROMPT = `
Generate 3 icon variations from the provided logo structure. Return JSON only:

{
  "variations": {
    "lightBackground": {
      "shapes": [
        {"type": "circle", "cx": 20, "cy": 20, "r": 15, "fill": "#333333"}
      ],
      "size": {"w": 40, "h": 40}
    },
    "darkBackground": {
      "shapes": [
        {"type": "circle", "cx": 20, "cy": 20, "r": 15, "fill": "#FFFFFF"}
      ],
      "size": {"w": 40, "h": 40}
    },
    "monochrome": {
      "shapes": [
        {"type": "circle", "cx": 20, "cy": 20, "r": 15, "fill": "#000000"}
      ],
      "size": {"w": 40, "h": 40}
    }
  }
}

Rules:
- Extract icon shapes only, remove text elements
- lightBackground: use dark colors (#333, #666) for contrast
- darkBackground: use light colors (#FFF, #F0F0F0) for contrast  
- monochrome: single color (#000000 or #FFFFFF)
- Maximum 6 shapes per variation
- Single line JSON, no explanations
`;
