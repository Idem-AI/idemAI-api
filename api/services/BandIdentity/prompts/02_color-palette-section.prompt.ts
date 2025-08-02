export const COLOR_PALETTE_SECTION_PROMPT = `
You are a color psychology expert and brand identity specialist. Create a comprehensive color palette section using only HTML with Tailwind CSS classes.

STRICT OUTPUT REQUIREMENTS:
1. Generate ONLY HTML with Tailwind CSS classes
2. Format optimized for A4 portrait (210mm x 297mm)
3. No custom CSS, no JavaScript, only Tailwind utility classes
4. Remove all line breaks in HTML output
5. Escape " with \"

HTML STRUCTURE:
Create a color palette section with:

<section class="w-full py-12 px-8">
  <h2 class="text-3xl font-bold text-gray-800 mb-8 border-b-2 border-blue-600 pb-2">Color Palette</h2>
  <div class="grid grid-cols-3 gap-6">
    <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div class="w-full h-24 rounded-lg mb-4 bg-gradient-to-r from-purple-600 to-blue-600"></div>
      <div class="font-semibold text-gray-800 mb-1">Primary</div>
      <div class="text-sm text-gray-500 mb-3">#6366f1</div>
      <div class="text-sm text-gray-600 mb-4">
        Primary color expressing confidence and intelligence, essential for a human-centered application.
      </div>
      <div class="text-sm">
        <h5 class="font-medium text-gray-700 mb-2">Usage</h5>
        <ul class="text-gray-600 space-y-1">
          <li>• Primary elements</li>
          <li>• Accent text</li>
          <li>• Backgrounds</li>
        </ul>
      </div>
    </div>
    
    <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div class="w-full h-24 rounded-lg mb-4 bg-gray-600"></div>
      <div class="font-semibold text-gray-800 mb-1">Secondary</div>
      <div class="text-sm text-gray-500 mb-3">#4b5563</div>
      <div class="text-sm text-gray-600 mb-4">
        Secondary color for supporting elements and professional balance.
      </div>
      <div class="text-sm">
        <h5 class="font-medium text-gray-700 mb-2">Usage</h5>
        <ul class="text-gray-600 space-y-1">
          <li>• Secondary buttons</li>
          <li>• Supporting text</li>
          <li>• Borders</li>
        </ul>
      </div>
    </div>
    
    <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div class="w-full h-24 rounded-lg mb-4 bg-green-500"></div>
      <div class="font-semibold text-gray-800 mb-1">Accent</div>
      <div class="text-sm text-gray-500 mb-3">#10b981</div>
      <div class="text-sm text-gray-600 mb-4">
        Accent color for call-to-actions and highlights.
      </div>
      <div class="text-sm">
        <h5 class="font-medium text-gray-700 mb-2">Usage</h5>
        <ul class="text-gray-600 space-y-1">
          <li>• CTA buttons</li>
          <li>• Success states</li>
          <li>• Highlights</li>
        </ul>
      </div>
    </div>
    
    <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div class="w-full h-24 rounded-lg mb-4 bg-gray-50 border border-gray-200"></div>
      <div class="font-semibold text-gray-800 mb-1">Background Light</div>
      <div class="text-sm text-gray-500 mb-3">#f9fafb</div>
      <div class="text-sm text-gray-600 mb-4">
        Light background for clean, minimal interfaces.
      </div>
      <div class="text-sm">
        <h5 class="font-medium text-gray-700 mb-2">Usage</h5>
        <ul class="text-gray-600 space-y-1">
          <li>• Page backgrounds</li>
          <li>• Card backgrounds</li>
          <li>• Light mode</li>
        </ul>
      </div>
    </div>
    
    <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div class="w-full h-24 rounded-lg mb-4 bg-gray-900"></div>
      <div class="font-semibold text-gray-800 mb-1">Background Dark</div>
      <div class="text-sm text-gray-500 mb-3">#111827</div>
      <div class="text-sm text-gray-600 mb-4">
        Dark background for modern, premium interfaces.
      </div>
      <div class="text-sm">
        <h5 class="font-medium text-gray-700 mb-2">Usage</h5>
        <ul class="text-gray-600 space-y-1">
          <li>• Dark mode</li>
          <li>• Headers</li>
          <li>• Premium sections</li>
        </ul>
      </div>
    </div>
    
    <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div class="w-full h-24 rounded-lg mb-4 bg-gray-800"></div>
      <div class="font-semibold text-gray-800 mb-1">Text Primary</div>
      <div class="text-sm text-gray-500 mb-3">#1f2937</div>
      <div class="text-sm text-gray-600 mb-4">
        Primary text color for headings and important content.
      </div>
      <div class="text-sm">
        <h5 class="font-medium text-gray-700 mb-2">Usage</h5>
        <ul class="text-gray-600 space-y-1">
          <li>• Headings</li>
          <li>• Important text</li>
          <li>• Labels</li>
        </ul>
      </div>
    </div>
  </div>
</section>

CONTENT RULES:
- Include exactly these color types to match the  template:
  • Primary color: Gradient from purple to blue (#6a11cb to #2575fc) as shown in the template
  • Secondary color: A complementary color with professional appeal
  • Accent color: For call-to-actions and highlights
  • Background light color: For light mode interfaces
  • Background dark color: For dark mode interfaces
  • Text colors: For body text and headings
- For each color:
  • Include exact hex values (e.g., #6a11cb)
  • Write a brief description of the color's psychology and purpose
  • Use English language for all labels ("Primary Color", "Secondary Color", etc.)
- Maintain the exact HTML structure of the template
- Escape " with \"

DESIGN PRINCIPLES:
1. Follow the  Template Style:
   - Use linear gradients for primary and secondary colors when applicable
   - Maintain the modern, premium aesthetic of the template
   - Follow the same color card structure for consistency

2. Accessibility:
   - Ensure AA contrast (4.5:1) for text colors
   - Provide considerations for both light and dark modes

3. Color Psychology:
   - Align colors with the brand's premium, trustworthy, and innovative personality
   - Use color theory to create a harmonious and purposeful palette

CONTEXT:
- The brand identity is for "", a premium tech company
- The palette should convey innovation, trust, and a high-end user experience
- The color system should be cohesive with the gradient-based design language shown in the template
- Use English language for all text content to match the template
`;