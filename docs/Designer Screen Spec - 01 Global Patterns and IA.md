# Designer Screen Specification - 01 Global Patterns and IA

## 1. Global Information Architecture

### Mobile App IA
- Home and task queue
- Inbound and putaway
- Picking and packing handoff
- Transfers
- Cycle count
- Dispatch confirmation
- Exceptions and alerts
- Profile, device, and offline sync

### Web App IA
- Control tower dashboard
- Inventory and location management
- Inbound and outbound workbenches
- Transfers and replenishment
- QC and returns
- Dead stock and disposition
- Approvals inbox
- Financial costing and valuation
- Analytics and report center
- Admin and integration center

## 2. Shared UX Patterns

### Navigation
- Mobile: bottom tabs plus task-first shortcuts.
- Web: left rail module nav, top global search, workspace switcher.

### List Pattern
- Required controls: search, filter chips, saved views, sort, pagination.
- Row actions: view details, edit, create task, flag exception.
- Bulk actions: assign, export, approve, update status.

### Detail Pattern
- Header: status badge, identifiers, owner, timestamps, quick actions.
- Body: tabbed sections (overview, lines, activity, attachments, audit).
- Side panel: alerts, related records, SLA indicators.

### Task Pattern
- One primary CTA per screen.
- Show scan status and validation feedback inline.
- Sticky footer action on mobile for one-hand operation.

### Approval Pattern
- Decision card with impact summary.
- Actions: approve, reject, request changes, delegate.
- Mandatory comments on reject and threshold overrides.

### Exception Pattern
- Classify exception type and severity.
- Capture root cause and corrective action.
- SLA clock and escalation path visible.

## 3. Shared Data Components

### Entity Headers
- SKU: code, name, variant attributes, UOM, lifecycle status.
- Location: warehouse, zone, aisle/shelf/bin, capacity and occupancy.
- Document: doc number, type, state, owner, created and updated time.

### Status Chips (Core)
- Available
- Reserved
- QC Hold
- Damaged
- In Transit
- Scrap
- Blocked

### Time and Audit Fields
- Created by, created at
- Last updated by, updated at
- Approved by, approved at
- Source system, sync timestamp

## 4. Shared Dialogs and Overlays

### SHD-001 Global Search Overlay
- Actions: jump to entity, recent items, pinned records.
- Data to show: type icon, primary label, secondary label, status.

### SHD-002 Barcode Scan Overlay
- Actions: camera scan, hardware scan listener, manual entry fallback.
- Data to show: decoded value, validation result, matched entity.

### SHD-003 Reason Code Dialog
- Actions: select reason, enter note, submit.
- Data to show: reason taxonomy, policy hint, character count.

### SHD-004 Attachment and Photo Drawer
- Actions: upload, camera capture, annotate, delete.
- Data to show: filename, type, size, timestamp, uploader.

### SHD-005 Conflict Resolution Dialog
- Actions: keep mine, keep server, merge fields.
- Data to show: local vs server values, changed fields, timestamp.

## 5. Responsive and Accessibility Rules
- Minimum touch target on mobile: 44x44 px.
- Scanner-triggered actions must be keyboard-equivalent on web.
- Color never as sole status indicator; include icon/text.
- Table actions reachable by keyboard with visible focus states.
- Numeric inputs use locale-aware formatting and validation hints.

## 6. Common Validation Rules
- Required identifiers: warehouse, SKU, quantity, UOM.
- Quantity must be non-negative unless adjustment workflow allows otherwise.
- Expiry date required for FEFO-enabled categories.
- Serial uniqueness enforced for serialized SKUs.
- Mandatory comment on any reject, write-off, or override path.

## 7. Global Non-Functional UX States
- Offline mode banner and sync queue indicator on mobile.
- Loading skeletons for all list/detail views.
- Empty state with instructional CTA.
- Retry CTA with clear failure reason on API errors.
- Session timeout warning and recovery path.
