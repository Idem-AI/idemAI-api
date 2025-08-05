export const LOGO_SYSTEM_SECTION_PROMPT = `
You are a senior brand designer. Generate a comprehensive logo system section in clean, production-ready HTML using Tailwind CSS utility classes only.

OBJECTIVE:
Create a visually polished, modern, and minimal logo presentation section, fully adapted to an A4 portrait format (210mm x 297mm). The design must reflect a high-end, premium identity system and be suitable for brand guidelines exported as PDF.

RULES:
- Use only HTML with Tailwind CSS utility classes
- The HTML must be properly indented, readable, and well-structured
- No JavaScript, no custom CSS
- All text content must be written in French
- Replace image placeholders (e.g. [PRIMARY_LOGO_URL]) with actual image URLs from the project context
- Ensure excellent visual hierarchy and consistency across all components
- All design choices must respect accessibility (contrast, spacing, semantic order)
- Structure must be responsive-friendly but optimized for A4 portrait display

SECTION STRUCTURE:
- Section title: "Logo & Déclinaisons"
- Four cards: 
  1. Logo principal
  2. Version monochrome
  3. Version négative
  4. Zone de protection
- Final block: Bonnes pratiques (as bulleted list)

DESIGN GUIDELINES:
- Use a clean card-based layout with soft shadows, subtle gradients, and rounded borders
- Harmonize colors (white, gray, slate, blue, amber) to convey clarity and professionalism
- Use Tailwind spacing units (px-8, py-16, gap-8, etc.) to ensure clear spacing
- Use max-h constraints and object-contain for logo displays
- Use color-coded badges (rounded dots) to distinguish each variant visually
- The final “Bonnes pratiques” block should have a distinct soft blue background and a clear icon

OUTPUT:
Generate ONLY the HTML code of the section, well-formatted and indented for clarity.
`;
