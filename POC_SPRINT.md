# Venti WMS — 1-Month Enterprise POC Sprint

**Target ICP:** Enterprise manufacturers (Daikin, Voltas-class HVAC / industrial)  
**Market:** India — ISO posture + DPDP compliance awareness  
**Deployment:** Cloud-only SaaS  
**Mode:** Emulate and demonstrate capabilities — not production end-to-end  
**Deadline:** 4 weeks  
**Competitive wedge:** 3D digital twin · AI decision layer · Speed to implement  

---

## POC Goal

Prospects should leave a 15-minute demo believing Venti can modernize their warehouse operations faster than legacy WMS vendors — with visible proof in 3D, measurable pick-path savings, and AI-driven decisions that execute autonomously.

### Success criteria

| # | Belief we must create | Proof mechanism |
|---|----------------------|-----------------|
| 1 | Understands our warehouse | Live 3D twin with inventory heatmap + pick routes |
| 2 | AI drives real decisions | Seasonal demand alert → one-click approve → task created |
| 3 | Pick efficiency is measurable | Naive vs optimized path, % travel saved, multi-picker zones |
| 4 | Operators can adopt quickly | PWA on tablet: scan → pick list → confirm |
| 5 | Ready for automation future | AGV fleet simulation + Autopilot wave release |
| 6 | Enterprise-ready for India | RBAC, audit logs, DPDP posture, cloud architecture |

### Score targets

| Lens | Current | POC target |
|------|---------|------------|
| Demo credibility | ~52% | **72%** |
| 3D / 2D twin | ~52% | **85%** |
| Route / TSP | ~3% | **70%** |
| AI / insights | ~8% | **65%** |
| Autopilot | ~5% | **60%** |
| PWA operator | ~15% | **55%** |

---

## Build vs Simulate vs Placeholder

| Capability | Strategy | Notes |
|------------|----------|-------|
| 3D twin (heatmap, paths, tooltips) | **Build** | Extend existing `ThreeView` |
| 2D layout editor | **Done** | Polish only |
| TSP / zone routing | **Build** | Heuristic on layout coordinates |
| Multi-picker + cart optimization | **Simulate** | Zone assignment + load-balance UI |
| AI insights | **Hybrid** | SQL-backed heuristics + optional LLM narrative |
| Autopilot execution | **Simulate** | Rules trigger visible state changes |
| PWA operator flows | **Build shell** | Responsive pick/receive UX |
| Barcode / printer hardware | **Placeholder** | Config UI + print preview modal |
| ERP / OMS integrations | **Placeholder** | Existing integrations page |
| AGV / WCS | **Simulate** | Animated paths on 3D floor |
| Returns workflow | **Simulate** | Guided wizard UI |
| Allocation / reservations | **Simulate** | Show allocated qty from seed data |
| DPDP / ISO | **Document + wire** | Privacy controls, audit demo, residency note |

---

## Sprint calendar

```
Week 1  Foundation + 3D Twin "Wow"
Week 2  Route Optimization Engine (Hero #1)
Week 3  AI Layer + Autopilot (Hero #2)
Week 4  PWA Operator + AGV Sim + Demo Polish (Hero #3)
```

---

# Week 1 — Foundation + 3D Twin

**Goal:** Nothing breaks in demo. 3D twin tells an operational story.

**Milestone demo:** Walk warehouse in 3D → hover bin for SKU/qty → toggle heatmap → see occupancy.

### Tasks

#### 1.1 API / schema alignment (P0)

- [ ] Fix `PickWave` schema — add `type`, link to `SalesOrder` (or wave lines table)
- [ ] Fix `createWave` / `getWaveById` — persist and return `type`, `lines`, `salesOrders`
- [ ] Fix wave detail page (`orders/fulfill/[id]`) — align with API response
- [ ] Fix transfer create API/UI drift — unify on `skuId`, `fromLocationId`, `toLocationId`
- [ ] Add ASN line items to `create-asn` procedure
- [ ] Smoke-test all order tabs: Inbound, Outbound, Transfer, Manifest, Fulfill

**Files (starting points):**
- `packages/database/prisma/schema.prisma`
- `packages/database/services/orders-service.ts`
- `packages/api/modules/orders/procedures/create-wave.ts`
- `packages/api/modules/orders/procedures/get-wave.ts`
- `apps/web/app/(saas)/app/(wms)/orders/fulfill/[id]/page.tsx`
- `apps/web/app/(saas)/app/(wms)/orders/transfers/new/page.tsx`

