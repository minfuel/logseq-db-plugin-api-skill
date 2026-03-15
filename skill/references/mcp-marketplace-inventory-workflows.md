# MCP Marketplace and Inventory Workflows

Blueprint for implementing a large hybrid toolset where some actions run directly in Logseq, while browser automation and external systems run through MCP.

## Delivery Model: What Runs Where

Use a three-layer model:

1. Logseq plugin layer (command center)
- Provides slash commands, command palette actions, page templates, and local workflows.
- Stores requests/results in graph pages.
- Good for intake, approvals, route planning, status dashboards, and logs.

2. MCP service layer (integration brain)
- Exposes strongly-typed tools.
- Calls ERPNext, third-party APIs, OCR/vision pipelines, price providers, and routing services.
- Handles auth, retries, idempotency keys, and audit trails.

3. Browser extension and phone-control layer (where direct API does not exist)
- Required for marketplace interactions that do not expose stable public APIs.
- Used for FINN/Facebook page automation, messaging sellers, and assisted manual approval.

## Required Plugin Packages

For the requested scope, split into modular packages:

1. Logseq plugin: ops-command-center
- Main operator UI in Logseq.
- Registers commands for every MCP tool in this document.
- Writes structured result blocks under pages like Ops Inbox, Marketplace Queue, Inventory Intake.

2. Browser extension: marketplace-phone-control
- Handles marketplace browsing, saved-search checks, and guided seller messaging.
- Receives requests from MCP service.

3. MCP server: erpnext-marketplace-mcp
- Exposes all tool contracts below.
- Integrates ERPNext, marketplace adapters, OCR/image services, geocoding, and GitHub API.

## Tool Contract Conventions

Apply to every tool:

- Input must include request_id for traceability.
- Output must include:
  - status: success | partial | failed
  - request_id: echoed input request_id
  - timestamp_utc
  - errors: list of machine-readable errors
- Use idempotency keys for posting/submission actions.
- Never store credentials in Logseq pages.

Common response shape:

```json
{
  "status": "success",
  "request_id": "req_2026_03_15_001",
  "timestamp_utc": "2026-03-15T10:12:00Z",
  "errors": [],
  "data": {}
}
```

## Marketplace and Listings

### post_to_marketplace

Description:
Post stock items or assets to marketplaces like Facebook Marketplace, FINN.no, leid.no, or other rental services.

Execution path:
- Logseq command starts request.
- MCP validates listing payload and listing_type.
- If direct API unavailable, extension executes browser posting flow.

Input schema:

```json
{
  "request_id": "string",
  "marketplace": "Facebook Marketplace | FINN.no | leid.no | Other Rental Service | Other",
  "title": "string",
  "description": "string",
  "price": 0,
  "item_code": "string",
  "asset_code": "string",
  "listing_type": "Sale | Rental",
  "images": ["string"]
}
```

Returns:
Dictionary with posting status and listing ID.

### track_saved_search

Description:
Track and save search queries based on purchase or material request items.

Execution path:
- Logseq command creates/updates saved search block.
- MCP persists rule and activates scheduled checks.

Input:
- user
- search_query
- marketplace
- search_type: purchase_request | material_request

Returns:
Dictionary with search tracking status.

### get_rental_eligible_assets

Description:
Get list of company-owned assets eligible for rental posting based on chart of account codes.

Execution path:
- MCP queries ERPNext Assets + account mappings.

Input:
- company (optional)
- asset_category (optional)
- chart_of_account_code (optional: 1202 | 1203 | 1204)

Returns:
Dictionary with list of rental-eligible assets.

### post_asset_for_rental

Description:
Convenience wrapper for rental-specific posting.

Execution path:
- MCP transforms rental input and internally calls post_to_marketplace.

Input:
- asset_code
- marketplace
- title
- description
- rental_rate
- images

Returns:
Dictionary with posting status and listing ID.

### manage_marketplace_listings_with_phone_ctrl

Description:
Manage marketplace listings using phone control for search, seller messaging, and list curation.

Execution path:
- Must run through extension/phone-control adapter.

