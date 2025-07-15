export const BRAND_HEADER_SECTION_PROMPT = `
You are a branding expert specializing in creating modern, visually striking brand headers. Create a brand header section that matches exactly the Sozy branding template style.

STRICT OUTPUT REQUIREMENTS:
1. Generate ONLY one <header> with this exact structure to match the Sozy template:
<header class="brand-header-modern">
  <div class="header-grid-overlay"></div>
  <div class="header-content">
    <h1>[BRAND_NAME]</h1>
    <div class="subtitle">Charte Graphique</div>
    <div class="project-info">
      <div class="info-item">
        <div class="info-icon"></div>
        <span>Version 1.0</span>
      </div>
      <div class="info-item">
        <div class="info-icon"></div>
        <span>Mise à jour: [CURRENT_DATE]</span>
      </div>
    </div>
  </div>
</header>

CONTENT RULES:
- Replace [BRAND_NAME] with the actual brand name provided in the project context
- Replace [CURRENT_DATE] with the current date in French format (e.g., "12 juin 2023")
- Use French language for all text content to match the template
- Remove all line breaks in HTML output
- Escape " with \"

DESIGN PRINCIPLES:
1. Modern Aesthetic:
   - The header has a distinctive gradient background similar to the Sozy template
   - A subtle grid overlay pattern adds depth and visual interest
   - The design should feel premium and tech-forward

2. Typography:
   - The brand name is displayed prominently in a bold, large font
   - "Charte Graphique" is displayed in a secondary style as a subtitle
   - Version and date information have a clean, minimalist style

3. Visual Balance:
   - Content is centered for visual balance
   - Adequate spacing between elements ensures clean readability
   - Subtle animations or hover effects can be suggested in comments

CONTEXT:
- This header is the first visual element of the brand identity document
- It should immediately establish the premium, modern feel of the brand
- The gradient background (from #6a11cb to #2575fc) should match the template style
- The header should be designed to look perfect both on screen and when printed
`;
