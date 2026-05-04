# ANL-009: Demand Trend and Forecast Monitor - Component Specification

## Screen Reference
- **ID**: ANL-009 | **Name**: Demand Trend and Forecast Monitor
- **Base Spec**: `../../analytics-screen-specs/ANL-009 Demand Trend and Forecast Monitor.md`
- **Route**: `/analytics/demand-forecast`

## Component Inventory
**Primary**: 1. Forecast vs Actual Chart, 2. Demand Trend Line, 3. Forecast Accuracy KPI
**Secondary**: 4. Seasonality Pattern, 5. SKU Forecast Table, 6. Confidence Intervals
**Modals**: Forecast Detail, Model Parameters

## Data Schema
| Field | Type | Validation |
|-------|------|------------|
| sku | string | SKU code |
| period | date | Forecast period |
| forecastQty | number | Predicted demand |
| actualQty | number | Actual demand |
| accuracy | number | Forecast accuracy % |
| confidenceInterval | object | Low/high bounds |

## Layout
**Pattern**: Chart + accuracy metrics + table
**Chart**: Forecast vs actual line chart
**Metrics**: Accuracy KPIs
**Table**: SKU-level forecast details

## Key Components
- **Forecast vs Actual**: Dual-line chart (forecast dotted, actual solid) with confidence band
- **Forecast Accuracy**: KPI showing % accuracy (MAE, MAPE metrics)
- **Demand Trend**: Historical demand line chart
- **Seasonality Pattern**: Chart showing recurring seasonal patterns
- **SKU Forecast Table**: Columns (SKU, Period, Forecast, Actual, Variance, Accuracy)
- **Confidence Intervals**: Shaded band showing forecast uncertainty
- **Horizon Selector**: Choose forecast horizon (1 week, 1 month, 3 months)
- **Category Filter**: Filter by SKU category
- **Accuracy Trend**: Track forecast accuracy improvement over time
- **Export**: Forecast data for planning systems

## Analytics-Specific
- **Forecast Visualization**: Compare predicted vs actual
- **Confidence Intervals**: Show forecast uncertainty
- **Accuracy Tracking**: Monitor model performance
