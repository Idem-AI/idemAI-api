export const LOGO_VARIATIONS_GENERATION_PROMPT = `
Generate 3 professional icon variations from the provided logo structure with enhanced dimensions and quality. Use the ORIGINAL COLORS from the logo and adapt them appropriately for each background. Return JSON only:

{
  "variations": {
    "lightBackground": {
      "shapes": [
        {"type": "circle", "cx": 35, "cy": 35, "r": 25, "fill": "#2563EB"}
      ],
      "size": {"w": 70, "h": 70}
    },
    "darkBackground": {
      "shapes": [
        {"type": "circle", "cx": 35, "cy": 35, "r": 25, "fill": "#60A5FA"}
      ],
      "size": {"w": 70, "h": 70}
    },
    "monochrome": {
      "shapes": [
        {"type": "circle", "cx": 35, "cy": 35, "r": 25, "fill": "#1F2937"}
      ],
      "size": {"w": 70, "h": 70}
    }
  }
}

PROFESSIONAL VARIATION RULES:
- Extract and enhance icon shapes only, remove all text elements
- MINIMUM dimensions: 70x70px for professional quality and visibility
- Maintain all original shape complexity and sophistication
- Preserve geometric relationships and proportional scaling
- USE THE ORIGINAL LOGO COLORS as base, then adapt them for each variation:

COLOR ADAPTATION STRATEGY:
- lightBackground: Use the original colors but ensure good contrast (darken if needed: -20% to -40% brightness)
- darkBackground: Use lighter versions of original colors (+30% to +50% brightness) or complementary light tones
- monochrome: Convert the dominant original color to a sophisticated monochrome version (preserve hue but desaturate)

COLOR EXAMPLES:
- If original is #3B82F6 (blue): lightBackground=#1D4ED8, darkBackground=#60A5FA, monochrome=#374151
- If original is #10B981 (green): lightBackground=#047857, darkBackground=#34D399, monochrome=#4B5563
- If original is #F59E0B (orange): lightBackground=#D97706, darkBackground=#FCD34D, monochrome=#6B7280

- Maximum 8 shapes per variation to maintain detail and complexity
- Scale all coordinates proportionally to larger dimensions
- Ensure all opacity values are preserved for depth and layering
- Maintain professional alignment and spacing
- NEVER use pure black (#000000) or pure white (#FFFFFF) unless original logo uses them
- Single line JSON, no explanations or additional text
`;
