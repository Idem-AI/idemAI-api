# Technical Manual: {{project.name}} - Agentic Coding Framework

## Introduction

This document describes the internal logic and step-by-step operation of the "Agentic Coding Framework" workflow. It aims to provide a clear understanding of each phase of the process, the actions undertaken by the AI agent, the documents generated, and the expected interactions with the user.

This workflow is designed to guide a software development project from the initial idea to implementation, relying on a series of structured prompts and rigorous state management.

## Fundamental Principles

1.  **Orchestration:** The [`01_AI-RUN/01_AutoPilot.md`](01_AI-RUN/01_AutoPilot.md:1) file serves as the main orchestrator, guiding the AI through the different phases.
2.  **State Management:** The [`project_session_state.json`](project_session_state.json:1) file at the root of the project is crucial. It maintains the current state of the workflow (current phase, last completed step, project information, etc.) and allows the process to be resumed in case of interruption.
3.  **Prompt Sequence:** The workflow relies on a series of prompts (`.md` files in `01_AI-RUN/`) that define the AI's role and the tasks to be accomplished for each phase.
4.  **Document Generation:** Each phase produces specific documents (e.g., `idea_document.md`, `project_prd.md`, `tasks/tasks.json`) which serve as input for subsequent phases.
5.  **Template Management:** For technical documentation (`02_AI-DOCS/`) and specifications (`03_SPECS/`), the system **creates new project-specific files** based on the provided templates. The original templates remain intact.
6.  **Spec-Driven Vision:** The entire process is guided by the principle of spec-driven development, with AI agents consistently referring to and being guided by documentation. The overarching vision for AI collaboration and task management is detailed in [`02_AI-DOCS/Documentation/AI_Task_Management_Optimization.md`](02_AI-DOCS/Documentation/AI_Task_Management_Optimization.md:1).

## General Workflow Diagram

```mermaid
flowchart TD
    A0[Startup & Initialization (00_Getting_Started.md, 01_AutoPilot.md)] --> A
    A[Phase 1: Idea (01_Idea.md)] --> B
    B[Phase 2: Market Research, Diagrams & Brand Identity (02_Market_Research.md)] --> C
    C[Phase 3: Core Concept (03_Core_Concept.md)] --> D
    D[Phase 4: PRD Generation (04_PRD_Generation.md)] --> E
    E[Phase 5: Specifications & Technical Docs (05_Specs_Docs.md)] --> F
    F[Phase 6: Task Manager (06_Task_Manager.md)] --> G
    G[Phase 6.5: README Generation (in 01_AutoPilot.md)] --> H
    H[Phase 7: Implementation (07_Start_Building.md)] --> I
    I[Phase 8: Testing (08_Testing.md)] --> J
    J[Phase 9: Deployment (09_Deployment.md)] --> K
    K[Phase 10: Iteration]

    A0 -- Reads --> project_session_state.json
    A0 -- Updates --> project_session_state.json
    A -- Creates --> idea_document.md
    B -- Creates --> market_research.md
    C -- Creates --> core_concept.md
    D -- Creates --> project_prd.md
    E -- Creates/Populates --> Files in 02_AI-DOCS/ and 03_SPECS/
    E -- Creates/Updates --> 03_SPECS/documentation_index.md
    F -- Creates --> tasks/tasks.json
    G -- Creates/Updates --> README.md
    H -- Implements code --> Project source code
    I -- Validates --> Preview Environment
    J -- Deploys --> Deployed Application
```

## Detailed Workflow Phases

### Phase 0: Initialization and Startup

*   **Files Involved:**
    *   [`01_AI-RUN/00_Getting_Started.md`](01_AI-RUN/00_Getting_Started.md:1): General workflow guide, conventions.
    *   [`01_AI-RUN/01_AutoPilot.md`](01_AI-RUN/01_AutoPilot.md:1): Main orchestration prompt.
    *   [`project_session_state.json`](project_session_state.json:1): Session state file.
