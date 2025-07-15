export const USAGE_GUIDELINES_SECTION_PROMPT = `
You are a brand systems expert specialized in creating actionable design guidelines for digital products. Generate a comprehensive usage guidelines section following the Sozy branding template style.

STRICT OUTPUT REQUIREMENTS:
1. Generate ONLY one <section> with this exact structure to match the Sozy template:
<div class="section-divider">
  <div class="divider"></div>
  <h2 class="section-title">Directives d'Usage</h2>
  <div class="divider"></div>
</div>

<section class="directives-section">
  <div class="directives-header">
    <p class="directives-intro">
      Pour préserver l'identité visuelle de la marque, il est essentiel de respecter ces directives d'usage. 
      Elles garantissent une cohérence et une reconnaissance optimales dans toutes les applications.
    </p>
  </div>
  
  <!-- Logo Guidelines Section -->
  <div class="guidelines-section">
    <div class="section-header">
      <div class="section-header-title">
        <span class="section-icon">■</span>
        <h3 class="guideline-section-title">Logo</h3>
      </div>
      <p class="section-description">Directives pour l'utilisation correcte du logo dans tous les supports de communication.</p>
    </div>
    
    <div class="guidelines-grid">
      <div class="guidelines-row">
        <!-- Principes fondamentaux -->
        <div class="guidelines-col guidelines-principles">
          <h4 class="guidelines-subtitle">Principes fondamentaux</h4>
          <ul class="guidelines-list">
            <li>Respectez toujours l'intégrité du logo en maintenant ses proportions d'origine.</li>
            <li>Assurez-vous que le logo soit toujours clairement visible et lisible sur tous les supports.</li>
            <li>Maintenez une zone de protection équivalente à la hauteur de la lettre 'L' tout autour du logo.</li>
            <li>Utilisez uniquement les versions officielles du logo fournies dans ce guide.</li>
          </ul>
        </div>
        
        <!-- Visuel -->
        <div class="guidelines-col">
          <div style="text-align: center; padding: 0 5mm;">
            <svg width="100%" height="90mm" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
              <!-- Représentation schématique du logo avec zone de protection -->
              <rect x="50" y="50" width="200" height="100" fill="#f0f0f0" stroke="#ccc" stroke-width="1" />
              <rect x="75" y="75" width="150" height="50" fill="#191970" />
              <text x="150" y="110" text-anchor="middle" fill="white" font-family="Arial" font-weight="bold" font-size="24">LOGO</text>
              
              <!-- Zone de protection -->
              <rect x="25" y="25" width="250" height="150" stroke="#28a745" stroke-width="1" stroke-dasharray="5,5" fill="none" />
              <text x="150" y="195" text-anchor="middle" fill="#555" font-family="Arial" font-size="12">Zone de protection</text>
            </svg>
          </div>
        </div>
      </div>
      
      <!-- À faire / À éviter -->
      <div class="guidelines-row guidelines-dodont">
        <div class="guidelines-col">
          <h4 class="guidelines-subtitle">À faire</h4>
          <ul class="guidelines-list good-practices">
            <li>Utiliser le logo sur des fonds clairs ou sombres qui offrent un bon contraste</li>
            <li>Conserver l'espace de protection autour du logo</li>
            <li>Utiliser la version négative sur les fonds foncés</li>
            <li>Mettre en valeur le logo dans sa forme complète quand l'espace le permet</li>
          </ul>
          <div class="example-visual do-example">
            <svg width="100%" height="80mm" viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg">
              <!-- Bon exemple -->
              <rect x="25" y="20" width="150" height="120" fill="#f8f9fa" stroke="#e9ecef" />
              <rect x="50" y="60" width="100" height="40" fill="#191970" rx="4" />
              <text x="100" y="85" text-anchor="middle" fill="white" font-family="Arial" font-size="16" font-weight="bold">LOGO</text>
              <rect x="50" y="60" width="100" height="40" stroke="#28a745" stroke-width="1" stroke-dasharray="5,5" fill="none" rx="4" />
              <text x="100" y="130" text-anchor="middle" fill="#28a745" font-family="Arial" font-size="12">✔ Bon contraste et zone respectée</text>
            </svg>
          </div>
        </div>

        <div class="guidelines-col">
          <h4 class="guidelines-subtitle">À éviter</h4>
          <ul class="guidelines-list bad-practices">
            <li>Déformer ou redimensionner le logo de manière disproportionnée</li>
            <li>Ajouter des effets (ombres, contours, lueurs) non approuvés</li>
            <li>Placer le logo sur des fonds au contraste insuffisant</li>
            <li>Utiliser le logo à une taille inférieure à la taille minimale recommandée</li>
          </ul>
          <div class="example-visual dont-example">
            <svg width="100%" height="80mm" viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg">
              <!-- Mauvais exemple -->
              <rect x="25" y="20" width="150" height="120" fill="#f8f9fa" stroke="#e9ecef" />
              <rect x="30" y="30" width="140" height="40" fill="#e9ecef" rx="4" />
              <text x="100" y="55" text-anchor="middle" fill="#adb5bd" font-family="Arial" font-size="16" font-weight="bold">LOGO</text>
              <line x1="140" y1="30" x2="170" y2="60" stroke="#dc3545" stroke-width="2" />
              <line x1="170" y1="30" x2="140" y2="60" stroke="#dc3545" stroke-width="2" />
              <text x="100" y="130" text-anchor="middle" fill="#dc3545" font-family="Arial" font-size="12">✖ Contraste insuffisant</text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  
  <!-- Typography Guidelines Section -->
  <div class="guidelines-section" id="typography-guidelines">
    <div class="section-divider">
      <span class="divider-icon"></span>
      <h2 class="divider-title">Directives Typographiques</h2>
      <hr class="divider-line">
    </div>
    <div class="guideline-header">
      <h3 class="guideline-title">Règles Typographiques</h3>
      <p class="guideline-intro">Maintenez une hiérarchie visuelle cohérente en respectant ces règles typographiques pour assurer l'accessibilité et l'identité visuelle.</p>
    </div>

    <div class="table-container">
      <table class="accessibility-table">
        <thead>
          <tr>
            <th>Élément</th>
            <th>Police</th>
            <th>Taille</th>
            <th>Espacement</th>
            <th>Usage</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>H1</strong></td>
            <td>Exo 2 Bold</td>
            <td>2.5rem</td>
            <td>1.2</td>
            <td>Titres principaux de page</td>
          </tr>
          <tr>
            <td><strong>H2</strong></td>
            <td>Exo 2 Bold</td>
            <td>2.0rem</td>
            <td>1.1</td>
            <td>Titres de section</td>
          </tr>
          <tr>
            <td><strong>H3</strong></td>
            <td>Exo 2 SemiBold</td>
            <td>1.5rem</td>
            <td>1.2</td>
            <td>Sous-titres</td>
          </tr>
          <tr>
            <td><strong>Corps</strong></td>
            <td>Ubuntu Mono Regular</td>
            <td>1.0rem</td>
            <td>1.5</td>
            <td>Texte principal</td>
          </tr>
          <tr>
            <td><strong>Label</strong></td>
            <td>Ubuntu Mono Medium</td>
            <td>0.9rem</td>
            <td>1.2</td>
            <td>Interface et légendes</td>
          </tr>
        </tbody>
      </table>
    </div>
    </div>
    
    <!-- Color Guidelines Section -->
    <div class="guidelines-section" id="color-guidelines">
      <div class="section-divider">
        <span class="divider-icon"></span>
        <h2 class="divider-title">Directives Chromatiques</h2>
        <hr class="divider-line">
      </div>
      
      <div class="guidelines-grid">
        <div class="guidelines-row">
          <div class="guidelines-col">
            <h4 class="guidelines-subtitle">À faire</h4>
            <ul class="guidelines-list good-practices">
              <li>Utiliser les couleurs selon leur signification fonctionnelle</li>
              <li>Maintenir un contraste suffisant pour l'accessibilité</li>
              <li>Respecter les proportions recommandées dans la palette</li>
              <li>Utiliser la couleur primaire pour les éléments principaux</li>
            </ul>
            <div class="visual-example good-example">
              <svg width="100%" height="70mm" viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg">
                <!-- Bon exemple -->
                <rect x="25" y="20" width="150" height="100" fill="#f8f9fa" stroke="#e9ecef" />
                <rect x="45" y="40" width="110" height="30" fill="#191970" rx="3" />
                <text x="100" y="60" text-anchor="middle" fill="white" font-family="Arial" font-size="14">Titre Principal</text>
                <rect x="45" y="80" width="110" height="20" fill="white" stroke="#191970" stroke-width="1" rx="3" />
                <text x="100" y="94" text-anchor="middle" fill="#191970" font-family="Arial" font-size="12">Bouton Secondaire</text>
                <text x="100" y="125" text-anchor="middle" fill="#28a745" font-family="Arial" font-size="12">✔ Bon contraste et cohérence</text>
              </svg>
            </div>
          </div>

          <div class="guidelines-col">
            <h4 class="guidelines-subtitle">À éviter</h4>
            <ul class="guidelines-list bad-practices">
              <li>Ne pas utiliser du texte clair sur fond clair</li>
              <li>Éviter des combinaisons avec contraste insuffisant</li>
              <li>Ne pas mélanger plus de 3 couleurs dans une section</li>
              <li>Ne pas créer de nouvelles nuances sans validation</li>
            </ul>
            <div class="visual-example bad-example">
              <svg width="100%" height="70mm" viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg">
                <!-- Mauvais exemple -->
                <rect x="25" y="20" width="150" height="100" fill="#f0f0f0" stroke="#e9ecef" />
                <rect x="45" y="40" width="110" height="30" fill="#e9ecef" rx="3" />
                <text x="100" y="60" text-anchor="middle" fill="#c0c0c0" font-family="Arial" font-size="14">Titre Principal</text>
                <line x1="150" y1="65" x2="165" y2="80" stroke="#dc3545" stroke-width="2" />
                <line x1="165" y1="65" x2="150" y2="80" stroke="#dc3545" stroke-width="2" />
                <!-- Contrast warning -->
                <text x="90" y="125" font-size="12" fill="#dc3545" text-anchor="middle">Contraste < 3:1 (Non accessible)</text>
              </svg>
            </div>
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