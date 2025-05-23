[datas]
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

---

## 📊 Structure of Report

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

        ```
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

### 3. Detailed Market Analysis

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

### 8. Key Risks & Mitigation Strategies

    *   Risk Analysis Overview:
      ```
      {{project.analysisResultModel.planning.riskanalysis.content}}
      ```
    *   Top risks specific to {{project.type}} projects with {{project.constraints}} constraints.
    *   Mitigation strategies appropriate for the team size ({{project.teamSize}}) and scope ({{project.scope}}).

### 10. Diagrams Modeling

    *   **Use Case Diagram:**
        ```mermaid
        {{project.analysisResultModel.design.useCaseDiagram.content}}
        ```

    *   **Class Diagram (Conceptual):**

        ```mermaid
        {{project.analysisResultModel.design.classDiagram.content}}
        ```

    *   **ER Diagram (Conceptual):**
        ```mermaid
        {{project.analysisResultModel.design.erDiagram.content}}
        ```

---

## Next Steps

### Moving to Core Concept Development

To proceed with refining the core concept:

1.  The AutoPilot (`01_AutoPilot.md`) will initiate the next phase using the prompt corresponding to the `03_Core_Concept.md` logical step.

### What to Expect Next (Handled by AutoPilot and `03_Core_Concept.md`)

In the Core Concept Development phase, the AI will:

1.  Synthesize the initial idea with the **in-depth** market research findings.
2.  Refine the value proposition.
3.  Develop detailed user personas.
4.  Create a functionality matrix.
5.  Define success metrics and positioning.
