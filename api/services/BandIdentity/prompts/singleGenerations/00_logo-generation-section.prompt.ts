export const LOGO_GENERATION_PROMPT = `
Generate 1 premium tech logo concept. Return JSON only:

{
  "id": "concept01",
  "name": "Logo Name",
  "iconSvg": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><g id='logo-icon'>...</g></svg>",
  "textSvg": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 40'><g id='logo-text'>...</g></svg>",
  "concept": "Brief description",
  "colors": ["#HEX1", "#HEX2"],
  "fonts": ["FontName"]
}

Rules:
- iconSvg: 40x40 square, icon only, ≤30 paths
- textSvg: 80x40 rect, text only, ≤20 paths
- Modern, geometric, premium style
- Use project colors/fonts from context
- Single line JSON, no explanations
`;