*   **Logic:**
    1.  The AI agent (initially "ProjectArchitect") is instructed by [`01_AI-RUN/01_AutoPilot.md`](01_AI-RUN/01_AutoPilot.md:1).
    2.  **State Check:** Attempts to load [`project_session_state.json`](project_session_state.json:1).
        *   If existing and populated, confirms with the user whether to resume or not.
        *   Manages pending actions or previous errors.
        *   If non-existent or empty, proceeds with a new initialization.
    3.  **Guide Reading:** The AI reads and internalizes [`01_AI-RUN/00_Getting_Started.md`](01_AI-RUN/00_Getting_Started.md:1) to understand the overall framework.
    4.  **Initial Information Gathering:** If a new project starts, the AI asks targeted questions to the user to define:
        *   `projectType` (Main project type, e.g., "React Web Application")
        *   `projectName` (Project name)
        *   `projectObjective` (Project objective, including target users, problem to solve, key MVP features)
        *   Business model, technological/design preferences (if known).
    5.  **State Update:** The collected information is saved in [`project_session_state.json`](project_session_state.json:1). `currentWorkflowPhase` is set to "ideaGeneration", `lastCompletedStep` to "initialInfoGathered".
*   **Why:** This phase ensures that the AI has all the necessary basic information and understands the project context before starting the substantive work. State management allows for persistence and resumption.

### Phase 1: Expansion of the Initial Idea

*   **Logic Prompt File:** [`01_AI-RUN/01_Idea.md`](01_AI-RUN/01_Idea.md:1)
*   **AI Role:** Idea structuring assistant.
*   **Inputs:** Initial project information (collected in Phase 0 or from [`project_session_state.json`](project_session_state.json:1)).
*   **Process:**
    1.  The AI uses the template provided by the `01_Idea.md` prompt to guide the user (or guide itself if in full AutoPilot mode) to detail:
        *   Project title.
        *   Central concept (pitch).
        *   Main problem solved.
        *   Proposed solution.
        *   Essential features (MVP).
        *   Initial design and technology preferences.
        *   Initial questions and uncertainties.
    2.  The state is saved in [`project_session_state.json`](project_session_state.json:1) before document creation (`pendingAction` set to `create_idea_document`), then updated after (`lastCompletedStep` to "ideaDocumentCreated", `pendingAction` cleared).
*   **Output:**
    *   `idea_document.md` file created at the project root.
    *   The AI presents this document to the user for validation.
*   **Transition:** After user validation, `lastCompletedStep` is updated to "ideaDocumentValidated" in [`project_session_state.json`](project_session_state.json:1), and `currentWorkflowPhase` transitions to "marketResearch".
*   **Why:** Formalizing the initial idea in a structured document ensures that all key aspects are considered and serves as a solid basis for subsequent steps, particularly market research.

### Phase 2: Automated (Interactive) Market Research, Diagrams & Brand Identity

*   **Logic Prompt File:** [`01_AI-RUN/02_Market_Research.md`](01_AI-RUN/02_Market_Research.md:1)
*   **AI Role:** "MarketResearch Assistant".
*   **Input:** The `idea_document.md` file.
*   **Process:**
    1.  The AI announces that it is conducting market research, including diagrams and brand identity aspects.
    2.  It uses the `02_Market_Research.md` prompt to structure an **interactive discussion** with the user (or an internal analysis if in AutoPilot mode) on:
        *   Understanding the idea and user pain points.
        *   Market and trends.
        *   Competition.
        *   Monetization and viability.
        *   Key opportunities and risks.
        *   Diagrams (e.g., user flow, architecture).
        *   Brand Identity (e.g., naming, tone, visual direction).
        *   Overall market attractiveness.
    3.  The AI synthesizes the discussion points. [`project_session_state.json`](project_session_state.json:1) is updated with `pendingAction` set to `create_market_research_document` before creation.
*   **Output:**
    *   `market_research.md` file created at the root, containing a concise summary of the market analysis, diagrams, and brand identity.
    *   The AI presents a summary of the main conclusions and asks if the user wants to review the full analysis or continue.
