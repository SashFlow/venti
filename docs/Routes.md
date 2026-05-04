# Application Routes

Comprehensive routing table for all screens across the Venti WMS platform.

## Route Conventions
- **Platform indicators**: [Mobile App] = Native mobile application routes | [Web] = Web browser application routes
- **Authentication**: 🔓 = Public (no auth required) | 🔒 = Authenticated users only | 🔐 = Admin/specific roles only
- **Parameters**: `:param` = required path parameter | `?param` = optional query parameter
- **Workspace context**: Most web routes include `:workspaceId` for multi-tenant scoping

---

## Authentication Routes (AUTH)

| Screen ID | Screen Name | URL Pattern | Platform | Auth |
|-----------|-------------|-------------|----------|------|
| AUTH-001 | Web Login and Workspace Selection | `/auth/login` | [Web] | 🔓 |
| AUTH-002 | Forgot Password Flow | `/auth/forgot-password` | [Web] | 🔓 |
| AUTH-003 | Password Reset Page | `/auth/reset-password?token=:token` | [Web] | 🔓 |
| AUTH-004 | MFA Enrollment | `/auth/mfa/enroll` | [Web] | 🔒 |
| AUTH-005 | MFA Verification | `/auth/mfa/verify` | [Web] | 🔒 |
| AUTH-006 | Session Timeout and Re-authentication | _Modal overlay, no dedicated route_ | [Web] | 🔒 |
| AUTH-007 | Account Profile and Settings | `/account/settings` | [Web] | 🔒 |
| AUTH-008 | User Invitation Acceptance | `/auth/accept-invitation?token=:token` | [Web] | 🔓 |

---

## Mobile App Routes (MOB)

All mobile routes use native app navigation (not browser URLs). Listed here for reference and deep linking support.

| Screen ID | Screen Name | Deep Link Pattern | Platform | Auth |
|-----------|-------------|-------------------|----------|------|
| MOB-001 | Login and Site Selection | `venti://auth/login` | [Mobile App] | 🔓 |
| MOB-002 | Shift Start and Device Health | `venti://shift/start` | [Mobile App] | 🔒 |
| MOB-003 | Home Task Queue | `venti://tasks/home` | [Mobile App] | 🔒 |
| MOB-004 | Inbound Task List | `venti://tasks/inbound` | [Mobile App] | 🔒 |
| MOB-005 | Inbound Scan and Validate | `venti://inbound/scan/:taskId` | [Mobile App] | 🔒 |
| MOB-006 | QC Routing Decision Prompt | `venti://qc/routing/:itemId` | [Mobile App] | 🔒 |
| MOB-007 | Putaway Suggestion and Confirm | `venti://putaway/:taskId` | [Mobile App] | 🔒 |
| MOB-008 | Pick Task List | `venti://tasks/picking` | [Mobile App] | 🔒 |
| MOB-009 | Pick Execution by Scan | `venti://pick/:taskId` | [Mobile App] | 🔒 |
| MOB-010 | Short Pick Exception | `venti://pick/short/:taskId` | [Mobile App] | 🔒 |
| MOB-011 | Pack Handoff Confirmation | `venti://pack/handoff/:orderId` | [Mobile App] | 🔒 |
| MOB-012 | Dispatch Scan Confirmation | `venti://dispatch/scan/:shipmentId` | [Mobile App] | 🔒 |
| MOB-013 | Bin-to-Bin Transfer Execute | `venti://transfer/bin/:taskId` | [Mobile App] | 🔒 |
| MOB-014 | Inter-Warehouse Transfer Pick | `venti://transfer/pick/:transferId` | [Mobile App] | 🔒 |
| MOB-015 | Inter-Warehouse Transfer Receive | `venti://transfer/receive/:transferId` | [Mobile App] | 🔒 |
| MOB-016 | Cycle Count Task List | `venti://tasks/count` | [Mobile App] | 🔒 |
| MOB-017 | Cycle Count Entry | `venti://count/:taskId` | [Mobile App] | 🔒 |
| MOB-018 | Recount and Variance Note | `venti://count/recount/:taskId` | [Mobile App] | 🔒 |
| MOB-019 | Returns Intake | `venti://returns/intake/:returnId` | [Mobile App] | 🔒 |
| MOB-020 | Return Inspection Capture | `venti://returns/inspect/:returnId` | [Mobile App] | 🔒 |
| MOB-021 | Technician Stock Consume | `venti://technician/consume/:workOrderId` | [Mobile App] | 🔒 |
| MOB-022 | Alerts and Notifications | `venti://alerts` | [Mobile App] | 🔒 |
| MOB-023 | Exception Inbox | `venti://exceptions` | [Mobile App] | 🔒 |
| MOB-024 | Offline Queue and Sync | `venti://sync` | [Mobile App] | 🔒 |
| MOB-025 | Profile and Scanner Settings | `venti://settings` | [Mobile App] | 🔒 |

