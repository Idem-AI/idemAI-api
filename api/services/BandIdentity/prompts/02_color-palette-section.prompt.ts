export const COLOR_PALETTE_SECTION_PROMPT = `
You are a brand identity expert and color theorist. Based on the project description, generate a sophisticated, modern color palette section using only HTML with Tailwind CSS utility classes.

STRICT OUTPUT RULES:
- Output: HTML only, NO custom CSS or JS
- Use Tailwind utility classes ONLY (including arbitrary values like bg-[#hex])
- Remove all line breaks (output must be one single line)
- Escape all " with \\"
- Layout must fit an A4 portrait (210mm x 297mm)

GOAL:
Display six color cards in a responsive grid showcasing:
1. Primary Brand Color
2. Secondary Brand Color
3. Accent Color
4. Background Light
5. Background Dark
6. Text Primary

EACH COLOR CARD MUST INCLUDE:
- Large color preview with gradient overlay
- Color name with descriptive subtitle
- Exact hex code with copy indicator
- Color psychology and usage description
- Specific use cases with icons
- Accessibility contrast information

INSTRUCTION:
- Use bg-[#xxxxxx] for dynamic hex colors
- Include hover effects and micro-interactions
- Add visual hierarchy with typography scales
- Ensure proper spacing and visual balance

TEMPLATE STRUCTURE:
<section class="w-full py-16 px-8 bg-gradient-to-b from-gray-50 to-white">
  <div class="max-w-7xl mx-auto">
    <div class="text-center mb-16">
      <h2 class="text-4xl font-black text-gray-900 mb-4 tracking-tight">Color Palette</h2>
      <div class="w-24 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 mx-auto mb-6 rounded-full"></div>
      <p class="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">Our carefully curated color system ensures consistency, accessibility, and emotional resonance across all brand touchpoints.</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <!-- Primary Color Card -->
      <div class="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-gray-200">
        <div class="relative mb-6">
          <div class="w-full h-32 rounded-2xl bg-[#hex] shadow-lg relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
            <div class="absolute bottom-3 right-3 bg-black/20 backdrop-blur-sm rounded-lg px-3 py-1">
              <span class="text-white text-xs font-mono">#HEX</span>
            </div>
          </div>
        </div>
        <div class="space-y-4">
          <div>
            <h3 class="text-xl font-bold text-gray-900 mb-1">[Color Name]</h3>
            <p class="text-sm text-gray-500 font-medium">[Color Subtitle]</p>
          </div>
          <p class="text-sm text-gray-700 leading-relaxed">[Color psychology and emotional impact description]</p>
          <div class="space-y-3">
            <h4 class="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <div class="w-2 h-2 bg-indigo-500 rounded-full"></div>
              Primary Usage
            </h4>
            <ul class="text-sm text-gray-600 space-y-2 pl-4">
              <li class="flex items-start gap-2">
                <span class="text-indigo-400 mt-1 text-xs">▪</span>
                <span>[Specific use case 1]</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-indigo-400 mt-1 text-xs">▪</span>
                <span>[Specific use case 2]</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-indigo-400 mt-1 text-xs">▪</span>
                <span>[Specific use case 3]</span>
              </li>
            </ul>
          </div>
          <div class="pt-4 border-t border-gray-100">
            <div class="flex items-center justify-between text-xs">
              <span class="text-gray-500">Contrast Ratio</span>
              <span class="font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded">[AA/AAA]</span>
            </div>
          </div>
        </div>
      </div>
      <!-- Repeat similar structure for other 5 colors -->
    </div>
    <div class="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-100">
      <div class="flex items-start gap-4">
        <div class="w-8 h-8 bg-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
          <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-bold text-blue-900 mb-2">Color Guidelines</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div class="space-y-2">
              <h4 class="font-semibold">Accessibility</h4>
              <ul class="space-y-1">
                <li>• Maintain WCAG AA contrast ratios (4.5:1 minimum)</li>
                <li>• Test color combinations across different devices</li>
                <li>• Consider color blindness accessibility</li>
              </ul>
            </div>
            <div class="space-y-2">
              <h4 class="font-semibold">Implementation</h4>
              <ul class="space-y-1">
                <li>• Use exact hex values for digital applications</li>
                <li>• Provide CMYK values for print materials</li>
                <li>• Maintain color consistency across all platforms</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

CONSTRAINTS:
- Use English only
- Ensure WCAG AA compliance for all color combinations
- Colors must reflect premium, innovative, trustworthy brand traits
- Generate appropriate hex values based on project description
- Include accessibility information and contrast ratios
- Provide comprehensive usage guidelines

PROJECT DESCRIPTION:
"{{ insert project description here }}"
`;
