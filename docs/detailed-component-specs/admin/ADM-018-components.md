# ADM-018: API Key and Webhook Management - Component Specification

## Screen Reference
- **ID**: ADM-018 | **Name**: API Key and Webhook Management
- **Base Spec**: `../../admin-screen-specs/ADM-018 API Key and Webhook Management.md`
- **Route**: `/admin/integrations/api-keys`

## Component Inventory
**Primary**: 1. API Key Table, 2. Webhook Table, 3. Key Generator, 4. Webhook Editor
**Secondary**: 5. Scope Management, 6. Delivery Logs, 7. Secret Rotation
**Modals**: Generate Key Dialog, Create Webhook Dialog, Revoke Confirmation

## Data Schema
| Field | Type | Validation |
|-------|------|------------|
| keyId | string | UUID |
| keyName | string | Required, unique |
| key | string | Auto-generated, masked |
| scopes | array | Permission scopes |
| status | enum | 'active','revoked','expired' |
| expiresAt | datetime | Expiration date |
| lastUsed | datetime | Last API call |

## Layout
**Pattern**: Tabbed interface (API Keys tab, Webhooks tab)
**Table**: Key/webhook list
**Detail**: Right panel for selected item
**Logs**: Bottom panel for delivery logs

## Key Components
- **API Key Table**: Name, Key (masked), Scopes, Status, Expires, Last Used, Actions
- **Generate Key**: Button opens dialog (name, scopes, expiration), generates key with one-time display
- **Key Display**: Shows full key only once on creation (copy to clipboard button)
- **Scope Selector**: Checkboxes for API scopes (Read Inventory, Create Order, Update Shipment, etc.)
- **Expiration**: Date picker or duration dropdown (30d, 90d, 1yr, never)
- **Revoke Button**: Immediately invalidate key
- **Secret Rotation**: Generate new key, revoke old (for zero-downtime rotation)
- **Webhook Table**: URL, Events, Status, Signature, Last Delivery, Actions
- **Webhook Editor**: URL input, event multi-select (order.created, shipment.dispatched), signature secret
- **Delivery Logs**: Table of webhook deliveries (timestamp, event, status code, retry count)
- **Test Webhook**: Send test payload to verify configuration
- **Signature Validation**: HMAC-SHA256 signature generation for security

## Admin-Specific
- **Security-First**: One-time key display, masked storage
- **Scope-Based**: Granular permission control per key
- **Webhook Reliability**: Retry logic and delivery tracking
