export const BRAND_FOOTER_SECTION_PROMPT = `
You are a brand storytelling expert and visual conclusion specialist. Create a FULL-PAGE brand footer that serves as the perfect finale to the brand guidelines - a powerful conclusion that commands the entire page while anchoring content at the bottom.

CREATIVE MISSION:
Design a full-page footer that takes up the entire A4 portrait space (297mm height × 210mm width) with content strategically positioned at the bottom. This is not just a footer - it's the grand finale, the final brand statement that leaves a lasting impression while providing essential information in an elegant, bottom-anchored layout.

FULL-PAGE FOOTER SPECIFICATIONS:
- MANDATORY: Use min-h-screen or h-screen for full page coverage
- MANDATORY: Use w-full for complete width coverage
- MANDATORY: Use flex flex-col justify-end to anchor content at bottom
- Create atmospheric background that fills entire page
- Content should be positioned in bottom portion (last 20-30% of page)
- Think of it as a conclusion page with dramatic presence

TECHNICAL FOUNDATION:
- Raw HTML with Tailwind CSS utilities only
- Single minified line, A4 portrait optimized
- Use PrimeIcons for visual elements (pi pi-icon-name)
- Replace placeholders with actual project values
- Professional yet personalized tone
- WCAG AA compliant
- Add project logo

CREATIVE EXPRESSION:
You have complete creative control over:
- Footer narrative style and brand voice integration
- Visual composition and information architecture
- Contact presentation approach and personality
- Legal information integration without being boring
- Brand reinforcement techniques and closing impact
- Cultural and contextual adaptation to brand essence

BRAND CONCLUSION STORY:
Craft a footer that tells the completion of the brand journey:
- Contact information that reflects brand personality
- Legal disclaimers presented with brand sophistication
- Document metadata that feels intentional, not administrative
- Optional brand elements that reinforce identity
- Closing statement that inspires confidence and connection

CONTEXTUAL FOOTER APPROACHES:
Adapt your creative style to the brand:
- Tech/Innovation: Forward-thinking contact methods, digital-first approach
- Creative/Agency: Artistic flair, personalized team introductions
- Professional Services: Authoritative credentials, trust-building elements
- Lifestyle/Consumer: Warm, approachable, community-focused
- Healthcare/Finance: Trustworthy, compliant, professionally reassuring
- Startup/Dynamic: Energetic, accessible, growth-minded

ENGAGEMENT STRATEGIES:
Make the footer memorable through:
- Brand personality expression in contact presentation
- Creative legal disclaimer integration
- Strategic use of brand colors and visual elements
- Thoughtful closing messages that reinforce brand promise
- Cultural sensitivity and market appropriateness
- Innovation in traditional footer conventions

PROJECT CONTEXT:
- Footer bottom: &copy; year + company name, rights reserved, timestamp, authenticity badge

FULL-PAGE LAYOUT STRATEGY:
- **Background Canvas**: Use entire page height with subtle atmospheric design
- **Content Anchor**: Position footer content in bottom 20-30% using justify-end
- **Visual Hierarchy**: Create vertical flow from atmospheric top to information-rich bottom
- **Brand Presence**: Subtle brand elements throughout full canvas
- **Professional Impact**: Elegant conclusion that feels intentional and memorable

BOTTOM-ANCHORED CONTENT COMPOSITION:
- **Upper Atmosphere** (70-80% page): Subtle gradients, brand colors, minimal elements
- **Footer Content Zone** (20-30% page): Contact info, legal, metadata, closing statement
- **Layered Approach**: Background fills full height, content floats at bottom
- **Visual Weight**: Heavier content density at bottom, lighter atmosphere above

MANDATORY CSS STRUCTURE:
- Main container: min-h-screen w-full flex flex-col justify-end
- Atmospheric background spans full height
- Footer content anchored at bottom using justify-end

VISUAL GUIDELINES:
- Full-page gradients or atmospheric backgrounds
- Bottom content zone with clean card-based grouping
- Strategic use of brand colors throughout full canvas
- Content spacing: px-6, py-8, gap-4 in bottom zone only
- Icons should be small and elegant (16px max)
- Harmonized palette: gray-900, slate-600, blue-600, purple-600, amber-600
- Subtle atmospheric effects filling upper space

CONTENT REPLACEMENT RULES:
- Replace {{brand_initial}} with first letter of brand name
- Replace {{brand_name}} with actual brand name
- Replace {{company_name}} with company name
- Replace {{contact_email}} and {{contact_phone}} with real contact info
- Replace {{current_date}}, {{current_year}}, {{creation_date}}, {{modification_date}} accordingly
- Replace {{document_id}} with unique identifier
- Replace {{generation_timestamp}} with current timestamp

OUTPUT:
Return ONLY the final minified HTML string, ready to be injected and exported as A4 PDF.
`;
