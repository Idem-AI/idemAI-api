export const LOGO_GENERATION_PROMPT = `
Generate 1 premium, ORIGINAL logo concept with sophisticated, professional design. Create a distinctive brand identity that stands out in the market. 

**LOGO TYPE REQUIREMENTS:**
Read the USER PREFERENCES above to understand the required logo type. Generate modern, professional logos that match these specifications:

- **"icon" (Icon Based)**: Create an easy-to-remember shape/icon + brand name. The icon is the focal point.
  * Examples: Apple (apple icon + text), Nike (swoosh + text), Twitter (bird + text)
  * Design a distinctive, memorable icon/symbol as the main visual element
  * Include the full brand name positioned beside or below the icon
  * The icon should be instantly recognizable and work standalone
  * Balance: Icon is dominant, text is complementary

- **"name" (Name Based)**: The company name WITH distinctive typography IS the logo. No separate icon.
  * Examples: Coca-Cola (scripted text), Google (colorful letters), FedEx (text with hidden arrow)
  * Focus entirely on typographic treatment of the brand name
  * Use creative font styling, letter spacing, colors, and effects
  * The text itself must be visually distinctive and memorable
  * NO separate icon element - typography IS the design
  * May include subtle graphic elements integrated within letters

- **"initial" (Initial Based)**: Brand initials as the main design element forming a unique logo.
  * Examples: IBM (blue striped letters), HP (circle with letters), CNN (bold letters in red box)
  * Create a sophisticated design using ONLY the first letter(s) of the brand name
  * The initials should be stylized, geometric, or artistically rendered
  * May include shapes, containers, or graphic elements that enhance the initials
  * The initials ARE the primary visual identity
  * Highly stylized and iconic treatment of 2-3 letters maximum

If a custom description is provided in USER PREFERENCES, incorporate those specific requirements into your design.

Return JSON with complete SVG content:

{
  "id": "concept01",
  "name": "Creative Professional Logo Name",
  "concept": "Detailed, compelling concept description explaining the design philosophy, symbolism, and brand values represented (40-60 words)",
  "colors": ["#HEX1", "#HEX2", "#HEX3", "#HEX4"],
  "fonts": ["Modern Professional FontName"],
  "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 200 80\" width=\"200\" height=\"80\"><defs><style>.text-font{font-family:'Inter',Arial,sans-serif;font-weight:700;}</style></defs><g id=\"icon\"><path d=\"M20,8 Q35,2 50,8 Q58,25 50,42 Q35,48 20,42 Q12,25 20,8 Z\" fill=\"#HEX1\"/><circle cx=\"35\" cy=\"25\" r=\"12\" fill=\"#HEX2\" opacity=\"0.85\"/><polygon points=\"28,18 42,18 40,32 30,32\" fill=\"#HEX3\"/><path d=\"M25,15 L45,15 L42,35 L28,35 Z\" fill=\"#HEX4\" opacity=\"0.7\"/></g><g id=\"text\"><text x=\"78\" y=\"45\" class=\"text-font\" font-size=\"24\" fill=\"#HEX1\">BRAND</text></g></svg>",
  "layout": {
    "textPosition": "right",
    "spacing": 8,
    "totalWidth": 200,
    "totalHeight": 80
  }
}

SVG GENERATION REQUIREMENTS:
- GENERATE COMPLETE, PROFESSIONAL SVG CODE with proper XML structure
- Include proper xmlns="http://www.w3.org/2000/svg" declaration
- Create sophisticated icon designs using advanced SVG elements:
  * Complex <path> elements with Bézier curves for organic shapes
  * Strategic <circle>, <ellipse>, <polygon> for geometric precision
  * Advanced <g> grouping for logical organization
  * Proper opacity and layering for depth and visual richness
- Use professional typography with Inter font family and fallbacks
- Include CSS styles in <defs><style> for consistent formatting
- Create 3-5 sophisticated shapes with varying opacities (0.6-1.0)
- Use premium color palettes with 3-4 complementary hex colors
- Ensure scalable design that works at any size
- Add subtle gradients or effects using SVG <defs> when appropriate

**SVG STRUCTURE BY LOGO TYPE:**

**For "icon" type (Icon Based - Icon + Brand Name):**
- Use viewBox="0 0 220 80" for horizontal layout with prominent icon
- Create a distinctive, memorable ICON in the left portion (0-70px width)
- Include the FULL BRAND NAME as text beside the icon (starting x="78")
- The icon should be the visual focal point, instantly recognizable
- Icon examples: shapes, symbols, abstract forms that represent the brand
- Ensure proper spacing between icon and text (8px minimum)
- Font size for brand name: 22-26px
Example:
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 80" width="220" height="80">
  <defs><style>.text-font{font-family:'Inter',Arial,sans-serif;font-weight:600;}</style></defs>
  <g id="icon">
    <!-- Distinctive icon shapes: circles, paths, polygons representing brand -->
    <circle cx="35" cy="40" r="28" fill="#HEX1"/>
    <path d="M35,20 L45,40 L35,60 L25,40 Z" fill="#HEX2"/>
  </g>
  <g id="text">
    <text x="78" y="48" class="text-font" font-size="24" fill="#HEX1">BRAND NAME</text>
  </g>
</svg>

**For "name" type (Name Based - Typography IS the Logo):**
- Use viewBox="0 0 200 60" for text-focused layout
- Create ONLY the <g id="text"> group - NO separate icon group
- The brand name with creative typography IS the entire logo design
- Use distinctive fonts, letter effects, colors, spacing for visual impact
- May include decorative elements WITHIN or AROUND letters (underlines, backgrounds, letter modifications)
- Focus on making the text itself visually unique and memorable
- Font size: 28-36px for prominence
Example:
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
  <defs>
    <style>.brand-text{font-family:'Inter',Arial,sans-serif;font-weight:800;letter-spacing:2px;}</style>
    <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#HEX1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#HEX2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <g id="text">
    <!-- Optional: Background or decorative shapes integrated with text -->
    <rect x="0" y="5" width="190" height="50" fill="#HEX3" opacity="0.1" rx="8"/>
    <text x="100" y="42" class="brand-text" font-size="32" fill="url(#textGrad)" text-anchor="middle">BRAND</text>
  </g>
</svg>

**For "initial" type (Initial Based - Stylized Initials as Logo):**
- Use viewBox="0 0 100 100" for square, centered layout
- Create a sophisticated design using ONLY the initials (2-3 letters max)
- The initials should be the PRIMARY visual element, highly stylized
- May include geometric shapes, containers, or backgrounds that enhance initials
- Create iconic, recognizable letterforms (like IBM's striped letters, HP's circle)
- NO full brand name - only initials with artistic treatment
- Font size for initials: 36-48px, bold and prominent
Example:
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs><style>.initial-font{font-family:'Inter',Arial,sans-serif;font-weight:900;}</style></defs>
  <g id="icon">
    <!-- Container or background shape for initials -->
    <circle cx="50" cy="50" r="45" fill="#HEX1"/>
    <circle cx="50" cy="50" r="40" fill="none" stroke="#HEX2" stroke-width="3"/>
  </g>
  <g id="text">
    <text x="50" y="62" class="initial-font" font-size="42" fill="#HEX3" text-anchor="middle">BN</text>
  </g>
</svg>

LAYOUT INTELLIGENCE:
- **RESPECT the logo type from USER PREFERENCES above - this is CRITICAL**
- **"icon" type (Icon Based)**: Distinctive icon + full brand name. Icon is the star, text supports it
- **"name" type (Name Based)**: Typography ONLY - no separate icon. The text styling IS the logo
- **"initial" type (Initial Based)**: Stylized initials as the main element. No full brand name
- For long brand names in "icon" type: consider stacking (icon on top, name below)
- For short names in "icon" type: use horizontal layout (icon left, name right)
- Ensure no overlapping between elements
- Maintain professional spacing and visual balance
- Use modern, clean, sophisticated design principles
- **IMPORTANT:** Don't change project name. Extract it from the project description provided

CUSTOM DESCRIPTION INTEGRATION:
- If a custom description is provided in USER PREFERENCES, prioritize it
- Incorporate specific design elements, themes, or concepts mentioned
- Maintain the logo type requirement while implementing custom ideas
- Balance user vision with professional design principles
- Think: Apple (icon+text), Coca-Cola (pure text), IBM (styled initials)

CRITICAL REQUIREMENTS - READ CAREFULLY:
1. **ICON BASED ("icon" type):**
   - Create a memorable icon/symbol (like Apple's apple, Nike's swoosh)
   - Include the FULL brand name as text beside or below the icon
   - Icon should be recognizable even without text
   - Balance: Icon dominant, text complementary
   - Think: Twitter bird + "Twitter", Apple logo + "Apple"

2. **NAME BASED ("name" type):**
   - NO separate icon element whatsoever
   - The brand name with creative typography IS the entire logo
   - Focus on font styling, letter spacing, colors, effects
   - May include decorative elements integrated with letters
   - Think: Coca-Cola script, Google colored letters, FedEx with hidden arrow

3. **INITIAL BASED ("initial" type):**
   - Use ONLY the first letters of the brand name (2-3 letters max)
   - Create a sophisticated, iconic design with the initials
   - May include shapes/containers that enhance the initials
   - NO full brand name text - initials ARE the logo
   - Think: IBM striped letters, HP in circle, CNN bold letters

4. Use the provided colors and typography from the context
5. Create unique, memorable designs that avoid clichés
6. Ensure production-ready, valid SVG markup
7. Generate modern, professional, scalable logos

AVOID:
- Broken XML or invalid SVG syntax
- Missing xmlns namespace declarations
- Overlapping elements that reduce legibility
- Poor spacing between elements
- Generic or basic shapes without sophistication
- **MIXING logo types** (e.g., adding icon to "name" type, or full name to "initial" type)
- Ignoring the logo type preference specified in USER PREFERENCES
- Creating amateur or dated designs
- Using cliché symbols or overused concepts

GOAL: Generate production-ready SVG logos that perfectly match user preferences, are immediately usable, professionally designed, and scalable across all media formats.
`;
