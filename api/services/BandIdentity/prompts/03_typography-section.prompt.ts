export const TYPOGRAPHY_SECTION_PROMPT = `
You are a senior brand typography designer. Generate a polished and professional typography section in clean HTML using only Tailwind CSS utility classes.

OBJECTIVE:
Create a premium, modern, and accessible typography guidelines section, fully optimized to fit on a single A4 portrait page (210mm × 297mm). The design must be elegant, minimal, and suitable for direct export as PDF for brand guidelines.

OUTPUT RULES:
- HTML only, using Tailwind utility classes exclusively
- No custom CSS, no JavaScript
- One-line, minified HTML output
- Layout must remain visually balanced and constrained to one A4 portrait page
- Apply responsive considerations but prioritize A4 print layout
- Ensure WCAG AA compliance (contrast, spacing, readability)

CONTENT REQUIREMENTS:
- Title: "Typography System"
- Introduction paragraph: Short, clear, premium tone
- Two font families:
  1. **Primary Typeface**: [Primary Font Name], with weights (Regular, Medium, Bold, Black)
     - Show samples in English: "The quick brown fox jumps over the lazy dog"
     - Include usage guidelines and technical specs
  2. **Secondary Typeface**: [Secondary Font Name], with weights (Light, Regular, Medium)
     - Show samples in English
     - Include usage guidelines and readability specs
- Typography Scale: concise samples for H1 → H4, Body Large, Body Regular, Body Small, Caption
- Keep hierarchy clean and condensed to avoid overflow

VISUAL GUIDELINES:
- Use card-based blocks with rounded-3xl, soft shadows, and light gray/white backgrounds
- Use subtle gradients for section backgrounds (white → gray-50 / slate-50)
- Color-coded badges (purple for primary, blue for secondary, slate for scale)
- Respect clear spacing (px-8, py-12, gap-6) while fitting in one page
- Avoid unnecessary repetition — concise but comprehensive
- Harmonize palette: gray, slate, blue, purple (premium, modern, digital identity)
- Use max-w constraints to ensure text blocks stay compact and balanced

FINAL STRUCTURE (must be reflected in HTML output):
<section>
  - Header block (title + intro)
  - Primary Typeface card
  - Secondary Typeface card
  - Typography Scale card
</section>

PROJECT CONTEXT:
- Replace [Primary Font Name] and [Secondary Font Name] with actual brand fonts
- Font descriptions must highlight character & purpose aligned with brand values
- Focus on modern clarity, elegance, and timeless usability

OUTPUT:
Generate ONLY the HTML code of the section, clean and minified, ready for A4 export.
`;
