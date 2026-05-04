# WEB-023: Dead Stock Analyzer - Component Specification

## Screen Reference
- **ID**: WEB-023 | **Name**: Dead Stock Analyzer
- **Base Spec**: `../../web-screen-specs/WEB-023 Dead Stock Analyzer.md`
- **Route**: `/workspace/:workspaceId/inventory/dead-stock`

## Component Inventory
**Primary**: 1. Aging Band Filters, 2. Category/Warehouse Segmentation, 3. Disposition Recommender
**Secondary**: 4. Non-Moving Value, 5. Days Since Movement, 6. Carrying Cost Estimates
**Modals**: Disposition Recommendation Dialog, Bulk Disposition Editor

## Data Schema
| Field | Type |
|-------|------|
| sku | string |
| category | string |
| warehouse | string |
| qty | number |
| value | number |
| daysSinceMovement | number |
| carryingCost | number |
| recommendedDisposition | enum |

## Layout
**Pattern**: Table with segmentation filters
**Table**: 70px rows, financial metrics
**Filters**: Left panel with aging bands

## Key Components
- **Aging Band Filter**: Buttons for age ranges (90-180d, 180-365d, >365d, >2yr)
- **Dead Stock Table**: Columns: SKU, Description, Category, Warehouse, Qty, Value, Days No Movement, Carrying Cost/Month, Recommendation
- **Category Segmentation**: Group by product category
- **Warehouse Segmentation**: Group by warehouse location
- **Days Since Movement**: Shows days with no sales/transfers
- **Non-Moving Value**: Total inventory value locked in dead stock
- **Carrying Cost**: Monthly storage cost estimate
- **Disposition Recommender**: Suggests action (Liquidate, Transfer, Write-Off, Promotional Sale) based on age/value
- **Bulk Disposition**: Multi-select for batch disposition assignment
- **Export**: CSV of dead stock report

## Web-Specific
- **Financial Analytics**: Value-based segmentation and cost tracking
- **Bulk Disposition**: Batch assignment for efficient processing
- **Aging Visualization**: Charts showing aging distribution