*   **Transition:** After user confirmation, `lastCompletedStep` is updated to "marketResearchCompleted" in [`project_session_state.json`](project_session_state.json:1) (and `pendingAction` cleared), and `currentWorkflowPhase` transitions to "coreConceptDevelopment".
*   **Why:** Validate the idea against the existing market, identify competitors, understand user segments, and assess economic viability before investing more time in concept development.

### Phase 3: Core Concept Development

*   **Logic Prompt File:** [`01_AI-RUN/03_Core_Concept.md`](01_AI-RUN/03_Core_Concept.md:1)
*   **AI Role:** "ConceptForge", product strategist.
*   **Inputs:** `idea_document.md` and `market_research.md`.
*   **Process:**
    1.  The AI announces that it is developing the core concept.
    2.  It uses the `03_Core_Concept.md` prompt to synthesize information from the input documents and define:
        *   Summary of concept evolution.
        *   Refined value proposition.
        *   Detailed user personas (primary and secondary).
        *   Core feature matrix (linking user pain points, features, value, and priority).
        *   Unique Selling Points (USPs).
        *   Concept positioning.
        *   Success metrics.
        *   Risks and mitigation strategies.
        *   Concept visualization.
    3.  [`project_session_state.json`](project_session_state.json:1) is updated with `pendingAction` set to `create_core_concept_document` before creation.
*   **Output:**
    *   `core_concept.md` file created at the root.
    *   The AI presents the value proposition and key feature matrix for validation.
*   **Transition:** After user validation, `lastCompletedStep` is updated to "coreConceptValidated" in [`project_session_state.json`](project_session_state.json:1) (and `pendingAction` cleared), and `currentWorkflowPhase` transitions to "prdGeneration".
*   **Why:** Refine the initial idea into a solid, market-validated concept that will serve as a direct foundation for the Product Requirements Document (PRD).

### Phase 4: PRD (Product Requirements Document) Generation

*   **Logic Prompt File:** [`01_AI-RUN/04_PRD_Generation.md`](01_AI-RUN/04_PRD_Generation.md:1)
*   **AI Role:** "PRDarchitect", expert in product management and full-stack architecture.
*   **Inputs:**
    *   `core_concept.md`.
    *   The PRD template (typically [`01_AI-RUN/Template/PRD_template.md`](01_AI-RUN/Template/PRD_template.md:1)).
    *   Specific user information.
*   **Process:**
    1.  The AI announces the PRD creation.
    2.  It **scrupulously** follows the PRD template structure to create a new file.
    3.  It integrates elements from `core_concept.md` into the appropriate sections of the PRD.
    4.  It adapts the PRD based on specific information provided by the user, particularly design preferences.
    5.  It uses its technical expertise to detail specifications (system architecture, data model, APIs, test strategies).
    6.  Particular attention is paid to section 5.2 (Design System) to obtain user design preferences, crucial for initializing `design_conventions.md` later.
    7.  [`project_session_state.json`](project_session_state.json:1) is updated with `pendingAction` set to `create_project_prd_document` before creation.
*   **Output:**
    *   `project_prd.md` file created at the root.
    *   The AI presents an executive summary with links to the full sections and asks if the user wants to review specific sections.
*   **Transition:** After user confirmation, `lastCompletedStep` is updated to "prdValidated" in [`project_session_state.json`](project_session_state.json:1) (and `pendingAction` cleared), and `currentWorkflowPhase` transitions to "technicalDocumentation".
*   **Why:** Create the single, exhaustive reference document that will guide all product development, ensuring all requirements (functional, non-functional, technical, design) are clearly defined.

### Phase 5: Creation of Technical Specifications and Documentation

