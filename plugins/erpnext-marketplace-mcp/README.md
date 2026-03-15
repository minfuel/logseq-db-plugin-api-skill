# erpnext-marketplace-mcp (mock)

Mock MCP server that exposes all requested tool names.

## Run

1. Open terminal in `plugins/erpnext-marketplace-mcp/server`
2. Start server: `npm start`
3. Health: `http://localhost:8787/health`
4. Tool list: `http://localhost:8787/tools`

## Endpoint

- `POST /mcp/call`

Body:

```json
{
  "tool": "compare_vendor_prices",
  "request_id": "req-1",
  "payload": {
    "item_name": "Laser level"
  }
}
```
