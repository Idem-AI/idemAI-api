# Project Idea Pre-Writing Template
*For initializing the PRD "Streamlined Agentic AI Workflow" with the Agentic Agent*

**Creation Date:** [Date]  
**Idea Author:** [Your Name/ID]

## SECTION A: THE CORE IDEA
*Purpose: Capture the essence of the project for Sections 1.2 and 3.1 of the PRD*

### 1. Project Working Title

```
[What working name do you have in mind?]
```

**Example:** "Neighborhood Carpooling App"

### 2. The Idea in a Few Words (Pitch/Central Concept)

```
[Describe the main concept in 1-2 sentences. What's the big idea?]
```

**Example:** "A mobile application to facilitate spontaneous and local carpooling between neighbors for short trips (school, shopping, activities)."

### 3. Main Problem this Project Solves

```
[What is the major pain point you're targeting? For whom is this problem most acute?]
```

**Example:** "Difficulty organizing small shared trips without the complexity of national platforms, lack of trust for carpooling with strangers over short distances, waste of empty seats in cars for recurring neighborhood trips."

### 4. Proposed Solution (How the Project Solves the Problem)

```
[How does your idea provide a solution? What is the unique approach?]
```

**Example:** "By creating a trust network based on locality, with a simple interface to offer/search for trips instantly, and verified profiles (optional) within a neighborhood community."

## SECTION B: KEY FEATURES (INITIAL MVP)
*Purpose: Feed Section 3.1 of the PRD*

### 1. Essential Feature #1

- **Name:** [Feature name]
- **Description (what the user can do):** [Short description]
- **Key Result for the User:** [What direct benefit?]
- **Desired "Vibe"/Experience (Optional):** [What feeling/quality?]

**Example:**
- **Name:** Neighborhood Registration & Profile
- **Description:** Create an account, define your neighborhood of residence, add a photo.
- **Result:** Be identified and able to interact with neighbors.
- **Vibe:** Simple, quick, reassuring.

### 2. Essential Feature #2

- **Name:** [Feature name]
- **Description:** [Short description]
- **Key Result for the User:** [What direct benefit?]
- **Desired "Vibe"/Experience (Optional):** [What feeling/quality?]

### 3. Essential Feature #3 (and #4 if needed)

- **Name:** [Feature name]
- **Description:** [Short description]
- **Key Result for the User:** [What direct benefit?]
- **Desired "Vibe"/Experience (Optional):** [What feeling/quality?]

## SECTION C: INITIAL DESIGN & TECHNOLOGY PREFERENCES
*Purpose: Guide AI proposals for Sections 1.10, 5.1, 5.2, 5.4 of the PRD*

### 1. General "Vibe" and Desired Aesthetics

```
[Describe the general atmosphere you envision. Use keywords if helpful (e.g., "modern and clean", "playful and colorful", "serious and professional", "artisanal and warm"). Are there any apps or websites whose design you like that could serve as inspiration (even vague)?]
```

**Example:** "I want something very simple, intuitive, with a modern and reassuring design. Soft colors. Inspiration: a mix between the 'Nextdoor' app for the local aspect and 'BlaBlaCar' for the simplicity of trip proposals."

### 2. Primary Target Audience (First Intuition)

```
[Who are the main users you're targeting? (e.g., neighborhood parents, young professionals without cars, active retirees). This will help the AI propose personas later.]
```

**Example:** "Residents of the same neighborhood or small town, especially families for school/activity trips, and people looking to save money or reduce their ecological footprint for local errands."

### 3. Technology Stack (If you have strong preferences or constraints)

The Agentic PRD suggests as a default: Next.js, Supabase, Tailwind CSS. However, the final technology choices can be adapted by the user.

```
[Do you have reasons to deviate from this standard? Specific technologies you absolutely want to use or avoid? Particular libraries in mind for certain functionalities? If not, leave blank, and the AI will follow the defaults.]
```

**Example:** "The default stack works perfectly for me. Perhaps explore using [Library X] for mapping if needed."

### 4. Anticipated Third-Party Integrations / MCPs (If clear ideas already exist)

```
[Are you already thinking about specific external services to integrate? (e.g., payment system, mapping service, push notifications, AI for a specific feature)]
```

**Example:** "Probably a mapping service to visualize trips (e.g., Mapbox or Google Maps via MCP). Push notifications for new trip proposals."

## SECTION D: INITIAL QUESTIONS FOR YOURSELF (AND FOR ROO LATER)
*Purpose: Anticipate points to explore further*

### 1. What are the biggest risks or uncertainties for this project at this stage?

```
[E.g., User adoption, technical complexity of a feature, monetization...]
```

### 2. How could this project generate value (for users, for you/the company)?

```
[What are the expected benefits?]
```

### 3. Are there any direct or indirect competitors that you already know of?

```
[Even a simple list is useful.]
```

### 4. On a scale of 1 to 10, how clear is this idea to you (1=very vague, 10=very clear)? Which aspects are the most unclear?

```
[Be honest, this will help Roo know where to focus questions.]
```

## Instructions for the Next Step

### Saving Your Output

Once you've completed this document:

1. Save it as `idea_document.md` in your project directory
2. This file will serve as the foundation for the next phase of the workflow

### Moving to Market Research

To proceed with market research:

1. Open the prompt file in `01_AI-RUN/` that corresponds to the `02_Market_Research.md` logical step. (Ensure `00_AutoPilot.md` or your manual process calls the correct actual filename for market research).
2. Share it with your AI agent.
3. When prompted for your idea, reference this completed `idea_document.md`.

```
@MarketMaster Pro

Please analyze the market potential for my project idea. You can find the complete idea document at: `idea_document.md`

The core concept is: [Brief 1-2 sentence summary of your idea]
```

### What to Expect Next

In the Market Research phase, the AI will:

1. Analyze your idea for market viability
2. Research competitors and market trends
3. Identify target user segments
4. Provide pricing and go-to-market strategies
5. Deliver a comprehensive market analysis report

This market validation is crucial before proceeding to refine your core concept in the next phase.