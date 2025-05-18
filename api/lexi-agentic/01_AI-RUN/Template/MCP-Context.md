# MCP Servers Overview

This document provides an overview of the currently connected Model Context Protocol (MCP) servers and their main functionalities.

## Context7
*Installation: `npx -y @upstash/context7-mcp@latest`*

- **resolve-library-id**: Finds the identifier of a Context7-compatible library. Useful for obtaining the exact ID needed for other Context7 tools.
- **get-library-docs**: Retrieves up-to-date documentation for a specific library using its Context7 ID.

## GitHub
*Installation: `npx -y @modelcontextprotocol/server-github`*

Provides a complete suite of tools for interacting with GitHub repositories:

- **File Management**: create_or_update_file, get_file_contents, push_files
- **Repository Management**: search_repositories, create_repository, fork_repository
- **Branch Management**: create_branch, update_pull_request_branch
- **Issue Management**: create_issue, list_issues, update_issue, add_issue_comment, get_issue
- **Pull Request Management**: create_pull_request, get_pull_request, list_pull_requests, create_pull_request_review, merge_pull_request, get_pull_request_files, get_pull_request_status, get_pull_request_comments, get_pull_request_reviews
- **Search Capabilities**: search_code, search_users, search_issues
- **Commit Management**: list_commits

## Puppeteer
*Installation: `npx -y @modelcontextprotocol/server-puppeteer`*

Allows control of a browser (based on PuppeteerJS) for web automation tasks:

- **Navigation**: puppeteer_navigate
- **Screenshots**: puppeteer_screenshot
- **Page Interactions**: puppeteer_click, puppeteer_fill, puppeteer_select, puppeteer_hover
- **JavaScript Execution**: puppeteer_evaluate
- **Direct access to browser console logs** via console://logs

## Stripe
*Installation: `npx -y @stripe/mcp --tools=all --api-key=YOUR_API_KEY`*

Provides tools for interacting with the Stripe API for payment management:

- **Customer Management**: create_customer, list_customers
- **Product Management**: create_product, list_products
- **Price Management**: create_price, list_prices
- **Payment Links**: create_payment_link
- **Invoice Management**: create_invoice, create_invoice_item, finalize_invoice
- **Refunds**: create_refund
- **Payment Intents**: list_payment_intents
- **Subscription Management**: list_subscriptions, cancel_subscription, update_subscription
- **Coupon Management**: list_coupons, create_coupon
- **Balance Retrieval**: retrieve_balance

## Playwright
*Installation: `npx -y @executeautomation/playwright-mcp-server`*

Similar to Puppeteer, this server uses Playwright for browser automation (Chromium, Firefox, Webkit):

- **Test Session Recording**: start_codegen_session, end_codegen_session
- **Navigation**: playwright_navigate
- **Screenshots**: playwright_screenshot
- **Page Interactions**: 
  - Clicks: playwright_click, playwright_iframe_click
  - Form filling: playwright_fill
  - Selection: playwright_select
  - Hovering: playwright_hover
  - Key presses: playwright_press_key
  - Drag and drop: playwright_drag
- **JavaScript Execution**: playwright_evaluate
- **Console Log Management**: playwright_console_logs
- **HTTP Requests**: playwright_get, playwright_post, etc.
- **HTTP Response Handling**: playwright_expect_response, playwright_assert_response
- **PDF Saving**: playwright_save_as_pdf
- **Direct access to browser console logs** via console://logs

## Sequential Thinking
*Installation: `npx -y @modelcontextprotocol/server-sequential-thinking`*

- **sequentialthinking**: A tool designed for complex problem-solving and planning, enabling step-by-step thought analysis with the ability to revise, question, and explore different approaches.

## Shadcn
*Installation: `npx -y shadcn@canary registry:mcp`*

Tools for interacting with a UI component registry (likely shadcn/ui):

- **Project Initialization**: init
- **Component Listing**: get_items
- **Component Retrieval**: get_item
- **Component Addition**: add_item

