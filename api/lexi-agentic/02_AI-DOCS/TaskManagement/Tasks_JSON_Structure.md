# tasks.json Structure Definition

The `tasks/tasks.json` file is the central repository for all project tasks. It follows a specific JSON structure.

## Root Object Structure

The root of the JSON file is an object containing two main keys: `meta` and `tasks`.

```json
{
  "meta": {
    "projectName": "Agentic Coding Framework",
    "version": "1.0.0",
    "source": "scripts/prd.txt or PRD document reference",
    "description": "Tasks generated from PRD",
    "totalTasksGenerated": 0,
    "tasksIncluded": 0
  },
  "tasks": []
}
```

### `meta` Object Fields:
*   `projectName` (String): The official name of the project (e.g., "Agentic Coding Framework").
*   `version` (String): Version of the task list or project.
*   `source` (String): Origin of the tasks (e.g., PRD filename, AI generation session ID).
*   `description` (String): A brief description of this task set.
*   `totalTasksGenerated` (Number): The total number of tasks initially generated.
*   `tasksIncluded` (Number): The current number of tasks in the `tasks` array.

### `tasks` Array:
This is an array of task objects.

## Task Object Structure

Each object within the `tasks` array must have the following fields:

*   `id` (Number or String): A unique identifier for the task (e.g., `1`, `2`, `feature-auth-1`). Must be unique across all tasks and subtasks if subtasks are flattened.
*   `title` (String): A brief, descriptive title for the task (e.g., "Initialize Project Repository").
*   `description` (String): A concise summary of what the task involves.
*   `status` (String): The current state of the task. Recommended values: "todo", "In Progress", "blocked", "review", "qa_testing", "Done", "pending", "deferred".
*   `dependencies` (Array of Numbers/Strings): An array of `id`s for tasks that must be completed before this task can begin. (e.g., `[1, 2]`).
*   `priority` (String): The importance level of the task. Recommended values: "high", "medium", "low".
*   `details` (String): **CRITICAL FIELD.** In-depth implementation instructions, notes, technical specifications, or context. Can be multi-line. **This field MUST contain direct links to, or embed the necessary content from, all relevant *created* project-specific documents that guide the task's execution.** This includes, but is not limited to:
    *   Specific feature specifications (e.g., `../03_SPECS/features/feature_spec_FEAT-XXX.md`).
    *   Relevant sections of `project_prd.md`.
    *   Architectural diagrams or guidelines from the created `../02_AI-DOCS/Architecture/architecture.md`.
    *   For UI tasks: Links to mockups, wireframes, component designs, and the created `../02_AI-DOCS/Conventions/design_conventions.md`.
    *   For backend tasks: API contracts (from `../02_AI-DOCS/Integrations/` or `../03_SPECS/`), data models, and the created `../02_AI-DOCS/Conventions/coding_conventions.md`.
    *   For database tasks: Schema details, migration plans, etc.
    The AI agent relies on this field to find and use the precise specifications needed for any development work (frontend, backend, database, design).
*   `testStrategy` (String): The approach for verifying that the task is completed correctly (e.g., "Unit tests for all new functions", "Manual QA on staging environment"), which should align with the specifications linked in `details`.
*   `subtasks` (Array of Task Objects): A list of smaller, more specific tasks that make up this main task. Each subtask object follows the same structure as a parent task object. Importantly, the `subtasks` array within a task object can itself contain task objects that also have their own `subtasks` array. This allows for multiple levels of nesting (e.g., task -> subtask -> sub-subtask -> ...), enabling detailed task breakdown. It is crucial to emphasize that each object at any level of nesting (whether a primary task, subtask, or sub-subtask) is a complete task object. As such, it should ideally include all standard fields, especially a detailed `description`, comprehensive `details` (which, like the parent task's `details` field, **MUST incorporate or reference all pertinent design specifications, coding conventions, technical specs, and context from parent tasks**), and a clear `testStrategy` to ensure clarity and quality at every level. Subtask IDs should be distinct, potentially following a hierarchical naming convention (e.g., `1.1`, `1.1.1`).
*   `estimatedEffort` (String, optional): Estimated time or effort for the task (e.g., "4h", "2d", "5sp").
*   `actualEffort` (String, optional): Actual time or effort spent on the task, updated upon completion.
*   `assignee` (String, optional): Identifier for the person or AI agent assigned to the task (e.g., "developer_alice", "Roo-Code-Agent-1").
*   `labels` (Array of Strings, optional): Descriptive labels or tags for categorizing the task (e.g., `["backend", "auth", "api"]`).
*   `dueDate` (String, optional): Target completion date for the task in YYYY-MM-DD format.
*   `codeContextPaths` (Array of Strings, optional): An array of file or directory paths relevant to the task's implementation, providing context for AI agents.
*   `complexityScore` (Number, optional): A numerical score representing the task's complexity, potentially assigned by an analysis process.
*   `recommendedSubtasks` (Number, optional): A suggested number of subtasks this task could be broken into, potentially from a complexity analysis.

### Example Task Object:

```json
{
  "id": 1,
  "title": "Implement User Authentication API",
  "description": "Develop the backend API endpoints for user registration, login, and logout.",
  "status": "todo",
  "dependencies": [ ],
  "priority": "high",
  "details": "Endpoints required:\n- POST /auth/register\n- POST /auth/login\n- POST /auth/logout\nUtilize JWT for session management. Hash passwords using bcrypt.",
  "testStrategy": "Write integration tests for all endpoints. Ensure proper error handling for invalid credentials or requests. Manually test flow with a frontend client.",
  "estimatedEffort": "3d",
  "actualEffort": null,
  "assignee": "Roo-Code-Agent-1",
  "labels": ["backend", "api", "authentication"],
  "dueDate": "2025-05-20",
  "codeContextPaths": ["src/api/auth/", "src/models/user.js"],
  "complexityScore": 8,
  "recommendedSubtasks": 3,
  "subtasks": [
    {
      "id": "1.1", // Example of a subtask ID convention
      "title": "Design Auth Database Schema",
      "description": "Define the schema for the users table.",
      "status": "todo",
      "dependencies": [],
      "priority": "high",
      "details": "Fields: id, username, email, password_hash, created_at, updated_at.",
      "testStrategy": "Review schema with team.",
      "subtasks": []
    },
    {
      "id": "1.2",
      "title": "Implement Registration Endpoint",
      "description": "Create the POST /auth/register endpoint.",
      "status": "todo",
      "dependencies": ["1.1"],
      "priority": "high",
      "details": "Validate input, hash password, store user.",
      "testStrategy": "Integration test with valid and invalid inputs.",
      "subtasks": []
    }
  ]
}