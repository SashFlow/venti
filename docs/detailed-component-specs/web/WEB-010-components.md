# WEB-010: Shipment Detail and Tracking - Component Specification

## Screen Reference
- **ID**: WEB-010 | **Name**: Shipment Detail and Tracking
- **Base Spec**: `../../web-screen-specs/WEB-010 Shipment Detail and Tracking.md`
- **Route**: `/workspace/:workspaceId/shipments/:shipmentId`

## Component Inventory
**Primary**: 1. Shipment Header, 2. Event Timeline, 3. Linked Orders Panel, 4. Tracking Status
**Secondary**: 5. Delivery ETA, 6. Dispatch Notes, 7. Customer Notification Trigger
**Modals**: Add Note Modal, Customer Notification Dialog

## Data Schema
| Field | Type |
|-------|------|
| shipmentId | string |
| status | enum |
| timeline | array |
| orders | array |
| eta | datetime |

## Layout
**Pattern**: Detail page with header + timeline left + info panels right
**Header**: Shipment summary (100px)
**Timeline**: Vertical event timeline (60% width)
**Panels**: Right sidebar (40% width)

## Key Components
- **Shipment Header**: Shipment ID + status chip + vehicle + driver + destination
- **Event Timeline**: Vertical timeline (Created → Packed → Dispatched → In Transit → Delivered)
- **Linked Orders**: List of orders in shipment with links
- **Tracking Status**: Current location + ETA + carrier tracking link
- **Dispatch Notes**: Text area for internal notes
- **Customer Notification**: Button to trigger customer email/SMS update
- **Add Event**: Manual event entry for exceptions

## Web-Specific
- **Timeline Visualization**: Rich event history with timestamps
- **External Tracking**: Integration with carrier tracking APIs
- **Notification Templates**: Pre-built customer notification messages