---

## Web Operations Routes (WEB)

| Screen ID | Screen Name | URL Pattern | Platform | Auth |
|-----------|-------------|-------------|----------|------|
| WEB-001 | Global Control Tower Dashboard | `/workspace/:workspaceId/dashboard` | [Web] | 🔒 |
| WEB-002 | Task Orchestration Board | `/workspace/:workspaceId/tasks/orchestration` | [Web] | 🔒 |
| WEB-003 | Inbound Workbench | `/workspace/:workspaceId/inbound` | [Web] | 🔒 |
| WEB-004 | GRN Detail and Line Validation | `/workspace/:workspaceId/inbound/grn/:grnId` | [Web] | 🔒 |
| WEB-005 | Putaway Monitor | `/workspace/:workspaceId/putaway` | [Web] | 🔒 |
| WEB-006 | Outbound Wave Planner | `/workspace/:workspaceId/outbound/waves` | [Web] | 🔒 |
| WEB-007 | Pick Performance Monitor | `/workspace/:workspaceId/outbound/picking` | [Web] | 🔒 |
| WEB-008 | Packing Station Workbench | `/workspace/:workspaceId/outbound/packing` | [Web] | 🔒 |
| WEB-009 | Dispatch Console | `/workspace/:workspaceId/outbound/dispatch` | [Web] | 🔒 |
| WEB-010 | Shipment Detail and Tracking | `/workspace/:workspaceId/outbound/shipment/:shipmentId` | [Web] | 🔒 |
| WEB-011 | Inventory Explorer | `/workspace/:workspaceId/inventory` | [Web] | 🔒 |
| WEB-012 | Location Utilization Map | `/workspace/:workspaceId/inventory/locations` | [Web] | 🔒 |
| WEB-013 | Stock State Management | `/workspace/:workspaceId/inventory/state` | [Web] | 🔒 |
| WEB-014 | Transfer Order List | `/workspace/:workspaceId/transfers` | [Web] | 🔒 |
| WEB-015 | Transfer Order Detail | `/workspace/:workspaceId/transfers/:transferId` | [Web] | 🔒 |
| WEB-016 | Replenishment Recommendations | `/workspace/:workspaceId/replenishment` | [Web] | 🔒 |
| WEB-017 | PO and Replenishment Link View | `/workspace/:workspaceId/replenishment/:recommendationId` | [Web] | 🔒 |
| WEB-018 | Cycle Count Planning Board | `/workspace/:workspaceId/count/planning` | [Web] | 🔒 |
| WEB-019 | Cycle Count Reconciliation Desk | `/workspace/:workspaceId/count/reconciliation` | [Web] | 🔒 |
| WEB-020 | QC Operations Queue | `/workspace/:workspaceId/qc` | [Web] | 🔒 |
| WEB-021 | QC Inspection Detail | `/workspace/:workspaceId/qc/inspection/:inspectionId` | [Web] | 🔒 |
| WEB-022 | Returns Operations Workbench | `/workspace/:workspaceId/returns` | [Web] | 🔒 |
| WEB-023 | Dead Stock Analyzer | `/workspace/:workspaceId/inventory/dead-stock` | [Web] | 🔒 |
| WEB-024 | Clearance and Write-Off Console | `/workspace/:workspaceId/inventory/clearance` | [Web] | 🔒 |
| WEB-025 | Approval Inbox | `/workspace/:workspaceId/approvals` | [Web] | 🔒 |
| WEB-026 | Exception Command Center | `/workspace/:workspaceId/exceptions` | [Web] | 🔒 |

---

## Admin Routes (ADM)

