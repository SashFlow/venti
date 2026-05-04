# Designer Screen Specification - 03 Web Operations and Management Screens

Scope: operations supervisor, inventory controller, planner, finance analyst, operations manager.

## Web Operations Screen Catalog
- WEB-001 Global Control Tower Dashboard
- WEB-002 Task Orchestration Board
- WEB-003 Inbound Workbench
- WEB-004 GRN Detail and Line Validation
- WEB-005 Putaway Monitor
- WEB-006 Outbound Wave Planner
- WEB-007 Pick Performance Monitor
- WEB-008 Packing Station Workbench
- WEB-009 Dispatch Console
- WEB-010 Shipment Detail and Tracking
- WEB-011 Inventory Explorer
- WEB-012 Location Utilization Map
- WEB-013 Stock State Management
- WEB-014 Transfer Order List
- WEB-015 Transfer Order Detail
- WEB-016 Replenishment Recommendations
- WEB-017 PO and Replenishment Link View
- WEB-018 Cycle Count Planning Board
- WEB-019 Cycle Count Reconciliation Desk
- WEB-020 QC Operations Queue
- WEB-021 QC Inspection Detail
- WEB-022 Returns Operations Workbench
- WEB-023 Dead Stock Analyzer
- WEB-024 Clearance and Write-Off Console
- WEB-025 Approval Inbox
- WEB-026 Exception Command Center

## WEB-001 Global Control Tower Dashboard
- Personas: Operations Manager, Supervisor
- Primary actions:
1. Switch warehouse scope.
2. Apply date and shift filters.
3. Drill into exceptions.
- Data to show:
1. Inbound/outbound throughput.
2. Open tasks by status.
3. SLA breaches and risk forecast.
4. OTIF and fulfillment rate trend.

## WEB-002 Task Orchestration Board
- Primary actions:
1. Assign/reassign tasks.
2. Bulk change priority.
3. Pause or unblock tasks.
- Data to show:
1. Task cards by stage.
2. Owner, start time, SLA timer.
3. Dependency blockers.

## WEB-003 Inbound Workbench
- Primary actions:
1. Create GRN from ASN/PO.
2. Start receiving session.
3. Route lines to QC.
- Data to show:
1. Expected arrivals and dock assignments.
2. Supplier performance indicators.
3. Receiving backlog.

## WEB-004 GRN Detail and Line Validation
- Primary actions:
1. Validate lines in bulk.
2. Apply serial/lot edits.
3. Approve over/short exception.
- Data to show:
1. PO line vs received quantities.
2. Variances by SKU.
3. Audit trail of line edits.

## WEB-005 Putaway Monitor
- Primary actions:
1. View pending putaway queue.
2. Recompute bin suggestions.
3. Reassign tasks by zone.
- Data to show:
1. Suggested location confidence.
2. Capacity utilization heat.
3. Average putaway time.

## WEB-006 Outbound Wave Planner
- Primary actions:
1. Create wave by rules.
2. Simulate wave impact.
3. Release/cancel wave.
- Data to show:
1. Candidate orders by cutoff.
2. Picker availability.
3. Estimated completion time.

## WEB-007 Pick Performance Monitor
- Primary actions:
1. Track active waves.
2. Compare picker productivity.
3. Trigger help for lagging tasks.
- Data to show:
1. Picks per hour.
2. Short-pick frequency.
3. Path efficiency score.

## WEB-008 Packing Station Workbench
- Primary actions:
1. Open tote/order.
2. Confirm items packed.
3. Print shipment label.
4. Record dimensional weight.
- Data to show:
1. Order lines and picked status.
2. Carton recommendation.
3. Label print status.

## WEB-009 Dispatch Console
- Primary actions:
1. Allocate shipments to vehicle.
2. Confirm load sequence.
3. Mark dispatch complete.
- Data to show:
1. Vehicle capacity usage.
2. Driver assignment.
3. Dispatch delays and reasons.

## WEB-010 Shipment Detail and Tracking
- Primary actions:
1. View shipment lifecycle.
2. Add dispatch notes.
3. Trigger customer notification.
- Data to show:
1. Timeline of shipment events.
2. Linked order list.
3. Delivery ETA and status.

