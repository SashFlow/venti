# Venti Sales Assets

Place pitch deck and proposal images here. Filename convention: `{category}-{short-description}.png`

## Which deck uses which assets

| Document | Slides | Use when |
|----------|--------|----------|
| **`COO_PITCH_FLOW.md`** | 12 main + appendix | First COO meeting (20 min) |
| **`PITCH_DECK.md`** | 32 full deck | Workshop, CIO, board, deep demo |
| **`CLIENT_PROPOSAL.md`** | Written leave-behind | After discovery / POC SOW |

## Recommended screenshots (from golden demo)

Capture these from a running dev instance after seeding (`pnpm --filter @repo/database create:layout-and-simulation`).

| Filename | Route / component | Used in |
|----------|-------------------|---------|
| `hvac-plant-pain.png` | Custom — heat map + SKU + ₹ trapped | Slide 2 |
| `three-promises.png` | Custom — Floor · Savings · Leadership pillars | Slide 4 |
| `offline-safe-operator.png` | Operator PWA + offline sync diagram | Slides 6, 23 |
| `operator-pwa-tablet.png` | `/operator/pick` vs RF terminal | Slide 7 |
| `cost-of-delay-ticker.png` | Analytics — profit bleed ticker | Slide 4 |
| `executive-capital-at-risk.png` | `/app/home` — Executive persona tab | Slide 7b |
| `predictive-demand-card.png` | Analytics — demand insight card | Slide 10 |
| `predictive-maintenance-card.png` | Analytics — maintenance alert | Slide 11 |
| `dead-stock-net-savings.png` | Analytics — dead stock rebalance card | Slide 12 |
| `geospatial-risk-map.png` | Analytics — geospatial map | Slide 13 |
| `financial-ledger.png` | Analytics — Capital & Cost Ledger tab | Slide 14 |
| `autopilot-dashboard.png` | `/app/autopilot` | Slide 15 |
| `five-persona-strip.png` | `/app/home` — all persona tabs | Slide 17 |
| `3d-heatmap-twin.png` | Warehouse → 3D — Operations view heatmap | Slide 18 |
| `route-optimization-31pct.png` | Fulfill wave detail — savings metric | Slide 19 |
| `multi-picker-routes.png` | 3D — color-coded picker paths | Slide 20 |
| `agv-fleet-panel.png` | Warehouse — AGV panel + 3D animation | Slide 21 |
| `workflow-builder.png` | `/app/settings/workflows` | Slide 22 |
| `operator-pwa-tablet.png` | `/operator/pick` on tablet | Slide 23 |
| `returns-wizard.png` | `/app/returns` | Slide 26 |
| `component-failure-pareto.png` | `/app/home` — Inventory & Quality tab | Proposal |
| `insight-approve-flow.png` | Analytics — Approve replenishment | Slide 6 |

## Custom illustrations to create

| Filename | Description |
|----------|-------------|
| `hero-cover-cinematic.png` | Dark command center hero — 16:9 |
| `vision-four-quadrant.png` | See · Predict · Decide · Automate |
| `savings-waterfall.png` | Labor + inventory + OTIF + reverse = total ROI |
| `hvac-summer-storyboard.png` | 6-panel use case with ₹ callouts |
| `comparison-legacy-vs-venti.png` | RF terminal vs tablet PWA |
| `comparison-blueyonder-manhattan.png` | Competitive table graphic |
| `timeline-poc-vs-legacy.png` | 4 weeks vs 18 months |
| `roi-dashboard-mock.png` | 4 KPI tiles — Labor, Inventory, OTIF, CO₂ |
| `executive-briefing-mock.png` | Morning ops summary widget |
| `architecture-diagram.png` | Control Tower → API → 3D Twin + PWA |

## Demo script reference

See `POC_SPRINT.md` — Golden demo script (Acts 1–5) for capture order.
