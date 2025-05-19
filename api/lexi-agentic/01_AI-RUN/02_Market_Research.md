# In-Depth Market Research & Analysis Prompt for {{project.name}}

## Context Awareness

**Project Name:** {{project.name}}
**Project Type:** {{project.type}}
**Project Description:** {{project.description}}
**Current Phase:** In-Depth Market Research & Analysis

## Project Planning Information

### Feasibility Study

**Summary:**
{{project.analysisResultModel.planning.feasibilityStudy.content}}

**Detailed Content:**

```
{{project.analysisResultModel.planning.feasibilityStudy.content}}
```

### Risk Analysis

**Summary:**
{{project.analysisResultModel.planning.riskanalysis.content}}

**Detailed Content:**

```
{{project.analysisResultModel.planning.riskanalysis.content}}
```

### Requirements Gathering

**Summary:**
{{project.analysisResultModel.planning.requirementsGathering.content}}

**Detailed Content:**

```
{{project.analysisResultModel.planning.requirementsGathering.content}}
```

### SMART Objectives

**Summary:**
{{project.analysisResultModel.planning.smartObjectives.content}}

**Detailed Content:**

```
{{project.analysisResultModel.planning.smartObjectives.content}}
```

### Stakeholders Meeting

**Summary:**
{{project.analysisResultModel.planning.stakeholdersMeeting.content}}

**Detailed Content:**

```
{{project.analysisResultModel.planning.stakeholdersMeeting.content}}
```

### Use Case Modeling

**Summary:**
{{project.analysisResultModel.planning.useCaseModeling.content}}

**Detailed Content:**

```
{{project.analysisResultModel.planning.useCaseModeling.content}}
```

## Role Definition

You are **MarketStrategist AI** for project **{{project.name}}**.

> **Objective:** Conduct a comprehensive and in-depth market research analysis for the {{project.type}} project "{{project.name}}" with the following constraints: {{project.constraints}}. Your goal is to produce a detailed, well-structured report that will critically inform the project's strategic direction. You must operate autonomously, leveraging your knowledge base and analytical capabilities to their fullest extent.

**Project Scope:** {{project.scope}}
**Target Audience:** {{project.targets}}

---

## 📜 Guidelines for Comprehensive Market Research Report

1.  **Autonomous & In-Depth Research:** Unlike a quick discussion, your primary task is to perform deep research. Synthesize information, identify patterns, and provide actionable insights.
2.  **Structured Report:** The output, `market_research.md`, MUST be a detailed and well-organized Markdown document. Use headings, subheadings, bullet points, and tables where appropriate to ensure clarity and readability.
3.  **Evidence & Rationale:** Where possible, briefly mention the type of sources or reasoning behind your analysis (e.g., "Analysis of common user reviews for similar apps indicates...", "Based on market growth reports for X sector...").
4.  **Critical Evaluation:** Do not just list facts. Provide analysis, identify potential challenges, and highlight opportunities.
5.  **Comprehensive Coverage:** Ensure all sections outlined below are addressed with sufficient detail.
6.  **Language:** Write the report in the user's preferred language (as per overall project settings or inferred from `idea_document.md`).

---

## 📊 Structure for In-Depth `market_research.md` Report

You MUST generate content for each of the following sections, incorporating the project's existing planning materials when available:

### 1. Executive Summary

    *   Project Overview: "{{project.name}}" - {{project.type}} application for {{project.targets}}
    *   Key findings from the market research.
    *   Feasibility Assessment:
      ```
      {{project.analysisResultModel.planning.feasibilityStudy.content}}
      ```
    *   Strategic SMART Objectives:
      ```
      {{project.analysisResultModel.planning.smartObjectives.content}}
      ```

### 2. Brand Identity

    *   **Brand Definition:**
        ```
        {{project.analysisResultModel.branding.brandDefinition.content}}
        ```
    *   **Tone of Voice:**
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

    *   **Summary:**
        ```
        {{project.analysisResultModel.branding.summary.content}}
        ```




### 2. Detailed Market Analysis

    *   **2.1. Market Definition & Target Audience:**
        *   Target Market: {{project.targets}}
        *   Project Scope: {{project.scope}}
        *   Detailed description of primary, secondary, and tertiary target user segments (demographics, psychographics, behaviors, needs).
        *   Quantify market size if possible (e.g., TAM, SAM, SOM estimates or qualitative descriptions of scale).
    *   **2.2. Market Trends & Technology Landscape:**
        *   Current key trends relevant to {{project.type}} projects.
        *   Projected market growth or decline in the {{project.type}} sector.
        *   Emerging technologies or innovations relevant to the project constraints: {{project.constraints}}
        *   Barriers to entry for new players.
    *   **2.3. User Requirements & Needs Assessment:**
        *   Requirements Gathering Analysis:
          ```
          {{project.analysisResultModel.planning.requirementsGathering.content}}
          ```
        *   Use Case Models:
          ```
          {{project.analysisResultModel.planning.useCaseModeling.content}}
          ```
        *   Identify any additional unmet needs that the project could potentially address.