*   **Logic Prompt File:** [`01_AI-RUN/05_Specs_Docs.md`](01_AI-RUN/05_Specs_Docs.md:1)
*   **AI Role:** "TechDocNavigator", technical documentation specialist.
*   **Input:** The `project_prd.md` file.
*   **Process:**
    1.  The AI announces the update/creation of technical documentation.
    2.  **PRD Analysis:** Extracts all technologies, frameworks, APIs, etc., from `project_prd.md`.
    3.  **Information Gathering:** Uses MCPs (like `context7`, `github`, `firecrawl`) to retrieve official documentation, code examples, etc., for each identified technical element.
    4.  **Creation of Project-Specific Documents:**
        *   The AI **creates new files** in the subdirectories of `02_AI-DOCS/` (e.g., `02_AI-DOCS/Architecture/architecture.md`) and `03_SPECS/` (e.g., `03_SPECS/features/feature_spec_FEAT-001.md`). For feature specifications, filenames should follow the pattern `03_SPECS/features/feature_spec_[FEATURE_ID].md`, where `[FEATURE_ID]` is derived from the PRD or the task structure managed by Roo Orchestrator (see [`02_AI-DOCS/TaskManagement/Roo_Task_Workflow.md`](02_AI-DOCS/TaskManagement/Roo_Task_Workflow.md:1)).
        *   To do this, it **copies** the appropriate template (e.g., `architecture_template.md`) to the new file name. The `write_to_file` tool will handle directory creation if needed.
        *   It reads the structure of the newly copied file and **populates** it with relevant information extracted from the PRD and collected documentation.
        *   The original templates (`*_template.md`) **are not modified**.
        *   Particular attention is given to `02_AI-DOCS/Conventions/design_conventions.md` which is populated based on `02_AI-DOCS/Documentation/AI_Design_Agent_Optimization.md` and PRD preferences.
    5.  **Indexing:** Creates or updates `03_SPECS/documentation_index.md` to list and link all created technical documents and reference documents (like `AI_Coding_Agent_Optimization.md`). The AI should be capable of listing files in specified directories and generating markdown links.
    6.  The documents `02_AI-DOCS/Documentation/AI_Coding_Agent_Optimization.md` and `AI_Design_Agent_Optimization.md` serve as references and are not copied/modified.
*   **Output:**
    *   Set of project-specific technical documents created and populated in `02_AI-DOCS/` and `03_SPECS/`.
    *   An updated `03_SPECS/documentation_index.md` file.
    *   The AI presents a summary of the technical stack and key integrations.
*   **Transition:** Once all documents are generated and `documentation_index.md` is updated, `lastCompletedStep` is set to "technicalDocumentationCompleted" in [`project_session_state.json`](project_session_state.json:1), and `currentWorkflowPhase` transitions to "taskManagement".
*   **Why:** Build a solid, project-specific technical knowledge repository that will serve as a basis for task breakdown and implementation.

### Phase 6: Task Manager

*   **Logic Prompt File:** (The old [`01_AI-RUN/06_Task_Manager.md`](01_AI-RUN/06_Task_Manager.md:1) now redirects to the primary workflow document: [`02_AI-DOCS/TaskManagement/Roo_Task_Workflow.md`](02_AI-DOCS/TaskManagement/Roo_Task_Workflow.md:1))
*   **AI Role:** Interface with Roo Orchestrator for task management.
*   **Inputs:**
    *   `project_prd.md`.
    *   Project-specific technical documents created in `02_AI-DOCS/` and `03_SPECS/`.
    *   Design principles from `02_AI-DOCS/Documentation/AI_Design_Agent_Optimization.md`.
