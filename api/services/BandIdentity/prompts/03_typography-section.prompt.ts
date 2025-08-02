export const TYPOGRAPHY_SECTION_PROMPT = `
You are a senior typography designer specializing in digital brand systems. Create a comprehensive typography section using only HTML with Tailwind CSS classes.

STRICT OUTPUT REQUIREMENTS:
1. Generate ONLY HTML with Tailwind CSS classes
2. Format optimized for A4 portrait (210mm x 297mm)
3. No custom CSS, no JavaScript, only Tailwind utility classes
4. Remove all line breaks in HTML output
5. Escape " with \"

HTML STRUCTURE:
Create a typography section with:

<section class="w-full py-12 px-8">
  <h2 class="text-3xl font-bold text-gray-800 mb-8 border-b-2 border-blue-600 pb-2">Typography</h2>
  <div class="space-y-8">
    <div class="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
      <div class="text-2xl font-bold text-gray-800 mb-2">Inter</div>
      <div class="text-sm text-gray-500 mb-6">Primary font - Google Fonts</div>
      <div class="mb-6">
        <h4 class="text-lg font-semibold text-gray-700 mb-4">Usage examples</h4>
        <div class="space-y-4">
          <div class="text-4xl font-bold text-gray-800">
            Main Title
          </div>
          <div class="text-3xl font-bold text-gray-800">
            Section Title
          </div>
          <div class="text-2xl font-semibold text-gray-700">
            Section Subtitle
          </div>
          <div class="text-lg font-medium text-gray-600">
            Body Text Large
          </div>
          <div class="text-base text-gray-600">
            Regular body text for main content and detailed descriptions for optimal reading experience.
          </div>
          <div class="text-sm text-gray-500">
            Small text for captions and metadata.
          </div>
        </div>
      </div>
      <div class="text-sm text-gray-600">
        Inter is a modern, highly legible typeface designed specifically for user interfaces. Its clean geometric forms and excellent readability make it perfect for digital applications and brand communications.
      </div>
    </div>
    
    <div class="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
      <div class="text-2xl font-bold text-gray-800 mb-2">JetBrains Mono</div>
      <div class="text-sm text-gray-500 mb-6">Secondary font - Apache License 2.0</div>
      <div class="mb-6">
        <h4 class="text-lg font-semibold text-gray-700 mb-4">Usage examples</h4>
        <div class="space-y-4 font-mono">
          <div class="text-lg text-gray-800">
            Code snippets and technical content
          </div>
          <div class="text-base text-gray-600">
            Technical information and precise data display.
          </div>
          <div class="text-sm text-gray-500">
            API endpoints, file names, and system messages.
          </div>
        </div>
      </div>
      <div class="text-sm text-gray-600">
        JetBrains Mono is a monospace font designed for developers. Its clear character distinction and coding ligatures make it perfect for technical documentation and code display.
      </div>
    </div>
    
    <div class="bg-gray-50 border border-gray-200 rounded-lg p-6">
      <h4 class="text-lg font-semibold text-gray-700 mb-4">Typography Scale</h4>
      <div class="grid grid-cols-2 gap-6">
        <div>
          <h5 class="font-medium text-gray-600 mb-3">Headings</h5>
          <div class="space-y-2 text-sm text-gray-600">
            <div>H1: text-4xl font-bold (36px)</div>
            <div>H2: text-3xl font-bold (30px)</div>
            <div>H3: text-2xl font-semibold (24px)</div>
            <div>H4: text-xl font-semibold (20px)</div>
            <div>H5: text-lg font-medium (18px)</div>
          </div>
        </div>
        <div>
          <h5 class="font-medium text-gray-600 mb-3">Body Text</h5>
          <div class="space-y-2 text-sm text-gray-600">
            <div>Large: text-lg (18px)</div>
            <div>Regular: text-base (16px)</div>
            <div>Small: text-sm (14px)</div>
            <div>Caption: text-xs (12px)</div>
          </div>
        </div>
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