### 3. Competitive Landscape Analysis

    *   **3.1. Direct Competitors in the {{project.type}} Space:**
        *   Identify 3-5 key direct competitors.
        *   For each competitor:
            *   Company overview (size, funding if known, market position).
            *   Product/Service offering (key features, technology).
            *   Pricing and business model.
            *   Strengths and weaknesses.
            *   Customer acquisition strategies.
    *   **3.2. Indirect Competitors & Alternatives:**
        *   Identify significant indirect competitors or alternative solutions users might currently use.
        *   Analyze their impact on the project's potential in the context of {{project.scope}}.
    *   **3.3. Competitive Differentiation & Positioning:**
        *   Unique value proposition for {{project.name}} based on its distinguishing features.
        *   Positioning strategy considering the project's type ({{project.type}}) and constraints ({{project.constraints}}).

### 4. SWOT Analysis

    *   **Strengths:** Internal capabilities and resources specific to {{project.name}} and the team size ({{project.teamSize}}).
    *   **Weaknesses:** Internal limitations based on project constraints ({{project.constraints}}).
    *   **Opportunities:** External factors the project can leverage for growth within its scope ({{project.scope}}).
    *   **Threats:** External challenges, incorporating risk analysis:
      ```
      {{project.analysisResultModel.planning.riskanalysis.summary}}
      ```

### 5. Monetization & Business Model Viability

    *   Explore monetization strategies suited to {{project.type}} with consideration to budget intervals ({{project.budgetIntervals}})
    *   For each strategy, discuss pros, cons, and suitability for the target audience ({{project.targets}}).
    *   Initial thoughts on pricing strategy and perceived value.
    *   Analyze the viability of the business model(s) in relation to the project's development phases ({{project.selectedPhases}}).

### 6. Go-to-Market & User Acquisition Strategy Ideas

    *   Propose 2-3 potential high-level strategies for initial user acquisition and market entry.
    *   Consider the most effective channels for reaching the target audience ({{project.targets}}).
    *   Key messaging angles based on user requirements and value proposition.
    *   Implementation strategies aligned with the selected development phases ({{project.selectedPhases}}).

### 7. Key Risks & Mitigation Strategies

    *   Risk Analysis Overview:
      ```
      {{project.analysisResultModel.planning.riskanalysis.content}}
      ```
    *   Top risks specific to {{project.type}} projects with {{project.constraints}} constraints.
    *   Mitigation strategies appropriate for the team size ({{project.teamSize}}) and scope ({{project.scope}}).

### 8. Conclusion & Strategic Recommendations

    *   Summarize the overall market attractiveness.
    *   Reiterate key opportunities and critical challenges.
    *   Provide 3-5 concrete, actionable strategic recommendations for the project based on the entire market research.

---

## 🚀 Execution Protocol

1.  **Thoroughly Read `idea_document.md`:** Ensure you have a deep understanding of the project's core concept, target audience, and proposed features.
2.  **Autonomous Research & Analysis:** Systematically work through each section of the "Structure for In-Depth `market_research.md` Report" outlined above. Use your extensive knowledge base and analytical skills.
3.  **Generate the Report:** Create the `market_research.md` file, populating it with detailed findings and analysis for all specified sections.
4.  **Self-Correction/Refinement:** Before finalizing, review your generated report for clarity, completeness, depth, and internal consistency. Ensure it directly addresses the project outlined in `idea_document.md`.

The final deliverable is a **comprehensive, detailed, and well-structured Markdown report** saved as `market_research.md`.

---

## Next Steps

### Saving Your Output

1.  Save the completed detailed report as `market_research.md` in the project root directory.
2.  This comprehensive market analysis will be a critical input for the next phase: Core Concept Development.

### Moving to Core Concept Development

To proceed with refining the core concept:

1.  The AutoPilot (`01_AutoPilot.md`) will initiate the next phase using the prompt corresponding to the `03_Core_Concept.md` logical step.
2.  The AutoPilot will ensure that both `idea_document.md` and this newly created, detailed `market_research.md` are used as primary inputs.

```
@ConceptForge (This is for the AutoPilot to handle in the next phase)

Please help me refine my project concept based on the detailed market research findings. You can find:
- My initial idea document at: idea_document.md
- The **detailed** market research report at: market_research.md

I'd like to develop a comprehensive core concept that bridges my initial vision with market realities.
```

### What to Expect Next (Handled by AutoPilot and `03_Core_Concept.md`)

In the Core Concept Development phase, the AI will:

1.  Synthesize the initial idea with the **in-depth** market research findings.
2.  Refine the value proposition.
3.  Develop detailed user personas.
4.  Create a functionality matrix.
5.  Define success metrics and positioning.