Input:
- material_request_items
- marketplace: facebook | finn
- action: search | message_seller | add_to_list
- message_template: standard | storage | free_goods | apology

Returns:
Dictionary with marketplace action results and communication status.

### orchestrate_pickup_route

Description:
Schedule pickup conversations and optimize route with Google Maps link.

Execution path:
- MCP geocodes listing addresses.
- Solves route with departure/start constraints.
- Generates Norwegian message suggestions.

Input:
- listings
- start_location
- preferred_date (YYYY-MM-DD)
- message_type: standard | storage | free_goods | apology

Returns:
Dictionary with route plan, Google Maps link, suggested messages, seller contact status.

### run_marketplace_hustle_routine

Description:
Scheduled worker that checks active saved marketplace searches and matches results to Material Requests/Tasks.

Execution path:
- MCP cron job + on-demand trigger from Logseq command.

Input:
- none

Returns:
Dictionary with searches processed, items found, matches created.

### find_warehouses_on_finn

Description:
Find warehouses in Norway via FINN and optionally create ERPNext records.

Execution path:
- Extension required for FINN browsing automation.
- MCP normalizes results and writes to ERPNext when enabled.

Input:
- location
- search_query (default: lager)
- region (optional)
- add_to_erpnext (boolean)
- phone_control (boolean)

Returns:
Dictionary with found warehouses and ERPNext creation status.

## Inventory and Stock

### quick_add_item_from_camera

Description:
Add a new stock item or asset from a camera image with background removal and enhancement.

Execution path:
- Extension/mobile capture -> MCP vision pipeline -> ERPNext item creation.

Input:
- image_data
- warehouse
- item_group (optional)
- valuation_rate (optional)
- remove_background (default true)
- enhance_image (default true)

Returns:
Dictionary with item creation status and item code.

### scan_barcode_for_location

Description:
Scan barcode to resolve warehouse location.

Execution path:
- Extension scanner or device camera + MCP lookup.

Input:
- barcode

Returns:
Dictionary with warehouse location information.

### get_item_details

Description:
Get detailed ERPNext item information and stock levels across warehouses.

Input:
- item_code

Returns:
Dictionary with item details.

### scan_receipt_and_add_items

Description:
Use OCR to parse receipt and create stock or asset records.

Execution path:
- MCP OCR model + field extraction + ERPNext record creation.

Input:
- receipt_image
- add_as: stock | asset
- warehouse
- cost_center

Returns:
Dictionary with scanned items and creation status.

### batch_camera_upload_items

Description:
Batch item creation from multiple phone images.

Execution path:
- Extension captures image list.
- MCP runs preprocessing and creates items in batch.

Input:
- images
- warehouse
- upload_name (optional)
- item_group (optional)
- valuation_rate (optional)
- remove_background (default true)
- enhance_image (default true)

Returns:
Dictionary with created items and failures.

### compare_vendor_prices

Description:
Compare vendor prices using Prisjakt and internal catalog and suggest cheapest vendor.

Execution path:
- MCP provider fan-out query + normalization + scoring.

Input:
- item_name
- search_prisjakt (default true)

Returns:
Dictionary with comparisons and recommendation.

### query_inventory_natural_language

Description:
Natural language inventory question answering.

Execution path:
- MCP parser -> ERPNext query builder -> NL response generator.

Input:
- query

Returns:
Dictionary with natural-language result and supporting rows.

## Norwegian Business and Government

### import_norwegian_chart_of_accounts

Description:
Import NS4102 or DFO chart of accounts.

Input:
- standard: NS4102 | DFO
- company (optional)

Returns:
Dictionary with import results.

### manage_skatteetaten_submissions

Description:
Handle tax-related submissions and deadline checks.

Input:
- action: employee_registration | tax_report | deduction_request | check_deadlines | check_account
- data

Returns:
Dictionary with status and phone-control fallback instructions when direct API is unavailable.

### submit_lyngdal_kommune_application

Description:
Submit municipality applications (building/renovation/property upgrade).

Input:
- kommune
- application_type: building_permit | renovation_permit | property_upgrade
- data

Returns:
Dictionary with submission status and tracking details.

### get_support_programs

