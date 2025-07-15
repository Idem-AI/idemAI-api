export const VISUAL_EXAMPLES_SECTION_PROMPT = `
You are a UI/UX expert creating brand-compliant application examples that match the  branding template style.

STRICT REQUIREMENTS:
1. Generate ONLY one <section> with this exact structure to match the  template. Le contenu sera placé dans un élément parent avec la classe 'branding-document':
<section class="section">
  <h2 class="section-title">Exemples Visuels</h2>
  <div class="visual-examples">
    <div class="visual-card">
      <h3 class="visual-title">Application Mobile</h3>
      <div class="visual-representation">
        <svg width="220" height="170" viewBox="0 0 220 170" xmlns="http://www.w3.org/2000/svg">
          <!-- Phone frame -->
          <rect x="70" y="10" width="80" height="150" rx="10" fill="white" stroke="#e6e6fa" stroke-width="2" />
          <rect x="70" y="10" width="80" height="20" rx="10" fill="#191970" />
          <!-- Screen content -->
          <rect x="75" y="35" width="70" height="100" fill="#f8f9fa" />
          <!-- App header -->
          <rect x="75" y="35" width="70" height="15" fill="#191970" />
          <circle cx="85" cy="42" r="5" fill="white" />
          <rect x="95" y="40" width="30" height="4" rx="2" fill="white" />
          <!-- Content -->
          <rect x="80" y="55" width="60" height="25" rx="4" fill="white" stroke="#e6e6fa" stroke-width="1" />
          <circle cx="90" cy="67" r="5" fill="#191970" />
          <rect x="100" y="63" width="30" height="2" rx="1" fill="#191970" />
          <rect x="100" y="68" width="25" height="2" rx="1" fill="#adb5bd" />
          <rect x="100" y="72" width="20" height="2" rx="1" fill="#adb5bd" />
          <rect x="80" y="85" width="60" height="25" rx="4" fill="white" stroke="#e6e6fa" stroke-width="1" />
          <circle cx="90" cy="97" r="5" fill="#DDA0DD" />
          <rect x="100" y="93" width="30" height="2" rx="1" fill="#191970" />
          <rect x="100" y="98" width="25" height="2" rx="1" fill="#adb5bd" />
          <rect x="100" y="102" width="20" height="2" rx="1" fill="#adb5bd" />
          <!-- Bottom nav -->
          <rect x="75" y="135" width="70" height="15" fill="white" stroke="#e6e6fa" stroke-width="1" />
          <circle cx="90" cy="142" r="3" fill="#191970" />
          <circle cx="110" cy="142" r="3" fill="#adb5bd" />
          <circle cx="130" cy="142" r="3" fill="#adb5bd" />
          <!-- Logo on screen -->
          <g transform="translate(80, 125) scale(0.15)">
            <path d="M10,20 C30,5 90,5 110,20 C90,35 30,35 10,20" stroke="#191970" stroke-width="4" fill="none" stroke-linecap="round" />
            <circle cx="40" cy="20" r="7" fill="#191970" />
            <circle cx="80" cy="20" r="7" fill="#191970" />
          </g>
        </svg>
      </div>
      <div class="visual-description">
        Interface mobile adaptative conservant tous les codes visuels de la marque. Navigation intuitive et espacement optimisé pour l'interaction tactile.
      </div>
    </div>
    
    <div class="visual-card">
      <h3 class="visual-title">Interface Web</h3>
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
        Site responsive avec une structure de navigation claire et une hiérarchie visuelle. Le dégradé de marque et la typographie sont optimisés pour une expérience utilisateur fluide.
      </div>
    </div>
    
    <div class="visual-card">
      <h3 class="visual-title">Documents Commerciaux</h3>
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
          <rect x="45" y="144" width="120" height="1" rx="0.5" fill="#adb5bd" />
        </svg>
      </div>
      <div class="visual-description">
        Ensemble de papeterie d'entreprise incluant cartes de visite, en-têtes de lettre et documents officiels. Matérialise l'identité de marque dans les communications professionnelles.
      </div>
    </div>
  </div>
</section>

RULES:
- MAX 2 core examples
- 1-2 sentences per rationale
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