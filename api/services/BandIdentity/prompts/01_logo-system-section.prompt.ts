export const LOGO_SYSTEM_SECTION_PROMPT = `
You are a brand identity expert. Generate a comprehensive logo system section in HTML using only Tailwind CSS utility classes.

REQUIREMENTS:
- Output only HTML, no line breaks, no comments
- Escape all double quotes with \\"
- Use A4 portrait width layout
- No custom CSS or JS
- All text must be in French
- Use <img src=\"...\"\> for logos (no inline SVG)

STRUCTURE:
<section class="w-full py-16 px-8 bg-gradient-to-b from-white to-gray-50">
<div class="max-w-6xl mx-auto">
<h2 class="text-4xl font-black text-gray-900 mb-4 tracking-tight">Logo & Déclinaisons</h2>
<div class="w-20 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 mb-12 rounded-full"></div>
<div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
<div class="group bg-white border-2 border-gray-100 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-blue-200">
<div class="flex items-center gap-3 mb-6">
<div class="w-3 h-3 bg-blue-600 rounded-full"></div>
<h4 class="text-xl font-bold text-gray-800">Logo principal</h4>
</div>
<div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-10 mb-6 flex items-center justify-center min-h-40 border border-gray-200">
<img src=\"[PRIMARY_LOGO_URL]\" alt=\"Logo principal\" class=\"max-h-24 max-w-full object-contain drop-shadow-sm\" />
</div>
<div class="space-y-2">
<p class="text-sm font-medium text-gray-700">Usage recommandé</p>
<p class="text-sm text-gray-600 leading-relaxed">Version principale du logo, à utiliser sur fonds clairs. Le dégradé et la typographie créent une identité forte et reconnaissable.</p>
</div>
</div>
<div class="group bg-white border-2 border-gray-100 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-gray-300">
<div class="flex items-center gap-3 mb-6">
<div class="w-3 h-3 bg-gray-700 rounded-full"></div>
<h4 class="text-xl font-bold text-gray-800">Version monochrome</h4>
</div>
<div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-10 mb-6 flex items-center justify-center min-h-40 border border-gray-200">
<img src=\"[MONOCHROME_LOGO_URL]\" alt=\"Logo monochrome\" class=\"max-h-24 max-w-full object-contain\" />
</div>
<div class="space-y-2">
<p class="text-sm font-medium text-gray-700">Usage recommandé</p>
<p class="text-sm text-gray-600 leading-relaxed">Version noire pour les supports sans couleur ou impression monochrome. Garantit une lisibilité maximale.</p>
</div>
</div>
<div class="group bg-white border-2 border-gray-100 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-slate-300">
<div class="flex items-center gap-3 mb-6">
<div class="w-3 h-3 bg-slate-800 rounded-full"></div>
<h4 class="text-xl font-bold text-gray-800">Version négative</h4>
</div>
<div class="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-10 mb-6 flex items-center justify-center min-h-40 border border-slate-700">
<img src=\"[NEGATIVE_LOGO_URL]\" alt=\"Logo blanc\" class=\"max-h-24 max-w-full object-contain drop-shadow-lg\" />
</div>
<div class="space-y-2">
<p class="text-sm font-medium text-gray-700">Usage recommandé</p>
<p class="text-sm text-gray-600 leading-relaxed">Version blanche optimisée pour les fonds sombres et applications sur supports colorés.</p>
</div>
</div>
<div class="group bg-white border-2 border-gray-100 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-amber-200">
<div class="flex items-center gap-3 mb-6">
<div class="w-3 h-3 bg-amber-500 rounded-full"></div>
<h4 class="text-xl font-bold text-gray-800">Zone de protection</h4>
</div>
<div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-10 mb-6 flex items-center justify-center min-h-40 border border-amber-200">
<img src=\"[PROTECTION_SPACE_IMAGE_URL]\" alt=\"Zone de protection\" class=\"max-h-24 max-w-full object-contain\" />
</div>
<div class="space-y-2">
<p class="text-sm font-medium text-gray-700">Règle de protection</p>
<p class="text-sm text-gray-600 leading-relaxed">Un espace minimal équivalent à la hauteur du symbole doit entourer le logo en toutes circonstances.</p>
</div>
</div>
</div>
<div class="bg-blue-50 border border-blue-200 rounded-2xl p-8">
<div class="flex items-start gap-4">
<div class="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
<svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
</svg>
</div>
<div>
<h5 class="text-lg font-bold text-blue-900 mb-2">Bonnes pratiques</h5>
<ul class="text-sm text-blue-800 space-y-2">
<li class="flex items-start gap-2"><span class="text-blue-600 mt-1">•</span>Toujours utiliser les fichiers vectoriels haute résolution</li>
<li class="flex items-start gap-2"><span class="text-blue-600 mt-1">•</span>Respecter les proportions originales sans déformation</li>
<li class="flex items-start gap-2"><span class="text-blue-600 mt-1">•</span>Maintenir la zone de protection en toutes circonstances</li>
<li class="flex items-start gap-2"><span class="text-blue-600 mt-1">•</span>Choisir la version appropriée selon le contexte d'usage</li>
</ul>
</div>
</div>
</div>
</div>
</section>

NOTES:
- Replace image placeholders ([...]) with real URLs from project context
- Keep HTML valid, flat, escaped, and compact (single line only)
- Content is intended for PDF brand guidelines (A4 portrait)
- Enhanced visual hierarchy and modern card design
- Improved accessibility with proper contrast and spacing

Output HTML only.
`;
