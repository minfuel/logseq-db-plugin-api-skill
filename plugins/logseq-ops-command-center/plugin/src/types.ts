export interface ToolDefinition {
  key: string
  title: string
  description: string
}

export interface MockResult {
  status: 'success' | 'partial' | 'failed'
  request_id: string
  timestamp_utc: string
  errors: Array<{ code: string; message: string }>
  data: Record<string, unknown>
}

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  { key: 'post_to_marketplace', title: 'Post to Marketplace', description: 'Publish sale or rental listing to selected marketplace.' },
  { key: 'track_saved_search', title: 'Track Saved Search', description: 'Save and track search queries for requests.' },
  { key: 'get_rental_eligible_assets', title: 'Get Rental Eligible Assets', description: 'List assets eligible for rental posting.' },
  { key: 'post_asset_for_rental', title: 'Post Asset for Rental', description: 'Rental-focused wrapper for posting assets.' },
  { key: 'manage_marketplace_listings_with_phone_ctrl', title: 'Manage Listings with Phone Control', description: 'Phone-assisted search/message/list actions.' },
  { key: 'orchestrate_pickup_route', title: 'Orchestrate Pickup Route', description: 'Build optimized pickup route and seller message plan.' },
  { key: 'run_marketplace_hustle_routine', title: 'Run Marketplace Hustle Routine', description: 'Scan saved searches and match against needs.' },
  { key: 'find_warehouses_on_finn', title: 'Find Warehouses on FINN', description: 'Search warehouses and optionally add to ERPNext.' },
  { key: 'quick_add_item_from_camera', title: 'Quick Add Item from Camera', description: 'Add item from image capture with enhancement.' },
  { key: 'scan_barcode_for_location', title: 'Scan Barcode for Location', description: 'Resolve warehouse location from barcode.' },
  { key: 'get_item_details', title: 'Get Item Details', description: 'Fetch item details and stock levels.' },
  { key: 'scan_receipt_and_add_items', title: 'Scan Receipt and Add Items', description: 'OCR receipt and create stock/asset entries.' },
  { key: 'batch_camera_upload_items', title: 'Batch Camera Upload Items', description: 'Bulk create items from camera images.' },
  { key: 'compare_vendor_prices', title: 'Compare Vendor Prices', description: 'Compare prices with Prisjakt and vendor catalog.' },
  { key: 'query_inventory_natural_language', title: 'Query Inventory (Natural Language)', description: 'Answer natural language inventory questions.' },
  { key: 'import_norwegian_chart_of_accounts', title: 'Import Norwegian Chart of Accounts', description: 'Import NS4102 or DFO accounts.' },
  { key: 'manage_skatteetaten_submissions', title: 'Manage Skatteetaten Submissions', description: 'Handle tax submission workflows and checks.' },
  { key: 'submit_lyngdal_kommune_application', title: 'Submit Kommune Application', description: 'Submit municipality applications.' },
  { key: 'get_support_programs', title: 'Get Support Programs', description: 'List grants/support programs with filters.' },
  { key: 'get_enova_support_programs', title: 'Get Enova Support Programs', description: 'Get active Enova support programs.' },
  { key: 'search_norwegian_support', title: 'Search Norwegian Support', description: 'Keyword search over support programs.' },
  { key: 'generate_rds_81346_designation', title: 'Generate RDS 81346 Designation', description: 'Generate standardized reference designation.' },
  { key: 'create_s1000d_data_module', title: 'Create S1000D Data Module', description: 'Generate S1000D issue 6 data module metadata.' },
  { key: 'import_github_repos_as_assets', title: 'Import GitHub Repos as Assets', description: 'Import repositories into ERPNext as assets/items.' },
]

export const DEFAULT_PAGE = 'Ops Command Center'
