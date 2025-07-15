export const TYPOGRAPHY_SECTION_PROMPT = `
You are a senior typography designer specializing in digital brand systems. Create a comprehensive typography section that matches exactly the Sozy branding template style.

STRICT OUTPUT REQUIREMENTS:
1. Generate ONLY one <section> with this exact structure to match the Sozy template:
<section class="section">
  <h2 class="section-title">Typographie</h2>
  <div class="fonts-container">
    <div class="font-card">
      <div class="font-name">Exo 2</div>
      <div class="font-meta">Police Principale - Open Font License</div>
      <div class="font-specimen">
        <h4>Exemples d'utilisation</h4>
        <div class="font-example" style="font-family: 'Exo 2', sans-serif; font-size: 2.5rem; font-weight: 700;">
          Titre Principal
        </div>
        <div class="font-example" style="font-family: 'Exo 2', sans-serif; font-size: 2rem; font-weight: 700;">
          Titre de Section
        </div>
        <div class="font-example" style="font-family: 'Exo 2', sans-serif; font-size: 1.5rem; font-weight: 600;">
          Sous-titre Section
        </div>
      </div>
      <div class="font-rationale">
        Les formes modernes et géométriques d'Exo 2 transmettent un sentiment d'innovation, adapté à une application technologique. Sa structure solide offre une excellente lisibilité pour les titres et en-têtes.
      </div>
    </div>
    
    <div class="font-card">
      <div class="font-name">Ubuntu Mono</div>
      <div class="font-meta">Police Secondaire - Ubuntu Font Licence</div>
      <div class="font-specimen">
        <h4>Exemples d'utilisation</h4>
        <div class="font-example" style="font-family: 'Ubuntu Mono', monospace; font-size: 1rem">
          Texte de contenu principal et descriptions détaillées pour une lecture optimale.
        </div>
        <div class="font-example" style="font-family: 'Ubuntu Mono', monospace; font-size: 0.9rem">
          Informations techniques et données précises.
        </div>
      </div>
      <div class="font-rationale">
        Ubuntu Mono, avec son style monospace, apporte une sensation technique et précise, parfaite pour afficher des données ou extraits de code. Sa clarté améliore la lisibilité du texte principal.
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