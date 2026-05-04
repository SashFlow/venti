# Designer Screen Specification - 02 Mobile Warehouse App Screens

Scope: floor operations app for operators, QC inspectors, and technicians.

## Mobile Screen Catalog
- MOB-001 Login and Site Selection
- MOB-002 Shift Start and Device Health
- MOB-003 Home Task Queue
- MOB-004 Inbound Task List
- MOB-005 Inbound Scan and Validate
- MOB-006 QC Routing Decision Prompt
- MOB-007 Putaway Suggestion and Confirm
- MOB-008 Pick Task List
- MOB-009 Pick Execution by Scan
- MOB-010 Short Pick Exception
- MOB-011 Pack Handoff Confirmation
- MOB-012 Dispatch Scan Confirmation
- MOB-013 Bin-to-Bin Transfer Execute
- MOB-014 Inter-Warehouse Transfer Pick
- MOB-015 Inter-Warehouse Transfer Receive
- MOB-016 Cycle Count Task List
- MOB-017 Cycle Count Entry
- MOB-018 Recount and Variance Note
- MOB-019 Returns Intake
- MOB-020 Return Inspection Capture
- MOB-021 Technician Stock Consume
- MOB-022 Alerts and Notifications
- MOB-023 Exception Inbox
- MOB-024 Offline Queue and Sync
- MOB-025 Profile and Scanner Settings

## MOB-001 Login and Site Selection
- Personas: all mobile users
- Primary actions:
1. Sign in.
2. Select warehouse/site.
3. Select role context if multiple roles exist.
- Data to show:
1. User name and role badges.
2. Available sites with timezone and shift code.
3. Last login and device trust state.
- States: invalid credentials, locked account, no assigned site.

## MOB-002 Shift Start and Device Health
- Personas: Floor Operator, QC Inspector
- Primary actions:
1. Start shift.
2. Run scanner test.
3. Run printer label test (if paired).
4. Confirm safety checklist.
- Data to show:
1. Device battery and network strength.
2. Scanner connection state.
3. Open critical alerts.
- States: hardware unavailable, low battery warning.

## MOB-003 Home Task Queue
- Personas: Floor Operator, Technician
- Primary actions:
1. Start next recommended task.
2. Filter by task type.
3. Claim/unclaim task.
4. Pause/resume task.
- Data to show:
1. Task type, priority, SLA timer.
2. Source and destination locations.
3. Quantity progress.
4. Exception badge count.
- States: no tasks, high-priority interrupt, stale task claim.

## MOB-004 Inbound Task List
- Primary actions:
1. Search shipment/PO.
2. Open task details.
3. Start receiving session.
- Data to show:
1. GRN reference, supplier, dock, ETA.
2. Pending lines and completion percent.
3. QC-required flag.

## MOB-005 Inbound Scan and Validate
- Primary actions:
1. Scan shipment, SKU, serial/lot.
2. Enter received quantity.
3. Mark damaged units.
4. Save line and continue.
- Data to show:
1. Expected vs received quantity.
2. SKU image, name, attributes.
3. Expiry/manufacturing date fields where applicable.
4. Real-time validation result.
- States: unknown barcode, duplicate serial, over-receipt policy block.

## MOB-006 QC Routing Decision Prompt
- Primary actions:
1. Send to QC hold.
2. Bypass QC if rule allows with override reason.
- Data to show:
1. Rule trigger reason.
2. Required sampling quantity.
3. Policy reference and override eligibility.

## MOB-007 Putaway Suggestion and Confirm
- Primary actions:
1. Accept suggested bin.
2. Request alternative bin.
3. Scan destination and confirm.
- Data to show:
1. Suggested location with distance and occupancy.
2. Capacity check (weight/volume).
3. Restriction warnings (QC/scrap/returns zones).
- States: bin full, bin blocked, wrong-zone scan.

## MOB-008 Pick Task List
- Primary actions:
1. Start assigned wave.
2. Re-sequence picks by optimized path.
3. Request reassignment.
- Data to show:
1. Wave ID, cutoff time.
2. Total lines, picks completed, remaining.
3. Multi-order batch grouping.

## MOB-009 Pick Execution by Scan
- Primary actions:
1. Scan bin then SKU.
2. Confirm picked quantity.
3. Substitute SKU (if allowed).
4. Complete line.
- Data to show:
1. Required qty, picked qty, short qty.
2. FIFO/FEFO pick recommendation.
3. Substitute compatibility list.
- States: wrong bin, expired lot selected, insufficient stock.

