# ANL-010: Return and QC Analysis Dashboard - Component Specification

## Screen Reference
- **ID**: ANL-010 | **Name**: Return and QC Analysis Dashboard
- **Base Spec**: `../../analytics-screen-specs/ANL-010 Return and QC Analysis Dashboard.md`
- **Route**: `/analytics/returns-qc`

## Component Inventory
**Primary**: 1. Return Rate KPI, 2. Return Reasons Chart, 3. QC Fail Rate
**Secondary**: 4. Top Returned SKUs, 5. Defect Categories, 6. Cost Impact
**Modals**: Return Detail, QC Analysis

## Data Schema
| Field | Type | Validation |
|-------|------|------------|
| returnRate | number | Percentage |
| returnReason | enum | Predefined reasons |
| skuCode | string | Returned SKU |
| returnQty | number | Units returned |
| qcFailRate | number | QC failure % |
| defectCategory | string | Defect type |

## Layout
**Pattern**: KPI cards + reason breakdown + table
**Header**: Return rate + QC fail rate KPIs
**Charts**: Return reasons pie + defect Pareto
**Table**: Top returned SKUs

## Key Components
- **Return Rate KPI**: % of shipments returned with trend
- **QC Fail Rate KPI**: % of receipts failing QC with trend
- **Return Reasons**: Pie chart (Damaged, Wrong Item, Defective, Customer Change)
- **Top Returned SKUs**: Table (SKU, Return Qty, Return Rate, Top Reason)
- **Defect Categories**: Pareto chart of QC defect types
- **Cost Impact**: Total cost of returns (shipping + restocking + waste)
- **Supplier Analysis**: Return/defect rate by supplier (identifies quality issues)
- **Trend Chart**: Return and QC fail rates over time
- **Export**: Detailed return/QC report

## Analytics-Specific
- **Root Cause**: Identify why returns/defects occur
- **Supplier Accountability**: Track quality by supplier
- **Cost Quantification**: Financial impact of quality issues
