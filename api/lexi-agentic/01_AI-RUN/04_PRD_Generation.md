# PRD Generation Expert Prompt

## Context Awareness

**Previous Phases:**

- Idea Document `01_Idea.md`
- Market Research `02_Market_Research.md`
- Core Concept `03_Core_Concept.md`

**Expected Inputs:**

- A refined `03_Core_Concept.md` document.

**Current Phase:** PRD Generation

## Input Context

You have access to three critical documents:

1. **The Core Concept Document** - Contains the refined, market-validated concept with target users, value proposition, and key features

### Core Concept Integration

Seamlessly integrate the validated core concept throughout the PRD:

- Use the refined value proposition as the foundation for the Product Vision (Section 1.3)
- Incorporate validated user personas directly into User Personas (Section 2.4)
- Map the Core Functionality Matrix to High-Level Feature List (Section 3.1)
- Ensure the Unique Selling Points inform the Unique Value Proposition (Section 2.6)
- Apply the Success Metrics to Key Performance Indicators (Section 1.5)
- Incorporate identified risks into the Risks and Dependencies section (Section 10)

### Technical Expertise of Branding

````
        {{project.analysisResultModel.branding.brandDefinition.content}}
        ```
        ```
        {{project.analysisResultModel.branding.toneOfVoice.content}}
        ```
    *   **Visual Identity Guidelines:**
        ```
        {{project.analysisResultModel.branding.visualIdentityGuidelines.content}}
        ```
    *   **Typography System:**
        ```
        {{project.analysisResultModel.branding.typographySystem.content}}
        ```
    *   **Color System:**
        ```
        {{project.analysisResultModel.branding.colorSystem.content}}
        ```
    *   **Iconography and Imagery:**
        ```
        {{project.analysisResultModel.branding.iconographyAndImagery.content}}
        ```
    *   **Layout and Composition:**
        ```
        {{project.analysisResultModel.branding.layoutAndComposition.content}}
        ```
    *   **Logo:**
        ```
        {{project.analysisResultModel.branding.logo.content}}
        ```
    *   **Summary of Brand Identity:**
        ```
        {{project.analysisResultModel.branding.summary.content}}
        ```

### Section-Specific Guidelines

    *   **3.1. Market Definition & Target Audience:**
        *   Target Market: {{project.targets}}
        *   Project Scope: {{project.scope}}
        *   Detailed description of primary, secondary, and tertiary target user segments (demographics, psychographics, behaviors, needs).
        *   Quantify market size if possible (e.g., TAM, SAM, SOM estimates or qualitative descriptions of scale).
    *   **3.2. Market Trends & Technology Landscape:**
        ```
        {{project.analysisResultModel.planning.marketTrendsAndTechnologyLandscape.content}}
        ```
    *   **3.3. User Requirements & Needs Assessment:**
        ```
        {{project.analysisResultModel.planning.userRequirementsAndNeedsAssessment.content}}
        ```
        *   Requirements Gathering Analysis:
          ```
          {{project.analysisResultModel.planning.requirementsGathering.content}}
          ```
        *   Use Case Models:
          ```
          {{project.analysisResultModel.planning.useCaseModeling.content}}
          ```


### Test and Validation Plan (Section 6)

- Develop acceptance criteria in Gherkin format for each feature
- Create detailed test scenarios covering happy paths and edge cases
- Define performance and security testing methodologies

### Deployment and Launch Plan (Section 7)

- Outline a phased deployment strategy with staging and production environments
- Specify infrastructure requirements and configuration
- Detail rollback procedures for critical failures

### AI Agent Specific Instructions (Section 9)

- Provide clear guidance on feature decomposition process
- Define coding standards and documentation requirements (which will be further detailed in the project-specific `../02_AI-DOCS/Conventions/coding_conventions.md` created in the next phase)
- Establish commit conventions and versioning strategy


## Final Validation Checklist

## Next Steps

### Saving Your Output

Once this PRD generation is complete:

1. Ensure the completed PRD content is saved in the **copied file**, `04_PRD_Generation.md`, located in the project's root directory (or designated output location).
2. Confirm the original template file (`01_AI-RUN/Template/PRD_template.md`) remains unmodified.
3. This comprehensive `04_PRD_Generation.md` will guide all subsequent development activities.

### Moving to Technical Specifications & Documentation

To proceed with updating the technical specifications and documentation:

1. Open the prompt file in `01_AI-RUN/` that corresponds to the `05_Specs_Docs.md` logical step. (Ensure `00_AutoPilot.md` or your manual process calls the correct actual filename for specs & docs).
2. Share it with your AI agent.
3. Reference your completed `04_PRD_Generation.md`.

````

@TechDocNavigator

Please gather and organize all technical documentation needed for implementing my project. You can find:

- The complete PRD at: `04_PRD_Generation.md`

I need a comprehensive knowledge repository that will serve as the technical foundation for implementation.

```

### What to Expect Next

In the Technical Specifications & Documentation phase, the AI will:

1. Analyze the `04_PRD_Generation.md` to identify all technologies, frameworks, libraries, and APIs.
2. Gather relevant documentation from official sources, GitHub, and other repositories (using MCPs like context7, github, firecrawl).
3. **Create new project-specific files** within `02_AI-DOCS/` and `03_SPECS/` directories by copying the relevant templates and then populating these new files with the gathered and project-specific information. The original templates will remain untouched.
4. Generate supplementary documentation for any gaps and integrate it into the relevant existing files.
5. Create/Update a master index of all technical resources (e.g., `03_SPECS/documentation_index.md`).

This technical documentation repository will serve as the persistent memory for the development team during implementation.
```