*   **Process:**
    1.  The AI announces the project breakdown into tasks.
    2.  It prepares a prompt for Roo Orchestrator by extracting project contextual information (name, objective) and the list of features (Section 3.1 of the PRD) in JSON format, as outlined in [`02_AI-DOCS/TaskManagement/Roo_Task_Workflow.md`](02_AI-DOCS/TaskManagement/Roo_Task_Workflow.md:1).
    3.  **Interaction with Roo Orchestrator:**
        *   Instructs Roo Orchestrator to initialize project tracking.
        *   Instructs Roo Orchestrator to create epics from the feature list.
        *   For each epic, instructs Roo Orchestrator to perform a detailed breakdown into tasks (max 4h per task), emphasizing the inclusion of technical details and design requirements (referencing [`02_AI-DOCS/Conventions/design_conventions.md`](02_AI-DOCS/Conventions/design_conventions.md:1) and [`02_AI-DOCS/Documentation/AI_Design_Agent_Optimization.md`](02_AI-DOCS/Documentation/AI_Design_Agent_Optimization.md:1)). Roo Orchestrator may engage Roo Code mode for these technical specifics.
        *   Ensures that the `details` field of each task (as defined in [`02_AI-DOCS/TaskManagement/Tasks_JSON_Structure.md`](02_AI-DOCS/TaskManagement/Tasks_JSON_Structure.md:1)) contains direct links or embedded references to specific feature specifications (e.g., `03_SPECS/features/feature_spec_FEAT-XXX.md`), relevant design mockups/guidelines (from [`02_AI-DOCS/Conventions/design_conventions.md`](02_AI-DOCS/Conventions/design_conventions.md:1)), and any other necessary technical documentation.
        *   Instructs Roo Orchestrator to perform a complexity analysis for each task and epic.
        *   Instructs Roo Orchestrator to generate an implementation roadmap (this might involve Roo Orchestrator synthesizing task information).
    4.  The AI may initiate additional refinement requests to Roo Orchestrator if some tasks still seem too large or ambiguous.
    5.  [`project_session_state.json`](project_session_state.json:1) is updated with `pendingAction` set to `generate_tasks_file` before `tasks/tasks.json` is finalized.
*   **Output:**
    *   [`tasks/tasks.json`](tasks/tasks.json:1) file created/updated with the complete task hierarchy (including `meta` block, epics, tasks, sub-tasks), their `id`, `title`, `description`, `status`, `dependencies`, `priority`, `details` (with design specifications), `testStrategy`, etc., as defined in [`02_AI-DOCS/TaskManagement/Tasks_JSON_Structure.md`](02_AI-DOCS/TaskManagement/Tasks_JSON_Structure.md:1).
    *   The AI presents high-level epics and priority tasks.
    *   Asks the user if they want to modify priorities before implementation.
*   **Transition:** After user confirmation of priorities, `lastCompletedStep` is updated to "taskPrioritiesConfirmed" in [`project_session_state.json`](project_session_state.json:1) (and `pendingAction` cleared), and `currentWorkflowPhase` transitions to "readmeGeneration".
*   **Why:** Transform PRD requirements into a concrete, granular action plan, facilitating estimation, resource allocation, and implementation tracking.

### Phase 6.5: README Generation

*   **Logic Prompt File:** Managed within [`01_AI-RUN/01_AutoPilot.md`](01_AI-RUN/01_AutoPilot.md:1) (section "Phase 6.5").
*   **AI Role:** Technical writer.
*   **Inputs:**
    *   `projectName`, `projectType`, `projectObjective` from [`project_session_state.json`](project_session_state.json:1).
    *   Technical stack details from `02_AI-DOCS/Architecture/architecture.md` (created in phase 5) or `project_prd.md`.
*   **Process:**
    1.  The AI announces the `README.md` generation.
    2.  It assembles the Markdown content including:
        *   Quick start instruction for the AI agent (to restart the workflow).
        *   Project title.
        *   Project type badge.
        *   Short description.
        *   "Main Technical Stack" section.
        *   "Quick Start (Manual)" section (placeholder).
        *   "Project Structure" section.
    3.  Uses the `write_to_file` tool to save the content to `README.md` at the root, overwriting the existing file.
*   **Output:** `README.md` file created/updated at the project root.
*   **Transition:** `lastCompletedStep` is updated to "readmeGenerated" in [`project_session_state.json`](project_session_state.json:1), and `currentWorkflowPhase` transitions to "implementation". Automatic to the next phase.
*   **Why:** Provide a clear entry point for the project, explaining its objective, structure, and how to get started (manually or with AI).

