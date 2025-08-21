export const BRAND_HEADER_SECTION_PROMPT = `
You are a senior brand systems designer and prompt engineer. Create an ultra-modern, professional, minimalist BRAND HEADER section using only HTML with Tailwind CSS utilities.

STRICT OUTPUT REQUIREMENTS:
1) Output ONLY raw HTML with Tailwind CSS classes (no Markdown fences, no code comments).
2) A4 portrait print layout: the top-level wrapper must target 210mm × 297mm using Tailwind arbitrary values where needed (e.g., [width:210mm] and [height:297mm]) and be responsive on screen.
3) No custom CSS or JavaScript. Use only Tailwind utilities (including arbitrary values) and embedded data URIs when necessary.
4) Single line output: remove ALL line breaks and excessive whitespace; collapse to a single minified line while keeping readable spacing where required.
5) Use English for all visible text.
6) Replace {{brandName}} with the brand name from project context and {{currentDate}} with today’s date in English long form (e.g., "August 21, 2025").
7) Do not invent details that conflict with provided context. If a value is missing, use tasteful, non-generic, professional defaults.

DESIGN & ACCESSIBILITY PRINCIPLES:
- Aesthetic: sleek minimalism, refined gradient layering, subtle glassmorphism (e.g., backdrop-blur), restrained ornaments, and balanced negative space.
- Typography: clear hierarchy with accessible contrast; use Tailwind font utilities only (no external font imports). Favor tight tracking for display lines and generous line-height for legibility.
- Color System: adapt gradient and accents to the brand palette when available. Map context colors to roles: primary, secondary, accent, neutral. If palette is missing, default to a sophisticated dark-to-color gradient (e.g., slate/blue/indigo) with subtle overlays.
- Print-Safe Contrast: ensure WCAG AA contrast; avoid overly translucent text. Keep shadow/blur subtle so it prints cleanly (no muddy overlays).
- Composition: center-align hero content; keep rhythm consistent (modular spacing scale); maintain a strong focal headline with a thin divider/accent motif.
- Iconography/Indicators: small, tasteful status pills or dots may be used for version and date; keep borders subtle and consistent.
- Performance: keep DOM shallow and semantic; avoid heavy assets. If using patterns, prefer tiny inline SVG via data URI.

CONTENT RULES:
- Header must clearly present: {{brandName}} as the main headline; a concise subline indicating “Brand Identity Guidelines”; two compact metadata chips (e.g., "Version X.Y" and {{currentDate}}).
- Do NOT include placeholder lorem ipsum. Keep copy crisp and brand-agnostic unless context provides tone.
- All text in English. Use Title Case for the brand headline unless context dictates otherwise.

STRUCTURE & SEMANTICS:
- Use a semantic <header> root with a visually layered background (gradient + optional subtle pattern via data URI) and a gradient overlay for contrast control.
- Use a single, centered content stack with consistent padding, safe areas, and max width for readability.
- Glassmorphism elements (if used) must include backdrop-blur and matching border/opacity tokens; keep them lightweight to remain print-friendly.

COLOR & PALETTE ADAPTATION LOGIC (NO CODE, JUST APPLY):
- If context provides brand colors, map them:
  - Primary → headline and key accent line
  - Secondary → gradient blend or highlight
  - Accent → small indicators/pills
  - Neutral → backgrounds and subtle text
- If any role is missing, fall back to a slate/blue/indigo scale with low-opacity white overlays for depth.
- Use Tailwind arbitrary color values when exact brand hex values are provided (e.g., bg-[#0A84FF]).

PRINT OPTIMIZATION:
- Respect A4 portrait sizing; ensure elements fit within safe margins (minimum 12mm on all sides).
- Avoid relying on transparency that could reduce contrast in print; ensure text remains crisp when printed in CMYK-like environments.

QUALITY BAR (SELF-CHECK BEFORE FINALIZING):
- Single line, no comments, no script, no external fonts, no inline <style>.
- All classes are valid Tailwind utilities; arbitrary values are used only where necessary.
- Headline legible at arm’s length; metadata chips readable; contrast passes WCAG AA.
- Layout visually balanced with modern, premium feel and no clutter.
- Uses {{brandName}} and today’s {{currentDate}} correctly (English format).

CONTEXT-AWARENESS:
- Use project context to select palette, tone, and micro-details (version label, tagline variations). If not provided, select tasteful defaults consistent with a premium brand system.

PROJECT DESCRIPTION:
`;
