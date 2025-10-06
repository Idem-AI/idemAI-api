export const LOGO_GENERATION_PROMPT = `
Generate 1 HIGHLY ORIGINAL, CREATIVE, and PROFESSIONAL logo concept that pushes design boundaries. Create a UNIQUE brand identity that is MEMORABLE, MODERN, and SOPHISTICATED.

**DESIGN PHILOSOPHY:**
- Think like a world-class brand designer (Pentagram, Landor, Wolff Olins level)
- Avoid generic, predictable, or cliché designs at all costs
- Create visual impact through innovation, not imitation
- Balance creativity with timeless professionalism
- Every element must serve a purpose and tell a story

**LOGO TYPE REQUIREMENTS:**
Read the USER PREFERENCES above to understand the required logo type. Generate EXCEPTIONAL, ORIGINAL logos:

- **"icon" (Icon Based)**: Create a UNIQUE, MEMORABLE icon + brand name. Push creative boundaries.
  * AVOID: Generic circles, basic shapes, predictable symbols
  * DO: Abstract concepts, unexpected shapes, clever visual metaphors, geometric innovation
  * Examples of excellence: Apple (bitten apple = knowledge), Nike (motion/victory), Twitter (upward bird = growth)
  * The icon should tell a story and be instantly recognizable
  * Use negative space creatively, asymmetry, or unexpected compositions
  * Modern, minimalist approach with sophisticated details

- **"name" (Name Based)**: REVOLUTIONARY typography that becomes iconic. The text IS art.
  * AVOID: Basic fonts, simple text, boring layouts, generic styling
  * DO: Custom letterforms, creative ligatures, hidden meanings, optical illusions, dynamic compositions
  * Examples of excellence: Coca-Cola (flowing script = refreshment), FedEx (hidden arrow = speed), Google (playful colors = innovation)
  * Transform letters into visual experiences
  * Use: Gradients, geometric cuts, overlapping letters, 3D effects, color psychology
  * Create visual rhythm and movement through typography
  * May integrate subtle shapes WITHIN the letters themselves
  * Think: How can typography alone create emotional impact?

- **"initial" (Initial Based)**: ICONIC, ARTISTIC initials that become a visual symbol.
  * AVOID: Plain letters in circles, basic monograms, simple stacking
  * DO: Geometric abstraction, interlocking letters, negative space mastery, architectural letterforms
  * Examples of excellence: IBM (horizontal stripes = technology), HP (circular embrace = innovation), CNN (bold red = urgency)
  * Transform initials into abstract art while maintaining readability
  * Use: Overlapping, rotation, reflection, geometric deconstruction
  * Create depth through layering and dimensional effects
  * The initials should work as both letters AND abstract symbol

If a custom description is provided in USER PREFERENCES, incorporate those specific requirements while maintaining EXCEPTIONAL design quality.

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

SVG GENERATION REQUIREMENTS - CREATE EXCEPTIONAL DESIGNS:
- GENERATE COMPLETE, PROFESSIONAL SVG CODE with proper XML structure
- Include proper xmlns="http://www.w3.org/2000/svg" declaration
- Use ADVANCED SVG techniques for premium results:
  * Complex <path> with Bézier curves (Q, C commands) for fluid, organic shapes
  * Strategic geometric primitives (<circle>, <ellipse>, <polygon>, <rect>)
  * <clipPath> for sophisticated masking effects
  * <linearGradient> and <radialGradient> for depth and dimension
  * <filter> effects (blur, shadow) for subtle sophistication (use sparingly)
  * Transform attributes (rotate, scale, skew) for dynamic compositions
  * Negative space techniques for clever visual storytelling
- Typography excellence:
  * Use Inter font family with multiple weights (300, 400, 600, 700, 900)
  * Creative letter-spacing, text-anchor, and alignment
  * For "name" type: Transform text into art with <tspan>, custom paths, effects
- Color mastery:
  * Use 3-5 colors with intentional color theory (complementary, analogous, triadic)
  * Varying opacities (0.3-1.0) for depth and layering
  * Gradients for modern, premium feel
  * Consider color psychology for brand emotion
- Composition principles:
  * Golden ratio and rule of thirds for balance
  * Asymmetry for visual interest when appropriate
  * Whitespace as a design element
  * Scalability from 16px to 1000px+

**SVG STRUCTURE BY LOGO TYPE:**

**For "icon" type (Icon Based - Icon + Brand Name):**
- Use viewBox="0 0 220 80" for horizontal layout with prominent icon
- Create a UNIQUE, CREATIVE icon in the left portion (0-70px width)
- Include the FULL BRAND NAME as text beside the icon (starting x="78")
- Push creative boundaries: abstract concepts, unexpected shapes, clever metaphors
- Use negative space, asymmetry, geometric innovation
- Font size for brand name: 22-26px, weight: 600-700
Example (CREATIVE approach):
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 80" width="220" height="80">
  <defs>
    <style>.text-font{font-family:'Inter',Arial,sans-serif;font-weight:600;}</style>
    <linearGradient id="iconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#HEX1;stop-opacity:1"/>
      <stop offset="100%" style="stop-color:#HEX2;stop-opacity:1"/>
    </linearGradient>
  </defs>
  <g id="icon">
    <!-- CREATIVE icon with depth and meaning -->
    <path d="M20,15 Q35,5 50,15 L50,55 Q35,65 20,55 Z" fill="url(#iconGrad)" opacity="0.9"/>
    <circle cx="35" cy="35" r="8" fill="#HEX3"/>
    <path d="M28,30 L35,35 L42,30" stroke="#HEX4" stroke-width="2" fill="none"/>
  </g>
  <g id="text">
    <text x="78" y="48" class="text-font" font-size="24" fill="#HEX1" letter-spacing="1">BRAND NAME</text>
  </g>
</svg>

**For "name" type (Name Based - Typography IS the Logo):**
- Use viewBox="0 0 200 60" for text-focused layout
- Create ONLY the <g id="text"> group - NO separate icon group
- REVOLUTIONARY typography: Transform text into visual art
- Use creative techniques: custom letterforms, ligatures, overlapping, geometric cuts, 3D effects
- Integrate decorative elements WITHIN letters (not as separate icons)
- Font size: 28-40px, varying weights (300-900) for visual hierarchy
- Think: How can typography alone create WOW factor?
Example (CREATIVE typography):
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
  <defs>
    <style>
      .brand-text{font-family:'Inter',Arial,sans-serif;font-weight:800;letter-spacing:3px;}
      .brand-accent{font-family:'Inter',Arial,sans-serif;font-weight:300;}
    </style>
    <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#HEX1;stop-opacity:1"/>
      <stop offset="50%" style="stop-color:#HEX2;stop-opacity:1"/>
      <stop offset="100%" style="stop-color:#HEX3;stop-opacity:1"/>
    </linearGradient>
    <clipPath id="textClip">
      <text x="100" y="38" class="brand-text" font-size="36" text-anchor="middle">BRAND</text>
    </clipPath>
  </defs>
  <g id="text">
    <!-- Creative background shapes integrated with text -->
    <rect x="10" y="8" width="180" height="44" fill="url(#textGrad)" opacity="0.15" rx="22"/>
    <!-- Main text with gradient and effects -->
    <text x="100" y="38" class="brand-text" font-size="36" fill="url(#textGrad)" text-anchor="middle">BRAND</text>
    <!-- Decorative accent line under text -->
    <path d="M40,45 Q100,42 160,45" stroke="#HEX2" stroke-width="2" fill="none" opacity="0.6"/>
  </g>
</svg>

**For "initial" type (Initial Based - Stylized Initials as Logo):**
- Use viewBox="0 0 100 100" for square, centered layout
- Transform initials into ICONIC, ARTISTIC symbols
- Use geometric abstraction, interlocking letters, negative space mastery
- Create depth through layering, rotation, reflection, dimensional effects
- The initials should work as both letters AND abstract visual symbol
- Font size for initials: 36-52px, weight: 700-900
- Think: How can letters become architecture?
Example (CREATIVE initials):
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <style>.initial-font{font-family:'Inter',Arial,sans-serif;font-weight:900;}</style>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#HEX1;stop-opacity:1"/>
      <stop offset="100%" style="stop-color:#HEX2;stop-opacity:1"/>
    </linearGradient>
  </defs>
  <g id="icon">
    <!-- Geometric container with depth -->
    <rect x="10" y="10" width="80" height="80" fill="url(#bgGrad)" rx="16" opacity="0.9"/>
    <rect x="15" y="15" width="70" height="70" fill="none" stroke="#HEX3" stroke-width="2" rx="12" opacity="0.5"/>
    <!-- Decorative geometric elements -->
    <path d="M20,50 L50,20" stroke="#HEX4" stroke-width="1.5" opacity="0.3"/>
    <path d="M50,80 L80,50" stroke="#HEX4" stroke-width="1.5" opacity="0.3"/>
  </g>
  <g id="text">
    <!-- Stylized initials with creative treatment -->
    <text x="50" y="65" class="initial-font" font-size="44" fill="#HEX3" text-anchor="middle" letter-spacing="2">BN</text>
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

CRITICAL REQUIREMENTS - PUSH CREATIVE BOUNDARIES:

1. **ICON BASED ("icon" type):**
   - Create a UNIQUE, MEMORABLE icon that tells a story
   - AVOID: Generic circles, basic triangles, predictable shapes, cliché symbols
   - DO: Abstract concepts, unexpected geometries, clever visual metaphors, negative space magic
   - Include the FULL brand name as text beside or below the icon
   - Icon should be instantly recognizable and work standalone
   - Use gradients, layering, and sophisticated compositions
   - Examples of excellence: Apple (knowledge), Nike (motion), Airbnb (belonging)

2. **NAME BASED ("name" type):**
   - NO separate icon element whatsoever - TYPOGRAPHY IS EVERYTHING
   - AVOID: Basic fonts, simple text, boring layouts, standard styling
   - DO: Custom letterforms, creative ligatures, geometric cuts, overlapping letters, 3D effects
   - Transform letters into visual art and emotional experiences
   - Use gradients, multiple weights, letter-spacing, decorative elements WITHIN text
   - Create hidden meanings or optical illusions when possible
   - Examples of excellence: Coca-Cola (flow), FedEx (hidden arrow), Google (playful innovation)

3. **INITIAL BASED ("initial" type):**
   - Use ONLY the initials (2-3 letters max) - NO full brand name
   - AVOID: Plain letters in circles, basic monograms, simple stacking
   - DO: Geometric abstraction, interlocking letters, architectural letterforms, dimensional effects
   - Transform initials into abstract art while maintaining readability
   - Use rotation, reflection, overlapping, negative space mastery
   - Create depth through layering and sophisticated compositions
   - Examples of excellence: IBM (technology stripes), HP (circular innovation), CNN (bold urgency)

4. **UNIVERSAL REQUIREMENTS:**
   - Use provided colors with intentional color theory (complementary, analogous, triadic)
   - Apply gradients for modern, premium feel
   - Varying opacities (0.3-1.0) for depth and sophistication
   - Multiple font weights (300-900) for visual hierarchy
   - Ensure scalability from 16px to 1000px+
   - Production-ready, valid SVG markup with proper namespaces

5. **INNOVATION MANDATE:**
   - Every design must be ORIGINAL and DISTINCTIVE
   - Push boundaries while maintaining professionalism
   - Think: "What would Pentagram or Landor create?"
   - Avoid predictable, safe, or generic solutions
   - Create designs that make people say "WOW!"

STRICTLY AVOID:
- Broken XML or invalid SVG syntax
- Missing xmlns namespace declarations
- Overlapping elements that reduce legibility
- Poor spacing or composition
- **Generic shapes**: basic circles, simple triangles, predictable patterns
- **Cliché symbols**: light bulbs for ideas, gears for tech, globes for global
- **Amateur mistakes**: Comic Sans vibes, rainbow gradients, clipart aesthetics
- **Type mixing**: Adding icons to "name" type, or full names to "initial" type
- **Dated designs**: 90s gradients, Web 2.0 glossy effects, outdated trends
- **Lazy solutions**: Copy-paste designs, template-looking logos, uninspired layouts

**CREATIVE INSPIRATION TECHNIQUES:**
- Use unexpected color combinations that still feel harmonious
- Apply the golden ratio for proportions (1.618:1)
- Create visual tension through asymmetry, then resolve it
- Use negative space to hide secondary meanings
- Apply gestalt principles (proximity, similarity, closure)
- Think in 3D even when designing in 2D
- Use optical illusions subtly (like the FedEx arrow)
- Apply color psychology intentionally
- Create movement through implied lines and flow
- Balance complexity with simplicity (sophisticated minimalism)

**FINAL QUALITY CHECK:**
Before finalizing your design, ask yourself:
1. Is this logo TRULY original, or have I seen something similar?
2. Does it tell a story or evoke an emotion?
3. Would it stand out in a lineup of 100 logos?
4. Is it memorable enough that someone could describe it from memory?
5. Does it work at both 16px and 1000px?
6. Does it respect the logo type requirement (icon/name/initial)?
7. Is the SVG code clean, valid, and production-ready?

If you answer "no" to any question, REDESIGN until all answers are "yes".

GOAL: Generate EXCEPTIONAL, ORIGINAL, production-ready SVG logos that perfectly match user preferences, create emotional impact, are immediately usable, professionally designed at world-class level, and scalable across all media formats. Make every logo a masterpiece.
`;

