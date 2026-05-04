# ANL-004: Pick Pack Productivity Dashboard - Component Specification

## Screen Reference
- **ID**: ANL-004 | **Name**: Pick Pack Productivity Dashboard
- **Base Spec**: `../../analytics-screen-specs/ANL-004 Pick Pack Productivity Dashboard.md`
- **Route**: `/analytics/productivity`

## Component Inventory
**Primary**: 1. Productivity KPIs, 2. User Leaderboard, 3. Hourly Throughput Chart
**Secondary**: 4. Task Distribution, 5. Idle Time Analysis, 6. Quality Metrics
**Modals**: User Detail View, Shift Performance Report

## Data Schema
| Field | Type | Validation |
|-------|------|------------|
| userId | string | Operator ID |
| linesPerHour | number | Pick rate |
| accuracy | number | 0-100 percentage |
| activeTime | number | Minutes working |
| idleTime | number | Minutes idle |
| tasksCompleted | number | Task count |

## Layout
**Pattern**: KPIs + leaderboard + charts
**Top**: KPI cards (avg pick rate, accuracy, utilization)
**Left**: User leaderboard table
**Right**: Hourly throughput line chart

## Key Components
- **Productivity KPIs**: Avg lines/hour, accuracy %, utilization %
- **User Leaderboard**: Table (Rank, User, Lines/Hour, Tasks, Accuracy) sorted by performance
- **Hourly Throughput**: Line chart showing pick rate by hour of day
- **Task Distribution**: Pie chart (Pick, Pack, QC, Putaway time allocation)
- **Idle Time Analysis**: Bar chart of idle time causes (Break, Wait for Task, Equipment Issue)
- **Quality Metrics**: Error rate, mispick count, QC fail rate
- **Top Performers**: Badge icons for top 3 users
- **Shift Selector**: Toggle between shifts (Morning, Afternoon, Night)
- **User Filter**: Search/select specific users

## Analytics-Specific
- **Leaderboard**: Gamification with rankings
- **Time Distribution**: Understand where time is spent
- **Quality vs Speed**: Balance productivity with accuracy