#### 1.2 3D inventory heatmap

- [ ] Query bin-level inventory qty + velocity from seed/analytics data
- [ ] Map qty/velocity → color scale (green → amber → red) on bin meshes
- [ ] Add legend + toggle: "Layout view" / "Operations view"
- [ ] Performance: memoize color updates, limit re-renders

**Files:**
- `apps/web/modules/saas/warehouse/components/ThreeView.tsx`
- `apps/web/app/(saas)/app/(wms)/warehouse/[id]/components/tab-contents.tsx`

#### 1.3 3D hover tooltips

- [ ] Raycast on bin hover → tooltip: SKU code, description, qty, lot (if any)
- [ ] Click bin → side panel with inventory detail
- [ ] Empty bins show "Available capacity"

#### 1.4 2D operations overlay

- [ ] Add route/path layer placeholder on `CanvasEditor` (prep for Week 2)
- [ ] Sync selected bin highlight between 2D and 3D tabs

#### 1.5 PWA scaffold

- [ ] Add `manifest.json` (name, icons, `display: standalone`, theme color)
- [ ] Mobile-responsive operator layout shell (`/app/operator`)
- [ ] Bottom nav for operator mode: Tasks · Scan · Profile
- [ ] Install prompt / "Add to Home Screen" hint
- [ ] Test on iPad Safari + Android Chrome

#### 1.6 Demo data

- [ ] Verify Daikin seed runs cleanly (`create:layout-and-simulation`)
- [ ] Add optional generic org name variant for non-Daikin demos (e.g. "Premier HVAC India")
- [ ] Document `pnpm` seed commands in sprint notes

### Week 1 exit checklist

- [ ] No broken pages on main nav routes
- [ ] 3D heatmap renders from real inventory data
- [ ] Bin hover tooltip works
- [ ] PWA installable on tablet
- [ ] Wave create → detail page loads without errors

---

# Week 2 — Route Optimization Engine

**Goal:** Measurable pick efficiency — the answer to "why not Manhattan?"

**Milestone demo:** Release 12-line wave → 3 pickers assigned to zones → animated routes in 3D → "−31% travel" metric card.

### Tasks

#### 2.1 Warehouse graph builder

- [ ] New package or module: `packages/utils/src/route-optimizer/` (or `packages/database/services/route-optimizer.ts`)
- [ ] Build graph from layout: nodes = BIN locations with `(x, y, z)`
- [ ] Edges = aisle adjacency (same zone, within walkable distance threshold)
- [ ] Entry/exit nodes: dock doors, pack stations (from `Asset` type `DOCK_DOOR`)

#### 2.2 Zone partitioner

- [ ] Partition pick lines by zone (A, B, C, D) from location hierarchy
- [ ] Support wave types: `SINGLE_ORDER`, `BATCH`, `ZONE`, `CLUSTER`
- [ ] API: `optimizeWaveRoutes(waveId)` → per-zone, per-picker routes

#### 2.3 TSP heuristic

- [ ] Implement nearest-neighbor starting from zone entry point
- [ ] Optional 2-opt improvement pass
- [ ] Return ordered bin sequence + total distance (meters)
- [ ] Compute baseline "naive" route (order line sequence) for comparison

#### 2.4 Multi-picker + cart assignment

- [ ] Assign N pickers to zones (round-robin or load-balanced by line count)
- [ ] Assign cart IDs (C-01, C-02, …) per picker
- [ ] UI: picker card showing zone, cart, line count, estimated distance

#### 2.5 Route visualization

- [ ] 3D: polyline path through bin centers, animated draw-on-release
- [ ] 2D: route overlay on `CanvasEditor` per picker (color-coded)
- [ ] Picker legend with color key

#### 2.6 Metrics panel

- [ ] Before/after card: `Naive: 847m → Optimized: 583m (−31%)`
- [ ] Per-picker breakdown table
- [ ] Store route result on wave (JSON field or `PickWaveRoute` table)

#### 2.7 Wire to fulfill flow

