export const BRAND_HEADER_SECTION_PROMPT = `
You are a branding expert specializing in creating modern, visually striking brand headers. Create a brand header section using only HTML with Tailwind CSS classes.

STRICT OUTPUT REQUIREMENTS:
1. Generate ONLY HTML with Tailwind CSS classes
2. Format optimized for A4 portrait (210mm x 297mm) - use appropriate sizing
3. No custom CSS, no JavaScript, only Tailwind utility classes
4. Remove all line breaks in HTML output
5. Escape " with \"

HTML STRUCTURE:
Create a header section with:

<header class="w-full h-64 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 relative overflow-hidden flex items-center justify-center text-white">
  <!-- Grid overlay pattern -->
  <div class="absolute inset-0 opacity-10">
    <div class="w-full h-full" style="background-image: linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px); background-size: 20px 20px;"></div>
  </div>
  
  <!-- Content -->
  <div class="relative z-10 text-center px-8">
    <h1 class="text-5xl font-bold mb-2 tracking-tight drop-shadow-lg">{{brandName}}</h1>
    <div class="text-xl opacity-90 mb-6 font-light">Brand Guidelines</div>
    <div class="flex justify-center space-x-8 text-sm">
      <div class="flex items-center space-x-2">
        <div class="w-2 h-2 bg-white rounded-full"></div>
        <span>Version 1.0</span>
      </div>
      <div class="flex items-center space-x-2">
        <div class="w-2 h-2 bg-white rounded-full"></div>
        <span>Updated: {{currentDate}}</span>
      </div>
    </div>
  </div>
</header>

CONTENT RULES:
- Replace {{brandName}} with the actual brand name from project context
- Replace {{currentDate}} with current date in English format (e.g., "June 12, 2023")
- Use English language for all text content
- Ensure responsive design works well on A4 portrait format

DESIGN PRINCIPLES:
1. A4 Portrait Optimization:
   - Header height appropriate for document format (h-64 = 16rem)
   - Text sizes optimized for print/PDF generation
   - Proper spacing for document layout

2. Modern Aesthetic:
   - Gradient background using Tailwind's gradient utilities
   - Grid overlay pattern using inline styles (minimal custom CSS)
   - Premium, tech-forward appearance

3. Typography:
   - Large, bold brand name (text-5xl font-bold)
   - Elegant subtitle with lighter weight
   - Clean metadata display with visual indicators
- The gradient background (from [primaryColor] to [secondaryColor]) should match the template style
- The header should be designed to look perfect both on screen and when printed
`;