## MOB-010 Short Pick Exception
- Primary actions:
1. Record short reason.
2. Accept alternate location suggestion.
3. Escalate to supervisor.
- Data to show:
1. Short quantity and impact on orders.
2. Alternate bins and travel estimate.
3. SLA risk indicator.

## MOB-011 Pack Handoff Confirmation
- Primary actions:
1. Confirm tote/carton handoff.
2. Print pack label request.
3. Flag packaging issue.
- Data to show:
1. Order references included in tote.
2. Weight and carton recommendation.
3. Destination and carrier cutoff.

## MOB-012 Dispatch Scan Confirmation
- Primary actions:
1. Scan shipment labels.
2. Assign loading sequence.
3. Confirm loaded to vehicle.
- Data to show:
1. Vehicle and driver.
2. Route code and planned departure.
3. Loaded count vs planned count.

## MOB-013 Bin-to-Bin Transfer Execute
- Primary actions:
1. Scan source bin and SKU.
2. Enter quantity to move.
3. Scan destination bin.
4. Confirm transfer.
- Data to show:
1. Source availability.
2. Destination capacity.
3. Reason code options.

## MOB-014 Inter-Warehouse Transfer Pick
- Primary actions:
1. Pick transfer lines.
2. Stage at dispatch lane.
3. Confirm dispatch.
- Data to show:
1. Transfer order details.
2. Source and destination warehouses.
3. Partial dispatch rules.

## MOB-015 Inter-Warehouse Transfer Receive
- Primary actions:
1. Scan transfer manifest.
2. Verify received quantities.
3. Mark discrepancies.
4. Confirm receipt.
- Data to show:
1. In-transit vs received quantities.
2. Damaged/missing flags.
3. Auto-create discrepancy case ID.

## MOB-016 Cycle Count Task List
- Primary actions:
1. Start assigned count route.
2. View frozen bins only toggle.
3. Skip with reason.
- Data to show:
1. Count class (ABC/random/zone).
2. Bin sequence and pending count.
3. Recount required badge.

## MOB-017 Cycle Count Entry
- Primary actions:
1. Scan bin and SKU.
2. Enter counted qty.
3. Add note/photo for anomalies.
- Data to show:
1. Book qty (masked/unmasked per policy).
2. Variance indicator.
3. Last count timestamp.

## MOB-018 Recount and Variance Note
- Primary actions:
1. Perform recount.
2. Submit discrepancy reason.
3. Request supervisor review.
- Data to show:
1. First count vs recount.
2. Variance value estimate.
3. Approval threshold guidance.

## MOB-019 Returns Intake
- Primary actions:
1. Scan return reference.
2. Select return category.
3. Receive into return area.
- Data to show:
1. Customer/order details.
2. Claimed reason.
3. Serialization expectations.

## MOB-020 Return Inspection Capture
- Primary actions:
1. Open inspection template.
2. Capture photos/notes.
3. Select disposition recommendation.
- Data to show:
1. Pass/fail checkpoints.
2. Warranty eligibility.
3. Proposed path: restock/refurbish/scrap/RTV.

## MOB-021 Technician Stock Consume
- Personas: Service Technician
- Primary actions:
1. Scan part and service ticket.
2. Enter consumed quantity.
3. Trigger replenishment request.
- Data to show:
1. Technician min/max and on-hand.
2. Suggested replenishment quantity.
3. Part compatibility warnings.

## MOB-022 Alerts and Notifications
- Primary actions:
1. Filter alerts by severity.
2. Acknowledge alert.
3. Jump to linked task.
- Data to show:
1. Alert type, source, created time.
2. Due by time and escalation state.

## MOB-023 Exception Inbox
- Primary actions:
1. Claim exception.
2. Add root cause.
3. Resolve or escalate.
- Data to show:
1. Exception code and impacted document.
2. Current owner and SLA clock.
3. Suggested resolution playbook.

## MOB-024 Offline Queue and Sync
- Primary actions:
1. Review queued actions.
2. Retry failed sync records.
3. Resolve sync conflicts.
- Data to show:
1. Queue size and oldest pending age.
2. Per-item sync result.
3. Conflict details for user choice.

## MOB-025 Profile and Scanner Settings
- Primary actions:
1. Switch language.
2. Configure scan mode.
3. Pair/unpair devices.
4. Sign out.
- Data to show:
1. User role and permissions summary.
2. Device firmware and app version.
3. Diagnostics export option.