| Screen ID | Screen Name | URL Pattern | Platform | Auth |
|-----------|-------------|-------------|----------|------|
| ADM-001 | Tenant and Warehouse Setup | `/admin/workspaces` | [Web] | 🔐 |
| ADM-002 | Zone Shelf Bin Designer | `/admin/workspace/:workspaceId/locations` | [Web] | 🔐 |
| ADM-003 | Capacity and Restriction Rules | `/admin/workspace/:workspaceId/capacity-rules` | [Web] | 🔐 |
| ADM-004 | SKU and Catalog Admin | `/admin/workspace/:workspaceId/catalog` | [Web] | 🔐 |
| ADM-005 | UOM and Conversion Admin | `/admin/workspace/:workspaceId/uom` | [Web] | 🔐 |
| ADM-006 | Barcode and Label Template Manager | `/admin/workspace/:workspaceId/labels` | [Web] | 🔐 |
| ADM-007 | Device Registration and Health | `/admin/workspace/:workspaceId/devices` | [Web] | 🔐 |
| ADM-008 | Workflow Configuration | `/admin/workspace/:workspaceId/workflows` | [Web] | 🔐 |
| ADM-009 | Approval Matrix Configuration | `/admin/workspace/:workspaceId/approvals` | [Web] | 🔐 |
| ADM-010 | Role and Permission Manager | `/admin/workspace/:workspaceId/roles` | [Web] | 🔐 |
| ADM-011 | User and Team Administration | `/admin/workspace/:workspaceId/users` | [Web] | 🔐 |
| ADM-012 | Notification Rule Builder | `/admin/workspace/:workspaceId/notifications` | [Web] | 🔐 |
| ADM-013 | Alert Channel Configuration | `/admin/workspace/:workspaceId/alert-channels` | [Web] | 🔐 |
| ADM-014 | Integration Connector Registry | `/admin/workspace/:workspaceId/integrations` | [Web] | 🔐 |
| ADM-015 | SAP Mapping Studio | `/admin/workspace/:workspaceId/integrations/sap` | [Web] | 🔐 |
| ADM-016 | Integration Queue Monitor | `/admin/workspace/:workspaceId/integrations/queue` | [Web] | 🔐 |
| ADM-017 | Dead-Letter Replay Console | `/admin/workspace/:workspaceId/integrations/dead-letter` | [Web] | 🔐 |
| ADM-018 | API Key and Webhook Management | `/admin/workspace/:workspaceId/api` | [Web] | 🔐 |
| ADM-019 | Audit Log Explorer | `/admin/workspace/:workspaceId/audit` | [Web] | 🔐 |
| ADM-020 | Data Import and Bulk Action Center | `/admin/workspace/:workspaceId/bulk-actions` | [Web] | 🔐 |

---

## Analytics Routes (ANL)

| Screen ID | Screen Name | URL Pattern | Platform | Auth |
|-----------|-------------|-------------|----------|------|
| ANL-001 | Operational KPI Dashboard | `/workspace/:workspaceId/analytics/operations` | [Web] | 🔒 |
| ANL-002 | Inbound vs Outbound Trend Analysis | `/workspace/:workspaceId/analytics/flow-trends` | [Web] | 🔒 |
| ANL-003 | Order Fulfillment and OTIF Dashboard | `/workspace/:workspaceId/analytics/fulfillment` | [Web] | 🔒 |
| ANL-004 | Pick Pack Productivity Dashboard | `/workspace/:workspaceId/analytics/productivity` | [Web] | 🔒 |
| ANL-005 | Inventory Valuation Dashboard | `/workspace/:workspaceId/analytics/valuation` | [Web] | 🔒 |
| ANL-006 | Cost Breakdown and Landed Cost View | `/workspace/:workspaceId/analytics/costs` | [Web] | 🔒 |
| ANL-007 | Stock Aging Dashboard | `/workspace/:workspaceId/analytics/aging` | [Web] | 🔒 |
| ANL-008 | Dead Stock Insights Dashboard | `/workspace/:workspaceId/analytics/dead-stock` | [Web] | 🔒 |
| ANL-009 | Demand Trend and Forecast Monitor | `/workspace/:workspaceId/analytics/demand` | [Web] | 🔒 |
| ANL-010 | Return and QC Analysis Dashboard | `/workspace/:workspaceId/analytics/quality` | [Web] | 🔒 |
| ANL-011 | Alert Center | `/workspace/:workspaceId/analytics/alerts` | [Web] | 🔒 |
| ANL-012 | Notification Delivery Analytics | `/workspace/:workspaceId/analytics/notifications` | [Web] | 🔒 |
| ANL-013 | Report Builder | `/workspace/:workspaceId/analytics/reports/builder` | [Web] | 🔒 |
| ANL-014 | Scheduled Reports Manager | `/workspace/:workspaceId/analytics/reports/scheduled` | [Web] | 🔒 |
| ANL-015 | Export and Data Extract Center | `/workspace/:workspaceId/analytics/exports` | [Web] | 🔒 |

