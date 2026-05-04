# ADM-017: Dead-Letter Replay Console - Component Specification

## Screen Reference
- **ID**: ADM-017 | **Name**: Dead-Letter Replay Console
- **Base Spec**: `../../admin-screen-specs/ADM-017 Dead-Letter Replay Console.md`
- **Route**: `/admin/integrations/dead-letter`

## Component Inventory
**Primary**: 1. Dead-Letter Table, 2. Payload Inspector, 3. Replay Controls, 4. Failure Diagnostics
**Secondary**: 5. Payload Editor, 6. Retry History, 7. Business Document Linker
**Modals**: Payload Viewer, Edit Payload Dialog, Replay Confirmation

## Data Schema
| Field | Type | Validation |
|-------|------|------------|
| eventId | string | UUID |
| originalTimestamp | datetime | When event first entered |
| failureReason | string | Error message |
| stackTrace | string | Error stack |
| payload | object | Event data |
| retryAttempts | number | Total attempts |
| businessDocId | string | Linked doc (GRN, order, etc.) |

## Layout
**Pattern**: Table + payload inspector
**Table**: Dead-letter events (left 40%)
**Inspector**: Payload viewer (right 60%)
**Editor**: Inline JSON editor

## Key Components
- **Dead-Letter Table**: Event ID, Connector, Failure Reason, Retry Attempts, Timestamp, Actions
- **Failure Reason**: Truncated error with expand button
- **Payload Inspector**: JSON viewer with syntax highlighting, collapsible nodes
- **Stack Trace**: Expandable error details with line numbers
- **Payload Editor**: Edit JSON payload to fix data issues
- **Retry History**: Timeline of all retry attempts with errors
- **Business Doc Link**: Shows linked GRN/order/transfer if identifiable
- **Replay Button**: Resubmit event to queue (optionally with edited payload)
- **Delete Button**: Permanently remove dead-letter event
- **Bulk Replay**: Select multiple events for batch replay
- **Search**: Search by event ID, connector, or error message

## Admin-Specific
- **Payload Editing**: Fix data issues before replay
- **Diagnostics**: Complete error context for troubleshooting
- **Bulk Replay**: Efficient recovery from systemic failures