Description:
List Norwegian grants/support programs with filters.

Input:
- entity_type (optional)
- provider (optional)
- program_type (optional)
- category (optional)

Returns:
Dictionary with matching programs.

### get_enova_support_programs

Description:
Return active Enova programs.

Input:
- none

Returns:
Dictionary with active Enova programs.

### search_norwegian_support

Description:
Search support programs by keyword.

Input:
- search_term

Returns:
Dictionary with matches.

## Technical Standards and Documentation

### generate_rds_81346_designation

Description:
Generate ISO/IEC 81346 reference designations.

Input:
- equipment_name
- function_aspect
- product_aspect
- location_aspect
- parent_system

Returns:
Dictionary with generated designation and metadata.

### create_s1000d_data_module

Description:
Create S1000D Issue 6 data module structures.

Input:
- item_code
- data_module_code
- title
- content_type: procedural | descriptive | fault | crew
- issue_number (default: 6)

Returns:
Dictionary with data module structure and metadata.

## DevOps and GitHub

### import_github_repos_as_assets

Description:
Import GitHub repositories as ERPNext assets or items.

Execution path:
- MCP queries GitHub REST API and writes ERPNext records.

Input:
- username
- organization
- github_token (optional)
- import_as_assets (boolean)
- asset_category

Returns:
Dictionary with import results and creation status.

## Logseq Command Mapping

Map every MCP tool to a Logseq command palette action.

Recommended command key format:
- ops-mcp-post-to-marketplace
- ops-mcp-track-saved-search
- ops-mcp-get-rental-eligible-assets
- ops-mcp-post-asset-for-rental
- ops-mcp-manage-marketplace-phone-control
- ops-mcp-orchestrate-pickup-route
- ops-mcp-run-marketplace-hustle-routine
- ops-mcp-find-warehouses-on-finn
- ops-mcp-quick-add-item-from-camera
- ops-mcp-scan-barcode-for-location
- ops-mcp-get-item-details
- ops-mcp-scan-receipt-and-add-items
- ops-mcp-batch-camera-upload-items
- ops-mcp-compare-vendor-prices
- ops-mcp-query-inventory-natural-language
- ops-mcp-import-norwegian-chart-of-accounts
- ops-mcp-manage-skatteetaten-submissions
- ops-mcp-submit-kommune-application
- ops-mcp-get-support-programs
- ops-mcp-get-enova-support-programs
- ops-mcp-search-norwegian-support
- ops-mcp-generate-rds-81346-designation
- ops-mcp-create-s1000d-data-module
- ops-mcp-import-github-repos-as-assets

## Minimal TypeScript MCP Client Shape

Use this in the Logseq plugin layer to call MCP tools.

```typescript
export type MCPToolRequest<T> = {
  request_id: string
  payload: T
}

export type MCPToolResponse<T> = {
  status: 'success' | 'partial' | 'failed'
  request_id: string
  timestamp_utc: string
  errors: Array<{ code: string; message: string }>
  data: T
}

export async function callMcpTool<TPayload, TResult>(
  toolName: string,
  request: MCPToolRequest<TPayload>
): Promise<MCPToolResponse<TResult>> {
  const response = await fetch('/mcp/call', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tool: toolName, ...request }),
  })

  if (!response.ok) {
    throw new Error(`MCP call failed for ${toolName}: ${response.status}`)
  }

  return (await response.json()) as MCPToolResponse<TResult>
}
```

## Security and Compliance Checklist

- Use OAuth/service tokens in MCP backend only.
- Do not expose ERPNext credentials in plugin or extension code.
- Encrypt sensitive tokens at rest.
- Log all submission/posting actions with request_id and actor.
- Add dry_run mode for high-risk actions (posting, submissions).
- Require explicit user confirmation before phone-control message send.

## Recommended Build Order

1. Build MCP server contracts and mocks for all tools.
2. Build Logseq command center with request forms and result pages.
3. Build extension phone-control adapters for FINN/Facebook flows.
4. Add scheduled routines and routing optimization.
5. Add compliance workflows (Skatteetaten, kommune, support programs).
6. Add standards/document generation and GitHub import workflows.
