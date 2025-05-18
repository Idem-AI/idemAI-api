# Product Requirements Document (PRD) - {{project.name}}

**Project Name:** `{{project.name}}`
**Version:** `1.0.0`
**Last Updated:** `{{project.updatedAt}}`
**Author(s):** `{{project.userId}} (Initial Idea) & AI Coding Agent (Elaboration)`
**Key Stakeholders:** `{{project.userId}}, AI Coding Agent`

**Preamble: Streamlined Workflow Approach**
This PRD template is designed for a streamlined workflow where the primary user input is the core project idea and desired high-level features. The AI Coding Agent is expected to take significant initiative in proposing technical details, design elements, and specific tooling. While a Next.js and Supabase stack is suggested as a default (and detailed in Section 1.10), this is a recommendation. The user will have the final say in choosing the most appropriate frontend, backend, and other technologies based on project needs, PRD analysis, market research, or other factors. Human validation will occur at key decision points proposed by the AI, as outlined in the AI-Human Interaction Protocol (Section 1.11).

---
## 0. AI Agent Onboarding and PRD Interpretation Protocol
*AI Agent Directive: Your first task is to read and analyze this entire PRD to understand its structure, objectives, and directives. Build an internal representation of interdependencies between sections (e.g., how NFRs influence feature decomposition, how design preferences guide UI proposals). When one section references another, ensure you follow these links for comprehensive understanding. Utilize the Glossary (Section 11) to clarify terms. You must maintain an internal state of tasks as outlined in Section 1.11 (AI-Human Interaction and Validation Protocol) and communicate this status clearly (e.g., by interacting with Roo Orchestrator, or by updating a status field in this PRD or a linked document).*
*Familiarize yourself with the list of currently connected MCP Servers and their primary tools as outlined in Section 5.6.1 (Known and Desired MCP Catalog) and any supplementary documentation provided (e.g., the `AI_Docs/MCP-Context.txt` file if it details these MCPs). This is your primary toolkit for interacting with external services.* 

---