- [ ] "Release wave" button → calls route optimizer → saves routes
- [ ] Wave detail page shows routes, pickers, metrics
- [ ] Link "Open in PWA" → operator pick list for assigned picker

### Week 2 exit checklist

- [ ] Route optimizer runs on real warehouse layout coordinates
- [ ] Multi-picker zone assignment visible in UI
- [ ] 3D + 2D route visualization works
- [ ] Travel savings metric displays on wave detail
- [ ] Demo wave (12+ lines) completes full flow without manual fixes

---

# Week 3 — AI Layer + Autopilot

**Goal:** Decision support and autonomous execution feel real.

**Milestone demo:** Heat-wave demand spike on dashboard → AI suggests compressor replenishment → manager approves → Autopilot creates task → 3D bin updates.

### Tasks

#### 3.1 Ground AI in real data

- [ ] Refactor `get-predictive-demand.ts` — query actual SKU velocity + inventory levels
- [ ] Seasonal rule for HVAC: high `COMP-*` SKUs when "extreme heat" flag set (configurable)
- [ ] Refactor `get-dead-stock-rebalance.ts` — query real dead stock from analytics SQL
- [ ] Refactor `get-predictive-maintenance.ts` — tie to high-value serialized SKUs in seed
- [ ] Keep external weather as mock OR optional API key — document which is live vs simulated

#### 3.2 Actionable insight cards

- [ ] "Approve replenishment" → creates `WarehouseTask` (REPLENISHMENT) + toast
- [ ] "Approve transfer" → creates transfer draft or task
- [ ] "Dismiss" → marks insight as dismissed (local state or DB flag)
- [ ] Insight approval reflected in 3D heatmap on refresh

**Files:**
- `apps/web/app/(saas)/app/(wms)/analytics/components/predictive-alerts.tsx`
- `packages/api/modules/analytics/procedures/*.ts`

#### 3.3 LLM narrative layer (optional, time-boxed)

- [ ] Add procedure: `get-operations-summary` — feeds KPIs to Vercel AI SDK
- [ ] Returns 2–3 sentence executive summary for Control Tower
- [ ] Graceful fallback if `OPENAI_API_KEY` not set

#### 3.4 Autopilot rule engine (lightweight)

- [ ] Define 3 demo rules (config in DB or org JSON):
  1. **Low-stock replenish** — SKU below min → create replenishment task
  2. **Wave auto-release** — daily at configured time → release pending waves
  3. **Dead-stock rebalance** — dead stock > threshold → suggest transfer
- [ ] In-process scheduler (no Redis required for POC) — `setInterval` or cron on API boot
- [ ] Rules page: toggle on/off, show last run time, last action taken

**Files:**
- `apps/web/app/(saas)/app/(common)/autopilot/page.tsx` — wire to real state
- New: `packages/api/modules/autopilot/` router + procedures

#### 3.5 Execution animation

- [ ] Rule fires → toast notification → task appears in task list
- [ ] Optional: WebSocket or polling for "live" task queue updates
- [ ] 3D: highlight affected bin when task created

#### 3.6 Workflow live execution

- [ ] Workflow builder: Save definition to DB (`WorkflowDefinition` model exists)
- [ ] Demo mode: "Run workflow" animates nodes Receive → QC → Putaway in sequence
- [ ] Highlight active node, show elapsed time per step

**Files:**
- `apps/web/app/(saas)/app/(wms)/settings/workflows/components/workflow-builder.tsx`

#### 3.7 Navigation + Control Tower

- [ ] Unhide Analytics / Control Tower in sidebar (`/app/analytics`)
- [ ] Unhide Autopilot in sidebar
- [ ] Home dashboard links to actionable insights

### Week 3 exit checklist

- [ ] At least 2 insight types use real SQL data
- [ ] Approve action creates visible task in system
- [ ] Autopilot page shows live rule status (not static mock)
- [ ] One rule executes automatically during demo
- [ ] Workflow demo animates 3+ steps

---

# Week 4 — Operator PWA + AGV Sim + Demo Polish

**Goal:** Floor-ready feel, automation vision, 15-minute scripted demo.

**Milestone demo:** Full end-to-end on iPad — inbound receive, outbound pick with scan confirm, AGV animation, returns wizard — no broken pages.

### Tasks

#### 4.1 PWA pick flow

