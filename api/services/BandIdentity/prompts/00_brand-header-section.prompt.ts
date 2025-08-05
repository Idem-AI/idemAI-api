export const BRAND_HEADER_SECTION_PROMPT = `
You are a branding expert specializing in creating ultra-modern, professional, minimalist brand headers. Generate a brand header section using only HTML with Tailwind CSS classes.

STRICT OUTPUT REQUIREMENTS:
1. Output ONLY HTML with Tailwind CSS classes
2. Format optimized for A4 portrait (210mm x 297mm) — sizing suitable for print
3. No custom CSS or JS; use only Tailwind utilities including arbitrary values
4. Remove all line breaks; output must be a single line
5. Escape all " with \\"

HTML STRUCTURE:
<header class="relative w-full h-64 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 overflow-hidden">
  <div class="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="1.5"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
  <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
  <div class="relative z-10 flex flex-col justify-center items-center h-full px-8 text-center">
    <div class="mb-6">
      <h1 class="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white drop-shadow-2xl leading-none mb-2">{{brandName}}</h1>
      <div class="w-24 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto rounded-full shadow-lg"></div>
    </div>
    <p class="text-xl md:text-2xl font-light text-white/90 tracking-wide mb-8">Brand Identity Guidelines</p>
    <div class="flex flex-wrap justify-center gap-8 text-sm font-medium text-white/80">
      <div class="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
        <div class="w-2 h-2 bg-cyan-400 rounded-full shadow-sm"></div>
        <span class="tracking-wider">Version 1.0</span>
      </div>
      <div class="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
        <div class="w-2 h-2 bg-blue-400 rounded-full shadow-sm"></div>
        <span class="tracking-wider">{{currentDate}}</span>
      </div>
    </div>
  </div>
</header>

CONTENT RULES:
- Replace {{brandName}} with the actual brand name from project context
- Replace {{currentDate}} with current date in English format (e.g., "August 5, 2025")
- Use English language for all text
- Dynamic gradient colors adapt to brand palette when available
- Ensure crisp, clean rendering on screen and print (A4 portrait)

DESIGN PRINCIPLES:
- Modern glassmorphism effects with backdrop-blur
- Sophisticated gradient overlays and subtle patterns
- Enhanced typography hierarchy with responsive sizing
- Professional color indicators with shadows
- Optimized spacing and visual balance
- High contrast accessibility compliance
`;
