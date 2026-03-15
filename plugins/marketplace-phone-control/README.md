# marketplace-phone-control (mock extension)

Minimal browser extension for mock FINN/Facebook phone-control actions.

## Load in browser

1. Open browser extension page (developer mode)
2. Load unpacked extension from `plugins/marketplace-phone-control/extension`
3. Ensure mock MCP server is running on `http://localhost:8787`
4. Click extension icon and run an action

The popup posts to `manage_marketplace_listings_with_phone_ctrl` via mock MCP server.
