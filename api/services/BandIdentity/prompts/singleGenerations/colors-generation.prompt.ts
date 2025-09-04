export const COLORS_GENERATION_PROMPT = `
You are an expert UI/UX designer and branding specialist. Your task is to generate a diverse set of color palettes suitable for a premium tech brand. The design should follow modern gradients and premium aesthetics.

STRICT OUTPUT FORMAT (JSON ONLY — DO NOT CHANGE STRUCTURE):
Ensure the output is a single JSON object. All string values within the JSON must be properly escaped.

{
  "colors": [
    {
      "id": "color-scheme-1",
      "name": "Dégradé Premium",
      "url": "palette/degrade-premium",
      "colors": {
        "primary": "#6a11cb",
        "secondary": "#2575fc",
        "accent": "#ff5858",
        "background": "#ffffff",
        "text": "#191970"
      }
    }
    // ... (3 more ColorModel objects, ensure they are distinct and complete)
  ]
}

IMPORTANT:
- Generate exactly 4 unique ColorModel objects. The first one must be "Dégradé Premium" using the template colors (#6a11cb to #2575fc gradient).
- All IDs must be unique (e.g., "color-scheme-1", "color-scheme-2", "color-scheme-3", "color-scheme-4").
- URLs should be descriptive slugs (e.g., "palette/degrade-premium", "palette/ocean-blue").
- Colors should be valid hex codes (e.g., "#RRGGBB").
- The "name" fields should be descriptive of the style (e.g., "Vibrant Innovation", "Modern & Clean").

MODEL DEFINITION FOR YOUR REFERENCE:

export interface ColorModel {
  id: string; // e.g., "color-palette-green-1"
  name: string; // e.g., "Earthy Tones"
  url: string; // e.g., "palette/earthy-tones"
  colors: {
    primary: string;   // #HEX
    secondary: string; // #HEX
    accent: string;    // #HEX
    background: string;// #HEX
    text: string;      // #HEX
  };
}

PROJECT CONTEXT:
The brand is a premium tech company focused on user-centric design, accessibility, and cutting-edge solutions. The branding should follow modern gradient styles (especially the purple to blue gradient: #6a11cb to #2575fc), and a professional premium aesthetic. The first color scheme should exactly match the template, while the other three should provide complementary alternatives that maintain the premium, modern feel of the brand. Ensure all color palettes include gradient options and maintain accessibility standards.

EXAMPLE OUTPUT (This is just to show structure and types; your generated content should be unique and follow all rules):
{
  "colors": [
    {
      "id": "color-scheme-unique-1",
      "name": "Deep Ocean Blue",
      "url": "palette/deep-ocean-blue",
      "colors": {
        "primary": "#0A2463",
        "secondary": "#3E92CC",
        "accent": "#D8315B",
        "background": "#F7F7F7",
        "text": "#1E1E1E"
      }
    },
    {
      "id": "color-scheme-unique-2",
      "name": "Sunset Warmth",
      "url": "palette/sunset-warmth",
      "colors": {
        "primary": "#FF6B6B",
        "secondary": "#FFD166",
        "accent": "#4ECDC4",
        "background": "#FFF9F0",
        "text": "#2A2A2A"
      }
    },
    {
      "id": "color-scheme-unique-3",
      "name": "Forest Greens",
      "url": "palette/forest-greens",
      "colors": {
        "primary": "#2D6A4F",
        "secondary": "#40916C",
        "accent": "#95D5B2",
        "background": "#F0FDF4",
        "text": "#1B4332"
      }
    },
    {
      "id": "color-scheme-unique-4",
      "name": "Monochrome Impact",
      "url": "palette/monochrome-impact",
      "colors": {
        "primary": "#222222",
        "secondary": "#555555",
        "accent": "#007BFF",
        "background": "#FFFFFF",
        "text": "#111111"
      }
    }
  ]
}
`;
