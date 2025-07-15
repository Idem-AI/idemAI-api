export const GLOBAL_CSS_PROMPT = `
You are a CSS architect specializing in design systems. Generate comprehensive styles that match the branding template and unify all brand sections into a cohesive visual system.

STRICT REQUIREMENTS:
1. Generate CSS that exactly matches the branding template visual style, with this structure:

    <style media="print">
      @page { 
        size: A4 portrait; 
        margin: 10mm; 
      }
      
      /* Styles d'optimisation A4 */
      .branding-document {
        width: 210mm;
        height: 297mm;
        margin: 0 auto;
        font-size: 10pt;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      .container {
        padding: 10mm 0;
        max-width: 190mm;
      }
  
  .brand-header-modern {
    border-radius: 5mm;
    height: 60mm;
    margin-bottom: 15mm;
  }
  
  .section {
    margin: 15mm 0;
    page-break-before: always;
    page-break-after: always;
  }
  
  .guidelines-section {
    page-break-before: always;
  }
  
  .section:first-of-type {
    page-break-before: avoid;
  }
  
  .practices-container,
  .logo-variants,
  .color-palette,
  .typography-grid,
  .visual-examples {
    grid-template-columns: repeat(2, 1fr);
    gap: 10mm;
  }
  
  .practice-card,
  .logo-card, 
  .color-card, 
  .font-card, 
  .visual-card {
    page-break-inside: avoid;
    break-inside: avoid;
  }
  
  .branding-document h1, 
  .branding-document h2, 
  .branding-document h3, 
  .branding-document h4 {
    page-break-after: avoid;
  }
  
  .branding-document table {
    font-size: 9pt;
  }
  
  .branding-document svg {
    max-height: 70mm;
  }
    </style>
    
    <style>
.branding-document {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: "Exo 2", sans-serif;
  background-color: #ffffff;
  color: #000000;
  line-height: 1.6;
}

.branding-document *,
.branding-document *::before,
.branding-document *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* New Brand Header Styles */
.brand-header-modern {
  position: relative;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  padding: 4rem 2rem;
  margin-bottom: 3rem;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(37, 117, 252, 0.2);
}

.header-grid-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px);
  background-size: 20px 20px;
  opacity: 0.3;
}

.header-content {
  position: relative;
  z-index: 1;
  text-align: center;
}

.brand-header-modern h1 {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  letter-spacing: -1px;
  text-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.brand-header-modern .subtitle {
  font-size: 1.4rem;
  opacity: 0.9;
  margin-bottom: 1.5rem;
  font-family: "Ubuntu Mono", monospace;
}

.project-info {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 2rem;
}

.info-item {
  display: flex;
  align-items: center;
  font-size: 1rem;
  background: rgba(255,255,255,0.2);
  border-radius: 50px;
  padding: 0.5rem 1rem;
  backdrop-filter: blur(5px);
}

.info-icon {
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-right: 8px;
  position: relative;
}

.section {
  margin: 20mm 0;
  position: relative;
  page-break-after: always;
}

.section-title {
  font-size: 2rem;
  color: #191970;
  margin-bottom: 2rem;
  font-weight: 700;
  border-bottom: 3px solid #dda0dd;
  padding-bottom: 0.5rem;
}

/* Logo System Section Styles */
.logo-system-section {
  margin-bottom: 4rem;
}

.logo-variants {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15mm;
  margin-top: 10mm;
}

.logo-card {
  background: #ffffff;
  border: 2px solid #e6e6fa;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
}

.logo-card h4 {
  color: #191970;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
}

/* Color Palette */
.color-palette {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.color-card {
  background: #ffffff;
  border: 2px solid #e6e6fa;
  border-radius: 8px;
  padding: 1.5rem;
}

.color-swatch {
  height: 100px;
  border-radius: 4px;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.color-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: #191970;
  margin-bottom: 0.5rem;
}

.color-hex {
  font-family: "Ubuntu Mono", monospace;
  font-size: 1rem;
  color: #666;
  margin-bottom: 1rem;
}

.color-description {
  font-size: 0.9rem;
  color: #555;
  line-height: 1.5;
}

/* Typography Styles */
.typography-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15mm;
  margin-top: 10mm;
}

.font-card {
  background: #ffffff;
  border: 2px solid #e6e6fa;
  border-radius: 8px;
  padding: 1.5rem;
}

.font-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: #191970;
  margin-bottom: 0.5rem;
}

.font-type {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 1.5rem;
}

.font-weights {
  margin-bottom: 1.5rem;
}

.font-weight-example {
  margin-bottom: 0.75rem;
}

.weight-label {
  font-size: 0.8rem;
  color: #888;
  margin-bottom: 0.25rem;
  display: block;
}

.weight-sample {
  font-size: 1.1rem;
  color: #333;
}

.typography-hierarchy {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  margin-top: 1rem;
}

.hierarchy-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #191970;
  margin-bottom: 1rem;
}

.hierarchy-example h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  color: #191970;
}

.hierarchy-example h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #191970;
}

.hierarchy-example h3 {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #191970;
}

.hierarchy-example p {
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 0.75rem;
  color: #333;
}

/* Add more specific styles based on the HTML structure and classes */

/* Usage Guidelines Section */
.guidelines-section {
  margin-top: 3rem;
}

.practices-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15mm;
  margin-top: 10mm;
}

.practice-card {
  background: #ffffff;
  border: 2px solid #e6e6fa;
  border-radius: 8px;
  padding: 1.5rem;
}

.practice-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #191970;
  margin-bottom: 1rem;
}

.practice-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.do-section,
.dont-section {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
}

.do-section h5 {
  color: #28a745;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
}

.dont-section h5 {
  color: #dc3545;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
}

.practice-list {
  list-style: none;
  font-size: 0.85rem;
  color: #555;
}

.practice-list li {
  margin-bottom: 0.5rem;
  padding-left: 1rem;
  position: relative;
}

.practice-list li:before {
  content: '•';
  position: absolute;
  left: 0;
  color: #6a11cb;
}

/* Visual Examples Section */
.visual-examples {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15mm;
  margin-top: 10mm;
}

.visual-card {
  background: #ffffff;
  border: 2px solid #e6e6fa;
  border-radius: 8px;
  overflow: hidden;
}

.visual-preview {
  height: 200px;
  background: #f8f9fa;
  position: relative;
  overflow: hidden;
}

.visual-info {
  padding: 1.5rem;
}

.visual-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #191970;
  margin-bottom: 0.5rem;
}

.visual-description {
  font-size: 0.9rem;
  color: #555;
  line-height: 1.5;
}

/* Visual Identity Synthesizer */
.identity-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.identity-card {
  background: #ffffff;
  border: 2px solid #e6e6fa;
  border-radius: 8px;
  overflow: hidden;
}

.identity-title {
  background: #f8f9fa;
  padding: 1rem;
  font-weight: 600;
  color: #191970;
  border-bottom: 1px solid #e6e6fa;
}

.identity-content {
  padding: 1.5rem;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .logo-variants,
  .color-palette,
  .typography-grid,
  .practices-container,
  .visual-examples,
  .identity-grid {
    grid-template-columns: 1fr;
  }
  
  .practice-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .brand-header-modern h1 {
    font-size: 2rem;
  }
  
  .brand-header-modern .subtitle {
    font-size: 1rem;
  }
}
    </style>

TECHNICAL CONSTRAINTS:
- No !important
- Use logical properties
- REM/EM units only
- Alphabetical properties
- Minified output

PROVIDED SECTIONS SUMMARY:
[INSERT_ALL_SECTIONS_SUMMARY_HERE]`;