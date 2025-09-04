export const TYPOGRAPHY_GENERATION_PROMPT = `
You are an expert UI/UX designer and branding specialist. Your task is to generate a diverse set of typography pairings suitable for a premium tech brand. The design should follow clean typography and professional aesthetics.

STRICT OUTPUT FORMAT (JSON ONLY — DO NOT CHANGE STRUCTURE):
Ensure the output is a single JSON object. All string values within the JSON must be properly escaped.

{
  "typography": [
    {
      "id": "typography-set-1",
      "name": "Système Premium",
      "url": "typography/systeme-premium",
      "primaryFont": "Exo 2",
      "secondaryFont": "Roboto"
    }
    // ... (3 more TypographyModel objects, ensure they are distinct and complete)
  ]
}

IMPORTANT:
- Generate exactly 4 unique TypographyModel objects. The first one must be "Système Premium" using Exo 2 as primary font and Roboto as secondary font.
- All IDs must be unique (e.g., "typography-set-1", "typography-set-2", "typography-set-3", "typography-set-4").
- URLs should be descriptive slugs (e.g., "typography/systeme-premium", "typography/tech-forward").
- Font names should be real, commonly used web fonts (e.g., from Google Fonts like "Inter", "Roboto", "Open Sans").
- The "name" fields should be descriptive of the style (e.g., "Tech Forward", "Classic Readability").

MODEL DEFINITION FOR YOUR REFERENCE:

export interface TypographyModel {
  id: string; // e.g., "typography-set-1"
  name: string; // e.g., "Elegant & Professional"
  url: string; // e.g., "typography/elegant-professional"
  primaryFont: string; // e.g., "Merriweather"
  secondaryFont: string; // e.g., "Open Sans"
}

PROJECT CONTEXT:
The brand is a premium tech company focused on user-centric design, accessibility, and cutting-edge solutions. The branding should follow clean typography (Exo 2 as primary font), and a professional premium aesthetic. The first typography set should exactly match the template, while the other three should provide complementary alternatives that maintain the premium, modern feel of the brand. Ensure all typography pairings maintain clear hierarchy and readability.

EXAMPLE OUTPUT (This is just to show structure and types; your generated content should be unique and follow all rules):
{
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
