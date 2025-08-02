export const LOGO_SYSTEM_SECTION_PROMPT = `
You are a brand identity expert specializing in logo systems. Create a comprehensive logo system section using only HTML with Tailwind CSS classes.

STRICT OUTPUT REQUIREMENTS:
1. Generate ONLY HTML with Tailwind CSS classes
2. Format optimized for A4 portrait (210mm x 297mm)
3. No custom CSS, no JavaScript, only Tailwind utility classes
4. Remove all line breaks in HTML output
5. Escape " with \"

HTML STRUCTURE:
Create a logo system section with:

<section class="w-full py-12 px-8">
  <h2 class="text-3xl font-bold text-gray-800 mb-8 border-b-2 border-blue-600 pb-2">Logo & Variations</h2>
  <div class="grid grid-cols-2 gap-8">
    <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h4 class="text-lg font-semibold text-gray-700 mb-4">Primary Logo</h4>
      <div class="bg-gray-50 rounded-lg p-8 mb-4 flex items-center justify-center min-h-32">
        <!-- SVG Logo Code Here -->
        <div class="text-gray-400 text-sm">Primary Logo SVG</div>
      </div>
      <div class="text-sm text-gray-600">
        <p>Primary version of the logo, used on white or light backgrounds. The symbol's gradient and typography create a strong and recognizable visual identity.</p>
      </div>
    </div>
    
    <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h4 class="text-lg font-semibold text-gray-700 mb-4">Monochrome Version</h4>
      <div class="bg-gray-50 rounded-lg p-8 mb-4 flex items-center justify-center min-h-32">
        <!-- SVG Monochrome Logo Code Here -->
        <div class="text-gray-400 text-sm">Monochrome Logo SVG</div>
      </div>
      <div class="text-sm text-gray-600">
        <p>Black version for applications where color is not possible. It maintains the visual identity while ensuring optimal readability.</p>
      </div>
    </div>
    
    <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h4 class="text-lg font-semibold text-gray-700 mb-4">Negative Version</h4>
      <div class="bg-gray-800 rounded-lg p-8 mb-4 flex items-center justify-center min-h-32">
        <!-- SVG Negative Logo Code Here -->
        <div class="text-gray-400 text-sm">White Logo SVG</div>
      </div>
      <div class="text-sm text-gray-600">
        <p>White version for use on dark backgrounds. Elements have been optimized to maintain visual impact regardless of background color.</p>
      </div>
    </div>
    
    <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h4 class="text-lg font-semibold text-gray-700 mb-4">Protection Space</h4>
      <div class="bg-gray-50 rounded-lg p-8 mb-4 flex items-center justify-center min-h-32 relative">
        <!-- SVG Logo with Protection Space Visualization -->
        <div class="border-2 border-dashed border-blue-300 p-4">
          <div class="text-gray-400 text-sm">Logo with Clear Space</div>
        </div>
      </div>
      <div class="text-sm text-gray-600">
        <p>A minimum space equivalent to the height of the symbol must be maintained around the logo to preserve its visual impact.</p>
      </div>
    </div>
  </div>
</section>

DESIGN RULES:
- Include exactly these logo variants:
  • Primary Logo: Full-color version of the selected brand logo
  • Monochrome Version: Black version for single-color applications
  • Negative Version: White version for dark backgrounds
  • Protection Space: Visual guide for minimum clear space around the logo
- Insert the actual SVG code for the selected logo in each variant
- If no logo is specified, use placeholder SVGs that match the style of the template
- Use French language for all labels and descriptions
- Maintain the exact HTML structure of the template
- Remove all line breaks in HTML when generating
- Escape " with \"

TECHNICAL SPECS:
1. SVG Requirements:
   - ViewBox set to "0 0 120 40" for consistency
   - Clean SVG code with no unnecessary elements
   - Semantic IDs for key components (e.g., 'logo-symbol', 'logo-text')
   - Ensure all logos render perfectly at sizes from 32px to 240px

2. Variants Technical Guidelines:
   - Primary: Full gradient version (#6a11cb to #2575fc) as defined in the project
   - Monochrome: Pure black (#000000) version with appropriate adjustments for legibility
   - Negative: Pure white (#ffffff) version optimized for dark backgrounds
   - Protection Space: Visual guide showing clear space equal to symbol height

3. Accessibility Requirements:
   - Ensure logo is recognizable at small sizes (minimum 32px width)
   - Maintain strong contrast between elements
   - Test legibility in various contexts

CONTEXT:
- The logo system is a core component of the brand identity
- Each variant serves a specific purpose in different applications
- The design should align with the premium, modern aesthetic of the  template
- Use the existing brand logo if available, otherwise create placeholder SVGs that match the template style
- All text content should be in French to match the template
`;
