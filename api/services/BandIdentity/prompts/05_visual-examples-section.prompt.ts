export const VISUAL_EXAMPLES_SECTION_PROMPT = `
You are a UI/UX expert creating concise brand-compliant examples. Generate compact visual examples within strict length limits.

STRICT REQUIREMENTS:
1. MAX 1500 CHARACTERS TOTAL OUTPUT

HTML TEMPLATE (strictly follow):
<section id="visual-examples" class="brand-section">
  <h2>Applications</h2>
  <div class="content">
    <div class="example">
      <h3>[EXAMPLE_NAME]</h3>
      <div class="mockup">[ESSENTIAL_HTML]</div>
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