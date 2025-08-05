export const TYPOGRAPHY_SECTION_PROMPT = `
You are a senior typography designer and brand systems expert. Generate a comprehensive, professional typography section using only HTML with Tailwind CSS classes, optimized for A4 portrait layout (210mm × 297mm).

OUTPUT RULES:
- HTML only, using Tailwind utility classes exclusively
- No custom CSS or JavaScript
- One-line minified HTML output
- Include responsive design considerations

USE PROJECT CONTEXT:
- Extract font families, weights, and hierarchy from project description
- Use only English language
- Maintain premium, accessible design standards
- Ensure WCAG AA compliance and print readiness
- Reflect modern digital brand identity

COMPREHENSIVE STRUCTURE:
<section class="w-full py-16 px-8 bg-gradient-to-b from-white to-gray-50">
  <div class="max-w-6xl mx-auto">
    <div class="text-center mb-16">
      <h2 class="text-4xl font-black text-gray-900 mb-4 tracking-tight">Typography System</h2>
      <div class="w-24 h-1 bg-gradient-to-r from-purple-600 to-blue-600 mx-auto mb-6 rounded-full"></div>
      <p class="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">Our typography creates hierarchy, enhances readability, and reinforces brand personality across all communications.</p>
    </div>
    
    <!-- Primary Font Family -->
    <div class="mb-16 bg-white rounded-3xl p-10 shadow-lg border border-gray-100">
      <div class="flex items-center gap-4 mb-8">
        <div class="w-4 h-4 bg-purple-600 rounded-full"></div>
        <h3 class="text-2xl font-bold text-gray-900">Primary Typeface</h3>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <div class="mb-6">
            <h4 class="text-6xl font-black text-gray-900 leading-none mb-2">[Primary Font Name]</h4>
            <p class="text-lg text-gray-600 font-medium">[Font Description & Character]</p>
          </div>
          <div class="space-y-4">
            <div class="flex items-center gap-4">
              <span class="text-sm font-semibold text-gray-700 w-20">Regular</span>
              <span class="text-lg font-normal text-gray-900">The quick brown fox jumps over the lazy dog</span>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-sm font-semibold text-gray-700 w-20">Medium</span>
              <span class="text-lg font-medium text-gray-900">The quick brown fox jumps over the lazy dog</span>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-sm font-semibold text-gray-700 w-20">Bold</span>
              <span class="text-lg font-bold text-gray-900">The quick brown fox jumps over the lazy dog</span>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-sm font-semibold text-gray-700 w-20">Black</span>
              <span class="text-lg font-black text-gray-900">The quick brown fox jumps over the lazy dog</span>
            </div>
          </div>
        </div>
        <div class="space-y-6">
          <div>
            <h5 class="text-lg font-bold text-gray-800 mb-3">Usage Guidelines</h5>
            <ul class="space-y-2 text-sm text-gray-600">
              <li class="flex items-start gap-2"><span class="text-purple-500 mt-1">▪</span>Headlines and primary messaging</li>
              <li class="flex items-start gap-2"><span class="text-purple-500 mt-1">▪</span>Brand names and key identifiers</li>
              <li class="flex items-start gap-2"><span class="text-purple-500 mt-1">▪</span>Call-to-action buttons and emphasis</li>
              <li class="flex items-start gap-2"><span class="text-purple-500 mt-1">▪</span>Digital and print headers</li>
            </ul>
          </div>
          <div class="bg-gray-50 rounded-2xl p-6">
            <h5 class="text-sm font-bold text-gray-800 mb-3">Technical Specifications</h5>
            <div class="grid grid-cols-2 gap-4 text-xs">
              <div><span class="text-gray-500">Format:</span> <span class="font-mono text-gray-700">OpenType, WOFF2</span></div>
              <div><span class="text-gray-500">Weights:</span> <span class="font-mono text-gray-700">400, 500, 700, 900</span></div>
              <div><span class="text-gray-500">Styles:</span> <span class="font-mono text-gray-700">Normal, Italic</span></div>
              <div><span class="text-gray-500">Support:</span> <span class="font-mono text-gray-700">Latin Extended</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Secondary Font Family -->
    <div class="mb-16 bg-white rounded-3xl p-10 shadow-lg border border-gray-100">
      <div class="flex items-center gap-4 mb-8">
        <div class="w-4 h-4 bg-blue-600 rounded-full"></div>
        <h3 class="text-2xl font-bold text-gray-900">Secondary Typeface</h3>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <div class="mb-6">
            <h4 class="text-4xl font-normal text-gray-900 leading-relaxed mb-2">[Secondary Font Name]</h4>
            <p class="text-lg text-gray-600">[Font Description & Purpose]</p>
          </div>
          <div class="space-y-4">
            <div class="flex items-center gap-4">
              <span class="text-sm font-semibold text-gray-700 w-20">Light</span>
              <span class="text-lg font-light text-gray-900">The quick brown fox jumps over the lazy dog</span>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-sm font-semibold text-gray-700 w-20">Regular</span>
              <span class="text-lg font-normal text-gray-900">The quick brown fox jumps over the lazy dog</span>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-sm font-semibold text-gray-700 w-20">Medium</span>
              <span class="text-lg font-medium text-gray-900">The quick brown fox jumps over the lazy dog</span>
            </div>
          </div>
        </div>
        <div class="space-y-6">
          <div>
            <h5 class="text-lg font-bold text-gray-800 mb-3">Usage Guidelines</h5>
            <ul class="space-y-2 text-sm text-gray-600">
              <li class="flex items-start gap-2"><span class="text-blue-500 mt-1">▪</span>Body text and paragraphs</li>
              <li class="flex items-start gap-2"><span class="text-blue-500 mt-1">▪</span>Captions and supporting text</li>
              <li class="flex items-start gap-2"><span class="text-blue-500 mt-1">▪</span>Navigation and interface elements</li>
              <li class="flex items-start gap-2"><span class="text-blue-500 mt-1">▪</span>Long-form content and readability</li>
            </ul>
          </div>
          <div class="bg-gray-50 rounded-2xl p-6">
            <h5 class="text-sm font-bold text-gray-800 mb-3">Optimal Readability</h5>
            <div class="space-y-2 text-xs text-gray-600">
              <div class="flex justify-between"><span>Line Height:</span><span class="font-mono">1.6 - 1.8</span></div>
              <div class="flex justify-between"><span>Letter Spacing:</span><span class="font-mono">0 - 0.02em</span></div>
              <div class="flex justify-between"><span>Min Size:</span><span class="font-mono">14px / 0.875rem</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Typography Scale -->
    <div class="bg-gradient-to-br from-slate-50 to-gray-100 rounded-3xl p-10 border border-gray-200">
      <div class="flex items-center gap-4 mb-8">
        <div class="w-4 h-4 bg-slate-700 rounded-full"></div>
        <h3 class="text-2xl font-bold text-gray-900">Typography Scale</h3>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div class="space-y-6">
          <div class="space-y-4">
            <div class="border-b border-gray-200 pb-4">
              <h1 class="text-6xl font-black text-gray-900 leading-none mb-2">Heading 1</h1>
              <p class="text-sm text-gray-500 font-mono">60px / 3.75rem / font-black</p>
            </div>
            <div class="border-b border-gray-200 pb-4">
              <h2 class="text-4xl font-bold text-gray-900 leading-tight mb-2">Heading 2</h2>
              <p class="text-sm text-gray-500 font-mono">36px / 2.25rem / font-bold</p>
            </div>
            <div class="border-b border-gray-200 pb-4">
              <h3 class="text-2xl font-semibold text-gray-900 leading-snug mb-2">Heading 3</h3>
              <p class="text-sm text-gray-500 font-mono">24px / 1.5rem / font-semibold</p>
            </div>
            <div class="border-b border-gray-200 pb-4">
              <h4 class="text-xl font-medium text-gray-900 leading-relaxed mb-2">Heading 4</h4>
              <p class="text-sm text-gray-500 font-mono">20px / 1.25rem / font-medium</p>
            </div>
          </div>
        </div>
        <div class="space-y-6">
          <div class="space-y-4">
            <div class="border-b border-gray-200 pb-4">
              <p class="text-lg text-gray-900 leading-relaxed mb-2">Body Large - Perfect for introductory paragraphs and important content that needs emphasis.</p>
              <p class="text-sm text-gray-500 font-mono">18px / 1.125rem / font-normal</p>
            </div>
            <div class="border-b border-gray-200 pb-4">
              <p class="text-base text-gray-900 leading-relaxed mb-2">Body Regular - The standard text size for most content, optimized for readability and user experience.</p>
              <p class="text-sm text-gray-500 font-mono">16px / 1rem / font-normal</p>
            </div>
            <div class="border-b border-gray-200 pb-4">
              <p class="text-sm text-gray-700 leading-relaxed mb-2">Body Small - Used for captions, metadata, and supporting information that complements the main content.</p>
              <p class="text-sm text-gray-500 font-mono">14px / 0.875rem / font-normal</p>
            </div>
            <div>
              <p class="text-xs text-gray-600 leading-relaxed mb-2">Caption - Minimal text for fine print, legal information, and micro-interactions.</p>
              <p class="text-sm text-gray-500 font-mono">12px / 0.75rem / font-normal</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

CONTENT REQUIREMENTS:
- Replace [Primary Font Name] and [Secondary Font Name] with actual fonts from project
- Include font descriptions that reflect brand personality
- Ensure all typography choices support brand messaging
- Maintain consistency with overall brand color palette
- Focus on clarity, elegance, and modern digital standards
PROJECT DESCRIPTION:
`;