## 21st-dev/magic
*Installation: `npx -y @21st-dev/magic@latest API_KEY="YOUR_API_KEY"`*

Server focused on UI component generation and search:

- **21st_magic_component_builder**: Generates code snippets for React UI components
- **logo_search**: Searches and provides company logos in different formats (JSX, TSX, SVG)
- **21st_magic_component_inspiration**: Retrieves data and previews of components from 21st.dev for inspiration
- **21st_magic_component_refiner**: Helps improve/redesign existing React UI components

## ElevenLabs
*Installation: `uvx elevenlabs-mcp`*

Provides tools for AI-based audio generation and manipulation from ElevenLabs:

- **Text-to-Speech**: text_to_speech
- **Speech-to-Text**: speech_to_text
- **Sound Effects Generation**: text_to_sound_effects
- **Voice Management**:
  - Search: search_voices, search_voice_library
  - Cloning: voice_clone
  - Creation from previews: create_voice_from_preview
  - Details retrieval: get_voice
- **AI Conversational Agents**: create_agent, add_knowledge_base_to_agent, list_agents, get_agent
- **Speech-to-Speech Transformation**: speech_to_speech
- **Voice Preview Creation**: text_to_voice
- **Outbound Calls**: make_outbound_call
- **Audio Utilities**: isolate_audio, play_audio

## Convex
*Installation: `npx -y convex@latest mcp start`*

Tools for interacting with the Convex backend platform:

- **Deployment Management**: status
- **Data Access**: data, tables
- **Backend Function Execution**: functionSpec, run, runOneoffQuery
- **Environment Variable Management**: envList, envGet, envSet, envRemove

## Firecrawl
*Installation: `npx -y firecrawl-mcp`*

Server for advanced web scraping and exploration with Firecrawl:

- **Single Page Scraping**: firecrawl_scrape
- **URL Discovery**: firecrawl_map
- **Website Crawling**: firecrawl_crawl, firecrawl_check_crawl_status
- **Web Search**: firecrawl_search
- **Structured Data Extraction with LLM**: firecrawl_extract
- **Deep Research**: firecrawl_deep_research
- **LLMs.txt File Generation**: firecrawl_generate_llmstxt

## Supabase
*Installation: `npx -y @supabase/mcp-server-supabase@latest --access-token YOUR_ACCESS_TOKEN`*

Tools for interacting with the Supabase backend platform:

- **Organization Management**: list_organizations, get_organization
- **Project Management**: list_projects, get_project, create_project, pause_project, restore_project
- **Cost Management**: get_cost, confirm_cost
- **Database Interaction**:
  - Tables: list_tables
  - Extensions: list_extensions
  - Migrations: list_migrations, apply_migration
  - SQL Execution: execute_sql
- **Edge Function Management**: list_edge_functions, deploy_edge_function
- **Log Consultation**: get_logs
- **Project Information**:
  - API URL: get_project_url
  - Anonymous key: get_anon_key
- **TypeScript Type Generation**: generate_typescript_types
- **Development Branch Management**: create_branch, list_branches, delete_branch, merge_branch, reset_branch, rebase_branch

## Memory
*Installation: `npx -y @modelcontextprotocol/server-memory`*

Allows building and interacting with a knowledge graph:

- **Creation**: create_entities, create_relations
- **Modification**: add_observations, delete_observations
- **Deletion**: delete_entities, delete_relations
- **Reading**: read_graph
- **Node Search/Opening**: search_nodes, open_nodes

## Everything
*Installation: `npx -y @modelcontextprotocol/server-everything`*

A demonstration and testing server for MCP functionalities:

- **Echo**: echo
- **Addition**: add
- **Environment Variable Display**: printEnv
- **Long Operation Demonstration**: longRunningOperation
- **LLM Sampling**: sampleLLM
- **Test Image Retrieval**: getTinyImage
- **Annotated Message Demonstration**: annotatedMessage
- **Resource Referencing**: getResourceReference
- Also provides static test resources

---

These servers significantly extend the tool's capabilities by providing specialized interfaces for a wide variety of services and tasks.