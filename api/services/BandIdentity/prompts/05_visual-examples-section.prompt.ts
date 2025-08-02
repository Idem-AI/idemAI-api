export const VISUAL_EXAMPLES_SECTION_PROMPT = `
You are a UI/UX expert creating brand-compliant application examples using only HTML with Tailwind CSS classes.

STRICT OUTPUT REQUIREMENTS:
1. Generate ONLY HTML with Tailwind CSS classes
2. Format optimized for A4 portrait (210mm x 297mm)
3. No custom CSS, no JavaScript, only Tailwind utility classes
4. Remove all line breaks in HTML output
5. Escape " with \"

HTML STRUCTURE:
Create visual examples section with:

<section class="w-full py-12 px-8">
  <h2 class="text-3xl font-bold text-gray-800 mb-8 border-b-2 border-blue-600 pb-2">Visual Examples</h2>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <div class="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
      <h3 class="text-xl font-bold text-gray-800 mb-6">Mobile Application</h3>
      <div class="flex justify-center mb-6">
        <div class="bg-gray-900 rounded-3xl p-2 shadow-lg">
          <div class="bg-white rounded-2xl w-48 h-80 p-4 relative overflow-hidden">
            <!-- Status bar -->
            <div class="bg-gradient-to-r from-purple-600 to-blue-600 h-6 rounded-t-2xl -mx-4 -mt-4 mb-4 flex items-center justify-center">
              <div class="text-white text-xs font-medium">9:41 AM</div>
            </div>
            
            <!-- Header -->
            <div class="flex items-center justify-between mb-4">
              <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <div class="w-4 h-4 bg-white rounded-full"></div>
              </div>
              <div class="text-lg font-bold text-gray-800">Dashboard</div>
              <div class="w-6 h-6 bg-gray-300 rounded"></div>
            </div>
            
            <!-- Content cards -->
            <div class="space-y-3">
              <div class="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-blue-600 rounded-full"></div>
                  <div class="flex-1">
                    <div class="h-2 bg-gray-800 rounded mb-1"></div>
                    <div class="h-2 bg-gray-400 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
              
              <div class="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-green-500 rounded-full"></div>
                  <div class="flex-1">
                    <div class="h-2 bg-gray-800 rounded mb-1"></div>
                    <div class="h-2 bg-gray-400 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
              
              <div class="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-purple-500 rounded-full"></div>
                  <div class="flex-1">
                    <div class="h-2 bg-gray-800 rounded mb-1"></div>
                    <div class="h-2 bg-gray-400 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Bottom navigation -->
            <div class="absolute bottom-4 left-4 right-4 bg-white border border-gray-200 rounded-full p-2 flex justify-around">
              <div class="w-6 h-6 bg-blue-600 rounded-full"></div>
              <div class="w-6 h-6 bg-gray-300 rounded-full"></div>
              <div class="w-6 h-6 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="text-sm text-gray-600">
        Adaptive mobile interface preserving all the brand's visual codes. Intuitive navigation and optimized spacing for touch interaction.
      </div>
    </div>
    
    <div class="visual-card">
      <h3 class="visual-title">Web Interface</h3>
      <div class="visual-representation">
        <svg width="220" height="170" viewBox="0 0 220 170" xmlns="http://www.w3.org/2000/svg">
          <!-- Desktop browser window frame -->
          <rect x="20" y="10" width="180" height="150" rx="5" fill="white" stroke="#e6e6fa" stroke-width="2" />
          <rect x="20" y="10" width="180" height="22" rx="5 5 0 0" fill="#191970" />
          <circle cx="32" cy="21" r="4" fill="#e6e6fa" />
          <circle cx="46" cy="21" r="4" fill="#e6e6fa" />
          <circle cx="60" cy="21" r="4" fill="#e6e6fa" />
          <rect x="75" y="16" width="100" height="10" rx="5" fill="#ffffff50" />
          
          <!-- Website content -->
          <rect x="20" y="32" width="180" height="128" fill="#f8f9fa" />
          
          <!-- Navigation -->
          <rect x="20" y="32" width="180" height="40" fill="white" stroke="#e6e6fa" stroke-width="1" />
          
          <!-- Logo in nav -->
          <g transform="translate(40, 50) scale(0.18)">
            <path d="M10,20 C30,5 90,5 110,20 C90,35 30,35 10,20" stroke="#191970" stroke-width="4" fill="none" stroke-linecap="round" />
            <circle cx="40" cy="20" r="7" fill="#191970" />
            <circle cx="80" cy="20" r="7" fill="#191970" />
          </g>
          
          <!-- Nav links -->
          <rect x="100" y="47" width="20" height="2" rx="1" fill="#191970" />
          <rect x="130" y="47" width="20" height="2" rx="1" fill="#191970" />
          <rect x="160" y="47" width="20" height="2" rx="1" fill="#191970" />
          
          <!-- Hero section -->
          <rect x="35" y="90" width="65" height="6" rx="2" fill="#191970" />
          <rect x="35" y="100" width="55" height="3" rx="1" fill="#adb5bd" />
          <rect x="35" y="106" width="55" height="3" rx="1" fill="#adb5bd" />
          <rect x="35" y="112" width="55" height="3" rx="1" fill="#adb5bd" />
          <rect x="35" y="122" width="40" height="12" rx="6" fill="#191970" />
          <rect x="45" y="127" width="20" height="2" rx="1" fill="white" />
          
          <!-- Hero image -->
          <rect x="120" y="82" width="60" height="50" rx="4" fill="#DDA0DD" opacity="0.7" />
        </svg>
      </div>
      <div class="visual-description">
        Responsive website with a clear navigation structure and visual hierarchy. The brand gradient and typography are optimized for a smooth user experience.
      </div>
    </div>
    
    <div class="visual-card">
      <h3 class="visual-title">Business Documents</h3>
      <div class="visual-representation">
        <svg width="220" height="170" viewBox="0 0 220 170" xmlns="http://www.w3.org/2000/svg">
          <!-- Business card -->
          <rect x="35" y="20" width="150" height="85" rx="5" fill="white" stroke="#e6e6fa" stroke-width="1" />
          
          <!-- Logo on card -->
          <g transform="translate(45, 45) scale(0.25)">
            <path d="M10,20 C30,5 90,5 110,20 C90,35 30,35 10,20" stroke="#191970" stroke-width="4" fill="none" stroke-linecap="round" />
            <circle cx="40" cy="20" r="7" fill="#191970" />
            <circle cx="80" cy="20" r="7" fill="#191970" />
          </g>
          
          <!-- Contact info -->
          <rect x="110" y="40" width="60" height="3" rx="1" fill="#191970" />
          <rect x="110" y="48" width="40" height="2" rx="1" fill="#adb5bd" />
          <rect x="110" y="56" width="50" height="2" rx="1" fill="#adb5bd" />
          <rect x="110" y="64" width="45" height="2" rx="1" fill="#adb5bd" />
          
          <!-- Letterhead preview -->
          <rect x="35" y="115" width="150" height="35" rx="0" fill="white" stroke="#e6e6fa" stroke-width="1" />
          <rect x="35" y="115" width="150" height="10" fill="#191970" />
          
          <!-- Logo on letterhead -->
          <g transform="translate(45, 120) scale(0.15)">
            <path d="M10,20 C30,5 90,5 110,20 C90,35 30,35 10,20" stroke="white" stroke-width="4" fill="none" stroke-linecap="round" />
            <circle cx="40" cy="20" r="7" fill="white" />
            <circle cx="80" cy="20" r="7" fill="white" />
          </g>
          
          <!-- Document content lines -->
          <rect x="45" y="135" width="60" height="2" rx="1" fill="#191970" />
          <rect x="45" y="140" width="120" height="1" rx="0.5" fill="#adb5bd" />
      </div>
    </div>
  </div>
</section>

CONTENT RULES:
- Generate 2 core visual examples (mobile and web applications)
- Include brief, practical descriptions for each example
- Focus on brand consistency and user experience
- Use modern UI patterns and layouts
- Emphasize accessibility and usability principles
- Essential styles only
- No redundant elements

OPTIMIZATION TECHNIQUES:
1. Style compression:
   - Use shorthand properties
   - Minimal styling
   - Reuse brand variables

2. Content prioritization:
   - Show only key UI patterns
   - Skip decorative elements
   - Focus on layout principles

PROJECT CONTEXT:`;