## Table of Contents
<!-- AI Agent to Auto-generate/Update -->
1.  [Introduction and Objectives](#1-introduction-and-objectives)
    1.1. [Document Purpose](#11-document-purpose)
    1.2. [Project Idea & Core Problem (User Input)](#12-project-idea--core-problem-user-input)
    1.3. [Product Vision (AI to Propose, User to Validate)](#13-product-vision-ai-to-propose-user-to-validate)
    1.4. [Business Goals (AI to Propose based on Idea, User to Validate)](#14-business-goals-ai-to-propose-based-on-idea-user-to-validate)
    1.5. [Key Performance Indicators (KPIs) (AI to Propose, User to Validate)](#15-key-performance-indicators-kpis-ai-to-propose-user-to-validate)
    1.6. [Project Scope (AI to Propose based on Features, User to Validate)](#16-project-scope-ai-to-propose-based-on-features-user-to-validate)
    1.7. [Out of Scope (AI to Propose, User to Validate)](#17-out-of-scope-ai-to-propose-user-to-validate)
    1.8. [Guiding Principles for the AI Agent](#18-guiding-principles-for-the-ai-agent)
    1.9. [Agentic Coding System Overview](#19-agentic-coding-system-overview)
    1.10. [Default Technology Stack & AI Initiative in Tooling](#110-default-technology-stack--ai-initiative-in-tooling)
        1.10.1. [Access to Project Context for AI Agent](#1101-access-to-project-context-for-ai-agent)
    1.11. [AI-Human Interaction and Validation Protocol](#111-ai-human-interaction-and-validation-protocol)
2.  [Market and User Analysis (AI to Assist/Research if Instructed)](#2-market-and-user-analysis-ai-to-assistresearch-if-instructed)
    2.1. [Market Research Summary (Optional User Input / AI Research Task)](#21-market-research-summary-optional-user-input--ai-research-task)
    2.2. [Problem(s) to Solve (Elaborated by AI from User Input)](#22-problems-to-solve-elaborated-by-ai-from-user-input)
    2.3. [Target Audience (AI to Propose, User to Validate)](#23-target-audience-ai-to-propose-user-to-validate)
    2.4. [User Personas (AI to Generate Drafts, User to Validate)](#24-user-personas-ai-to-generate-drafts-user-to-validate)
    2.5. [Competitive Analysis (Optional User Input / AI Research Task)](#25-competitive-analysis-optional-user-input--ai-research-task)
    2.6. [Unique Value Proposition (UVP) (AI to Propose, User to Validate)](#26-unique-value-proposition-uvp-ai-to-propose-user-to-validate)
3.  [Functional Requirements (User Input & AI Elaboration)](#3-functional-requirements-user-input--ai-elaboration)
    3.1. [High-Level Feature List (User Input)](#31-high-level-feature-list-user-input)
    3.2. [User Stories (AI to Generate from Features, User to Validate)](#32-user-stories-ai-to-generate-from-features-user-to-validate)
    3.3. [Use Cases (AI to Generate for Complex Features, User to Validate)](#33-use-cases-ai-to-generate-for-complex-features-user-to-validate)
    3.4. [User Flows (AI to Propose, User to Validate)](#34-user-flows-ai-to-propose-user-to-validate)
    3.5. [Localization and Internationalization (L10n / I18n) Requirements (AI to Query User if Potentially Needed)](#35-localization-and-internationalization-l10n--i18n-requirements-ai-to-query-user-if-potentially-needed)
    3.6. [Preliminary API Design (AI to Propose if applicable, User to Validate)](#36-preliminary-api-design-ai-to-propose-if-applicable-user-to-validate)
4.  [Non-Functional Requirements (NFRs) (AI to Propose Defaults, User to Adjust)](#4-non-functional-requirements-nfrs-ai-to-propose-defaults-user-to-adjust)
    4.1. [Performance](#41-performance)
    4.2. [Scalability](#42-scalability)
    4.3. [Security](#43-security)
    4.4. [Reliability and Availability](#44-reliability-and-availability)
    4.5. [Maintainability](#45-maintainability)
    4.6. [Usability and Accessibility (UX/UI & A11Y)](#46-usability-and-accessibility-uxui--a11y)
    4.7. [Compatibility (Browsers, Devices, OS)](#47-compatibility-browsers-devices-os)
    4.8. [Regulatory Compliance (AI to Query User if Potentially Relevant)](#48-regulatory-compliance-ai-to-query-user-if-potentially-relevant)
    4.9. [Documentation (Product & Technical)](#49-documentation-product--technical)
    4.10. [NFR Verification Criteria for AI Agent](#410-nfr-verification-criteria-for-ai-agent)
5.  [Design and Architecture (AI to Propose, User to Validate)](#5-design-and-architecture-ai-to-propose-user-to-validate)
    5.1. [Design Philosophy and Principles (Agentic Design - User to Provide Preferences)](#51-design-philosophy-and-principles-agentic-design---user-to-provide-preferences)
    5.2. [Design System & UI Implementation Strategy (AI to Propose based on User Preferences & Defaults)](#52-design-system--ui-implementation-strategy-ai-to-propose-based-on-user-preferences--defaults)
        5.2.1. [Core UI Components List (AI to Propose Initial List)](#521-core-ui-components-list-ai-to-propose-initial-list)
        5.2.2. [Interaction Design Principles (AI to Propose Key Principles)](#522-interaction-design-principles-ai-to-propose-key-principles)
        5.2.3. [Accessibility (A11Y) Specific Targets (AI to Propose)](#523-accessibility-a11y-specific-targets-ai-to-propose)
    5.3. [Proposed System Architecture (AI to Generate)](#53-proposed-system-architecture-ai-to-generate)
    5.4. [Technology Stack (User Override / Confirmation of Defaults)](#54-technology-stack-user-override--confirmation-of-defaults)
    5.5. [Data Requirements (AI to Propose Model based on Features)](#55-data-requirements-ai-to-propose-model-based-on-features)
    5.6. [Third-Party Integrations & MCP Servers (AI to Propose Solutions based on Needs)](#56-third-party-integrations--mcp-servers-ai-to-propose-solutions-based-on-needs)
        5.6.1. [Known and Desired MCP Catalog](#561-known-and-desired-mcp-catalog)
    5.7. [Directory Structure and Naming Conventions (AI to Adhere to Defaults)](#57-directory-structure-and-naming-conventions-ai-to-adhere-to-defaults)
    5.8. [Agentic Project Boilerplate (Conceptual - AI to Assume)](#58-agentic-project-boilerplate-conceptual---ai-to-assume)
6.  [Test and Validation Plan (AI to Propose, User to Validate)](#6-test-and-validation-plan-ai-to-propose-user-to-validate)
    6.1. [Test Strategy (Including AI Generation)](#61-test-strategy-including-ai-generation)
        6.1.1. [Definition of Done (DoD) for UI Tasks (AI to Propose)](#611-definition-of-done-dod-for-ui-tasks-ai-to-propose)
    6.2. [Acceptance Criteria (Gherkin/BDD Format - AI to Generate)](#62-acceptance-criteria-gherkinbdd-format---ai-to-generate)
    6.3. [Detailed Test Scenarios for AI Agent (AI to Generate)](#63-detailed-test-scenarios-for-ai-agent-ai-to-generate)
    6.4. [User Acceptance Testing (UAT) (User to Define Process)](#64-user-acceptance-testing-uat-user-to-define-process)
    6.5. [Performance, Security, etc. Tests (Criteria for AI - AI to Propose)](#65-performance-security-etc-tests-criteria-for-ai---ai-to-propose)
7.  [Deployment and Launch Plan (AI to Propose, User to Validate)](#7-deployment-and-launch-plan-ai-to-propose-user-to-validate)
    7.1. [Deployment Strategy](#71-deployment-strategy)
    7.2. [Deployment Prerequisites](#72-deployment-prerequisites)
    7.3. [Deployment Scripts (Instructions for AI Agent)](#73-deployment-scripts-instructions-for-ai-agent)
    7.4. [Rollback Plan](#74-rollback-plan)
    7.5. [Launch Communication](#75-launch-communication)
8.  [Maintenance and Future Evolutions (User Input & AI Suggestions)](#8-maintenance-and-future-evolutions-user-input--ai-suggestions)
    8.1. [Maintenance Plan (AI to Propose Basics)](#81-maintenance-plan-ai-to-propose-basics)
    8.2. [Ideas for Future Releases (User Input / AI Brainstorming)](#82-ideas-for-future-releases-user-input--ai-brainstorming)
9.  [AI Agent Specific Instructions](#9-ai-agent-specific-instructions)
    9.1. [Feature Decomposition and Specification Process (Mandatory Pre-Coding Step for AI)](#91-feature-decomposition-and-specification-process-mandatory-pre-coding-step-for-ai)
    9.2. [Coding Style and Linters](#92-coding-style-and-linters)
    9.3. [Dependency Management](#93-dependency-management)
    9.4. [Code Documentation Generation](#94-code-documentation-generation)
    9.5. [Commit and Versioning Strategy](#95-commit-and-versioning-strategy)
    9.6. [Feedback Loop and Self-Correction](#96-feedback-loop-and-self-correction)
    9.7. [AI Initiative in Tooling, MCP Server, and Service Selection](#97-ai-initiative-in-tooling-mcp-server-and-service-selection)
        9.7.1. [Protocol for Proposing and Learning New Tools/MCPs](#971-protocol-for-proposing-and-learning-new-toolsmcps)
    9.8. [Workflow with Assisted Coding Tools (e.g., Cursor, Cline)](#98-workflow-with-assisted-coding-tools-eg-cursor-cline)
    9.9. [Standard MCP Integration Logic (Using Supabase as a Hub)](#99-standard-mcp-integration-logic-using-supabase-as-a-hub)
10. [Risks and Dependencies (AI to Identify, User to Validate)](#10-risks-and-dependencies-ai-to-identify-user-to-validate)
    10.1. [Risk Identification](#101-risk-identification)
    10.2. [Risk Mitigation Plan](#102-risk-mitigation-plan)
    10.3. [Dependencies](#103-dependencies)
11. [Glossary (AI to Maintain)](#11-glossary-ai-to-maintain)
12. [Appendices (User or AI to Add as Needed)](#12-appendices-user-or-ai-to-add-as-needed)

---

## 0. AI Agent Onboarding and PRD Interpretation Protocol
*AI Agent Directive: Your first task is to read and analyze this entire PRD to understand its structure, objectives, and directives. Build an internal representation of interdependencies between sections (e.g., how NFRs influence feature decomposition, how design preferences guide UI proposals). When one section references another, ensure you follow these links for comprehensive understanding. Utilize the Glossary (Section 11) to clarify terms. You must maintain an internal state of tasks as outlined in Section 1.11 (AI-Human Interaction and Validation Protocol) and communicate this status clearly (e.g., by interacting with Roo Orchestrator, or by updating a status field in this PRD or a linked document). Familiarize yourself with the list of currently connected MCP Servers and their primary tools as outlined in Section 5.6.1 (Known and Desired MCP Catalog) and any supplementary documentation provided (e.g., the `AI_Docs/MCP-Context.txt` file if it details these MCPs). This is your primary toolkit for interacting with external services.*

---

## 1. Introduction and Objectives

### 1.1. Document Purpose
*Comment: This document serves as the primary input for the AI Coding Agent, which will elaborate on technical specifications based on the user's high-level input. It outlines the project idea, desired features, and establishes the framework for the AI to propose detailed solutions within the "Agentic Coding System".*
`[AI to summarize after initial user input]`

### 1.2. Project Idea & Core Problem

**Project Type:** `{{project.type}}`
**Project ID:** `{{project.id}}`
**Project Description:** `{{project.description}}`

**Key Constraints:**
```
{{project.constraints}}
```

**Team Size:** `{{project.teamSize}}`
**Project Scope:** `{{project.scope}}`
**Budget Intervals:** `{{project.budgetIntervals}}`
**Targets:** `{{project.targets}}`
**Selected Phases:** `{{project.selectedPhases}}`

### 1.3. Product Vision (AI to Propose, User to Validate)
*Comment: Based on the user's idea, the AI will propose a long-term vision for the product.*
*AI Instruction: Based on the `Project Idea & Core Problem`, propose a compelling product vision. Consider potential impact and future evolution.*
`[AI to Propose Product Vision for User Validation]`

### 1.4. Business Goals (AI to Propose based on Idea, User to Validate)
*Comment: The AI will propose SMART business goals aligned with the project idea.*
*AI Instruction: Based on the `Project Idea & Core Problem`, propose 2-3 SMART (Specific, Measurable, Achievable, Relevant, Time-bound) business goals.*
`[AI to Propose Business Goals for User Validation]`

### 1.5. Key Performance Indicators (KPIs) (AI to Propose, User to Validate)
*Comment: The AI will propose KPIs to measure the success of the proposed business goals.*
*AI Instruction: For each proposed Business Goal, suggest 1-2 relevant KPIs.*
`[AI to Propose KPIs for User Validation]`

### 1.6. Project Scope (AI to Propose based on Features, User to Validate)
*Comment: The AI will define the initial scope based on the user's feature list.*
*AI Instruction: Based on the `High-Level Feature List` (Section 3.1), define what is IN SCOPE for the initial development phase.*
`[AI to Propose Project Scope for User Validation]`

### 1.7. Out of Scope (AI to Propose, User to Validate)
*Comment: The AI will suggest items that are explicitly out of scope for clarity.*
*AI Instruction: Based on the `Project Scope`, identify and list key items that are OUT OF SCOPE for this initial phase.*
`[AI to Propose Out of Scope items for User Validation]`

### 1.8. Guiding Principles for the AI Agent
*Comment: These are foundational principles for the AI's operation.*
*   **Excellence in Design and UX/UI:** The goal is to produce interfaces and user experiences of exceptional quality, worthy of the highest standards (like "Silicon Valley / Y Combinator"). This takes precedence over mere functionality.
*   Strict adherence to the Agentic Design System (Section 5.1 & 5.2), which must reflect this ambition.
*   Prioritize code clarity, maintainability, and testability.
*   Implement security best practices by default.
*   Optimize for performance as per NFRs (Section 4.1).
*   Generate comprehensive tests (unit, integration, assist with E2E).
*   Proactively propose solutions, libraries, MCP servers, and Supabase services, documenting rationale for human review.
*   Communicate ambiguities or need for clarification promptly (Section 9.1.10).
*   Follow all instructions within this PRD meticulously.
*   **Embrace Iterative Exploration:** Be prepared to generate multiple alternatives for UI components, logic flows, or technical solutions when prompted or when a clear optimal path isn't immediately evident from the PRD. The goal is to rapidly explore the solution space with human guidance, facilitating quick feedback and 'vibe-driven' development. Clearly label exploratory suggestions versus production-ready proposals.
*   **Contextual Awareness:** Strive to understand the broader project context by referring to all relevant sections of this PRD, existing codebase (if available and accessible as per Section 1.10.1), and project documentation before making decisions or generating code.
`[User can add specific overriding principles if any]`

### 1.9. Agentic Coding System Overview
*Comment: This system emphasizes technical excellence, design finesse, close Design <> Dev collaboration (even with AI), exhaustive documentation, and rapid iteration.*
*   **Core Tenets:**
    *   **Technical Excellence:** Clean, well-tested, performant, and maintainable code.
    *   **Design Finesse:** Meticulous attention to detail, resulting in a polished and intuitive user experience. Adherence to the `[AI to Propose Project Name] Design System` is paramount.
    *   **Collaboration:** Seamless integration between user requirements and AI execution, facilitated by this PRD and AI's clarification process.
    *   **Documentation:** AI-assisted generation of comprehensive documentation for code, design system components, and APIs.
    *   **Iteration:** AI facilitates rapid development cycles based on feedback and continuous improvement.
`[AI to ensure its processes align with these tenets]`

### 1.10. Default Technology Stack & AI Initiative in Tooling
*Comment: Defines the default technical foundation and AI's role in tool selection.*
This project suggests the following default technology stack, which can be overridden by user input in Section 5.4:
*   **Suggested Frontend:** Next.js (with TypeScript)
*   **Suggested Backend/Database:** Supabase (PostgreSQL, Auth, Storage, Edge Functions)
*   **Suggested Styling:** Tailwind CSS (with a custom Design System inspired by Shadcn/ui, as per Section 5.2)
The final choice of technologies will be determined by the user, considering project requirements and analyses.

The AI Coding Agent is empowered and expected to:
1.  Select appropriate, stable versions for the core stack elements.
2.  Identify, research, propose, and integrate relevant auxiliary libraries, **MCP servers** (e.g., for payments via Stripe MCP, advanced search, specific data processing via custom MCPs, documentation lookups via Context7 MCP, direct Supabase interactions via Supabase MCP, GitHub operations via GitHub MCP), and third-party APIs compatible with the chosen stack to best achieve the project goals. Task management is handled by Roo Orchestrator/Code (see [`../../../02_AI-DOCS/TaskManagement/Roo_Task_Workflow.md`](../../../02_AI-DOCS/TaskManagement/Roo_Task_Workflow.md)).
3.  If Supabase is chosen, leverage its features (Auth, Storage, Realtime, Edge Functions, Vector DB for AI features, etc.) extensively as the backend solution.
4.  All such selections and proposed integrations will be documented by the AI in its detailed feature specifications (as per Section 9.1) or in a dedicated 'Proposed Technical Solutions & Integrations' section for human review and approval before implementation.

#### 1.10.1. Access to Project Context for AI Agent
*AI Agent Directive: For optimal understanding and consistency, you will have access to (or must request access to, if not immediately available) the following project context elements:*
*   *The complete Git repository of the project (once initiated).*
*   *Key configuration files (e.g., `tailwind.config.js`, `tsconfig.json`, `package.json`, framework-specific configuration like `next.config.js` if Next.js is chosen, Vercel/chosen hosting provider and Supabase/chosen backend environment variables).*
*   *Existing Storybook documentation (if any).*
*   *Database schemas (e.g., Supabase Studio interface or migration files if Supabase is chosen).*
*   *Documentation for known/integrated MCPs (via Context7 MCP or provided links).*
*   *When performing tasks like feature decomposition (Section 9.1) or code generation, actively refer to this context to ensure coherence and accuracy.*
`[User can note any immediate exclusions or preferences here]`

### 1.11. AI-Human Interaction and Validation Protocol
*Comment: This section defines how the AI Agent and human stakeholders will interact for proposals, validations, and conflict resolution. The AI Agent must maintain an internal state of tasks (TODO, PENDING_SPEC_VALIDATION, READY_FOR_IMPLEMENTATION, IN_PROGRESS, PENDING_CODE_REVIEW/TESTING, DONE) and communicate this status clearly, potentially by interacting with Roo Orchestrator or by updating a status field in this PRD/linked document.*
*   **Proposal Mechanism:** The AI Agent will primarily update relevant sections of THIS PRD with its detailed proposals (e.g., proposed KPIs in 1.5, detailed feature specs in a separate linked document or appendix referenced from 9.1, proposed Design System tokens in 5.2). For significant proposals (new MCPs, major architectural choices, complex UI designs), the AI will explicitly state: 'PROPOSAL FOR VALIDATION: [details of proposal]' and list specific questions if any.
*   **Validation Channel:** The user will review these sections/proposals and provide feedback directly within the project's communication channel (e.g., comments in a shared document, dedicated Slack channel, or project management tool). Feedback should be clear (e.g., 'Approved', 'Approved with changes: [details]', 'Rejected, please reconsider [alternative/reason]').
*   **Conflict Resolution & Iteration:** If a human stakeholder disagrees with an AI proposal, the AI will be provided with the reasons or alternative suggestions. The AI must then revise its proposal, incorporating the feedback, and present a new option. This iterative feedback loop will continue until consensus is reached or the human stakeholder provides a definitive directive. The AI should log its previous proposals and the received feedback to learn and avoid repeating rejected suggestions.
*   **PRD Versioning:** After each significant cycle of AI proposals and human validation that leads to changes in the PRD, the AI Agent will increment the minor version of this PRD (e.g., from 1.0 to 1.1) and update the 'Last Updated' date.
*   **Waiting for Validation:** AI Agent, after submitting a proposal for validation, you must place that specific task in a 'PENDING_VALIDATION' state and await explicit human feedback before proceeding with implementation related to that proposal.

---

## 2. Market and User Analysis (AI to Assist/Research if Instructed)

### 2.1. Market Research Summary (Optional User Input / AI Research Task)
*User Instruction: If you have market research, please summarize key findings or provide a link. Alternatively, you can instruct the AI to perform high-level online research on the market, target audience, and competitors based on your project idea.*
`[User Input or AI Research Task: e.g., "AI, please research competitors for a [Project Idea] app."]`
*AI Instruction: If tasked, perform high-level research and summarize findings here. Prioritize information from official documentation, reputable industry sources. If using general web search, cross-reference information from multiple sources where possible. Clearly state if information is from a less verifiable source. If a `context7` MCP or similar trusted documentation MCP is available, prioritize its use. Your research here is to provide initial context; deep strategic analysis remains a human responsibility. Cite sources if possible.*
`[AI to fill if tasked, or reflect user input]`

### 2.2. Problem(s) to Solve (Elaborated by AI from User Input)
*AI Instruction: Based on the user's `Project Idea & Core Problem` (Section 1.2) and any market research (Section 2.1), elaborate on the specific problems this product will solve.*
`[AI to Elaborate for User Validation]`

### 2.3. Target Audience (AI to Propose, User to Validate)
*AI Instruction: Based on the project idea and research, propose a primary target audience. Describe key demographics, needs, and behaviors.*
`[AI to Propose Target Audience for User Validation]`

### 2.4. User Personas (AI to Generate Drafts, User to Validate)
*AI Instruction: Based on the Target Audience, generate 1-2 draft user personas. Include name, core goals, key frustrations (that the product will solve), and a brief scenario of how they might use the product.*
`[AI to Generate Draft Personas for User Validation]`
    *   **Persona 1: [AI to Propose Name]**
        *   Description: ...
        *   Goals: ...
        *   Frustrations: ...
        *   Usage Scenario: ...

### 2.5. Competitive Analysis (Optional User Input / AI Research Task)
*User Instruction: If you know key competitors, list them. Otherwise, the AI can research them (see 2.1).*
`[User Input or AI Research Task]`
*AI Instruction: If tasked or based on user input, list 2-3 main competitors. For each, briefly note their key offerings and potential differentiators for our project. Prioritize information as per guidelines in Section 2.1.*
`[AI to fill if tasked, or reflect user input]`

### 2.6. Unique Value Proposition (UVP) (AI to Propose, User to Validate)
*AI Instruction: Based on the problem, target audience, and competitive landscape, propose a clear UVP for this product.*
`[AI to Propose UVP for User Validation]`

---

## 3. Functional Requirements (User Input & AI Elaboration)
*Comment: The AI Agent will decompose these high-level features into detailed, actionable specifications as per Section 9.1.*

### 3.1. High-Level Feature List (User Input)
*User Instruction: Please list the core features you envision for your project. For each feature, provide a concise name, a brief description of what it should do from a user's perspective, and optionally, a short phrase about the **'desired vibe' or 'key experience'** for this feature. Example: "Feature: Project Dashboard. Description: Display user's projects. Desired Vibe: Must load ultra-fast and provide an immediate, clear overview."*
1.  **Feature Name:** `[User to provide]`
    *   **User-Provided Objective/Description:** `[User to provide]`
    *   **Desired Vibe/Key Experience (Optional):** `[User to provide]`
    *   **Key User Outcomes:** `[User to provide high-level benefits, or AI to propose for validation if not provided]`
2.  **Feature Name:** `[User to provide]`
    *   **User-Provided Objective/Description:** `[User to provide]`
    *   **Desired Vibe/Key Experience (Optional):** `[User to provide]`
    *   **Key User Outcomes:** `[User to provide high-level benefits, or AI to propose for validation if not provided]`
3.  `[Add more features as needed]`

*AI Instruction: You will use this list as the primary input for the detailed feature decomposition in Section 9.1. Assign a `FEAT-XXX` ID to each. If Key User Outcomes are not provided by the user, propose them based on your analysis of the feature description and objective, for user validation, as part of your detailed feature specification (Section 9.1). If 'Desired Vibe/Key Experience' is provided, use this as a strong guiding factor in your UI/UX proposals and technical choices for that feature.*

### 3.2. User Stories (AI to Generate from Features, User to Validate)
*AI Instruction: For each feature listed in 3.1, generate 1-3 core user stories in the format: "As a [proposed persona type], I want to [action related to feature] so that [benefit derived from feature]." Prioritize them (Must Have, Should Have).*
`[AI to Generate User Stories for User Validation]`

### 3.3. Use Cases (AI to Generate for Complex Features, User to Validate)
*AI Instruction: If any feature from 3.1 implies complex interactions or multiple steps, generate a high-level use case description for it.*
`[AI to Generate Use Cases for User Validation, if applicable]`

### 3.4. User Flows (AI to Propose, User to Validate)
*AI Instruction: For 1-2 core features, propose a high-level user flow diagram using **Mermaid syntax** (e.g., `graph TD; A-->B;`) for easy visualization and review, or a textual step-by-step description if a diagram is overly complex for the initial proposal.*
`[AI to Propose User Flows for User Validation]`

### 3.5. Localization and Internationalization (L10n / I18n) Requirements (AI to Query User if Potentially Needed)
*AI Instruction: Based on the project idea, assess if L10n/I18n might be relevant. If so, ask the user for their preferences (e.g., "Do you plan for this application to support multiple languages?"). If yes, detail default L10n/I18n setup (UTF-8, placeholder for language files).*
`[AI to Query User or Propose Default L10n/I18n Setup]`

### 3.6. Preliminary API Design (AI to Propose if applicable, User to Validate)
*AI Instruction: If the features imply backend interactions beyond simple CRUD operations (e.g., complex business logic in serverless functions, or if a separate API layer is decided), propose a preliminary design for key API endpoints. If Supabase is chosen, default to using Supabase Edge Functions for custom backend logic.*
`[AI to Propose API Design for User Validation, if applicable]`

---

## 4. Non-Functional Requirements (NFRs) (AI to Propose Defaults, User to Adjust)
*AI Instruction: Propose sensible default NFRs. The user can then adjust these.*

### 4.1. Performance
*AI Proposal:*
*   Web Vitals (LCP, FID, CLS) should be in the 'Good' range.
*   Server-side (e.g., Supabase Edge Function if used) responses for typical API calls should be < 500ms under normal load.
*   Page transitions should feel instant.
`[User to Adjust/Confirm AI's Proposed Performance NFRs]`

### 4.2. Scalability
*AI Proposal:*
*   If Supabase is chosen, the system should leverage its inherent scalability for database and authentication.
*   Edge functions should be written statelessly to allow for easy scaling.
*   Target: Handle 1000 concurrent users with acceptable performance (as defined in 4.1) after initial launch phase.
`[User to Adjust/Confirm AI's Proposed Scalability NFRs]`

### 4.3. Security
*AI Proposal:*
*   All data transmission encrypted via HTTPS.
*   If Supabase is chosen, Row Level Security (RLS) policies should be implemented for all relevant tables.
*   Secure password handling (e.g., leveraging Supabase Auth if chosen, or a similar robust authentication service).
*   Protection against OWASP Top 10 vulnerabilities in any custom code (e.g., API routes in the chosen frontend framework, serverless functions in the chosen backend).
*   Regular dependency updates.
`[User to Adjust/Confirm AI's Proposed Security NFRs]`

### 4.4. Reliability and Availability
*AI Proposal:*
*   Target 99.9% uptime (leveraging the chosen hosting provider, e.g., Vercel, and backend infrastructure, e.g., Supabase).
*   Implement robust error handling and logging in serverless functions/backend and frontend.
*   Utilize automated backups provided by the chosen database service (e.g., Supabase).
`[User to Adjust/Confirm AI's Proposed Reliability/Availability NFRs]`

### 4.5. Maintainability
*AI Proposal:*
*   Code will adhere to styles defined in Section 9.2.
*   AI will generate code documentation as per Section 9.4.
*   Modular design (Atomic Design for frontend, well-defined Edge Functions).
`[User to Adjust/Confirm AI's Proposed Maintainability NFRs]`

### 4.6. Usability and Accessibility (UX/UI & A11Y)
*AI Proposal:*
*   **Superior UX/UI Objective:** The application must offer an exceptionally intuitive, fluid, and aesthetically refined user experience, aiming for the standards of top "Silicon Valley / Y Combinator" applications.
*   Adherence to Agentic Design Principles (Section 5.1) which must embody this objective.
*   WCAG 2.1 AA compliance as a minimum target, with particular attention to an accessible and enjoyable user experience for all.
*   Semantic HTML, keyboard navigability, sufficient color contrast, and attention to interaction details.
`[User to Adjust/Confirm AI's Proposed Usability/Accessibility NFRs]`

### 4.7. Compatibility (Browsers, Devices, OS)
*AI Proposal:*
*   Latest two versions of major browsers: Chrome, Firefox, Safari, Edge.
*   Responsive design for desktop, tablet, and mobile.
*   Primary OS: Web-based, so OS agnostic.
`[User to Adjust/Confirm AI's Proposed Compatibility NFRs]`

### 4.8. Regulatory Compliance (AI to Query User if Potentially Relevant)
*AI Instruction: Based on the project idea (e.g., if it involves PII, health data, financial data), ask the user if specific regulations like GDPR, HIPAA, CCPA, etc., apply. If yes, note them here and ensure security/data handling plans reflect this.*
`[AI to Query User or state "No specific regulations identified by user at this stage."]`

### 4.9. Documentation (Product & Technical)
*AI Proposal:*
*   This PRD serves as the core product documentation.
*   AI will generate code-level documentation (JSDoc, comments).
*   AI will generate Storybook stories for UI components.
*   AI will generate basic API documentation if custom APIs are built.
`[User to Adjust/Confirm AI's Proposed Documentation Plan]`

### 4.10. NFR Verification Criteria for AI Agent
*AI Instruction: For each NFR above, you will define specific, verifiable criteria in your detailed feature specifications (Section 9.1) that your generated code must meet. E.g., for Performance: "Ensure all database queries generated for the chosen database (e.g., Supabase) use appropriate security mechanisms (like RLS) and table indexes where applicable."*
`[This section is a directive to the AI for its internal processes]`

---

## 5. Design and Architecture (AI to Propose, User to Validate)
 
### 5.1. Design Philosophy and Principles (Agentic Design - User to Provide Preferences)
*User Instruction: The goal is an **exceptionally high-quality design and UX/UI, worthy of "Silicon Valley / Y Combinator" standards**. Please describe your general aesthetic preferences (e.g., "modern and clean look," "playful and colorful," "professional and sober"). If you have examples of sites/applications whose design you admire (especially those embodying this excellence), please share them. **'Vibe keywords'** (e.g., 'energetic and bold,' 'calm and focused,' 'futuristic and high-tech') are also very helpful. In the absence of preferences, the AI will propose a minimalist, modern style with careful typography, generous spacing, and an intentional color palette, aiming for this high quality.*
`[User to provide general aesthetic preferences, examples (ideally YC-style), or 'vibe keywords']`
 
*AI Instruction: Based on user input (and the YC-standard goal), or by initializing with the default style described, establish the Key Design Principles for THIS project. These principles must explicitly aim for UX/UI excellence and guide all your proposals.*
`[AI to Propose Specific Key Design Principles for User Validation, emphasizing the "Y Combinator standard" goal]`

### 5.2. Design System & UI Implementation Strategy (AI to Propose based on User Preferences & Defaults)
*AI Instruction: Based on user's aesthetic preferences (Section 5.1) and the default stack (Tailwind CSS, Shadcn/ui inspiration), propose the initial `[AI to Propose Project Name] Design System` tokens (primary/secondary colors, typography scale, core spacing units) for `tailwind.config.js`. Detail how Shadcn/ui components will be customized to fit this system. All visual design proposals are subject to human review.*
*   **Proposed Design System Name:** `[AI to Propose Project Name] Design System`
*   **Proposed Core Design Tokens (for `tailwind.config.js`):**
    *   Colors: `[AI to propose primary, secondary, accent, neutral palettes]`
    *   Typography: `[AI to propose font families, base sizes, scale]`
    *   Spacing: `[AI to propose base spacing unit and scale]`
*   **Shadcn/ui Customization Strategy:** *AI Instruction: When customizing Shadcn/ui components, your goal is to ensure they align seamlessly with the `[Project Name] Design System`'s tokens and interaction patterns. This means you will: 1. Override default styles using Tailwind utility classes mapped to our Design System tokens. 2. Adjust component structure or add/remove elements for our specific UX needs. 3. Ensure all interactive states (hover, focus, active, disabled) match our Design System’s specifications. 4. The final component must feel unique to our brand, not like a generic Shadcn/ui component. Document these customizations in Storybook.*
*   **Storybook Plan:** `[AI to confirm Storybook will be used for all custom components]`
`[AI to Propose Design System and UI Strategy for User Validation]`

#### 5.2.1. Core UI Components List (AI to Propose Initial List)
*AI Instruction: Based on the features (Section 3.1) and user's design preferences (Section 5.1), propose an initial list of core, reusable UI components (e.g., PrimaryButton, SecondaryButton, Card, ModalShell, InputField, DataTable, NavigationBar). For each, briefly describe its purpose and key variants. This list will serve as a starting point for the `design_conventions.md` and Storybook development.*
`[AI to Propose Initial List of Core UI Components for User Validation]`

#### 5.2.2. Interaction Design Principles (AI to Propose Key Principles)
*AI Instruction: Propose 3-5 key principles for micro-interactions and animations that align with the "Silicon Valley / YC standard" of excellence and the user's desired 'vibe' (Section 5.1). Examples: "Feedback for all actions must be immediate and clear, using subtle visual cues.", "Transitions between states or views should be smooth, typically lasting 200-300ms, using ease-in-out timing.", "Animations should serve a purpose (guide attention, provide context) and not be purely decorative."*
`[AI to Propose Key Interaction Design Principles for User Validation]`

#### 5.2.3. Accessibility (A11Y) Specific Targets (AI to Propose)
*AI Instruction: Beyond the general WCAG 2.1 AA target (Section 4.6), are there specific accessibility aspects to emphasize for this project? (e.g., "Ensure all complex data visualizations are fully keyboard navigable and screen-reader friendly.", "Provide high-contrast themes as an option."). If no specific targets are identified by the user, reiterate the commitment to WCAG 2.1 AA and semantic HTML.*
`[AI to Propose Specific A11Y Targets or Reiterate General Commitment for User Validation]`

### 5.3. Proposed System Architecture (AI to Generate)
*AI Instruction: Generate a high-level system architecture diagram using **Mermaid syntax** showing the proposed/chosen frontend (e.g., Next.js), backend/database (e.g., Supabase: Auth, DB, Storage, Edge Functions), and any key proposed MCPs/Third-Party APIs. Briefly describe component responsibilities. Adapt the diagram if a different stack is chosen.*
```mermaid
graph TD
    UserInterface["Proposed Frontend (e.g., Next.js on Vercel)"] -->|API Calls/SDK| BackendFunctions["Proposed Backend Functions (e.g., Supabase Edge Functions)"];
    UserInterface -->|SDK| AuthService["Proposed Auth Service (e.g., Supabase Auth)"];
    UserInterface -->|SDK/Direct| DatabaseService["Proposed Database (e.g., Supabase DB - PostgreSQL)"];
    UserInterface -->|SDK| StorageService["Proposed Storage Service (e.g., Supabase Storage)"];
    BackendFunctions --> DatabaseService;
    BackendFunctions -->|Optional| ExternalAPI1["External API/MCP 1"];
    BackendFunctions -->|Optional| ExternalAPI2["External API/MCP 2"];

    style UserInterface fill:#D5F5E3,stroke:#333,stroke-width:2px
    style BackendFunctions fill:#AED6F1,stroke:#333,stroke-width:2px
    style AuthService fill:#AED6F1,stroke:#333,stroke-width:2px
    style DatabaseService fill:#AED6F1,stroke:#333,stroke-width:2px
    style StorageService fill:#AED6F1,stroke:#333,stroke-width:2px
    style ExternalAPI1 fill:#FADBD8,stroke:#333,stroke-width:2px
    style ExternalAPI2 fill:#FADBD8,stroke:#333,stroke-width:2px
```
`[AI to Refine Diagram and Description for User Validation]`

### 5.4. Technology Stack (User Override / Confirmation of Defaults)
*User Instruction: The project suggests Next.js, Supabase, and Tailwind CSS as a default stack (see Section 1.10). Use this section to specify your preferences for frontend framework, backend services (database, auth, storage, serverless functions), styling solutions, or any other tools, versions, or auxiliary libraries. If left blank, the AI will proceed with the suggested defaults and select appropriate versions/libraries, but will seek your confirmation.*
`[User to provide any overrides or specific requests]`

*AI Instruction: Confirm the final stack here after considering user input. You are responsible for selecting appropriate versions and necessary auxiliary libraries compatible with the core stack and project needs.*
`[AI to Confirm Final Stack (incorporating user input if any) for User Validation]`

### 5.5. Data Requirements (AI to Propose Model based on Features)
*User Instruction: You can list key data entities if you have them in mind (e.g., 'Users', 'Products', 'Orders'). Otherwise, the AI Agent will analyze the features you've described (Section 3.1) and propose a detailed database schema for the chosen database technology (e.g., Supabase/PostgreSQL). This proposal will be part of its detailed feature specification (Section 9.1.6) and will require your review.*
`[User to list key data entities, if known]`

*AI Instruction: Based on user's feature list and any listed entities, you will propose a detailed database schema (e.g., for Supabase/PostgreSQL using Prisma-like syntax or pseudo-SQL) in your feature specifications (Section 9.1.6). Also propose data seeding strategies for dev/test environments.*
`[This section is a directive to the AI; detailed proposals will be in AI's feature specs]`

### 5.6. Third-Party Integrations & MCP Servers (AI to Propose Solutions based on Needs)
*User Instruction: If you know you'll need specific types of integrations (e.g., 'payment processing via Stripe', 'email sending via Resend', 'maps functionality'), list them here at a high level. The AI Agent will research and propose specific services, MCP servers, or other APIs. The AI will detail its integration plan in its feature specifications (Section 9.1.9) for your review.*
`[User to list high-level integration needs]`

#### 5.6.1. Known and Desired MCP Catalog
*User Instruction: List here any MCPs you know exist and might want to use, or types of MCP functionality you desire. The AI will use this as input for its proposals.*
*   `[Example: stripe_payment_mcp: (Status: Known to User/Desired) For payment processing.]`
*   `[Example: content_moderation_mcp: (Status: Desired) For moderating user-generated content.]`
*   **Connected & Available MCPs (AI to verify and utilize first):**
    *   `context7`: (Status: Connected and Available) For library documentation lookup.
    *   `github`: (Status: Connected and Available) For GitHub repository operations.
    *   `puppeteer`: (Status: Connected and Available) For web automation/scraping.
    *   `stripe`: (Status: Connected and Available) For payment processing.
    *   `playwright`: (Status: Connected and Available) For advanced web automation and testing.
    *   `sequential-thinking`: (Status: Connected and Available) For complex problem solving and planning.
    *   `shadcn`: (Status: Connected and Available) For UI component registry interactions.
    *   `@21st-dev/magic`: (Status: Connected and Available) For UI component generation and refinement.
    *   `ElevenLabs`: (Status: Connected and Available) For AI-based audio generation.
    *   `convex`: (Status: Connected and Available) For Convex backend interactions.
    *   `mcp-server-firecrawl`: (Status: Connected and Available) For web scraping and crawling.
    *   `Roo Orchestrator/Code`: (Status: Integrated) For AI-assisted task management (see [`../../../02_AI-DOCS/TaskManagement/Roo_Task_Workflow.md`](../../../02_AI-DOCS/TaskManagement/Roo_Task_Workflow.md) for workflow and [`../../../02_AI-DOCS/TaskManagement/Tasks_JSON_Structure.md`](../../../02_AI-DOCS/TaskManagement/Tasks_JSON_Structure.md) for [`tasks.json`](../../../tasks/tasks.json) structure).
    *   `supabase` (MCP): (Status: Connected and Available) For direct Supabase project interactions.
    *   `memory`: (Status: Connected and Available) For knowledge graph interactions.
    *   `everything`: (Status: Connected and Available) For MCP testing and demos.
`[User to fill or leave for AI to populate based on needs identified from features]`
*AI Instruction: Review this catalog. For "Connected and Available" MCPs, prioritize their use. For "Known" or "Desired" MCPs not yet connected, or for new needs, follow protocol in 9.7.1. You can also propose additions to this catalog if new needs are identified.*

*AI Instruction: Based on user's feature list and any stated integration needs or catalog entries, you will research and propose specific third-party services, **MCP servers**, or other APIs. Detail your proposals, including rationale and integration points, in your feature specifications (Section 9.1.9). Prioritize robust, secure, and well-supported options compatible with the chosen technology stack (e.g., Next.js/Supabase, or alternatives). For all MCP integrations, you MUST implement them following the detailed logic outlined in Section 9.9 'Standard MCP Integration Logic'.*
`[This section is a directive to the AI; detailed proposals will be in AI's feature specs]`

### 5.7. Directory Structure and Naming Conventions (AI to Adhere to Defaults)
*AI Instruction: You will adhere to a conventional project structure (e.g., the default Agentic Project Boilerplate structure in Section 5.8 if Next.js is chosen, or an equivalent standard structure for the selected framework), which typically uses Atomic Design principles for frontend frameworks. Key conventions generally include `PascalCase.tsx` (or equivalent for other languages) for components/pages, `kebab-case.ts` (or equivalent) for utils, and `camelCase` for functions/variables. Clarify any deviations if necessary for specific project needs in your technical proposals.*
    *   **Suggested Structure Overview (e.g., for Next.js App Router & Atomic Design):**
        ```
        /app/(routes)
        /components/{atoms,molecules,organisms,templates,ui}
        /lib, /config, /styles, /public, /stories, /tests
        ```
`[This section confirms AI's adherence to predefined standards]`

### 5.8. Agentic Project Boilerplate (Conceptual - AI to Assume)
*AI Instruction: You will operate as if starting from or evolving an "Agentic Project Boilerplate." If Next.js is chosen, this pre-configured template includes: TypeScript (strict), Tailwind CSS (with base design tokens to be defined by you based on user input/defaults), Atomic Design structure, ESLint/Prettier/Husky, Storybook, basic testing setup, and CI/CD placeholders. If a different framework is selected, you will adapt to a similar standard boilerplate for that technology. Your initial project setup tasks should include structuring the project files and base configurations accordingly. If a Git repository with an actual boilerplate is provided by the user, you should use that as your starting point. Otherwise, create the foundational structure (directories, key config files, basic `package.json` or equivalent with chosen technologies) according to the conceptual boilerplate for the selected stack.*
`[This section sets AI's operational context]`

---

## 6. Test and Validation Plan (AI to Propose, User to Validate)

### 6.1. Test Strategy (Including AI Generation)
*AI Instruction: Propose a comprehensive test strategy. Specify types of tests you will generate (Unit, Integration, E2E skeletons), frameworks (Jest, React Testing Library, Playwright), and target code coverage (e.g., 80% unit test coverage for your generated code).*
`[AI to Propose Test Strategy for User Validation]`

##### 6.1.1. Definition of Done (DoD) for UI Tasks (AI to Propose)
*AI Instruction: Propose a clear "Definition of Done" for tasks involving UI development. This DoD should ensure that functional code also meets the high-quality design and UX standards of the project. Refer to `design_conventions.md` (once populated) and `AI_Design_Agent_Optimization.md`.*
*AI Proposal for UI Task DoD:*
*   *Functionality implemented as per acceptance criteria (Section 6.2).*
*   *Code adheres to `coding_conventions.md`.*
*   **Visuals & Interactions:**
    *   *UI matches mockups/prototypes (if available) and strictly adheres to `design_conventions.md` (colors, typography, spacing, iconography, component styles).*
    *   *All interactive states (hover, focus, active, disabled, loading) are correctly implemented and visually distinct as per `design_conventions.md`.*
    *   *Micro-interactions and animations (if applicable) are smooth, purposeful, and align with `design_conventions.md` (Section 5.2.2).*
*   **Responsiveness:** Component/page is verified and functions correctly across all target breakpoints defined in `design_conventions.md` (or Section 4.7).
*   **Accessibility (A11Y):**
    *   *Passes automated A11Y checks (e.g., Axe DevTools).*
    *   *Full keyboard navigability confirmed for all interactive elements.*
    *   *Semantic HTML is used appropriately.*
    *   *Sufficient color contrast verified.*
    *   *ARIA attributes used correctly where necessary.*
*   **Cross-Browser Compatibility:** Verified on latest two versions of Chrome, Firefox, Safari, Edge (as per Section 4.7).
*   **Documentation:** Component is documented in Storybook (if applicable) with props and usage examples.
*   **Testing:** Relevant unit/integration tests for UI logic are passing.
`[User to Adjust/Confirm AI's Proposed DoD for UI Tasks]`

### 6.2. Acceptance Criteria (Gherkin/BDD Format - AI to Generate)
*AI Instruction: For each User Story you generate (Section 3.2), you will also generate corresponding acceptance criteria in Gherkin format ("GIVEN... WHEN... THEN...") in your detailed feature specifications (Section 9.1.4). These will form the basis for automated tests.*
`[This section is a directive to the AI; criteria will be in AI's feature specs]`

### 6.3. Detailed Test Scenarios for AI Agent (AI to Generate)
*AI Instruction: In your feature specifications (Section 9.1), beyond Gherkin ACs, you will generate detailed test scenarios (nominal, error, edge cases) that you will use to implement specific test cases.*
`[This section is a directive to the AI; scenarios will be in AI's feature specs]`

### 6.4. User Acceptance Testing (UAT) (User to Define Process)
*User Instruction: Please describe how you plan to conduct User Acceptance Testing. Who will participate? What are the key scenarios they should test? How will feedback be collected? The AI can help prepare test data or environments if instructed.*
`[User to Define UAT Process]`

### 6.5. Performance, Security, etc. Tests (Criteria for AI - AI to Propose)
*AI Instruction: Propose how critical NFRs (performance, security) will be tested, potentially involving tools like Lighthouse, k6 (for load testing stubs you might generate), or basic OWASP ZAP scans you might configure/run. Detail this in your NFR verification plan (Section 4.10) and feature specs.*
`[AI to Propose NFR Testing Approach for User Validation]`

---

## 7. Deployment and Launch Plan (AI to Propose, User to Validate)
*AI Instruction: Propose a basic deployment and launch plan, assuming a common hosting solution for the chosen frontend (e.g., Vercel for Next.js) and managed services for the chosen backend (e.g., Supabase).*

### 7.1. Deployment Strategy
*AI Proposal:* Phased deployment: Staging/Preview environment (Vercel Previews) for review, followed by Production deployment.
`[User to Adjust/Confirm AI's Proposed Deployment Strategy]`

### 7.2. Deployment Prerequisites
*AI Proposal:*
*   Vercel account connected to Git repository.
*   Backend project (e.g., Supabase) created and environment variables configured in the frontend hosting provider (e.g., Vercel).
*   Domain name configured (if applicable).
`[User to Adjust/Confirm AI's Proposed Deployment Prerequisites]`

### 7.3. Deployment Scripts (Instructions for AI Agent)
*AI Instruction: Deployment will primarily be handled by Vercel's CI/CD. You will ensure the `package.json` build scripts are correct and any necessary Vercel configuration files (e.g., `vercel.json`) are set up if non-standard settings are needed.*
`[This section outlines AI's responsibility for Vercel deployment setup]`

### 7.4. Rollback Plan
*AI Proposal:* Vercel provides immutable deployments, allowing easy rollback to previous production deployments via the Vercel dashboard.
`[User to Confirm AI's Proposed Rollback Plan]`

### 7.5. Launch Communication
*User Instruction: Outline any specific communication needed for launch (e.g., informing beta testers, internal team announcement).*
`[User to provide Launch Communication details]`

---

## 8. Maintenance and Future Evolutions (User Input & AI Suggestions)

### 8.1. Maintenance Plan (AI to Propose Basics)
*AI Proposal:*
*   Regular dependency updates (AI can assist in identifying and testing updates).
*   Monitoring of chosen hosting (e.g., Vercel) and backend (e.g., Supabase) dashboards for performance/errors.
*   User feedback collection mechanism (to be defined by user).
`[User to Adjust/Confirm AI's Proposed Maintenance Basics]`

### 8.2. Ideas for Future Releases (User Input / AI Brainstorming)
*User Instruction: List any known future features or ideas. You can also ask the AI to brainstorm potential future evolutions based on the current project scope.*
`[User Input or AI Brainstorming Task: e.g., "AI, suggest 3 potential enhancements for this app."]`
*AI Instruction: If tasked, provide 2-3 sensible future feature suggestions.*
`[AI to fill if tasked, or reflect user input]`

---

## 9. AI Agent Specific Instructions
*Comment: This section provides overarching directives for the AI Coding Agent. Adherence to these instructions is critical for the success of the Agentic Coding System.*

### 9.1. Feature Decomposition and Specification Process (Mandatory Pre-Coding Step for AI)
*AI Agent Directive: For every high-level feature provided by the user in Section 3.1, before commencing any code implementation, you MUST perform the following decomposition and specification process. The objective is to ensure your exhaustive and unambiguous understanding of each task, aligning with our 'Argentic Coding' standards. Generate this detailed specification internally or in a working document that can be reviewed by humans. **This includes proposing specific libraries, backend services (e.g., Supabase services if chosen), or MCP servers where appropriate.** Your proposals for tooling (MCPs, libraries, specific backend services) are crucial and require human validation. This decomposition process is critical for your reasoning. Break down complex problems into smaller, manageable sub-problems. For each sub-problem, consider the relevant sections of this PRD (NFRs, Design System, MCP Logic, etc.) before proposing a solution.*

**Detailed Specification Structure to be Generated by AI Agent (for each User-Provided Feature):**

1.  **`feature_id` (Unique Feature Identifier):**
    *   *AI Instruction:* Assign a unique ID (e.g., `FEAT-001`).
2.  **`user_story_reiteration` (User Story/Stories):**
    *   *AI Instruction:* Based on the user's high-level feature description, formulate the primary user story (or stories).
3.  **`description_expanded_by_ai` (AI's Detailed Understanding):**
    *   *AI Instruction:* Elaborate on the user's description. Clarify objectives, expected outcomes, integration points. Anticipate interactions and edge cases.
4.  **`acceptance_criteria_generated_by_ai` (AI-Generated Acceptance Criteria):**
    *   *AI Instruction:* Derive exhaustive acceptance criteria in Gherkin format. Cover nominal, error, and boundary cases.
    *   *AI Resources:* Project business rules, NFRs.
    5.  **`ui_elements_and_styling_plan_by_ai` (UI Elements and Styling Plan - Objective: YC Standard Excellence):**
        *   *AI Instruction:* Identify UI elements. Propose `element_type` and `component_base` (Storybook/Shadcn). Identify `tailwind_tokens_to_use` from [`tailwind.config.js`](tailwind.config.js:1). Describe layout, responsiveness, interactions. **Your proposals must imperatively aim for the "Silicon Valley / Y Combinator" design objective: modernity, elegance, fluidity, and an impeccable user experience. If the user has not provided aesthetic preferences, propose a style that embodies this ideal (minimalist, refined typography, etc.). If complexity justifies it AND the human explicitly requests it (Section 1.11), be prepared to propose 2-3 initial design variations for key UI elements of a feature to facilitate rapid exploration. Clearly label these proposals as 'exploratory design variations'.**
        *   *AI Resources:* [`tailwind.config.js`](tailwind.config.js:1), Storybook, Agentic Design Principles (with YC objective), user's aesthetic input.
    6.  **`data_and_logic_plan_by_ai` (Data and Logic Plan):**
        *   `input_data_identified`: List inputs, types, validation rules (client/server), error messages.
    *   `backend_interaction_strategy`: Detail interaction with the chosen backend (e.g., Supabase: DB, Auth, Edge Functions for custom logic). Specify tables, security considerations (like RLS if applicable), function signatures, request/response payloads.
    *   `frontend_state_management_approach`: Propose client-side state management suitable for the chosen frontend framework.
    *   *AI Resources:* Chosen database schema (you will propose this if not user-defined), API docs, state conventions.
7.  **`error_handling_strategy_by_ai` (Error Handling Strategy):**
    *   *AI Instruction:* Identify failure points (network, DB, APIs). Describe error catching, logging, user communication (aligned with Design System).
8.  **`security_checks_required_by_ai` (Security Checks):**
    *   *AI Instruction:* List security measures (input sanitization, RLS, XSS/CSRF protection for custom endpoints, etc.).
    *   *AI Resources:* OWASP Top 10, security best practices for the chosen backend (e.g., Supabase).
9.  **`dependencies_identified_by_ai` (Dependencies, including MCPs & Services):**
    *   *AI Instruction:* List project modules, external services, **MCP Servers** (e.g., `stripe` MCP, `context7` MCP, `supabase` MCP, `github` MCP), specific **backend services** (e.g., Supabase Auth, Storage, Functions, Realtime, Vector DB if Supabase is chosen), or third-party libraries/APIs. Task management is handled by Roo Orchestrator/Code (see [`../../../02_AI-DOCS/TaskManagement/Roo_Task_Workflow.md`](../../../02_AI-DOCS/TaskManagement/Roo_Task_Workflow.md)). **Provide justification for each proposed tool/service and how it integrates. When proposing an MCP server, specify its known capabilities, the primary function it will serve, and if it's a standard known MCP or one that would require setup/connection instructions from the user (if new/unknown, explicitly ask user for API docs/connection details). Confirm that its implementation will follow the 'Standard MCP Integration Logic' (Section 9.9).**
10. **`questions_for_clarification_by_ai` (Questions for Human Clarification):**
    *   *AI Instruction:* If ambiguities remain, list specific questions for the human team. **Do not code ambiguous parts without clarification.**

**General Directives for AI Agent During Implementation:**
*   Strict Adherence to Agentic Coding System.
*   Modular and Testable Code.
*   Relevant Comments.
*   Robust Error Handling.
*   Performance and Accessibility.

### 9.2. Coding Style and Linters
*AI Instruction: Adhere to ESLint with `@next/eslint-plugin-next` and Prettier (default settings or project-specific config if provided). Ensure all generated code passes these checks before considering a task complete.*
`[User can specify alternative linter/formatter configs if necessary]`

### 9.3. Dependency Management
*AI Instruction: Manage dependencies via `package.json` using `npm` (or `yarn`/`pnpm` if specified by user). Update `package.json` correctly when adding new dependencies (e.g., `npm install --save <package>`).*
`[User can specify package manager preference]`

### 9.4. Code Documentation Generation
*AI Instruction: Generate JSDoc comments for all functions and React components (props, purpose). Generate Storybook stories for all UI components. Ensure TypeScript types are clear and descriptive.*
`[User can specify additional code documentation standards]`

### 9.5. Commit and Versioning Strategy
*AI Instruction: Use Conventional Commits format for all commits (e.g., `feat: add user login page`, `fix: correct validation error on signup`). Generate clear and concise commit messages reflecting the changes made. Versioning (SemVer) will be handled by humans.*
`[User can specify variations to commit strategy if needed]`

### 9.6. Feedback Loop and Self-Correction
*AI Instruction: Upon encountering build errors, test failures, or linter issues, first attempt to self-correct based on the error messages and context. Make up to 3 self-correction attempts for a given logical issue. If self-correction fails after 3 attempts on the same logical issue, escalate to human review with detailed logs of attempts and errors, then await further instruction. Do not proceed with potentially flawed code.*
`[User can adjust self-correction parameters]`

### 9.7. AI Initiative in Tooling, MCP Server, and Service Selection
*AI Instruction: You are expected to proactively identify, evaluate, and propose the use of relevant tools and services.*

#### 9.7.1. Protocol for Proposing and Learning New Tools/MCPs
*AI Agent Directive: If you identify the need for a new tool, library, or MCP not currently listed or known to the project (see Section 5.6.1):*
    1.  *Describe the specific need and explain why existing project tools, connected MCPs, or chosen backend features (e.g., Supabase) are insufficient.*
    2.  *If you can identify a potential solution (e.g., a specific library, an existing third-party API, a known public MCP), provide a link to its official documentation and a brief summary of its relevance.*
    3.  *Explicitly ask the human user to validate the proposed tool/service.*
    4.  *If approved, request necessary configuration details from the user for the new tool/MCP, such as: API Endpoint, Authentication Method (and where to securely access credentials), Key request/response structures, Rate limits or quotas, Link to official detailed documentation.*
    5.  *Once approved and configured (potentially with human assistance for setup), you may add this tool/MCP to your 'knowledge base' for this project (e.g., by suggesting an update to Section 5.6.1 or an internal project knowledge document).*

*AI Instruction (General for 9.7):*
    *   **MCP Servers:** Utilize known, available MCPs (listed in 5.6.1) for specialized tasks. For new MCP needs, follow protocol 9.7.1.
    *   **Third-Party APIs & Libraries:** For functionalities not covered by the core stack or Supabase. Follow protocol 9.7.1 for new additions.
    *   **Chosen Backend Ecosystem:** If a BaaS like Supabase is chosen, fully leverage its features (Auth, DB, Storage, Edge Functions, Realtime, Vector DB) as a primary choice before proposing external tools.
*Document all proposals with rationale in your feature specifications (Section 9.1.9) for human review and approval. Prioritize robust, secure, well-maintained, and (where possible) cost-effective solutions compatible with the chosen technology stack (e.g., Next.js/Supabase or alternatives).*
`[This section empowers the AI but mandates human oversight for new tooling, especially non-standard MCPs/APIs]`

### 9.8. Workflow with Assisted Coding Tools (e.g., Cursor, Cline)
*AI Agent Directive: "When interacting with human developers via tools like Cursor or Cline, or any similar conversational coding assistant interface:*
    1.  *Be prepared to receive instructions and generate code in a conversational, iterative manner. Expect prompts to be less formal than full PRD specifications at times.*
    2.  *Utilize your comprehensive understanding of this PRD (including user-provided 'vibes', design principles, and technical constraints) to provide context-aware suggestions, code snippets, and complete components.*
    3.  *When asked to 'try something,' 'explore an idea,' or generate alternatives, leverage the 'Embrace Iterative Exploration' Guiding Principle (Section 1.8) and the Agentic Coding System to inform your proposals. Prioritize speed of generation for these exploratory tasks.*
    4.  *Facilitate rapid prototyping by generating functional (even if not initially fully polished or tested to production standards) code blocks quickly when in an exploratory context.*
    5.  *Clearly indicate when a generated piece of code is a 'draft for exploration/vibe check' versus a 'production-ready proposal based on full PRD specs and requiring all standard quality checks'. This distinction is crucial for managing expectations and workflow."*

### 9.9. Standard MCP Integration Logic (Using Supabase as a Hub)
*AI Agent Directive: When implementing features requiring interaction with any Model Context Protocol (MCP) Server (for payments, AI/LLM calls, GitHub operations, messaging, etc.), you MUST follow the integration logic detailed below. This logic pattern is a general guideline. For each specific MCP, you may need to adapt parts of this logic (e.g., specific error handling, request/response transformation) based on its official documentation and the information provided by the human for its setup. Always prioritize the MCP's official documentation for implementation details, while adhering to our security and logging principles. The objective is to use our chosen backend (e.g., Supabase instance) as a central hub for configuration, interaction logging, and potentially storing MCP results, ensuring secure and traceable interaction with these external services.*

**9.9.1 Retrieve MCP Configuration from Supabase (if applicable):**
*   *AI Scenario:* Dynamic API keys, user/tenant-specific endpoints, or behavioral parameters for MCPs might be stored in tables within the chosen backend (e.g., Supabase tables like `mcp_configurations`, `user_service_credentials`).
*   *AI Action:*
    1.  Before calling an MCP, check if specific configurations are required and if they should be read from the chosen backend.
    2.  Implement code to query the chosen backend (e.g., using `supabase-js` client with appropriate RLS if Supabase is used) to retrieve these configurations.
    3.  Handle cases where configuration is not found or is invalid (e.g., log error, notify user/admin, fallback to default if safe).
*   *AI Example (Pseudo-code to guide implementation):*
    ```typescript
    // Within a Next.js API Route or Supabase Edge Function
    async function getMcpConfig(serviceName: string) { // Example assumes Supabase
      const { data: mcpConfig, error } = await chosenBackendClient // e.g., supabase
        .from('mcp_configurations') // or equivalent table in chosen DB
        .select('api_key, endpoint_url, other_params')
        .eq('service_name', serviceName)
        .single();
      if (error || !mcpConfig) {
        console.error(`Error fetching MCP config for ${serviceName}:`, error);
        throw new Error(`Configuration for ${serviceName} not found.`);
      }
      return mcpConfig;
    }
    // const { apiKey, endpointUrl } = await getMcpConfig('stripe_payment_mcp');
    ```

**9.9.2 Prepare Input Data for MCP:**
*   *AI Scenario:* The MCP expects specific input data, which may come from user requests, the chosen database, or application logic.
*   *AI Action:*
    1.  Gather and format the required input data for the MCP.
    2.  Validate this data rigorously before sending it to the MCP.
    3.  If necessary, retrieve additional contextual data from the chosen backend (e.g., Supabase) to enrich the MCP request.

**9.9.3 Secure MCP Call:**
*   *AI Scenario:* Interaction with the MCP typically occurs via an HTTP call to its endpoint.
*   *AI Action:*
    1.  Implement the HTTP call (using `fetch` or a robust library like `axios`) to the MCP endpoint.
    2.  Inject necessary authentication headers (e.g., `Authorization: Bearer <MCP_API_KEY>`). **Sensitive API keys MUST be stored securely as server-side environment variables (e.g., in Vercel settings or the chosen backend's environment settings like Supabase) and NEVER exposed client-side.**
    3.  Implement proper timeout handling and retry mechanisms for transient network errors if appropriate for the MCP's nature.
    4.  All MCP calls must originate from server-side environments (e.g., Next.js API Routes if used, or chosen backend functions like Supabase Edge Functions).

**9.9.4 Log MCP Interaction in Supabase (Audit Trail):**
*   *AI Scenario:* For traceability, debugging, and analytics, all MCP calls must be logged.
*   *AI Action:*
    1.  Before and/or after the MCP call, insert/update a record in a dedicated table in the chosen backend (e.g., a Supabase table like `mcp_interaction_logs`).
    2.  Log information such as: `timestamp`, `user_id` (if applicable), `mcp_name`, `request_payload_summary` (anonymize/truncate sensitive data), `response_status_code`, `response_summary_or_error_message`, `correlation_id` (generate a unique ID for each interaction flow).
*   *AI Example (Pseudo-code for backend table structure and logging, assuming Supabase):*
    ```sql
    -- mcp_interaction_logs table example
    CREATE TABLE mcp_interaction_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at TIMESTAMPTZ DEFAULT now(),
        user_id UUID REFERENCES auth.users(id),
        mcp_name TEXT NOT NULL,
        correlation_id UUID NOT NULL,
        status TEXT NOT NULL, -- e.g., 'initiated', 'success', 'failed_mcp', 'failed_internal'
        request_details JSONB, -- Summary, non-sensitive parts
        response_details JSONB, -- Summary, status code, non-sensitive parts or error message
        error_message TEXT
    );
    ```
    ```typescript
    // Logging example
    const correlationId = crypto.randomUUID(); // or a similar UUID generation
    await chosenBackendClient.from('mcp_interaction_logs').insert({ // Example assumes Supabase
        mcp_name: 'example_mcp',
        user_id: userId, // if applicable
        correlation_id: correlationId,
        status: 'initiated',
        request_details: { /* non-sensitive summary */ }
    });
    // ... MCP call ...
    // On response:
    await chosenBackendClient.from('mcp_interaction_logs') // Example assumes Supabase
        .update({
            status: mcpResponse.ok ? 'success' : 'failed_mcp', // or more granular status
            response_details: { statusCode: mcpResponse.status, /* non-sensitive summary */ },
            error_message: mcpResponse.ok ? null : await mcpResponse.text()
        })
        .eq('correlation_id', correlationId)
        .eq('status', 'initiated'); // Ensure updating the correct log
    ```

**9.9.5 Process MCP Response:**
*   *AI Scenario:* The MCP returns data or a status.
*   *AI Action:*
    1.  Parse the MCP's response (e.g., JSON).
    2.  Handle different HTTP status codes appropriately (2xx for success, 4xx for client errors, 5xx for server errors from the MCP).
    3.  Extract relevant data from the successful response. Log errors comprehensively.

**9.9.6 Update Supabase Database with MCP Results (if applicable):**
*   *AI Scenario:* MCP results may require creating, updating, or deleting data in the chosen backend (e.g., Supabase).
*   *AI Action:*
    1.  Implement logic to persist relevant MCP results into the appropriate tables in the chosen backend.
    2.  This could involve updating an order status, storing a transaction ID, saving AI-generated content, etc. Ensure data integrity and apply relevant security measures (like RLS if applicable).

**9.9.7 Provide Feedback to User / Application Flow:**
*   *AI Scenario:* The outcome of the MCP interaction needs to be communicated or influence the application flow.
*   *AI Action:*
    1.  Format an appropriate response for the frontend client or calling service.
    2.  Trigger subsequent actions in the application flow (e.g., redirect, display success/error message, update UI state).

**9.9.8 Key Considerations for AI Agent:**
*   **Security First:** Reiterate that MCP API keys and sensitive data are server-side only.
*   **Idempotency:** Where possible and supported by the MCP, implement idempotent calls for critical operations.
*   **Granular Error Handling:** Differentiate errors (MCP vs. chosen backend vs. internal logic) and provide clear feedback/logs.
*   **Modularity:** Encapsulate interaction logic for each MCP into reusable server-side functions/modules (e.g., in `/lib` or dedicated API routes/serverless functions within the chosen stack).
*   **Configuration Management:** For MCPs requiring user-specific setup (API keys, etc.), ensure the system allows users to provide these securely, and your code retrieves them from the designated secure storage (environment variables or a secure table in the chosen backend with appropriate security like RLS).

---

## 10. Risks and Dependencies (AI to Identify, User to Validate)

### 10.1. Risk Identification
*AI Instruction: Based on the project scope and chosen technologies, identify potential technical risks (e.g., complexity of a feature, integration challenges with a proposed MCP/API, performance bottlenecks with chosen database queries if not designed carefully). The AI's ability to perform deep market/competitive risk analysis is limited; focus on technical and implementation risks.*
`[AI to Propose Risks for User Validation]`

### 10.2. Risk Mitigation Plan
*AI Instruction: For each significant risk identified, propose a mitigation strategy. This might involve alternative technical approaches, more detailed prototyping, or specific testing strategies.*
`[AI to Propose Mitigation Plans for User Validation]`

### 10.3. Dependencies
*AI Instruction: List key external dependencies (known MCP servers, proposed third-party APIs, specific features of the chosen backend (e.g., Supabase) critical to the project) and any assumptions made about their availability or functionality. Highlight where user action might be needed for setup or API keys.*
`[AI to List Key Dependencies for User Validation]`

---

## 11. Glossary (AI to Maintain)
*AI Instruction: Maintain a glossary of technical terms, acronyms, project-specific jargon, and names of key MCPs or services used, to ensure common understanding.*
*   **Agentic Coding System:** Our holistic methodology for developing high-quality software, emphasizing design finesse, technical excellence, and intelligent AI agent collaboration.
*   **Design System `[AI to Propose Project Name] Design System`:** The single source of truth for all UI components, design tokens, and styling guidelines for this project.
*   **MCP (Model Context Protocol) Server:** An external tool or service, often an API, that the AI Agent can interact with to perform specialized tasks (e.g., payment processing, documentation lookup, code analysis, GitHub operations). The AI Agent uses predefined MCPs where available or can be instructed by the user on how to connect to new ones if they follow a compatible API structure or if an MCP server wrapper can be created for them. When proposing an MCP, the AI will specify its known capabilities, the primary function it will serve, and if it's a standard known MCP or one requiring user setup/connection details.
*   **Supabase (if chosen):** A Backend-as-a-Service (BaaS) platform providing database, auth, storage, edge functions, etc. (This is a suggested default).
*   **Next.js (if chosen):** A React framework for the frontend. (This is a suggested default).
*   **Tailwind CSS:** The utility-first CSS framework for styling.
*   **Shadcn/ui:** A collection of UI components used as a customizable base, to be heavily adapted to the project's Design System.
`[AI to add terms as they arise]`

---

## 12. Appendices (User or AI to Add as Needed)
*Comment: Supporting documents, detailed diagrams, or links to external resources can be added here.*
`[User or AI to add appendices as needed]`

---
*End of PRD Template for Streamlined Agentic AI Workflow*