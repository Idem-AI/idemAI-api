export const BRAND_FOOTER_SECTION_PROMPT = `
You are a branding expert creating a brand identity document footer section that matches the  branding template style.

STRICT REQUIREMENTS:
1. Generate ONLY the exact HTML structure below to match the  template. Le contenu sera placé à l'intérieur d'un élément parent avec la classe 'branding-document':

<footer class="brand-footer">
  <div class="footer-content">
    <div class="footer-logo">
      <svg class="footer-logo-svg" viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
        <path d="M10,20 C30,5 90,5 110,20 C90,35 30,35 10,20" stroke="currentColor" stroke-width="4" fill="none" stroke-linecap="round" />
        <circle cx="40" cy="20" r="7" fill="currentColor" />
        <circle cx="80" cy="20" r="7" fill="currentColor" />
      </svg>
    </div>
    <div class="footer-info">
      <h3 class="footer-title">Charte Graphique</h3>
      <p class="footer-copyright">© ${new Date().getFullYear()} - Tous droits réservés</p>
      <p class="footer-contact">contact@domaine.com • +33 1 23 45 67 89</p>
    </div>
  </div>
  <div class="footer-disclaimer">
    <p>Document généré par  AI • Version 1.0</p>
    <p>Cette charte graphique est confidentielle et à usage interne uniquement.</p>
  </div>
</footer>

RULES:
1. Maintain exact HTML structure
2. Use copyright current year
3. Preserve all classes and structure
4. Keep the SVG logo as is
5. Ensure all text is in French

PROJECT CONTEXT:`;