## WEB-011 Inventory Explorer
- Primary actions:
1. Search SKU/location/lot/serial.
2. Apply stock state filters.
3. Export filtered inventory snapshot.
- Data to show:
1. On-hand, available, reserved.
2. Age buckets and expiry risk.
3. Recent movement summary.

## WEB-012 Location Utilization Map
- Primary actions:
1. View capacity heatmap.
2. Filter by zone class.
3. Open bin details.
- Data to show:
1. Occupancy percent by location.
2. Constraint violations.
3. Fast/slow movement alignment.

## WEB-013 Stock State Management
- Primary actions:
1. Move stock between states.
2. Apply hold/release in bulk.
3. Add compliance note.
- Data to show:
1. Current state quantities.
2. Reason history.
3. User and timestamp audit.

## WEB-014 Transfer Order List
- Primary actions:
1. Create transfer order.
2. Approve/reject pending transfer.
3. Track open in-transit records.
- Data to show:
1. Source and destination.
2. Status and age.
3. Partial completion indicator.

## WEB-015 Transfer Order Detail
- Primary actions:
1. Edit transfer lines.
2. Confirm dispatch/receipt milestones.
3. Raise discrepancy case.
- Data to show:
1. Planned vs moved vs received.
2. Transit timeline.
3. Exception logs.

## WEB-016 Replenishment Recommendations
- Personas: Planner, Inventory Controller
- Primary actions:
1. Review suggested buys/transfers.
2. Adjust proposal quantities.
3. Approve and create document.
- Data to show:
1. Forecast demand window.
2. Safety stock and lead time.
3. Stockout risk date.

## WEB-017 PO and Replenishment Link View
- Primary actions:
1. Open linked PO.
2. Compare recommendation vs actual.
3. Mark reason for deviation.
- Data to show:
1. Recommendation source data.
2. PO approval and ETA.
3. Fill-rate impact estimate.

## WEB-018 Cycle Count Planning Board
- Primary actions:
1. Generate count plan.
2. Assign counters.
3. Freeze bins by window.
- Data to show:
1. ABC class coverage.
2. Planned vs completed counts.
3. Pending recount volume.

## WEB-019 Cycle Count Reconciliation Desk
- Primary actions:
1. Review variances.
2. Approve/reject adjustments.
3. Trigger investigation.
- Data to show:
1. Book vs count vs recount.
2. Variance value and threshold.
3. Adjustment reason and approver.

## WEB-020 QC Operations Queue
- Primary actions:
1. Prioritize inspections.
2. Assign inspector.
3. Escalate aged QC cases.
- Data to show:
1. Item type and priority.
2. Time in QC hold.
3. Sample requirement.

## WEB-021 QC Inspection Detail
- Primary actions:
1. Complete checklist.
2. Upload evidence.
3. Set disposition.
- Data to show:
1. Template sections and pass/fail.
2. Defect taxonomy.
3. Disposition impact preview.

## WEB-022 Returns Operations Workbench
- Primary actions:
1. Create return intake batch.
2. Link SRN and receipt.
3. Route to QC or disposition.
- Data to show:
1. Return category and cause.
2. Item condition summary.
3. Credit-note eligibility.

## WEB-023 Dead Stock Analyzer
- Primary actions:
1. Filter by aging bands.
2. Segment by warehouse/category.
3. Recommend disposition.
- Data to show:
1. Non-moving value.
2. Days since last movement.
3. Carrying cost estimate.

## WEB-024 Clearance and Write-Off Console
- Personas: Operations Manager, Finance
- Primary actions:
1. Approve liquidation/write-off.
2. Batch update disposition.
3. Export accounting entries.
- Data to show:
1. Gross value, recoverable value.
2. Approval policy checks.
3. Posted accounting status.

## WEB-025 Approval Inbox
- Primary actions:
1. Review request context.
2. Approve/reject/delegate.
3. Add mandatory comments.
- Data to show:
1. Request type and risk score.
2. Financial/operational impact.
3. SLA deadline and escalation path.

## WEB-026 Exception Command Center
- Primary actions:
1. Triage by severity.
2. Assign owner.
3. Track corrective actions.
- Data to show:
1. Exception source trends.
2. Open vs resolved aging.
3. Repeat issue indicators.
