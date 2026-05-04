# ANL-007: Stock Aging Dashboard - Component Specification

## Screen Reference
- **ID**: ANL-007 | **Name**: Stock Aging Dashboard
- **Base Spec**: `../../analytics-screen-specs/ANL-007 Stock Aging Dashboard.md`
- **Route**: `/analytics/stock-aging`

## Component Inventory
**Primary**: 1. Aging Buckets Chart, 2. Aging Distribution Table, 3. Category Analysis
**Secondary**: 4. Slow-Moving SKUs, 5. Aging Trend, 6. Action Recommendations
**Modals**: SKU Detail, Aging Analysis

## Data Schema
| Field | Type | Validation |
|-------|------|------------|
| agingBucket | enum | '0-30d','31-60d','61-90d','90d+' |
| quantity | number | Units in bucket |
| value | number | Currency value |
| skuCount | number | # of SKUs |
| category | string | SKU category |

## Layout
**Pattern**: Stacked chart + bucket table + recommendations
**Chart**: Stacked bar showing aging buckets
**Table**: SKU-level aging details
**Panel**: Right side with action recommendations

## Key Components
- **Aging Buckets Chart**: Stacked bar (0-30d green, 31-60d yellow, 61-90d orange, 90d+ red)
- **Distribution Table**: Columns (Aging Bucket, Qty, Value, % of Total)
- **Category Breakdown**: Aging distribution per category
- **Slow-Moving SKUs**: Table of SKUs with oldest inventory (SKU, Days in Stock, Qty, Value)
- **Aging Trend**: Line chart showing aging over time (is old stock growing?)
- **Action Recommendations**: Panel with suggested actions (Clearance Sale, Transfer, Write-Off)
- **Warehouse Filter**: Select warehouse for aging analysis
- **Export**: Aging report with all SKUs and dates

## Analytics-Specific
- **Bucket Visualization**: Clear aging segments
- **Actionable Insights**: Recommendations based on aging
- **Trend Monitoring**: Track if aging problem is worsening