---

## Shared Overlays (SHD)

These are modal overlays/drawers that can appear on top of any screen. They don't have dedicated routes but are referenced throughout the application.

| Component ID | Component Name | Trigger Context |
|--------------|----------------|-----------------|
| SHD-001 | Global Search Overlay | Keyboard shortcut (Cmd/Ctrl+K), search icon in header |
| SHD-002 | Barcode Scan Overlay | Scanner hardware trigger, manual scan button |
| SHD-003 | Reason Code Dialog | Any action requiring justification (exceptions, adjustments, approvals) |
| SHD-004 | Attachment & Photo Drawer | Upload button, camera capture action |
| SHD-005 | Conflict Resolution Dialog | Concurrent edit detection, sync conflict after offline work |

---

## Common Query Parameters

These query parameters are supported across multiple routes for filtering, sorting, and context:

### Filtering & Search
- `?search=:query` - Full-text search within list views
- `?status=:status` - Filter by status (open, completed, failed, etc.)
- `?dateFrom=:date&dateTo=:date` - Date range filtering
- `?warehouse=:warehouseId` - Filter by specific warehouse (when user has multi-warehouse access)
- `?assignedTo=:userId` - Filter by assigned user

### Sorting & Pagination
- `?sort=:field&order=:direction` - Sort by field (asc/desc)
- `?page=:number&limit=:number` - Pagination controls

### Context & Navigation
- `?returnTo=:url` - Return URL after completing action
- `?modal=:modalId` - Open specific modal on page load
- `?highlight=:itemId` - Highlight specific item in list
- `?tab=:tabName` - Open specific tab on detail pages

---

## Navigation Patterns

### Role-Based Default Landing Pages
After login (AUTH-001) or workspace selection:

| Role | Default Route |
|------|---------------|
| Operations Manager / Supervisor | `/workspace/:workspaceId/dashboard` (WEB-001) |
| Floor Operator | `venti://tasks/home` (MOB-003) |
| Inventory Controller | `/workspace/:workspaceId/inventory` (WEB-011) |
| Replenishment Planner | `/workspace/:workspaceId/replenishment` (WEB-016) |
| Finance Analyst | `/workspace/:workspaceId/analytics/valuation` (ANL-005) |
| QC Inspector | `venti://tasks/home` or `/workspace/:workspaceId/qc` |
| System Admin | `/admin/workspaces` (ADM-001) |
| Integration Admin | `/admin/workspace/:workspaceId/integrations` (ADM-014) |

### Common Navigation Flows

#### Inbound Flow
1. WEB-003 (Inbound Workbench) → WEB-004 (GRN Detail) → WEB-005 (Putaway Monitor)
2. MOB-004 (Inbound Task List) → MOB-005 (Inbound Scan) → MOB-006 (QC Routing) → MOB-007 (Putaway)

#### Outbound Flow
1. WEB-006 (Wave Planner) → WEB-007 (Pick Monitor) → WEB-008 (Packing) → WEB-009 (Dispatch)
2. MOB-008 (Pick Task List) → MOB-009 (Pick Execution) → MOB-011 (Pack Handoff) → MOB-012 (Dispatch Scan)

#### Cycle Count Flow
1. WEB-018 (Count Planning) → MOB-016 (Count Task List) → MOB-017 (Count Entry) → MOB-018 (Recount) → WEB-019 (Reconciliation)

#### Exception Handling
1. WEB-026 or MOB-023 (Exception Center) → Relevant detail screen → WEB-025 (Approval if needed)

---

## Deep Link Support

### Mobile App Deep Links
The mobile app supports deep linking using the `venti://` URL scheme for:
- Push notification navigation
- Email/SMS alert links
- Inter-app navigation
- QR code scanning

Example: `venti://pick/12345` opens pick task with ID 12345

### Web Deep Links
Web URLs support:
- Entity-specific links (`:grnId`, `:taskId`, `:shipmentId`, etc.)
- Filter preservation via query parameters
- Tab/modal state in hash fragments
- Workspace context always in path

Example: `/workspace/wh-001/inbound/grn/GRN-2026-05-001?tab=lines#line-5`

---

## Notes
- All routes respect workspace context and user permissions
- Invalid routes redirect to appropriate error page or default dashboard
- Session expiration triggers AUTH-006 modal overlay before redirecting to AUTH-001
- Mobile app routes support offline access with sync queue (MOB-024)
- Admin routes require specific role permissions (🔐)
- Analytics routes may have additional role/module-based access restrictions
