# Getting Started: AI-Assisted Development Workflow

## Introduction

Welcome to the AI-Assisted Development Workflow! This document will guide you through the complete process of taking your project from initial idea to implementation using a structured, AI-driven approach.

The workflow consists of ten sequential phases, each with its own prompt file that instructs the AI agent on how to assist you. By following this process, you'll create a comprehensive set of documents that build upon each other, culminating in a detailed implementation plan, a tested product, and a successful deployment.

## AI Agent Initial Onboarding (Important!)

**AI Agent Directive:** Before starting the workflow (e.g., when processing [`01_AutoPilot.md`](01_DATAS/01_AutoPilot.md:1) or the first manual step), you MUST perform the following initial analysis:

1.  **Analyze File Structure:** Carefully examine the list of files provided in the initial `environment_details`. Understand the purpose of the main directories:
    - `01_DATAS/`: Contains all data files that you will need to perform your tasks.
    - `02_AI-DOCS/`: Contains project documentation templates (architecture, conventions, etc.) and core AI guidance (`Documentation/`). **Crucially, during the 'Specs & Docs' phase, project-specific documents (e.g., `architecture.md`, `coding_conventions.md`) will be CREATED in these subdirectories based on the templates.**
    - `03_SPECS/`: Contains specification templates (features, bugs). **Similarly, project-specific specification files (e.g., `features/feature_spec_FEAT-XXX.md`) will be CREATED here during the 'Specs & Docs' phase.**
    - `tasks/`: Will contain the generated task breakdown (`tasks.json`).
2.  **In-Depth Codebase Understanding (Pre-computation & Analysis):**
    - Beyond just the file structure, you MUST strive to understand the _content and interconnections_ of all relevant files within the project workspace.
    - This means proactively reading key files (e.g., `logic.md`, `project_session_state.json`, existing `.md` files in `01_DATAS/`, templates in `02_AI-DOCS/` and `03_SPECS/`, and any core application code if present) to build a mental model of the project's current state, its logic, and how different components are intended to interact.
    - This deep analysis is foundational for accurately executing the subsequent workflow phases.
3.  **Identify Key Reference Documents:** Recognize that the primary sources of truth for the project, once generated or established, will be:
    - `01_DATAS/01_Idea.md`.
    - Project-specific technical documents **created** in `02_AI-DOCS/` (e.g., `02_AI-DOCS/Architecture/architecture.md`, `02_AI-DOCS/Conventions/coding_conventions.md`, `02_AI-DOCS/Conventions/design_conventions.md`).
    - Project-specific specification documents **created** in `03_SPECS/` (e.g., `03_SPECS/features/feature_spec_FEAT-XXX.md`).
    - Task management guidelines: [`../02_AI-DOCS/TaskManagement/Roo_Task_Workflow.md`](../02_AI-DOCS/TaskManagement/Roo_Task_Workflow.md:1) and [`../02_AI-DOCS/TaskManagement/Tasks_JSON_Structure.md`](../02_AI-DOCS/TaskManagement/Tasks_JSON_Structure.md:1).
    - AI Agent Optimization Guides: [`../02_AI-DOCS/Documentation/AI_Coding_Agent_Optimization.md`](../02_AI-DOCS/Documentation/AI_Coding_Agent_Optimization.md:1), [`../02_AI-DOCS/Documentation/AI_Design_Agent_Optimization.md`](../02_AI-DOCS/Documentation/AI_Design_Agent_Optimization.md:1).
    - Overall AI Task Management Vision: [`../02_AI-DOCS/Documentation/AI_Task_Management_Optimization.md`](../02_AI-DOCS/Documentation/AI_Task_Management_Optimization.md:1).
4.  **Prioritize Generated Documents & Adhere to Specs:** When performing subsequent tasks (especially Task Management and Building), you MUST prioritize referencing these **generated, project-specific documents** over the original templates. The templates serve only as a starting structure.
5.  **Spec-Driven Execution:** For any development task (frontend, backend, database, design, etc.), you MUST actively locate, read, and strictly adhere to the relevant detailed specification documents (feature specs, design mockups/guidelines, API contracts, coding conventions, etc.) found within `02_AI-DOCS/` and `03_SPECS/`, or linked within the task `details` in [`tasks/tasks.json`](tasks/tasks.json:1).

## How to Use This Workflow

### Step 1: Initialize Your Project

