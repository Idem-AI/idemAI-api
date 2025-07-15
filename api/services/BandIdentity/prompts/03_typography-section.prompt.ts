export const TYPOGRAPHY_SECTION_PROMPT = `
You are a senior typography designer specializing in digital brand systems. Create a comprehensive typography section that matches exactly the Sozy branding template style.

STRICT OUTPUT REQUIREMENTS:
1. Generate ONLY one <section> with this exact structure to match the Sozy template:
<section class="section">
  <h2 class="section-title">Système Typographique</h2>
  <div class="typography-grid">
    <div class="font-card">
      <div class="font-name">Exo 2</div>
      <div class="font-type">Police Principale</div>
      <div class="font-samples">
        <div class="font-sample heading-sample">Aa Bb Cc 123</div>
        <div class="font-weights">
          <span class="font-weight" style="font-weight: 300">Light</span>
          <span class="font-weight" style="font-weight: 400">Regular</span>
          <span class="font-weight" style="font-weight: 600">SemiBold</span>
          <span class="font-weight" style="font-weight: 700">Bold</span>
        </div>
        <div class="font-usage">
          <p>Utilisée pour tous les titres, sous-titres et textes d'interface. Sa géométrie précise et ses formes modernes lui confèrent une identité tech premium.</p>
        </div>
      </div>
    </div>
    
    <div class="font-card">
      <div class="font-name">Roboto</div>
      <div class="font-type">Police Secondaire</div>
      <div class="font-samples">
        <div class="font-sample heading-sample">Aa Bb Cc 123</div>
        <div class="font-weights">
          <span class="font-weight" style="font-weight: 300">Light</span>
          <span class="font-weight" style="font-weight: 400">Regular</span>
          <span class="font-weight" style="font-weight: 500">Medium</span>
        </div>
        <div class="font-usage">
          <p>Utilisée pour les paragraphes et contenus longs. Sa grande lisibilité et son excellent rendu sur écran en font le complément parfait à Exo 2.</p>
        </div>
      </div>
    </div>
    
    <div class="font-card">
      <div class="font-name">Hiérarchie Typographique</div>
      <div class="hierarchy-samples">
        <h1 class="h1-sample">Titre Principal (H1) - 32px</h1>
        <h2 class="h2-sample">Titre de Section (H2) - 24px</h2>
        <h3 class="h3-sample">Sous-titre (H3) - 20px</h3>
        <p class="body-sample">Texte courant - 16px. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilisi.</p>
        <p class="caption-sample">Légende - 14px</p>
      </div>
    </div>
    
    <div class="font-card">
      <div class="font-name">Règles d'Utilisation</div>
      <div class="usage-rules">
        <ul>
          <li>Espacement des lignes: 1.5 pour le corps du texte</li>
          <li>Hauteur des titres: 1.2 pour tous les titres</li>
          <li>Contraste: WCAG AA minimum (4.5:1 pour texte standard)</li>
          <li>Taille minimale: 14px pour tout texte secondaire</li>
          <li>Mise en avant: Utiliser les variantes SemiBold/Bold uniquement</li>
        </ul>
      </div>
    </div>
  </div>
</section>

DESIGN RULES:
- Use exactly these fonts to match the Sozy template:
  • Primary font: Exo 2 (300 Light, 400 Regular, 600 SemiBold, 700 Bold)
  • Secondary font: Roboto (300 Light, 400 Regular, 500 Medium)
- Show exactly the hierarchy samples and weights as shown in the template
- Use French language for all labels and text to match the template
- Maintain the exact HTML structure of the template
- Remove all line breaks in HTML when generating
- Escape " with \"

TECHNICAL SPECS (to be included in the usage rules):
1. Web Font Integration:
   - Utiliser Google Fonts pour le chargement optimal
   - Charger uniquement les variantes de poids nécessaires

2. Accessibility Rules:
   - Minimum 16px pour le texte principal
   - Hauteur de ligne 1.5 pour le corps du texte
   - Conformité WCAG AA pour le contraste

3. Usage Guidelines:
   - Hiérarchie précise des titres (H1-H3)
   - Tailles adaptatives pour les écrans mobiles
   - Utilisation cohérente des graisses selon la hiérarchie

CONTEXT:
- La charte graphique est pour "Sozy", une entreprise tech premium
- La typographie doit évoquer l'innovation, la confiance et l'expérience utilisateur haut de gamme
- Le système typographique doit être cohérent avec le design moderne et épuré du template
- Utiliser la langue française pour tout le contenu textuel pour correspondre au template`;