- [ ] `/app/operator/pick/[waveId]` — mobile pick list sorted by optimized route
- [ ] Line items: SKU, bin location, qty, scan input field
- [ ] Confirm line → progress bar, next item highlighted
- [ ] Complete wave → success screen + link back to admin
- [ ] Filter by picker assignment (demo: picker 1 of 3)

#### 4.2 PWA receive flow

- [ ] `/app/operator/receive/[poId]` — ASN/PO lines, expected qty
- [ ] Enter received qty, lot (if applicable)
- [ ] Putaway suggestion card ("Bin A-12-03 recommended")
- [ ] Complete → inventory reflected (call existing receive API or simulate)

#### 4.3 Scan input

- [ ] Camera scan stub via `getUserMedia` (optional — time-boxed)
- [ ] Manual barcode text input (hardware wedge works as keyboard)
- [ ] Beep/vibration feedback on successful scan match
- [ ] Validation: wrong SKU → error shake animation

#### 4.4 Printer placeholder

- [ ] Organization settings: "Connected devices" section
- [ ] Add label printer config (name, IP, type: Zebra / Brother / Generic)
- [ ] "Print pick list" → PDF download or browser print preview
- [ ] "Print shipping label" → placeholder label image with tracking #

#### 4.5 AGV simulation

- [ ] AGV panel on warehouse detail: fleet list (AGV-01, AGV-02, AGV-03)
- [ ] Job queue: "Moving pallet P-2847 Zone D → Dock 3"
- [ ] 3D: simple box mesh AGVs on floor, tween along path waypoints
- [ ] "Dispatch AGV" button on task → starts animation
- [ ] Status badges: Idle · En route · Loading · Unloading

#### 4.6 Returns guided demo

- [ ] Replace `returns/page.tsx` stub with 4-step wizard:
  1. Return request (customer, SKU, reason)
  2. Inspection (pass/fail, photos placeholder)
  3. Disposition (RESTOCK / SCRAP / REFURBISH / RTV)
  4. Completion (inventory update message)
- [ ] Use seed return data for pre-filled demo option

#### 4.7 Integrations placeholder polish

- [ ] Integrations page: mark connectors as "Available Phase 2"
- [ ] SAP B1, Tally, Shopify — static cards with "Request integration" CTA
- [ ] Unhide in sidebar under Management (optional)

#### 4.8 Demo mode

- [ ] "Run Demo" button on home or warehouse page
- [ ] Scripts Scenario 1–5 with timed toasts and navigation hints
- [ ] "Reset Demo" — re-run seed or reset demo flags
- [ ] Demo script document (see below) for presenter

#### 4.9 DPDP + ISO posture

- [ ] Privacy / data processing notice accessible from settings
- [ ] Audit logs page demo-ready with filters (user, action, date)
- [ ] Settings: data export request placeholder
- [ ] Architecture one-pager: RBAC, encryption, ap-south-1 residency, audit trail
- [ ] Add to `apps/web/content/legal/` or internal `docs/compliance-poc.md`

#### 4.10 Final QA

- [ ] Full demo dry-run on iPad (portrait + landscape)
- [ ] Full demo dry-run on desktop Chrome
- [ ] Fix all console errors on demo paths
- [ ] Loading states on all async actions
- [ ] Empty states replaced with demo CTAs where needed
- [ ] Screenshot / screen recording of golden path for sales deck

### Week 4 exit checklist

- [ ] 15-minute demo runs without assistance
- [ ] PWA pick flow completable on tablet
- [ ] AGV animation visible in 3D
- [ ] Returns wizard walkthrough works
- [ ] Compliance story presentable to enterprise buyer
- [ ] No P0 bugs on demo routes

---

# Golden demo script (15 min)

Use this script for dry-runs and prospect meetings.

### Act 1 — Control Tower (3 min)

1. Open **Home dashboard** — OTIF, backlog, dead stock KPIs
2. Navigate to **Analytics** — AI insight: "Extreme heat forecast → COMP-400A stockout risk"
3. Click **Approve replenishment** — task created toast
4. Show **Autopilot** — low-stock rule running, last action timestamp

### Act 2 — 3D Digital Twin (4 min)

1. Open **Warehouse** → select Daikin DC
2. Toggle **Operations view** — heatmap on bins
3. Hover bins — SKU tooltips
4. Switch to **2D** — same heatmap overlay
5. Open **AGV panel** — dispatch AGV-01, watch 3D animation