### Phase 7: Implementation

*   **Logic Prompt File:** [`01_AI-RUN/07_Start_Building.md`](01_AI-RUN/07_Start_Building.md:1)
*   **AI Role:** "ImplementationArchitect", full-stack developer and technical lead.
*   **Inputs:**
    *   `project_prd.md`.
    *   Project-specific technical documents in `02_AI-DOCS/` (notably `architecture.md`, `coding_conventions.md`, `design_conventions.md`) and `03_SPECS/` (notably `feature_spec_[ID].md`).
    *   `tasks/tasks.json`.
    *   Design principles from `02_AI-DOCS/Documentation/AI_Design_Agent_Optimization.md`.
*   **Process:**
    1.  **Project Setup:**
        *   Set up the development environment according to the PRD stack.
        *   Initialize the project (framework, dependencies), **including creating the base source code directory structure (e.g., `src/`, `src/components/`, `src/services/`, `src/utils/` as defined in `architecture.md` or relevant conventions).** The `write_to_file` tool used for creating initial files will handle directory creation.
        *   Configure version control (e.g., `git init`, create `.gitignore`).
    2.  **Architecture Implementation:**
        *   Implement core architectural components as per `architecture.md` and high-priority architectural tasks from `tasks/tasks.json`.
        *   Configure the database schema based on `project_prd.md` and `architecture.md`.
    3.  **Systematic Task Implementation:**
        *   The AI interacts with Roo Orchestrator to get the next task to implement (as per the workflow in [`02_AI-DOCS/TaskManagement/Roo_Task_Workflow.md`](02_AI-DOCS/TaskManagement/Roo_Task_Workflow.md:1)).
        *   For each task:
            *   Analyzes detailed specifications and acceptance criteria for the task (obtained by querying Roo Orchestrator for task details, which include direct links or embedded content from relevant documents like `feature_spec_[ID].md`, design mockups, and convention documents found in the task's `details` field as per [`02_AI-DOCS/TaskManagement/Tasks_JSON_Structure.md`](02_AI-DOCS/TaskManagement/Tasks_JSON_Structure.md:1)).
            *   Writes code, scrupulously respecting coding and design conventions (references to [`02_AI-DOCS/Conventions/coding_conventions.md`](02_AI-DOCS/Conventions/coding_conventions.md:1), [`02_AI-DOCS/Conventions/design_conventions.md`](02_AI-DOCS/Conventions/design_conventions.md:1), [`02_AI-DOCS/Documentation/AI_Design_Agent_Optimization.md`](02_AI-DOCS/Documentation/AI_Design_Agent_Optimization.md:1)).
            *   Uses appropriate MCPs (e.g., `@21st-dev/magic` for UI components, GitHub MCP for commits).
            *   Writes tests (unit, integration) as specified in the task or conventions.
            *   Documents the code as per conventions.
            *   Verifies against acceptance criteria.
            *   Commits changes (potentially using GitHub MCP).
            *   Updates task status by informing Roo Orchestrator.
    4.  **Continuous Progression:** The AI requests the next task from Roo Orchestrator and reports its progress. [`project_session_state.json`](project_session_state.json:1) is updated with `lastCompletedStep` reflecting the ID of the last completed task.
*   **Output:** Functional project source code, tests, associated documentation.
*   **Transition:** Once all tasks in `tasks/tasks.json` are completed (verified by checking statuses with Roo Orchestrator), `lastCompletedStep` is updated to "implementationCompleted" in [`project_session_state.json`](project_session_state.json:1), and `currentWorkflowPhase` moves to "testing".
*   **Why:** Transform plans and specifications into a functional product, following a structured approach and maintaining high code and documentation quality.

### Phase 8: Testing

*   **Logic Prompt File:** [`01_AI-RUN/08_Testing.md`](01_AI-RUN/08_Testing.md:1)
*   **AI Role:** "QualityGuardian", QA Engineer.
*   **Inputs:**
    *   Implemented source code and features.
    *   `project_prd.md` (for acceptance criteria).
    *   Technical specifications and test cases defined in `03_SPECS/` or within task details in `tasks/tasks.json`.
*   **Process:**
    1.  **Test Execution:**
        *   The AI systematically executes all defined tests (unit, integration, E2E).
        *   It verifies that each feature behaves as specified in the PRD and technical documents.
        *   It checks for correct API calls, data handling, and UI interactions.
    2.  **Preview Setup:**
        *   The AI sets up a preview environment (e.g., a staging deployment) or provides clear, step-by-step instructions for the user to access a preview of the application. This might involve using MCPs for deployment or local server commands.
    3.  **User Acceptance Testing (UAT) Support:**
        *   The AI presents the preview to the user for final validation.
        *   It assists the user in UAT, potentially guiding them through test scenarios.
    4.  **Issue Resolution:**
        *   If issues are found, the AI logs them (potentially creating bugfix tasks in `tasks/tasks.json` via Roo Orchestrator).
        *   It then attempts to fix the identified issues, re-tests, and updates the preview. This loop continues until the user is satisfied.
    5.  **State Update:** [`project_session_state.json`](project_session_state.json:1) is updated. `lastCompletedStep` could be "testingCompleted" or "previewValidated".
*   **Output:**
    *   A thoroughly tested application.
    *   A preview environment or accessible preview.
    *   Test reports or summaries (optional).
*   **Transition:** Once all features are tested and the preview is validated by the user, `lastCompletedStep` is updated to "testingAndPreviewValidated" (or "finalValidationCompleted") in [`project_session_state.json`](project_session_state.json:1), and `currentWorkflowPhase` moves to "deployment".
*   **Why:** Ensure all implemented features are working correctly and meet user expectations before official deployment, minimizing post-deployment issues.

### Phase 9: Deployment

*   **Logic Prompt File:** [`01_AI-RUN/09_Deployment.md`](01_AI-RUN/09_Deployment.md:1)
*   **AI Role:** "DeployMaster", DevOps Engineer.
*   **Inputs:**
    *   Fully tested and validated application.
    *   `project_prd.md` (Section 7: Deployment Plan).
    *   Project-specific `02_AI-DOCS/Deployment/deployment_guide.md` (created in Phase 5).
*   **Process:**
    1.  **Pre-Deployment Checklist:** AI verifies all prerequisites (environment config, final build, backups).
    2.  **Execute Deployment:** AI follows `deployment_guide.md` to deploy to production, using MCPs or CLI commands as needed.
    3.  **Post-Deployment Verification:** AI performs smoke tests and health checks in the production environment.
    4.  **State Update:** [`project_session_state.json`](project_session_state.json:1) is updated. `lastCompletedStep` to "productionDeploymentCompleted".
*   **Output:**
    *   Application successfully deployed to production.
    *   Confirmation of stability and functionality.
*   **Transition:** After successful deployment, `currentWorkflowPhase` moves to "iteration".
*   **Why:** To release the validated and tested product to users and make it publicly available.

### Phase 10: Iteration (Conceptual)

*   **Logic:** This phase follows successful deployment. `currentWorkflowPhase` is "iteration".
*   **Process:**
    1.  **Monitoring & Feedback Collection:** The AI can assist in setting up monitoring (if not already done) and the user collects feedback on the deployed product.
    2.  **New Cycle Planning:** For a new iteration, the user can instruct the AI to restart the workflow (potentially returning to Phase 1: Idea, or directly to Phase 3: Core Concept or Phase 6: Task Manager for new features if the core concept remains). The AI would use the existing [`project_session_state.json`](project_session_state.json:1) to understand the current project, and new prompts would guide it.
*   **Why:** Enable continuous product improvement based on real usage and feedback, and adapt the project to changing needs.

This manual should provide a detailed understanding of the logic of your "Agentic Coding Framework".