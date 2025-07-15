export const VISUAL_EXAMPLES_SECTION_PROMPT = `
You are a UI/UX expert creating brand-compliant application examples that match the Sozy branding template style.

STRICT REQUIREMENTS:
1. Generate ONLY one <section> with this exact structure to match the Sozy template:
<section class="section">
  <h2 class="section-title">Applications</h2>
  <div class="examples-grid">
    <div class="example-card">
      <div class="example-title">Site Web</div>
      <div class="example-mockup website-mockup">
        <div class="mockup-header">
          <div class="logo-placeholder"></div>
          <div class="nav-placeholder">
            <span></span><span></span><span></span>
          </div>
        </div>
        <div class="mockup-hero">
          <div class="hero-content">
            <div class="hero-title"></div>
            <div class="hero-text"></div>
            <div class="hero-button"></div>
          </div>
          <div class="hero-image"></div>
        </div>
      </div>
      <div class="example-description">Mise en œuvre du système sur la plateforme principale avec dégradé signature et typographie premium.</div>
    </div>
    
    <div class="example-card">
      <div class="example-title">Application Mobile</div>
      <div class="example-mockup mobile-mockup">
        <div class="phone-frame">
          <div class="app-header">
            <div class="app-logo"></div>
          </div>
          <div class="app-content">
            <div class="app-card"></div>
            <div class="app-card"></div>
          </div>
          <div class="app-nav">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
      <div class="example-description">Version mobile respectant les contraintes d'espace tout en conservant l'identité visuelle distincte.</div>
    </div>

    <div class="example-card">
      <div class="example-title">Carte de Visite</div>
      <div class="example-mockup card-mockup">
        <div class="business-card">
          <div class="card-logo"></div>
          <div class="card-details">
            <div class="card-name"></div>
            <div class="card-title"></div>
            <div class="card-contact"></div>
          </div>
        </div>
      </div>
      <div class="example-description">Adaptation du système aux supports imprimés avec maintien de la cohérence et de l'impact visuel.</div>
    </div>
    
    <div class="example-card">
      <div class="example-title">Réseaux Sociaux</div>
      <div class="example-mockup social-mockup">
        <div class="social-post">
          <div class="post-header">
            <div class="post-avatar"></div>
            <div class="post-info"></div>
          </div>
          <div class="post-content">
            <div class="post-image"></div>
            <div class="post-text"></div>
            <div class="post-cta"></div>
          </div>
        </div>
      </div>
      <div class="example-description">Présence de marque optimisée pour les plateformes sociales avec adaptation du système aux différents formats.</div>
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