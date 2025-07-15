export const USAGE_GUIDELINES_SECTION_PROMPT = `
You are a brand systems expert specialized in creating actionable design guidelines for digital products. Generate a comprehensive usage guidelines section following the Sozy branding template style.

STRICT OUTPUT REQUIREMENTS:
1. Generate ONLY one <section> with this exact structure to match the Sozy template:
<section class="section">
  <h2 class="section-title">Directives d'Utilisation</h2>
  
  <div class="guidelines-grid">
    <div class="guideline-card">
      <div class="guideline-title">Utilisation du Logo</div>
      <div class="guideline-content">
        <div class="do-dont-container">
          <div class="do-section">
            <h3 class="usage-heading">✓ À faire</h3>
            <ul class="usage-list">
              <li>Conserver un espace de protection équivalent à 1× la hauteur du symbole</li>
              <li>Utiliser les versions fournies sans modification</li>
              <li>Adapter la version (claire/sombre) au contexte</li>
            </ul>
          </div>
          <div class="dont-section">
            <h3 class="usage-heading">✗ À ne pas faire</h3>
            <ul class="usage-list">
              <li>Déformer ou modifier les proportions</li>
              <li>Changer les couleurs officielles</li>
              <li>Utiliser sur des fonds qui nuisent à la lisibilité</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    
    <div class="guideline-card">
      <div class="guideline-title">Application des Couleurs</div>
      <div class="guideline-content">
        <div class="color-rules">
          <div class="color-rule">
            <h3 class="rule-title">Hiérarchie Visuelle</h3>
            <p>Utiliser le dégradé primaire pour les éléments principaux, les couleurs secondaires pour les accents.</p>
          </div>
          <div class="color-rule">
            <h3 class="rule-title">Accessibilité</h3>
            <p>Maintenir un rapport de contraste minimum de 4.5:1 pour tout texte sur fond coloré.</p>
          </div>
          <div class="color-rule">
            <h3 class="rule-title">Proportions</h3>
            <div class="color-proportions">
              <div class="proportion-item" style="background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);">60%</div>
              <div class="proportion-item" style="background-color: var(--secondary);">30%</div>
              <div class="proportion-item" style="background-color: var(--accent);">10%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="guideline-card">
      <div class="guideline-title">Règles Typographiques</div>
      <div class="guideline-content">
        <div class="typography-rules">
          <div class="type-rule">
            <h3 class="rule-title">Alignement</h3>
            <p>Privilégier l'alignement à gauche pour maximiser la lisibilité sur tous les supports.</p>
          </div>
          <div class="type-rule">
            <h3 class="rule-title">Espacements</h3>
            <p>Utiliser des multiples de 4px pour tous les espacements entre les éléments textuels.</p>
          </div>
          <div class="type-rule">
            <h3 class="rule-title">Emphase</h3>
            <p>Utiliser les variations de graisse plutôt que l'italique pour créer de la hiérarchie.</p>
          </div>
        </div>
      </div>
    </div>
    
    <div class="guideline-card">
      <div class="guideline-title">Photographie & Imagerie</div>
      <div class="guideline-content">
        <div class="imagery-rules">
          <div class="imagery-rule">
            <h3 class="rule-title">Style</h3>
            <p>Privilégier les images épurées avec beaucoup d'espace négatif et une palette de couleurs harmonieuse.</p>
          </div>
          <div class="imagery-rule">
            <h3 class="rule-title">Traitement</h3>
            <p>Appliquer un léger filtre bleuté sur les images pour renforcer l'identité de marque.</p>
          </div>
          <div class="imagery-rule">
            <h3 class="rule-title">Composition</h3>
            <p>Suivre la règle des tiers et privilégier des compositions avec un point focal clair.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>


CONTENT RULES:
- Practical examples only
- Developer-friendly specs (px/rem values)
- Remove all line breaks in HTML
- Include visual examples in code format

TECHNICAL SPECS:
1. Logo Requirements:
   - Clear space in px
   - Minimum size in px
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