### Act 3 — Outbound + Route Optimization (5 min)

**Seeded entities (Hyderabad `HYD-01`):** `SO-SUMMER-SPIKE-2026`, optional QA shortcut `WAVE-DEMO-PICK`.

1. **Orders → Outbound** — open **`SO-SUMMER-SPIKE-2026`** (14 ALLOCATED lines, unpicked)
2. **Fulfill → Create wave** — type ZONE (or use pre-seeded **`WAVE-DEMO-DRAFT`** for Autopilot auto-release demo)
3. **Release wave** — route optimizer runs (skip if using pre-released **`WAVE-DEMO-PICK`** → `/operator/pick/{waveId}?picker=1`)
4. Show metrics: **−31% travel**, 3 pickers, 3 carts
5. 3D route animation per picker
6. Open **PWA pick** on tablet — confirm 2 lines with scan

### Act 4 — Inbound + Returns (2 min)

**Seeded entities:** `PO-DEMO-RCV-001` (open receive), `PO-DEMO-RCV-002` (partial), `RMA-DEMO-001` / `RMA-DEMO-002`.

1. **PWA receive** — open **`PO-DEMO-RCV-001`** at `/operator/receive/{poId}` — enter qty, putaway suggestion
2. **Returns wizard** — open **`RMA-DEMO-001`** — inspection → RESTOCK → 3D bin turns green

### Act 5 — Close (1 min)

1. **Integrations** — "Phase 2: SAP, Tally, Shopify"
2. **Audit logs** — who approved what, when
3. **Architecture slide** — cloud India region, DPDP, ISO posture

---

# Out of scope (explicit)

Do not build in this sprint:

- Production ERP / EDI connectors
- Real AGV / WCS protocol (MQTT, VDA 5050)
- ML model training pipelines
- Full allocation / reservation engine
- Native iOS / Android apps
- Cycle count / replenishment full automation
- 3PL billing, yard management
- ISO 27001 certification or pen test
- Multi-region deployment

---

# Team allocation

### 2–3 developers

| Role | Week 1–2 | Week 3–4 |
|------|----------|----------|
| **3D / frontend** | Heatmap, tooltips, route viz | AGV anim, demo mode, polish |
| **Backend** | Graph builder, TSP, wave fixes | Autopilot rules, AI data wiring |
| **Full-stack / PWA** | PWA scaffold, fulfill flow | Operator flows, returns, QA |

### Solo developer — priority order

1. Wave API fixes (Week 1)
2. Route optimizer + 3D paths (Week 2)
3. PWA pick flow (Week 4)
4. AI approve → create task (Week 3)
5. AGV simulation (Week 4)
6. Everything else as time allows

---

# Risk register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Wave/transfer bugs break demo | High | High | Week 1 P0 hardening |
| TSP feels fake | Medium | High | Always show before/after on real coordinates |
| AI still feels mock | Medium | Medium | Ground 2+ insights in SQL |
| PWA not installable | Medium | Medium | Test iPad Week 1, fix manifest early |
| Scope creep | High | High | "Emulate not build" — reject new features |
| Seed data stale mid-demo | Low | High | "Reset Demo" command + documented seed |
| LLM latency in demo | Medium | Low | Fallback to static summary |

---

# Key commands

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm generate

# Run dev
pnpm dev

# Seed layout + 2-year simulation
pnpm --filter @repo/database create:layout-and-simulation

# Run migrations (after schema changes)
pnpm --filter @repo/database push
```

---

# Definition of done (POC)

The POC is **done** when:

- [ ] All Week 4 exit checklists pass
- [ ] 15-minute golden demo script runs twice without failure
- [ ] Demo works on iPad PWA + desktop Chrome
- [ ] At least one real metric (travel savings) is computed, not hardcoded
- [ ] At least one AI insight uses live database queries
- [ ] Autopilot executes at least one rule during demo
- [ ] DPDP / ISO story is presentable
- [ ] Sales deck has screenshots from golden demo

---

# Related documents

- `TODO.md` — full product roadmap (phases 0–15)
- `packages/database/prisma/schema.prisma` — data model
- `packages/database/prisma/seed/layout-and-simulation.ts` — demo data generator

---

*Last updated: June 2026*
