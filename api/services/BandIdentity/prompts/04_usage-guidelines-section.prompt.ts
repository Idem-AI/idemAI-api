export const USAGE_GUIDELINES_SECTION_PROMPT = `
You are a brand systems expert specialized in creating actionable design guidelines for digital products. Generate a comprehensive usage guidelines section following the  branding template style.

STRICT OUTPUT REQUIREMENTS:
1. Generate ONLY one <section> with this exact structure to match the  template. Note that all content will be inside a parent element with class 'branding-document':
<div class="section-divider">
  <div class="divider"></div>
  <h2 class="section-title">Usage Guidelines</h2>
  <div class="divider"></div>
</div>

<section class="directives-section">
  <div class="directives-header">
    <p class="directives-intro">
      To preserve the brand's visual identity, it is essential to follow these usage guidelines. 
      They ensure optimal consistency and recognition across all applications.
    </p>
  </div>
  
  <!-- Logo Guidelines Section -->
  <div class="guidelines-section">
    <div class="section-header">
      <div class="section-header-title">
        <span class="section-icon">■</span>
        <h3 class="guideline-section-title">Logo</h3>
      </div>
      <p class="section-description">Directives for the correct use of the logo in all communication supports.</p>
    </div>
    
    <div class="guidelines-grid">
      <div class="guidelines-row">
        <!-- Principles fundamentals -->
        <div class="guidelines-col guidelines-principles">
          <h4 class="guidelines-subtitle">Principles fundamentals</h4>
          <ul class="guidelines-list">
            <li>Always respect the integrity of the logo by maintaining its original proportions.</li>
            <li>Ensure that the logo is always clearly visible and readable on all supports.</li>
            <li>Maintain a protection zone equivalent to the height of the letter 'L' all around the logo.</li>
            <li>Use only the official versions of the logo provided in this guide.</li>
          </ul>
        </div>
        
        <!-- Visual -->
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
  <div class="guidelines-section" id="typography-guidelines">
    <div class="section-divider">
      <span class="divider-icon"></span>
      <h2 class="divider-title">Typography Guidelines</h2>
      <hr class="divider-line">
    </div>
    <div class="guideline-header">
      <h3 class="guideline-title">Typography Rules</h3>
      <p class="guideline-intro">Maintain a consistent visual hierarchy by adhering to these typography rules to ensure accessibility and visual identity.</p>
    </div>

    <div class="table-container">
      <table class="accessibility-table">
        <thead>
          <tr>
            <th>Element</th>
            <th>Font</th>
            <th>Size</th>
            <th>Spacing</th>
            <th>Usage</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>H1</strong></td>
            <td>Exo 2 Bold</td>
            <td>2.5rem</td>
            <td>1.2</td>
            <td>Main page titles</td>
          </tr>
          <tr>
            <td><strong>H2</strong></td>
            <td>Exo 2 Bold</td>
            <td>2.0rem</td>
            <td>1.1</td>
            <td>Section titles</td>
          </tr>
          <tr>
            <td><strong>H3</strong></td>
            <td>Exo 2 SemiBold</td>
            <td>1.5rem</td>
            <td>1.2</td>
            <td>Subtitles</td>
          </tr>
          <tr>
            <td><strong>Body</strong></td>
            <td>Ubuntu Mono Regular</td>
            <td>1.0rem</td>
            <td>1.5</td>
            <td>Main text</td>
          </tr>
          <tr>
            <td><strong>Label</strong></td>
            <td>Ubuntu Mono Medium</td>
            <td>0.9rem</td>
            <td>1.2</td>
            <td>Interface and captions</td>
          </tr>
        </tbody>
      </table>
    </div>
    </div>
    
    <!-- Color Guidelines Section -->
    <div class="guidelines-section" id="color-guidelines">
      <div class="section-divider">
        <span class="divider-icon"></span>
        <h2 class="divider-title">Color Guidelines</h2>
        <hr class="divider-line">
      </div>
      
      <div class="guidelines-grid">
        <div class="guidelines-row">
          <div class="guidelines-col">
            <h4 class="guidelines-subtitle">To do</h4>
            <ul class="guidelines-list good-practices">
              <li>Use colors according to their functional meaning</li>
              <li>Maintain sufficient contrast for accessibility</li>
              <li>Follow recommended proportions in the palette</li>
              <li>Use the primary color for main elements</li>
            </ul>
            <div class="visual-example good-example">
              <svg width="100%" height="70mm" viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg">
                <!-- Bon exemple -->
                <rect x="25" y="20" width="150" height="100" fill="#f8f9fa" stroke="#e9ecef" />
                <rect x="45" y="40" width="110" height="30" fill="#191970" rx="3" />
                <text x="100" y="60" text-anchor="middle" fill="white" font-family="Arial" font-size="14">Main Title</text>
                <rect x="45" y="80" width="110" height="20" fill="white" stroke="#191970" stroke-width="1" rx="3" />
                <text x="100" y="94" text-anchor="middle" fill="#191970" font-family="Arial" font-size="12">Secondary Button</text>
                <text x="100" y="125" text-anchor="middle" fill="#28a745" font-family="Arial" font-size="12">✔ Good contrast and consistency</text>
              </svg>
            </div>
          </div>

          <div class="guidelines-col">
            <h4 class="guidelines-subtitle">To avoid</h4>
            <ul class="guidelines-list bad-practices">
              <li>Do not use light text on a light background</li>
              <li>Avoid combinations with insufficient contrast</li>
              <li>Do not mix more than 3 colors in a section</li>
              <li>Do not create new nuances without validation</li>
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
                <text x="90" y="125" font-size="12" fill="#dc3545" text-anchor="middle">Contrast < 3:1 (Not accessible)</text>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="guideline-card">
      <div class="guideline-title">Photography & Imagery</div>
      <div class="guideline-content">
        <div class="imagery-rules">
          <div class="imagery-rule">
            <h3 class="rule-title">Style</h3>
            <p>Favor clean images with plenty of negative space and a harmonious color palette.</p>
          </div>
          <div class="imagery-rule">
            <h3 class="rule-title">Processing</h3>
            <p>Apply a slight bluish filter on images to reinforce the brand identity.</p>
          </div>
          <div class="imagery-rule">
            <h3 class="rule-title">Composition</h3>
            <p>Follow the rule of thirds and favor compositions with a clear focal point.</p>
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