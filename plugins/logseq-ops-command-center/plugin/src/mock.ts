import { MockResult } from './types'

function nowIso(): string {
  return new Date().toISOString()
}

function routeData(toolKey: string): Record<string, unknown> {
  const common = { listing_id: `mock-${toolKey}-${Date.now()}`, provider: 'mock-provider' }

  switch (toolKey) {
    case 'compare_vendor_prices':
      return {
        item_name: 'Makita drill set',
        cheapest_vendor: 'Prisjakt: ToolHub',
        best_price_nok: 1299,
        alternatives: [
          { vendor: 'ToolHub', price_nok: 1299 },
          { vendor: 'ByggPartner', price_nok: 1349 },
          { vendor: 'Internal Catalog', price_nok: 1390 },
        ],
      }
    case 'run_marketplace_hustle_routine':
      return {
        searches_processed: 5,
        items_found: 17,
        matches_created: 4,
      }
    case 'orchestrate_pickup_route':
      return {
        date: '2026-03-20',
        stops: ['Sirdal', 'Egersund', 'Sirevag'],
        google_maps_link: 'https://maps.google.com/?q=Sirdal,Egersund,Sirevag',
      }
    case 'query_inventory_natural_language':
      return {
        question: 'Do we have pliers?',
        answer: 'Yes. 14 units in Warehouse-A and 3 units in Van-2.',
      }
    default:
      return {
        ...common,
        message: 'Mock execution completed successfully.',
      }
  }
}

export async function runMockTool(toolKey: string): Promise<MockResult> {
  return {
    status: 'success',
    request_id: `req-${Date.now()}`,
    timestamp_utc: nowIso(),
    errors: [],
    data: routeData(toolKey),
  }
}
