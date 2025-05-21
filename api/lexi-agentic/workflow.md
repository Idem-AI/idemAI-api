# AI Builder Project Workflow

This document outlines the general automated workflow for the "Agentic Coding Framework" project. The process is designed to guide a software development project from initial idea to deployment, orchestrated by AI agents and structured prompts.

## Workflow Diagram

```mermaid
flowchart TD
    A0[Phase 0: Startup & Initialization (00_Getting_Started.md, 01_AutoPilot.md)] --> A
    A[Phase 1: Idea (01_Idea.md)] --> B
    B[Phase 2: Market Research, Diagrams & Brand Identity (02_Market_Research.md)] --> C
    C[Phase 3: Core Concept (03_Core_Concept.md)] --> D
    D[Phase 4: PRD Generation (04_PRD_Generation.md)] --> E
    E[Phase 5: Specifications & Technical Docs (05_Specs_Docs.md)] --> F
    F[Phase 6: Task Manager (06_Task_Manager.md & Roo_Task_Workflow.md)] --> G
    G[Phase 6.5: README Generation (in 01_AutoPilot.md)] --> H
    H[Phase 7: Implementation (07_Start_Building.md)] --> I
    I[Phase 8: Testing (08_Testing.md)] --> J
    J[Phase 9: Deployment (09_Deployment.md)] --> K
    K[Phase 10: Iteration]

    A0 -- Reads & Continuously Updates --> PSJ([project_session_state.json])
    A -- Creates --> idea_document.md
    A -- User Validation --> B
    B -- Creates --> market_research.md
    B -- User Validation (Optional Review) --> C
    C -- Creates --> core_concept.md
    C -- User Validation --> D
    D -- Creates --> project_prd.md
    D -- User Validation (Optional Review) --> E
    E -- Creates/Populates --> TechDocs[Files in 02_AI-DOCS/ & 03_SPECS/]
    E -- Creates/Updates --> SpecsIndex([03_SPECS/documentation_index.md])
    F -- Creates --> TasksJSON([tasks/tasks.json])
    F -- User Validation (Priorities) --> G
    G -- Creates/Updates --> ReadmeDoc([README.md])
    H -- Implements code --> SourceCode[Project Source Code]
    H -- User Validation (Features) --> I
    I -- Validates --> PreviewEnv[Preview Environment]
    I -- User Validation (Preview) --> J
    J -- Deploys --> DeployedApp[Deployed Application]
    J -- User Validation (Deployment) --> K
```

## Key Operational Principles:

*   **Orchestration:** The entire workflow is primarily orchestrated by the script and logic defined in [`01_AI-RUN/01_AutoPilot.md`](01_AI-RUN/01_AutoPilot.md:1).
*   **State Management:** The [`project_session_state.json`](project_session_state.json:1) file is critical. It's read at startup and **continuously updated** by the AI agent after every significant step within each phase to track progress, store key information, and manage state.
*   **Sequential Prompts:** Each phase (1-9) is driven by a corresponding `.md` file in the `01_AI-RUN/` directory, which defines the AI's role and tasks for that phase.
*   **Document Generation:** Specific documents are generated at each phase (e.g., `idea_document.md`, `project_prd.md`, `tasks/tasks.json`), serving as inputs for subsequent phases. Technical documentation and specifications in `02_AI-DOCS/` and `03_SPECS/` are created from templates.
*   **User Validation:** The workflow includes explicit points for user validation and intervention, as indicated in the diagram and detailed in [`01_AI-RUN/01_AutoPilot.md`](01_AI-RUN/01_AutoPilot.md:1).
*   **MCP Integration:** The AI agents leverage Model Context Protocol (MCP) servers for extended capabilities like research, tool usage, and interaction with external services.
*   **Spec-Driven Development:** The process emphasizes adherence to specifications detailed in the PRD and technical documents.

This diagram provides a high-level overview. For detailed step-by-step logic, refer to [`01_AI-RUN/01_AutoPilot.md`](01_AI-RUN/01_AutoPilot.md:1) and [`logic.md`](logic.md:1).