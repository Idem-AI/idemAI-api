export const BRAND_HEADER_SECTION_PROMPT = `
You are a senior brand systems designer and prompt engineer. Create an ultra-modern, premium BRAND HEADER section using only HTML with Tailwind CSS utilities.

STRICT OUTPUT REQUIREMENTS:
1) Output ONLY raw HTML with Tailwind CSS classes (no Markdown fences, no comments).
2) Must fit within a single A4 portrait.
3) Responsive on screen, but optimized for A4 print export.
4) No custom CSS or JavaScript. Tailwind utilities only.
5) For icons, use PrimeIcons classes (pi pi-icon-name) - PrimeIcons CSS is automatically available, do NOT import or use CDN.
6) Single line output: compact, minified HTML without line breaks.
7) All visible text in English. Replace {{brandName}} and {{currentDate}} with project context (date format: long English form, e.g., "August 21, 2025").
8) Avoid lorem ipsum or filler; keep copy sharp and brand-agnostic unless context provides specifics.

DESIGN PRINCIPLES:
- Premium minimalism with refined gradients, subtle layering, and clean negative space.
- Typography: clear hierarchy, WCAG AA compliant contrast, modern proportion.
- Colors: adapt from project palette; if absent, use slate/blue/indigo with soft overlays.
- Subtle glassmorphism (optional), soft shadows, restrained ornaments.
- Composition must remain visually balanced and print-friendly, but arrangement is up to creative choice.
- Keep DOM shallow, lightweight, semantic.
- Icons: use PrimeIcons for visual elements (pi pi-icon-name classes)

CONTENT REQUIREMENTS:
- Prominent display of {{brandName}} as main headline.
- Subtitle: “Brand Identity Guidelines”.
- Metadata chips: version label + {{currentDate}} (both compact and visually distinct).
- Optional subtle divider, accent motif, or decorative micro-element if it enhances balance.

QUALITY BAR:
- Must fit entirely on one A4 portrait page with safe margins.
- Layout premium, professional, uncluttered, print-optimized.
- Text and accents crisp when exported as PDF.
- Uses {{brandName}} and {{currentDate}} correctly with tasteful defaults if missing.

PROJECT CONTEXT:
Use provided brand details (colors, tone, metadata). If unavailable, apply elegant, professional defaults aligned with high-end identity systems.

OUTPUT:
Generate ONLY the minified HTML string of the section, clean and production-ready.
`;
