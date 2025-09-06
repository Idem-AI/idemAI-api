export const LOGO_VARIATIONS_GENERATION_PROMPT = `
Generate 3 icon variations from the provided logo. Return JSON only:

{
  "variations": {
    "lightBackground": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><g id='logo-icon'>...</g></svg>",
    "darkBackground": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><g id='logo-icon'>...</g></svg>",
    "monochrome": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><g id='logo-icon'>...</g></svg>"
  }
}

Rules:
- Extract icon only, remove text
- lightBackground: dark colors for contrast
- darkBackground: light colors for contrast  
- monochrome: single color (#000 or #FFF)
- 40x40 viewBox, ≤30 paths
- Single line JSON, no explanations
`;
