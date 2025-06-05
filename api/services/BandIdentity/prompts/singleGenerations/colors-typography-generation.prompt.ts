export const COLORS_TYPOGRAPHY_GENERATION_PROMPT = `
You are an expert UI/UX designer and branding specialist. Your task is to generate a diverse set of color palettes and typography pairings suitable for a modern tech brand.

STRICT OUTPUT FORMAT (JSON ONLY — DO NOT CHANGE STRUCTURE):
Ensure the output is a single JSON object. All string values within the JSON must be properly escaped.

{
  "colors": [
    {
      "id": "color-scheme-1",
      "name": "Vibrant Innovation",
      "url": "palette/vibrant-innovation",
      "colors": {
        "primary": "#HEXCOLOR1",
        "secondary": "#HEXCOLOR2",
        "accent": "#HEXCOLOR3",
        "background": "#HEXCOLOR4",
        "text": "#HEXCOLOR5"
      }
    },
    // ... (3 more ColorModel objects, ensure they are distinct and complete)
  ],
  "typography": [
    {
      "id": "typography-set-1",
      "name": "Modern & Clean",
      "url": "typography/modern-clean",
      "primaryFont": "Primary Font Name 1 (e.g., Inter)",
      "secondaryFont": "Secondary Font Name 1 (e.g., Roboto Mono)"
    },
    // ... (3 more TypographyModel objects, ensure they are distinct and complete)
  ]
}

IMPORTANT:
- Generate exactly 4 unique ColorModel objects.
- Generate exactly 4 unique TypographyModel objects.
- All IDs must be unique (e.g., "color-scheme-1", "color-scheme-2", "typography-set-1", "typography-set-2").
- URLs should be slug-like based on the name (e.g., "palette/vibrant-innovation").
- Colors should be valid hex codes (e.g., "#RRGGBB").
- Font names should be real, commonly used web fonts (e.g., from Google Fonts like "Inter", "Roboto", "Open Sans").
- The "name" fields should be descriptive of the style (e.g., "Vibrant Innovation", "Modern & Clean").

MODEL DEFINITIONS FOR YOUR REFERENCE (This is how the data should be structured):

export interface TypographyModel {
  id: string; // e.g., "typography-set-1"
  name: string; // e.g., "Elegant & Professional"
  url: string; // e.g., "typography/elegant-professional"
  primaryFont: string; // e.g., "Merriweather"
  secondaryFont: string; // e.g., "Open Sans"
}

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
The brand is an innovative tech company focused on user-centric design, accessibility, and cutting-edge solutions. The branding should feel modern, trustworthy, and approachable, yet sophisticated. Aim for variety in the generated sets, covering different moods (e.g., energetic, calm, professional, playful). Ensure each of the 4 color palettes is distinct, and each of the 4 typography pairings is distinct.

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
  ],
  "typography": [
    {
      "id": "typography-set-unique-1",
      "name": "Tech Forward",
      "url": "typography/tech-forward",
      "primaryFont": "Roboto",
      "secondaryFont": "Source Code Pro"
    },
    {
      "id": "typography-set-unique-2",
      "name": "Classic Readability",
      "url": "typography/classic-readability",
      "primaryFont": "Lora",
      "secondaryFont": "Lato"
    },
    {
      "id": "typography-set-unique-3",
      "name": "Bold Statements",
      "url": "typography/bold-statements",
      "primaryFont": "Montserrat",
      "secondaryFont": "Raleway"
    },
    {
      "id": "typography-set-unique-4",
      "name": "Minimalist Sans",
      "url": "typography/minimalist-sans",
      "primaryFont": "Open Sans",
      "secondaryFont": "PT Sans"
    }
  ]
}
`;