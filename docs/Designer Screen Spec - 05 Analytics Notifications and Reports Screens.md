# Designer Screen Specification - 05 Analytics Notifications and Reports Screens

Scope: operations manager, finance analyst, planner, supervisors.

## Analytics and Reporting Screen Catalog
- ANL-001 Operational KPI Dashboard
- ANL-002 Inbound vs Outbound Trend Analysis
- ANL-003 Order Fulfillment and OTIF Dashboard
- ANL-004 Pick Pack Productivity Dashboard
- ANL-005 Inventory Valuation Dashboard
- ANL-006 Cost Breakdown and Landed Cost View
- ANL-007 Stock Aging Dashboard
- ANL-008 Dead Stock Insights Dashboard
- ANL-009 Demand Trend and Forecast Monitor
- ANL-010 Return and QC Analysis Dashboard
- ANL-011 Alert Center
- ANL-012 Notification Delivery Analytics
- ANL-013 Report Builder
- ANL-014 Scheduled Reports Manager
- ANL-015 Export and Data Extract Center

## ANL-001 Operational KPI Dashboard
- Primary actions:
1. Select warehouse and time range.
2. Compare current vs previous period.
3. Drill into KPI drivers.
- Data to show:
1. Throughput, cycle times, backlog.
2. SLA adherence.
3. Exception volume.

## ANL-002 Inbound vs Outbound Trend Analysis
- Primary actions:
1. Filter by warehouse, product family, shift.
2. Toggle volume vs value.
3. Export trend chart.
- Data to show:
1. Daily/weekly inbound and outbound quantities.
2. Net movement and imbalance trend.
3. Peak load periods.

## ANL-003 Order Fulfillment and OTIF Dashboard
- Primary actions:
1. Segment by channel/customer.
2. View late-order cohorts.
3. Open delayed shipment details.
- Data to show:
1. Fulfillment rate.
2. OTIF percentage.
3. Delay reasons distribution.

## ANL-004 Pick Pack Productivity Dashboard
- Primary actions:
1. Compare performance by team/user.
2. View heatmap by zone/time.
3. Set target benchmarks.
- Data to show:
1. Picks per hour.
2. Pack accuracy.
3. Rework and short-pick trend.

## ANL-005 Inventory Valuation Dashboard
- Primary actions:
1. Switch costing method view (FIFO/weighted avg).
2. Filter by warehouse/category.
3. Export valuation snapshot.
- Data to show:
1. Total inventory value.
2. Value by state and age.
3. Variance vs prior period.

## ANL-006 Cost Breakdown and Landed Cost View
- Primary actions:
1. Expand landed cost components.
2. Compare supplier lanes.
3. Flag abnormal cost spikes.
- Data to show:
1. Base cost, freight, insurance, customs.
2. Cost per unit trend.
3. Margin impact estimate.

## ANL-007 Stock Aging Dashboard
- Primary actions:
1. Filter age buckets.
2. Focus FEFO-risk SKUs.
3. Trigger replenishment or clearance action.
- Data to show:
1. Quantity and value by age band.
2. Expiry risk horizon.
3. Movement recency.

## ANL-008 Dead Stock Insights Dashboard
- Primary actions:
1. Identify non-moving SKUs.
2. Simulate clearance options.
3. Create write-off proposal.
- Data to show:
1. Non-moving duration.
2. Carrying cost burden.
3. Recovery potential by strategy.

## ANL-009 Demand Trend and Forecast Monitor
- Primary actions:
1. Compare forecast vs actual.
2. Highlight anomaly windows.
3. Adjust planning assumptions.
- Data to show:
1. Demand by period and SKU group.
2. Forecast error metrics.
3. Lead-time risk overlays.

## ANL-010 Return and QC Analysis Dashboard
- Primary actions:
1. Segment by return category.
2. Drill into defect root causes.
3. Track QC turnaround.
- Data to show:
1. Return rate and reasons.
2. QC pass/fail mix.
3. Disposition outcomes.

## ANL-011 Alert Center
- Primary actions:
1. View all active alerts.
2. Acknowledge and assign owner.
3. Configure escalation path.
- Data to show:
1. Severity and source.
2. Aging and SLA.
3. Related entity links.

## ANL-012 Notification Delivery Analytics
- Primary actions:
1. Compare channel performance.
2. Retry failed notifications.
3. Export delivery audit.
- Data to show:
1. Sent, delivered, failed counts.
2. Latency percentiles.
3. Failure reasons by channel.

## ANL-013 Report Builder
- Primary actions:
1. Select data subject and fields.
2. Add filters/grouping.
3. Save reusable report template.
- Data to show:
1. Dataset schema.
2. Query preview row count.
3. Generated SQL-like explanation (read-only).

## ANL-014 Scheduled Reports Manager
- Primary actions:
1. Configure report schedule.
2. Select recipients and format.
3. Pause or resume schedules.
- Data to show:
1. Last run status.
2. Next run time.
3. Delivery outcomes.

## ANL-015 Export and Data Extract Center
- Primary actions:
1. Request data export.
2. Track extract job progress.
3. Download completed files.
- Data to show:
1. Job ID, requester, size.
2. Security classification and retention.
3. Expiry countdown for download.

## Shared Chart and Table Requirements
- Every chart needs absolute values plus percentage context.
- Every table supports filter, sort, pagination, export.
- Support saved views for role-specific recurring analysis.
- Include data freshness timestamp and source attribution.

## Designer Notes for Analytics
- Use clear hierarchy for KPI cards vs trend detail.
- Default chart ranges should match operational cadence (today, 7d, 30d).
- Ensure print-friendly layouts for executive sharing.
