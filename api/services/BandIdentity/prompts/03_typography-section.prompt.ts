export const TYPOGRAPHY_SECTION_PROMPT = `
You are a senior typography designer specializing in digital brand systems. Create a comprehensive typography section that matches exactly the  branding template style.

STRICT OUTPUT REQUIREMENTS:
1. Generate ONLY one <section> with this exact structure to match the  template. Note that all content will be placed inside a parent element with class 'branding-document':
<section class="section">
  <h2 class="section-title">Typography</h2>
  <div class="fonts-container">
    <div class="font-card">
      <div class="font-name">Exo 2</div>
      <div class="font-meta">Primary font - Open Font License</div>
      <div class="font-specimen">
        <h4>Usage examples</h4>
        <div class="font-example" style="font-family: 'Exo 2', sans-serif; font-size: 2.5rem; font-weight: 700;">
          Main title
        </div>
        <div class="font-example" style="font-family: 'Exo 2', sans-serif; font-size: 2rem; font-weight: 700;">
          Section title
        </div>
        <div class="font-example" style="font-family: 'Exo 2', sans-serif; font-size: 1.5rem; font-weight: 600;">
          Section subtitle
        </div>
      </div>
      <div class="font-rationale">
        The modern and geometric forms of Exo 2 convey an innovative sentiment, suitable for a technological application. Its solid structure offers excellent readability for titles and headers.
      </div>
    </div>
    
    <div class="font-card">
      <div class="font-name">Ubuntu Mono</div>
      <div class="font-meta">Secondary font - Ubuntu Font Licence</div>
      <div class="font-specimen">
        <h4>Usage examples</h4>
        <div class="font-example" style="font-family: 'Ubuntu Mono', monospace; font-size: 1rem">
          Main content text and detailed descriptions for optimal reading.
        </div>
        <div class="font-example" style="font-family: 'Ubuntu Mono', monospace; font-size: 0.9rem">
          Technical information and precise data.
        </div>
      </div>
      <div class="font-rationale">
        Ubuntu Mono, with its monospace style, brings a technical and precise feeling, perfect for displaying data or code snippets. Its clarity improves the readability of the main text.
      </div>
    </div>
  </div>
</section>

DESIGN RULES:
- Use exactly these fonts to match the  template:
  • Primary font: Exo 2 (300 Light, 400 Regular, 600 SemiBold, 700 Bold)
  • Secondary font: Roboto (300 Light, 400 Regular, 500 Medium)
- Show exactly the hierarchy samples and weights as shown in the template
- Use English language for all labels and text to match the template
- Maintain the exact HTML structure of the template
- Remove all line breaks in HTML when generating
- Escape " with \"

TECHNICAL SPECS (to be included in the usage rules):
1. Web Font Integration:
   - Use Google Fonts for optimal loading
   - Load only the necessary weight variants

2. Accessibility Rules:
   - Minimum 16px for the main text
   - Line height 1.5 for the body text
   - WCAG AA contrast compliance

3. Usage Guidelines:
   - Precise title hierarchy (H1-H3)
   - Adaptive sizes for mobile screens
   - Consistent use of weights according to the hierarchy

CONTEXT:
- The brand identity is for "", a premium tech company
- The typography should evoke innovation, trust, and a high-end user experience
- The typography system should be consistent with the modern and minimal design language shown in the template
- Use English language for all text content to match the template`;