import http from 'node:http'

const PORT = process.env.PORT ? Number(process.env.PORT) : 8787

const tools = [
  'post_to_marketplace',
  'track_saved_search',
  'get_rental_eligible_assets',
  'post_asset_for_rental',
  'manage_marketplace_listings_with_phone_ctrl',
  'orchestrate_pickup_route',
  'run_marketplace_hustle_routine',
  'find_warehouses_on_finn',
  'quick_add_item_from_camera',
  'scan_barcode_for_location',
  'get_item_details',
  'scan_receipt_and_add_items',
  'batch_camera_upload_items',
  'compare_vendor_prices',
  'query_inventory_natural_language',
  'import_norwegian_chart_of_accounts',
  'manage_skatteetaten_submissions',
  'submit_lyngdal_kommune_application',
  'get_support_programs',
  'get_enova_support_programs',
  'search_norwegian_support',
  'generate_rds_81346_designation',
  'create_s1000d_data_module',
  'import_github_repos_as_assets',
]

function json(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  })
  res.end(JSON.stringify(body, null, 2))
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => {
      data += chunk
    })
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {})
      } catch (error) {
        reject(error)
      }
    })
    req.on('error', reject)
  })
}

function mockData(tool, payload) {
  if (tool === 'compare_vendor_prices') {
    return {
      item_name: payload?.item_name || 'Laser level',
      cheapest_vendor: 'ToolHub',
      best_price_nok: 1499,
      alternatives: [
        { vendor: 'ToolHub', price_nok: 1499 },
        { vendor: 'ByggMax', price_nok: 1625 },
      ],
    }
  }

  if (tool === 'orchestrate_pickup_route') {
    return {
      preferred_date: payload?.preferred_date || '2026-03-20',
      start_location: payload?.start_location || 'Lyngdal',
      suggested_stops: ['Farsund', 'Egersund', 'Sirevag'],
      maps_link: 'https://maps.google.com/?q=Lyngdal,Farsund,Egersund,Sirevag',
    }
  }

  return {
    message: 'Mock MCP tool executed',
    echo_payload: payload || {},
    listing_id: `mock-${tool}-${Date.now()}`,
  }
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    json(res, 200, { ok: true })
    return
  }

  if (req.url === '/health' && req.method === 'GET') {
    json(res, 200, { status: 'ok', server: 'erpnext-marketplace-mcp-mock' })
    return
  }

  if (req.url === '/tools' && req.method === 'GET') {
    json(res, 200, { tools })
    return
  }

  if (req.url === '/mcp/call' && req.method === 'POST') {
    try {
      const body = await readBody(req)
      const tool = body.tool
      const requestId = body.request_id || `req-${Date.now()}`

      if (!tools.includes(tool)) {
        json(res, 400, {
          status: 'failed',
          request_id: requestId,
          timestamp_utc: new Date().toISOString(),
          errors: [{ code: 'UNKNOWN_TOOL', message: `Tool not found: ${tool}` }],
          data: {},
        })
        return
      }

      json(res, 200, {
        status: 'success',
        request_id: requestId,
        timestamp_utc: new Date().toISOString(),
        errors: [],
        data: mockData(tool, body.payload),
      })
      return
    } catch (error) {
      json(res, 500, {
        status: 'failed',
        request_id: `req-${Date.now()}`,
        timestamp_utc: new Date().toISOString(),
        errors: [{ code: 'SERVER_ERROR', message: String(error) }],
        data: {},
      })
      return
    }
  }

  json(res, 404, { error: 'Not found' })
})

server.listen(PORT, () => {
  console.log(`Mock MCP server listening on http://localhost:${PORT}`)
})
