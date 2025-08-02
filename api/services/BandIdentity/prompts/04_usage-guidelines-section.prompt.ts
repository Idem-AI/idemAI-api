export const USAGE_GUIDELINES_SECTION_PROMPT = `
You are a brand systems expert specialized in creating actionable design guidelines for digital products. Create comprehensive usage guidelines using only HTML with Tailwind CSS classes.

STRICT OUTPUT REQUIREMENTS:
1. Generate ONLY HTML with Tailwind CSS classes
2. Format optimized for A4 portrait (210mm x 297mm)
3. No custom CSS, no JavaScript, only Tailwind utility classes
4. Remove all line breaks in HTML output
5. Escape " with \"

HTML STRUCTURE:
Create usage guidelines with:

<section class="w-full py-12 px-8">
  <h2 class="text-3xl font-bold text-gray-800 mb-8 border-b-2 border-blue-600 pb-2">Usage Guidelines</h2>
  <div class="mb-8">
    <p class="text-lg text-gray-600 leading-relaxed">
      To preserve the brand's visual identity, it is essential to follow these usage guidelines. 
      They ensure optimal consistency and recognition across all applications.
    </p>
  </div>
  
  <div class="space-y-12">
    <!-- Logo Guidelines Section -->
    <div class="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
      <div class="mb-6">
        <div class="flex items-center mb-3">
          <span class="w-4 h-4 bg-blue-600 rounded-sm mr-3"></span>
          <h3 class="text-2xl font-bold text-gray-800">Logo Guidelines</h3>
        </div>
        <p class="text-gray-600">Directives for the correct use of the logo in all communication supports.</p>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h4 class="text-lg font-semibold text-gray-700 mb-4">Fundamental Principles</h4>
          <ul class="space-y-3 text-gray-600">
            <li class="flex items-start">
              <span class="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Always respect the integrity of the logo by maintaining its original proportions.
            </li>
            <li class="flex items-start">
              <span class="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Ensure that the logo is always clearly visible and readable on all supports.
            </li>
            <li class="flex items-start">
              <span class="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Maintain a protection zone equivalent to the height of the letter 'L' all around the logo.
            </li>
            <li class="flex items-start">
              <span class="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Use only the official versions of the logo provided in this guide.
            </li>
          </ul>
        </div>
        
        <div class="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div class="text-center">
            <div class="bg-white border-2 border-dashed border-gray-300 p-8 rounded-lg">
              <div class="bg-blue-600 text-white font-bold text-xl py-4 px-8 rounded">
                LOGO
              </div>
              <p class="text-sm text-gray-500 mt-4">Protection zone visualization</p>
            </div>
          </div>
        </div>
              
              <!-- Zone de protection -->
              <rect x="25" y="25" width="250" height="150" stroke="#28a745" stroke-width="1" stroke-dasharray="5,5" fill="none" />
              <text x="150" y="195" text-anchor="middle" fill="#555" font-family="Arial" font-size="12">Zone de protection</text>
            </svg>
          </div>
        </div>
      </div>
      
      <!-- To do / To avoid -->
      <div class="guidelines-row guidelines-dodont">
        <div class="guidelines-col">
          <h4 class="guidelines-subtitle">To do</h4>
          <ul class="guidelines-list good-practices">
            <li>Use the logo on light or dark backgrounds that offer good contrast</li>
            <li>Conserve the protection zone around the logo</li>
            <li>Use the negative version on dark backgrounds</li>
            <li>Highlight the logo in its complete form when space permits</li>
          </ul>
          <div class="example-visual do-example">
            <svg width="100%" height="80mm" viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg">
              <!-- Bon exemple -->
              <rect x="25" y="20" width="150" height="120" fill="#f8f9fa" stroke="#e9ecef" />
              <rect x="50" y="60" width="100" height="40" fill="#191970" rx="4" />
              <text x="100" y="85" text-anchor="middle" fill="white" font-family="Arial" font-size="16" font-weight="bold">LOGO</text>
              <rect x="50" y="60" width="100" height="40" stroke="#28a745" stroke-width="1" stroke-dasharray="5,5" fill="none" rx="4" />
              <text x="100" y="130" text-anchor="middle" fill="#28a745" font-family="Arial" font-size="12">✔ Good contrast and respected area</text>
            </svg>
          </div>
        </div>

        <div class="guidelines-col">
          <h4 class="guidelines-subtitle">To avoid</h4>
          <ul class="guidelines-list bad-practices">
            <li>Distort or resize the logo disproportionally</li>
            <li>Add unauthorized effects (shadows, contours, highlights)</li>
            <li>Place the logo on backgrounds with insufficient contrast</li>
            <li>Use the logo at a size smaller than the recommended minimum size</li>
          </ul>
          <div class="example-visual dont-example">
            <svg width="100%" height="80mm" viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg">
              <!-- Mauvais exemple -->
              <rect x="25" y="20" width="150" height="120" fill="#f8f9fa" stroke="#e9ecef" />
              <rect x="30" y="30" width="140" height="40" fill="#e9ecef" rx="4" />
              <text x="100" y="55" text-anchor="middle" fill="#adb5bd" font-family="Arial" font-size="16" font-weight="bold">LOGO</text>
              <line x1="140" y1="30" x2="170" y2="60" stroke="#dc3545" stroke-width="2" />
              <line x1="170" y1="30" x2="140" y2="60" stroke="#dc3545" stroke-width="2" />
              <text x="100" y="130" text-anchor="middle" fill="#dc3545" font-family="Arial" font-size="12">✖ Insufficient contrast</text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  
  <!-- Typography Guidelines Section -->
  <div class="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
    <div class="mb-6">
      <div class="flex items-center mb-3">
        <span class="w-4 h-4 bg-blue-600 rounded-sm mr-3"></span>
        <h3 class="text-2xl font-bold text-gray-800">Typography Guidelines</h3>
      </div>
      <p class="text-gray-600">Guidelines for consistent typography usage across all brand materials.</p>
    
    <!-- Color Guidelines Section -->
    <div class="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
      <div class="mb-6">
        <div class="flex items-center mb-3">
          <span class="w-4 h-4 bg-blue-600 rounded-sm mr-3"></span>
          <h3 class="text-2xl font-bold text-gray-800">Color Guidelines</h3>
      </div>
      
      <div class="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h5 class="font-semibold text-gray-700 mb-4">Typography Hierarchy</h5>
        <div class="space-y-3">
          <div class="text-2xl font-bold text-gray-800">Main Heading</div>
          <div class="text-xl font-semibold text-gray-700">Section Heading</div>
          <div class="text-base text-gray-600">Body text example</div>
          <div class="text-sm text-gray-500 font-mono">Code example</div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Color Guidelines Section -->
  <div class="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
    <div class="mb-6">
      <div class="flex items-center mb-3">
        <span class="w-4 h-4 bg-blue-600 rounded-sm mr-3"></span>
        <h3 class="text-2xl font-bold text-gray-800">Color Guidelines</h3>
      </div>
      <p class="text-gray-600">Guidelines for proper color usage to maintain brand consistency.</p>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <h4 class="text-lg font-semibold text-gray-700 mb-4">Color Usage Rules</h4>
        <ul class="space-y-3 text-gray-600">
          <li class="flex items-start">
            <span class="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            Use primary colors for main brand elements and call-to-actions.
          </li>
          <li class="flex items-start">
            <span class="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            Apply secondary colors for supporting elements and backgrounds.
          </li>
          <li class="flex items-start">
            <span class="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            Maintain accessibility standards with proper contrast ratios.
          </li>
          <li class="flex items-start">
            <span class="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            Use accent colors sparingly for highlights and important elements.
          </li>
        </ul>
      </div>
      
      <div class="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h5 class="font-semibold text-gray-700 mb-4">Color Palette</h5>
        <div class="grid grid-cols-3 gap-3">
          <div class="text-center">
            <div class="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded mb-2"></div>
            <div class="text-xs text-gray-600">Primary</div>
          </div>
          <div class="text-center">
            <div class="w-full h-12 bg-gray-600 rounded mb-2"></div>
            <div class="text-xs text-gray-600">Secondary</div>
          </div>
          <div class="text-center">
            <div class="w-full h-12 bg-green-500 rounded mb-2"></div>
            <div class="text-xs text-gray-600">Accent</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

CONTENT RULES:
- Generate comprehensive usage guidelines for logo, typography, and colors
- Use practical examples and clear visual representations
- Include accessibility considerations and best practices
- Maintain professional tone and clear instructions
- Focus on actionable guidelines for designers and developers
   - Approved backgrounds

2. Color Rules:
   - Accessible combinations
   - Contrast ratios
   - Overlay text rules

3. Typography:
   - Complete type scale
   - Line height ratios
   - Responsive breakpoints

PROJECT CONTEXT:`;