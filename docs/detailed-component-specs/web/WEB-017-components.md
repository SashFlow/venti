# WEB-017: PO and Replenishment Link View - Component Specification

## Screen Reference
- **ID**: WEB-017 | **Name**: PO and Replenishment Link View
- **Base Spec**: `../../web-screen-specs/WEB-017 PO and Replenishment Link View.md`
- **Route**: `/workspace/:workspaceId/replenishment/po-link`

## Component Inventory
**Primary**: 1. Recommendation vs PO Comparison Table, 2. Deviation Reason Form
**Secondary**: 3. Fill-Rate Impact Estimate, 4. Recommendation Source Data
**Modals**: Deviation Reason Dialog, Impact Analysis Modal

## Data Schema
| Field | Type |
|-------|------|
| sku | string |
| recommendedQty | number |
| poQty | number |
| deviation | number |
| deviationReason | string |
| fillRateImpact | number |

## Layout
**Pattern**: Comparison table
**Table**: 70px rows, comparison columns
**Deviation**: Inline reason entry

## Key Components
- **Comparison Table**: Columns: SKU, Recommended Qty, PO Qty, Deviation, Deviation %, Reason, Fill-Rate Impact
- **Deviation Column**: Highlights differences (red >20%, yellow 10-20%, green <10%)
- **Deviation Reason**: Dropdown (Price Negotiation, MOQ Constraint, Budget Limit, Other) + text
- **Fill-Rate Impact**: Shows projected fill-rate if deviation maintained
- **Recommendation Source**: Tooltip shows demand forecast, safety stock calc
- **Impact Analysis**: Button opens modal with detailed impact simulation
- **Filter**: Show only deviations >X%

## Web-Specific
- **Side-by-Side Comparison**: Recommendation vs actual PO
- **Impact Estimation**: Projected fill-rate calculation
- **Deviation Tracking**: Audit trail of manual overrides