1. Review this Getting Started guide
2. Create a project directory if you haven't already
3. Ensure all datas and prompt files (logically `01_Idea.md` through `09_Deployment.md`) are present in your `01_DATAS/` directory, correctly named and sequenced for the [`01_AutoPilot.md`](01_DATAS/01_AutoPilot.md:1) or manual execution.

### Step 2: Complete Each Phase in Sequence

For each phase of the workflow:

1. Open the corresponding prompt file (e.g., the file serving as `01_Idea.md` for the Idea phase)
2. Share the prompt with your AI agent
3. Follow the instructions in the prompt to complete the phase (only if phase is not automated)
4. Save the output in the designated location using the naming convention
5. Move to the next phase once the current phase is complete

### Step 3: Transition Between Phases

Each prompt file includes a "Next Steps" section at the end that explains. on datas files, no "Next Steps" section is provided:
on top of files we say if it is datas or prompts files with ([datas]or [prompts])

- How to save the current phase's output
- Which prompt file to use next
- What inputs the next phase requires

## Quick Start Guide

### Fully Automated Workflow (Important!)

1. **Start with AutoPilot**: Open [`01_AutoPilot.md`](01_AI-RUN/01_AutoPilot.md:1) and share it with your AI agent. Ensure [`01_AutoPilot.md`](01_AI-RUN/01_AutoPilot.md:1) correctly references your actual prompt filenames.
2. **Provide your initial idea**: Give a brief description of your project idea (1-3 sentences)
3. **Get project Details**: Gete project details in `01_DATAS/01_Idea.md`

## Troubleshooting

If at any point the AI agent seems confused or lacks context:

1. Ensure you've completed all previous phases
2. Verify that output files are named correctly and stored in the expected locations
3. Explicitly reference the relevant output files from previous phases
4. If needed, provide the AI with links to specific sections of previous outputs

## Workflow Stages and Responsibilities (Logical Sequence)

### 1. Idea (using `01_Idea.md` logic)

### 2. Specs & Docs (using `05_Specs_Docs.md` logic)

- **AI Role**: **Creating** project-specific files in `02_AI-DOCS/` and `03_SPECS/` by copying and populating templates based on the 05_Specs_Docs.md logic
- **Output**: **Created** project-specific technical documentation and specifications within `02_AI-DOCS/` and `03_SPECS/`.

### 3. Builder (using `07_Start_Building.md` logic)

- **Human Role**: Reviewing and validating code and features
- **AI Role**: Executing tasks, coding, utilizing MCPs
- **Output**: Functional code implementation

### 4. Testing (using `08_Testing.md` logic)

- **Human Role**: Final validation of features and preview environment.
- **AI Role**: Executing tests, setting up preview, addressing issues.
- **Output**: Fully tested application, accessible preview, (optional) test reports.

### 5. Deployment (using `09_Deployment.md` logic)

- **Human Role**: Final review of deployed application, go/no-go for public release if applicable.
- **AI Role**: Executing deployment plan, performing post-deployment checks.
- **Output**: Successfully deployed application to the target environment.

### 6. Iteration

- **Human Role**: Making decisions about the next development cycle based on feedback and strategic goals.
- **AI Role**: Assisting with feedback collection analysis, planning for the next iteration.
- **Output**: Plan for the next development cycle or new feature set.

## Key Benefits

- **Human-AI Collaboration**: Leverages strengths of both human creativity and AI capabilities
- **Structured Process**: Clear workflow with defined responsibilities
- **Efficiency**: Automation of repetitive tasks while maintaining quality
- **Flexibility**: Adaptable to various project types and scales
- **Continuous Improvement**: Built-in feedback loops for ongoing refinement

## Best Practices

1. **Complete phases sequentially**: Each phase builds on the outputs of previous phases
2. **Save all outputs**: Keep all generated documents for reference
3. **Validate key decisions**: Review and approve important decisions before proceeding
4. **Provide feedback**: Refine outputs before moving to the next phase
5. **Track changes**: Maintain version control for all documents

---

You are now ready to start the AI-assisted development workflow!

**Recommended Option**: Open the [`01_AutoPilot.md`](01_AI-RUN/01_AutoPilot.md:1) file and share it with your AI agent for a fully automated experience with minimal intervention. Ensure [`01_AutoPilot.md`](01_AI-RUN/01_AutoPilot.md:1) is configured to use the correct prompt filenames from your `01_AI-RUN/` directory.

Alternatively, you can follow the step-by-step process by starting with opening the prompt file corresponding to `01_Idea.md` and sharing it with your AI agent.
