# Designer Screen Specification - 04 Admin IAM Configuration Integration Screens

Scope: system admin, IAM admin, integration admin.

## Admin and Integration Screen Catalog
- ADM-001 Tenant and Warehouse Setup
- ADM-002 Zone Shelf Bin Designer
- ADM-003 Capacity and Restriction Rules
- ADM-004 SKU and Catalog Admin
- ADM-005 UOM and Conversion Admin
- ADM-006 Barcode and Label Template Manager
- ADM-007 Device Registration and Health
- ADM-008 Workflow Configuration
- ADM-009 Approval Matrix Configuration
- ADM-010 Role and Permission Manager
- ADM-011 User and Team Administration
- ADM-012 Notification Rule Builder
- ADM-013 Alert Channel Configuration
- ADM-014 Integration Connector Registry
- ADM-015 SAP Mapping Studio
- ADM-016 Integration Queue Monitor
- ADM-017 Dead-Letter Replay Console
- ADM-018 API Key and Webhook Management
- ADM-019 Audit Log Explorer
- ADM-020 Data Import and Bulk Action Center

## ADM-001 Tenant and Warehouse Setup
- Primary actions:
1. Create/edit warehouse master.
2. Set operating calendar and shifts.
3. Configure timezone and localization.
- Data to show:
1. Warehouse code and type.
2. Address and geofence.
3. Active status and ownership.

## ADM-002 Zone Shelf Bin Designer
- Primary actions:
1. Create hierarchy nodes.
2. Bulk import location tree.
3. Set zone classes (fast/slow/QC/scrap).
- Data to show:
1. Hierarchy tree visualization.
2. Node capacities and occupancy.
3. Validation errors on structure.

## ADM-003 Capacity and Restriction Rules
- Primary actions:
1. Create capacity rule.
2. Add incompatible stock constraints.
3. Set overflow behavior.
- Data to show:
1. Rule conditions and priority.
2. Affected locations count.
3. Last rule evaluation result.

## ADM-004 SKU and Catalog Admin
- Primary actions:
1. Create SKU and variants.
2. Define substitute mapping.
3. Configure compliance attributes.
- Data to show:
1. SKU lifecycle status.
2. Attribute sets.
3. Serialization and expiry flags.

## ADM-005 UOM and Conversion Admin
- Primary actions:
1. Define UOM hierarchy.
2. Set conversion factors.
3. Set precision and rounding rules.
- Data to show:
1. Base UOM and alternate UOMs.
2. Effective dates.
3. Validation and conflict logs.

## ADM-006 Barcode and Label Template Manager
- Primary actions:
1. Configure barcode symbology.
2. Build label template.
3. Print test label.
- Data to show:
1. Template preview.
2. Data field bindings.
3. Printer compatibility notes.

## ADM-007 Device Registration and Health
- Primary actions:
1. Register scanner/printer/mobile.
2. Assign device to user/zone.
3. Run diagnostics.
- Data to show:
1. Device type and firmware.
2. Last heartbeat and battery.
3. Error logs.

## ADM-008 Workflow Configuration
- Primary actions:
1. Select 1-step/2-step/3-step flows.
2. Configure branching conditions.
3. Publish workflow version.
- Data to show:
1. Workflow graph.
2. Version history.
3. Impacted modules list.

## ADM-009 Approval Matrix Configuration
- Primary actions:
1. Define threshold rules.
2. Map approver roles.
3. Configure delegation and SLA.
- Data to show:
1. Rule matrix by action type.
2. Escalation path.
3. Test simulation output.

## ADM-010 Role and Permission Manager
- Primary actions:
1. Create role profiles.
2. Assign module permissions.
3. Restrict by warehouse scope.
- Data to show:
1. Permission grid.
2. Role inheritance view.
3. Conflicting policy warnings.

## ADM-011 User and Team Administration
- Primary actions:
1. Invite user.
2. Assign role and team.
3. Suspend/reactivate account.
- Data to show:
1. User status and MFA state.
2. Assigned warehouses.
3. Last activity.

## ADM-012 Notification Rule Builder
- Primary actions:
1. Define event trigger.
2. Set severity and recipients.
3. Enable suppression windows.
- Data to show:
1. Rule conditions.
2. Channel targets.
3. Last fired timestamp.

## ADM-013 Alert Channel Configuration
- Primary actions:
1. Configure in-app/email/webhook.
2. Test channel.
3. Set retry policy.
- Data to show:
1. Channel credentials status.
2. Delivery success metrics.
3. Failed delivery logs.

## ADM-014 Integration Connector Registry
- Primary actions:
1. Add connector.
2. Configure endpoints and auth.
3. Enable/disable connector.
- Data to show:
1. Connector health.
2. Version and compatibility.
3. Throughput and error rate.

## ADM-015 SAP Mapping Studio
- Primary actions:
1. Map fields source to target.
2. Add transformation rules.
3. Validate sample payload.
- Data to show:
1. Source schema and target schema.
2. Mapping coverage percent.
3. Validation errors with line-level context.

## ADM-016 Integration Queue Monitor
- Primary actions:
1. Filter events by status.
2. Retry single or bulk.
3. Pause/resume queue.
- Data to show:
1. Queue depth and lag.
2. Event type distribution.
3. Last successful sync timestamp.

## ADM-017 Dead-Letter Replay Console
- Primary actions:
1. Inspect failed event payload.
2. Edit replay metadata.
3. Replay to connector.
- Data to show:
1. Failure reason stack.
2. Number of retry attempts.
3. Linked business document.

## ADM-018 API Key and Webhook Management
- Primary actions:
1. Generate/revoke API key.
2. Create webhook endpoint.
3. Rotate secrets.
- Data to show:
1. Key scopes and last used.
2. Webhook delivery logs.
3. Signature validation status.

## ADM-019 Audit Log Explorer
- Primary actions:
1. Search by user/entity/action.
2. Compare before/after values.
3. Export audit report.
- Data to show:
1. Actor, action, timestamp.
2. Entity and field diffs.
3. Source channel (web/mobile/api).

## ADM-020 Data Import and Bulk Action Center
- Primary actions:
1. Upload template file.
2. Validate and preview changes.
3. Commit import or rollback.
- Data to show:
1. Row-level validation errors.
2. Success/failure counts.
3. Audit reference for import job.
