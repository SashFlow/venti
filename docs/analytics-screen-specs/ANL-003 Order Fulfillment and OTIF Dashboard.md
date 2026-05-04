# 1. Screen Overview
Screen ID: ANL-003
Name: Order Fulfillment and OTIF Dashboard
Primary Persona: Operations Manager

Goal of Screen (1 line): Enable fast and trustworthy analytical decision-making from operational and financial data.

What should the user accomplish here?
- Analyze key trends and take follow-up actions without leaving context.

# 2. Primary Action (Critical)
Main CTA: Apply Analysis / Take Action
Success condition: User gets a valid insight view or triggers the intended downstream action/export.
What happens after success:
- Visualization updates, and optional export/report/action workflow is triggered.

# 3. Information Hierarchy (VERY IMPORTANT)
🔴 Primary (always visible, high emphasis)
- Segment by channel/customer
- View late-order cohorts
- Open delayed shipment details
🟡 Secondary (visible but less prominent)
- Fulfillment rate
- OTIF percentage
- Delay reasons distribution
⚪ Tertiary (hidden / expandable)
- Data source attribution
- Calculation notes
- Audit/export metadata

# 4. Layout Structure (Wireframe in words)
Header: KPI context, scope filters, date picker
Body: KPI cards + charts + detail tables
Footer / Sticky CTA: Export/Save view/Create report
Floating elements: Compare toggle, annotation markers

# 5. Interaction Model
Tap actions: Filter, segment, drill-down, export, save view
Swipe actions: Optional chart timespan scroll
Scan behavior: Not applicable
Auto-navigation rules: Drill-down opens detail panel or linked operational screen

# 6. States & UX Behavior
| State | UX Behavior |
|---|---|
| Loading | Chart/table skeleton with retained filter chips |
| Empty | No data for current filter message + reset filter CTA |
| Error | Inline chart error + retry and fallback snapshot |
| Success | Smooth chart update + freshness timestamp |

# 7. Error Handling (Important for ops apps)
Error type: Data source unavailable
User feedback: Warning banner with stale data note
Recovery action: Retry fetch or switch to cached view

Error type: Export/report generation failed
User feedback: Error toast with job ID
Recovery action: Retry job or reduce data scope

# 8. Visual Priority & Cues
🔴 Red = risk/outlier requiring intervention
🟡 Yellow = caution / deteriorating trend
🟢 Green = healthy trend
🔵 Blue = interactive controls

Also define:
- Badge usage: New anomaly, stale data, scheduled
- Icon expectations: trend, alert, export, schedule

# 9. Performance & UX Constraints
One-handed usage: No
Max steps to complete task: 3
Offline support: No
Latency tolerance: < 700ms filter response, < 3s chart redraw

# 10. Device / Hardware Context
Scanner type: None
Gloves usage: No
Sound feedback: No
Vibration: No

# 11. Navigation Rules
Entry point: Analytics module or dashboard tile
Exit path: Linked operations/admin screen or report center
Back behavior: Preserve filter and compare state
Deep links (if any): Filtered view links and saved-view links

# 12. Edge Cases
- Highly sparse data under strict filters
- Timezone mismatch in period comparisons
- Very large dataset export timeout
- User loses permission to underlying dataset

# 13. Notes for Designer (Optional but powerful)
- Prioritize readability of trend and variance
- Keep filter controls discoverable but compact
- Always show data freshness and source confidence
