const runButton = document.getElementById('run')
const marketplaceSelect = document.getElementById('marketplace')
const actionSelect = document.getElementById('action')
const output = document.getElementById('output')

async function runAction() {
  const marketplace = marketplaceSelect.value
  const action = actionSelect.value

  output.textContent = 'Running mock action...'

  const payload = {
    tool: 'manage_marketplace_listings_with_phone_ctrl',
    request_id: `ext-${Date.now()}`,
    payload: {
      material_request_items: ['MR-001', 'MR-002'],
      marketplace,
      action,
      message_template: 'standard',
    },
  }

  try {
    const response = await fetch('http://localhost:8787/mcp/call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await response.json()
    output.textContent = JSON.stringify(data, null, 2)
  } catch (error) {
    output.textContent = `Failed to call mock server: ${String(error)}`
  }
}

runButton.addEventListener('click', runAction)
