export const COLORS_TYPOGRAPHY_GENERATION_PROMPT = `
Generate 4 color palettes and 4 typography sets. Return JSON only:

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
    // ... 3 more unique palettes
  ],
  "typography": [
    {
      "id": "typography-set-1",
      "name": "Système Premium",
      "url": "typography/systeme-premium",
      "primaryFont": "Exo 2",
      "secondaryFont": "Roboto"
    }
    // ... 3 more unique sets
  ]
}

Rules:
- First color: exactly "Dégradé Premium" with colors above
- First typography: exactly "Système Premium" with Exo 2 + Roboto
- 3 more unique palettes and typography sets
- Valid hex codes, Google Fonts, descriptive names
- Single line JSON, no explanations`;