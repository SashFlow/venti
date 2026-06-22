# Venti WMS — Client Pitch Deck

**Vendor:** Sashflow  
**Product:** Venti WMS  
**Audience:** Enterprise HVAC manufacturers in India (Daikin, Voltas-class)  
**Format:** 32 slides · Markdown outline with image placeholders

> **First COO meeting?** Use the tight 12-slide flow instead: [`COO_PITCH_FLOW.md`](COO_PITCH_FLOW.md) (20 min · pain → wedge → offline → savings → proof → decision).

---

## Primary wedge (lead every meeting with this)

> **Offline-safe, operator-friendly warehouse execution for Indian HVAC plants — with CFO-grade savings and board-ready visibility in weeks, not years.**

**One sentence for plant leaders:**
> *"Venti is the fastest way to cut warehouse travel, protect summer stock, and give leadership a live view of trapped working capital."*

**What we lead with:** floor execution (simple PWA, offline-safe) + HVAC-specific savings (summer stockouts, spare parts, dead stock, −31% travel).

**What is proof, not headline:** 3D twin, Autopilot, forecast cards, geospatial map, AGV simulation.

---

## Internal legend (do not show to clients)

| Tag | Meaning |
|-----|---------|
| `[BUILT]` | Demo-ready in codebase today |
| `[POC]` | Simulated or seeded for demo |
| `[VISION]` | Pilot / Phase 2 — sell as committed roadmap |

---

# Act I — HVAC Pain & The Wedge

## Slide 1 — Cover

**Speaker notes:** Do not open with "AI platform." Open with the wedge. Plant leaders must be able to repeat this in the corridor.

**On-slide copy:**
- **Venti WMS**
- *Cut pick travel. Protect summer stock. Free trapped capital.*
- Offline-safe, operator-friendly execution for Indian HVAC plants
- Sashflow · `[CLIENT NAME]` · `[DATE]`

[IMAGE: HERO — Split: operator on tablet in warehouse + executive savings cockpit]
  Suggested: 16:9 | Source: composite — operator PWA + Executive panel
  File: docs/sales/assets/hero-cover-cinematic.png

---

## Slide 2 — The Daikin/Voltas Problem

**Speaker notes:** Name their world before you name your product. This slide is why they stay in the room.

**On-slide copy:**
- **March–June:** compressor and coil demand spikes — one stockout = lost install season
- **Spare parts:** technicians wait while the DC hunts SKUs in the wrong zone
- **Dead stock:** ₹`[X]` Cr in capacitors and controllers that haven't moved in 90 days
- **Working capital:** finance sees inventory; operations can't explain where it is
- **Legacy WMS:** 18-month rollout — summer is in 12 weeks

[IMAGE: DIAGRAM — India heat map + HVAC SKU icons + ₹ trapped capital callout]
  Suggested: 16:9 | Source: custom illustration
  File: docs/sales/assets/hvac-plant-pain.png

---

## Slide 3 — One Sentence

**Speaker notes:** If they remember nothing else, they remember this.

**On-slide copy:**
- **Venti turns your warehouse into an offline-safe, worker-friendly execution system — and gives leadership a live savings cockpit in weeks, not years.**
- Floor: simple tablet picks that work in dead zones
- Finance: trapped capital visible on one screen
- Board: measurable −31% travel and summer stockout prevention

[IMAGE: DIAGRAM — Three layers: Floor · Savings · Leadership]
  Suggested: 16:9 | Source: custom wedge diagram
  File: docs/sales/assets/vision-four-quadrant.png

---

## Slide 4 — Three Promises

**Speaker notes:** Everything in the deck maps to one of these three. Do not sell a fourth.

**On-slide copy:**

| Promise | What it means | Proof in demo |
|---------|---------------|---------------|
| **1. Floor that works** | Low-skill operators, scan-confirm, offline-safe in no-network zones | Operator PWA `[BUILT]` · offline `[VISION]` pilot |
| **2. Savings you can measure** | −31% pick travel, dead stock recovery, summer stockout alerts | Route optimizer + Control Tower `[BUILT]` |
| **3. Leadership visibility** | One screen replaces five reports; approve → task in 60 seconds | Analytics + Autopilot `[BUILT]` |

[IMAGE: DIAGRAM — Three pillars: Floor · Savings · Leadership]
  Suggested: 16:9 | Source: custom illustration
  File: docs/sales/assets/three-promises.png

---

## Slide 5 — Cost of Inaction (HVAC) `[BUILT/POC]`

**Speaker notes:** Tie bleed to HVAC season, not abstract supply chain.

**On-slide copy:**
- **Profit bleed: ₹[X]/hr** — delayed compressors, idle high-value coils, AMC parts not turned
- **Stockout cost:** one missed COMP-400A line = `[₹____]` lost revenue + technician idle time
- **Dead stock:** holding cost on SKUs that won't move before next summer
- Bottleneck named: *"Warehouse B outbound staging over capacity — 14 shipments delayed"*

[IMAGE: SCREENSHOT — Cost-of-delay ticker with HVAC bottleneck callout]
  Suggested: 16:9 | Source: `/app/analytics` — `cost-of-delay-ticker.tsx`
  File: docs/sales/assets/cost-of-delay-ticker.png

---

## Slide 6 — Works When the Network Doesn't `[VISION]` pilot

**Speaker notes:** This is your Manhattan/Blue Yonder killer on the floor. Legacy RF dies in dead zones; Venti doesn't. Commit to pilot delivery — do not apologize.

**On-slide copy:**
- **Offline-safe Operator PWA** — pick and receive continue without connectivity
- Local queue holds scan confirmations · syncs when back online
- Degraded mode: route-sorted list, bin location, qty confirm — no admin login required
- Built for mezzanine dead zones, metal racking interference, and patchy plant Wi-Fi
- *"Your operators stop saying 'system is down' during peak season."*

[IMAGE: DIAGRAM — Tablet offline → local queue → sync on reconnect; red "no signal" icon]
  Suggested: 16:9 | Source: custom illustration + operator PWA screenshot
  File: docs/sales/assets/offline-safe-operator.png

---

## Slide 7 — Built for Low-Skill Operators `[BUILT]`

**Speaker notes:** Contrast with RF gun training cycles. Venti is one screen, one action, one beep.

**On-slide copy:**
- **No RF gun training manual** — install on tablet, tap task, scan, confirm
- Route-sorted pick list: next bin always on top — no warehouse map in your head
- Large touch targets · minimal text · scan wedge or camera input
- Wrong SKU → error shake · right SKU → progress bar advances
- Operators productive in **one shift**, not one month

[IMAGE: COMPARISON — Green-screen RF terminal (complex menus) vs Venti single-task screen]
  Suggested: 16:9 | Source: `/operator/pick` screenshot + legacy RF stock photo
  File: docs/sales/assets/operator-pwa-tablet.png

---

## Slide 8 — CFO Savings Cockpit `[BUILT]`

**Speaker notes:** Leadership proof — not the opening hook. "One screen replaces five reports."

**On-slide copy:**
- **₹[X] Cr inventory capital at risk** — dead · slow-moving · excess on one card
- Summer stockout alert: COMP-400A · 4 days cover · approve replenishment in one click
- Profit bleed ticker · OTIF trend · component failure Pareto
- *Board asks for AI — you show trapped capital and actions taken overnight.*

[IMAGE: SCREENSHOT — Executive persona panel + analytics insight card]
  Suggested: 16:9 | Source: `/app/home` Executive tab + `/app/analytics`
  File: docs/sales/assets/executive-capital-at-risk.png

---

# Act II — Savings Proof (HVAC-Specific)

## Slide 9 — Summer Stockout Prevention `[BUILT]`

**Speaker notes:** This is Promise #2 for HVAC. Demo the approve flow immediately after explaining summer pain.

**On-slide copy:**
- **EXTREME HEAT** forecast → compressor SKU stockout risk surfaced automatically
- COMP-400A at Hyderabad: **4 days cover** · suggested replenishment: `[N]` units
- Manager clicks **Approve** → warehouse task created · Autopilot fires overnight
- Technician spare parts available before the first failed service call

[IMAGE: SCREENSHOT — 3-panel: insight card → Approve → task toast]
  Suggested: 16:9 | Source: `predictive-alerts.tsx` + task queue
  File: docs/sales/assets/insight-approve-flow.png

---

## Slide 10 — −31% Pick Travel (Measured) `[BUILT]`

**Speaker notes:** Provable ROI. Real layout coordinates. This is your answer to "why not Manhattan?"

**On-slide copy:**
- Naive route: `[847]` m → Optimized: `[583]` m · **−31% travel saved**
- Metric stored on every released wave — not a slide estimate
- Fewer hours per picker per day = overtime avoided in peak season
- Multi-picker zone assignment: 3 pickers · 3 carts · color-coded paths

[IMAGE: SCREENSHOT — Before/after metrics card + 3D route animation still]
  Suggested: 16:9 | Source: Fulfill wave detail + 3D overlay
  File: docs/sales/assets/route-optimization-31pct.png

---

## Slide 11 — Trapped Working Capital `[BUILT]`

**Speaker notes:** CFO slide. Dead stock rebalance shows net ₹ savings (holding − freight).

**On-slide copy:**
- **₹[X] Cr at risk:** dead stock · slow-moving · excess — executive card
- Dead stock rebalance: move SKU from low-demand DC → high-demand DC
- Net savings = 6-month holding cost − freight — shown before you approve
- Component failure Pareto: stop shipping the same failing capacitor twice

[IMAGE: SCREENSHOT — Capital at risk card + dead stock net savings insight]
  Suggested: 16:9 | Source: Executive panel + dead stock card
  File: docs/sales/assets/dead-stock-net-savings.png

---

## Slide 12 — ROI at a Glance (HVAC)

**Speaker notes:** Use their numbers. Every line maps to a Daikin/Voltas pain point.

**On-slide copy:**
- **Pick labor:** −31% travel × `[__]` pickers × peak season overtime → `[₹____]`
- **Summer stockouts avoided:** compressors + coils + capacitors → `[₹____]`
- **Dead stock recovered:** rebalance + disposition → `[₹____]`
- **Technician response:** spare parts availability → `[₹____]` SLA penalty avoided
- **Total · Payback:** `[₹____]` · `[__]` months

[IMAGE: DIAGRAM — Savings waterfall labeled with HVAC SKU examples]
  Suggested: 16:9 | Source: custom diagram
  File: docs/sales/assets/savings-waterfall.png

---

## Slide 13 — Demand Forecasting (Detail) `[BUILT]`

**Speaker notes:** Supporting detail for slide 9. Don't lead with this — prove it.

**On-slide copy:**
- Weather-aware demand: **EXTREME HEAT** scenario
- SKU velocity + days-of-cover + risk factor per warehouse
- Suggested replenishment quantity — approve in one click
- Prevents stockouts before the first service call fails

[IMAGE: SCREENSHOT — Predictive demand card with thermometer icon]
  Suggested: 4:3 | Source: `predictive-alerts.tsx`
  File: docs/sales/assets/predictive-demand-card.png

---

## Slide 14 — Technician Spare Parts `[BUILT]`

**Speaker notes:** HVAC aftermarket angle. Pre-position before truck rolls.

**On-slide copy:**
- Field unit failure estimate with confidence score
- Required parts list · local warehouse availability check
- Pre-position compressors and capacitors before truck rolls
- Faster technician response = fewer SLA penalties and repeat visits

[IMAGE: SCREENSHOT — Predictive maintenance alert card]
  Suggested: 4:3 | Source: `predictive-alerts.tsx`
  File: docs/sales/assets/predictive-maintenance-card.png

---

## Slide 15 — Autopilot (Overnight Actions) `[BUILT]`

**Speaker notes:** Leadership proof — rules run while plant sleeps.

**On-slide copy:**
- **Low-stock replenish** — compressor below min → task created before shift starts
- **Wave auto-release** — peak-season waves released on schedule
- **Dead-stock rebalance** — transfer suggestion when threshold hit
- Last run timestamp · recent actions queue · toggle per rule

[IMAGE: SCREENSHOT — Autopilot rules page with status badges]
  Suggested: 16:9 | Source: `/app/autopilot`
  File: docs/sales/assets/autopilot-dashboard.png

---

## Slide 16 — 5 Personas, 5 Money Leaks `[BUILT]`

**Speaker notes:** Optional depth slide. Skip in 15-min demo if time is short.

**On-slide copy:**

| Persona | HVAC pain | Venti surfaces |
|---------|-----------|----------------|
| **Associate** | Mis-picks in peak season | First-pass accuracy, route-sorted PWA |
| **Control Lead** | OTIF slip before summer | OTIF %, bottleneck zones, FIFO |
| **Inv & Quality** | Dead compressors in wrong DC | Failure Pareto, repair vs replace |
| **Regional** | AMC cores not returned | Transfer need, AMC exposure ₹ |
| **Executive** | Trapped working capital | Capital at risk, recovery yield |

[IMAGE: DIAGRAM — Five persona tabs with KPI highlights]
  Suggested: 16:9 | Source: `/app/home` persona strip
  File: docs/sales/assets/five-persona-strip.png

---

## Slide 17 — Why Now (India HVAC)

**Speaker notes:** Close Act II with urgency — season + compliance + legacy fatigue.

**On-slide copy:**
- **Summer is in 12 weeks** — Manhattan POC is still in requirements gathering
- **DPDP + audit trail** — Mumbai residency target (ap-south-1)
- **Operator reality** — patchy Wi-Fi and RF dead zones are not going away
- **4-week POC** — live savings cockpit before peak season planning locks

[IMAGE: ICON — Thermometer + calendar + India map + tablet]
  Suggested: 16:9 | Source: custom illustration
  File: docs/sales/assets/why-now-india.png

---

# Act III — Supporting Proof (Demo Depth)

*Use these slides in full demo or appendix. Do not lead the pitch with them.*

## Slide 18 — 3D Digital Twin `[BUILT]`

**Speaker notes:** Proof for supervisors and board demos — not the wedge headline.

**On-slide copy:**
- Live 3D twin from your layout coordinates
- Inventory heatmap — see dead stock clusters before finance asks
- Bin hover: SKU, qty, lot · click for detail
- *"Supervisors see what operators can't describe in a spreadsheet."*

[IMAGE: SCREENSHOT — 3D warehouse heatmap with bin tooltip]
  Suggested: 16:9 | Source: `ThreeView.tsx` — Operations view
  File: docs/sales/assets/3d-heatmap-twin.png

---

## Slide 19 — Full Control Tower `[BUILT]`

**Speaker notes:** Deep dive for CFO/COO. One screen replaces five reports.

**On-slide copy:**
- Analytics dashboard · geospatial risk map · financial ledger
- Cost-of-delay ticker · predictive alerts · approve-to-task
- Capital & Cost Ledger: PURCHASE · FREIGHT · HOLDING_COST · COGS

[IMAGE: SCREENSHOT — Full analytics dashboard page]
  Suggested: 16:9 | Source: `/app/analytics`
  File: docs/sales/assets/hero-command-center.png

---

## Slide 20 — Multi-Picker Optimization `[BUILT/POC]`

**Speaker notes:** Zone partition, cart assignment, color-coded paths per picker.

**On-slide copy:**
- Wave types: BATCH · ZONE · CLUSTER
- N pickers assigned to zones — load-balanced by line count
- Cart IDs per picker · per-picker distance breakdown
- 3 pickers · 3 carts · 3 optimized routes

[IMAGE: SCREENSHOT — Multi-picker route legend + zone assignment cards]
  Suggested: 16:9 | Source: Wave detail + 3D color paths
  File: docs/sales/assets/multi-picker-routes.png

---

## Slide 21 — AGV & Robotics Vision `[POC]`

**Speaker notes:** Future-proof narrative. Simulation today; WCS integration Phase 2.

**On-slide copy:**
- AGV fleet panel: AGV-01, AGV-02, AGV-03
- Job queue: *"Moving pallet P-2847 Zone D → Dock 3"*
- 3D animated paths on warehouse floor
- Bridge to MQTT / VDA 5050 in production rollout

[IMAGE: SCREENSHOT — AGV panel + 3D box mesh on floor]
  Suggested: 16:9 | Source: Warehouse AGV panel
  File: docs/sales/assets/agv-fleet-panel.png

---

## Slide 22 — Workflow Automation Builder `[BUILT/POC]`

**Speaker notes:** Visual workflows — Receive → QC → Putaway. Configurable without consultants.

**On-slide copy:**
- Drag-and-drop workflow builder
- Save definitions to database · demo execution animates nodes
- Standardize inbound, returns, and QC across all DCs
- No six-figure SI engagement to change a process

[IMAGE: SCREENSHOT — Workflow builder with Receive → QC → Putaway nodes]
  Suggested: 16:9 | Source: `/app/settings/workflows`
  File: docs/sales/assets/workflow-builder.png

---

## Slide 23 — Operator Floor Demo `[BUILT]` + Offline `[VISION]`

**Speaker notes:** Live demo slide. Pick 2 lines on tablet. Mention offline as pilot commitment.

**On-slide copy:**
- **Promise #1 in action:** scan → confirm → next bin (route-sorted)
- Works on ₹8K Android tablet — no MDM, no app store
- **Pilot adds:** offline queue in mezzanine / dead-zone areas
- *"If your operators can't use it, your CFO never sees the savings."*

[IMAGE: COMPARISON — RF terminal vs Venti single-task PWA + offline sync diagram]
  Suggested: 16:9 | Source: `/operator/pick` + custom offline diagram
  File: docs/sales/assets/offline-safe-operator.png

---

# Act IV — Trust & Close

## Slide 24 — HVAC Summer Spike Story `[BUILT]`

**Speaker notes:** End-to-end use case. Six beats, six ₹ callouts.

**On-slide copy:**
1. **Forecast** — Extreme heat → COMP-400A at 4 days cover `[BUILT]`
2. **Decide** — Manager approves replenishment in Control Tower `[BUILT]`
3. **Automate** — Autopilot creates task; low-stock rule fires `[BUILT]`
4. **Execute** — Summer wave released; −31% picker travel `[BUILT]`
5. **Measure** — OTIF holds 94%+; profit bleed drops `[BUILT/POC]`
6. **Recover** — RMA → RESTOCK → 3D bin turns green `[BUILT/POC]`

[IMAGE: STORYBOARD — 6-panel HVAC use case with ₹ on each panel]
  Suggested: 16:9 | Source: custom storyboard
  File: docs/sales/assets/hvac-summer-storyboard.png

---

## Slide 25 — End-to-End Flow

**Speaker notes:** Venti is a full WMS — intelligence is the hook, execution is the foundation.

**On-slide copy:**
- **Inbound** — PO · ASN · receive · putaway · landed cost
- **Storage** — lot/serial · reservations · cycle count
- **Outbound** — sales order · wave · pick · manifest · ship
- **Returns** — RMA · inspect · disposition · recovery
- **Transfer** — inter-DC moves · freight costing

[IMAGE: DIAGRAM — Circular flow: Inbound → Store → Pick → Ship → Returns → Transfer]
  Suggested: 16:9 | Source: custom diagram
  File: docs/sales/assets/end-to-end-flow.png

---

## Slide 26 — Returns & Reverse Logistics `[BUILT/POC]`

**Speaker notes:** HVAC aftermarket is returns-heavy. Recovery yield is hidden margin.

**On-slide copy:**
- Guided RMA wizard: request → inspect → disposition → complete
- RESTOCK · SCRAP · REFURBISH · RTV — with inventory update
- Recovery yield % · reverse value gap per warehouse
- Component failure Pareto — stop shipping the same bad part twice

[IMAGE: SCREENSHOT — Returns wizard + recovery yield KPI]
  Suggested: 16:9 | Source: `/app/returns` + Executive panel
  File: docs/sales/assets/returns-wizard.png

---

## Slide 27 — Enterprise-Ready for India

**Speaker notes:** IT and compliance buyers need this slide. DPDP, audit, residency.

**On-slide copy:**
- **RBAC** — organization role groups, warehouse-scoped permissions
- **Audit trail** — who approved what, when, from where
- **DPDP posture** — access, erasure, correction, grievance workflows
- **Data residency** — production target ap-south-1 (Mumbai)
- TLS in transit · secrets in environment · no client-side credentials

[IMAGE: ICON — Shield + India map + audit log + lock icons]
  Suggested: 16:9 | Source: custom icon grid
  File: docs/sales/assets/enterprise-india.png

---

## Slide 28 — Your Decision: Venti vs Status Quo

**Speaker notes:** Frame as a buyer decision, not a vendor roast. Respect Manhattan/Blue Yonder depth; win on the criteria that matter for *this* plant.

**On-slide copy:**

**Choose Venti if your priority is:**

| Your priority | Venti | Typical legacy path |
|---------------|-------|---------------------|
| **Live before next summer** | 4-week POC | 12–24 month SI project |
| **Operators who actually adopt** | Simple tablet PWA + offline pilot | RF gun + multi-day training |
| **Measured pick savings** | −31% on every wave, stored in system | Separate labor-management project |
| **Summer stockout prevention** | Heat forecast → approve → task | Manual safety-stock spreadsheets |
| **Trapped capital visible to CFO** | ₹ at risk on one executive card | Month-end inventory reports |
| **Floor works in dead zones** | Offline-safe operator mode (pilot) | RF drops when Wi-Fi drops |

**Choose Manhattan / Blue Yonder if:** you need deep SAP/Oracle EDI on day one and can wait 18+ months.

**One line:** *"Same warehouse. Fewer steps. Less travel. Stock protected. Capital visible."*

[IMAGE: COMPARISON — Buyer decision matrix (not vendor logos as villains)]
  Suggested: 16:9 | Source: custom graphic
  File: docs/sales/assets/comparison-blueyonder-manhattan.png

---

## Slide 29 — Customer Outcomes `[VISION]`

**Speaker notes:** Placeholder case studies — replace with real logos after first wins.

**On-slide copy:**
- **OTIF** +`[12]`% in `[90]` days
- **Pick labor** −`[31]`% travel measured per wave
- **Dead capital** ₹`[X]` L recovered via rebalance insights
- **Payback** `[6]` months on subscription + implementation
- *"[CLIENT QUOTE PLACEHOLDER]"* — COO, `[COMPANY]`

[IMAGE: TESTIMONIAL — Three outcome cards with metrics + logo placeholders]
  Suggested: 16:9 | Source: custom cards
  File: docs/sales/assets/customer-outcomes.png

---

## Slide 30 — Implementation — Weeks, Not Years

**Speaker notes:** Contrast with legacy timeline. POC in 4 weeks is the wedge.

**On-slide copy:**
- **Week 1–4: POC** — operator PWA, route optimizer, summer stockout alert, savings cockpit
- **Week 5–12: Pilot** — live DC, **offline-safe floor mode**, operator rollout on tablets
- **Month 4+:** multi-DC, ERP connectors, Autopilot hardening
- Legacy WMS: still in requirements when your peak season starts

[IMAGE: TIMELINE — Venti 4-week POC bar vs Manhattan 18-month bar]
  Suggested: 16:9 | Source: custom timeline
  File: docs/sales/assets/timeline-poc-vs-legacy.png

---

## Slide 31 — Engagement Options

**Speaker notes:** Three tiers. Fill pricing before client meetings.

**On-slide copy:**

| Tier | Scope | Investment |
|------|-------|------------|
| **POC** | 1 warehouse · demo data or client seed · 4-week sprint | `[₹____]` |
| **Pilot** | 1 live DC · operators on PWA · ERP interface spec | `[₹____]` / year |
| **Enterprise** | Multi-DC · Autopilot · integrations · dedicated CSM | `[₹____]` / year |

*All tiers include Control Tower, 3D twin, route optimizer, and Autopilot.*

[IMAGE: DIAGRAM — Three-tier pricing cards]
  Suggested: 16:9 | Source: custom layout
  File: docs/sales/assets/engagement-tiers.png

---

## Slide 32 — Next Steps

**Speaker notes:** Close with a clear path. Offer the 15-minute golden demo immediately.

**On-slide copy:**
1. **Discovery call** — map your DCs, SKUs, pain points (60 min)
2. **POC kickoff** — layout import, seed data, demo script (Week 1)
3. **Executive readout** — live demo + ROI worksheet (Week 4)
4. **Pilot decision** — go-live plan + integration roadmap

**Contact:** `[SALES NAME]` · `[EMAIL]` · `[PHONE]`  
**Sashflow** · venti.sashflow.com · `[CLIENT LOGO]` co-branding

[IMAGE: TEAM — Sashflow founders + client logo placeholder]
  Suggested: 16:9 | Source: team photos from `/images/`
  File: docs/sales/assets/team-next-steps.png

---

# Appendix A — Vision Features (internal — do not lead pitch)

| Feature | When to mention |
|---------|-----------------|
| AI Executive Briefing | CFO follow-up only |
| Dynamic Slotting AI | Phase 2 conversation |
| Voice-Activated Ops | Robotics/automation stakeholder |
| Offline-safe PWA | **Lead with this — pilot commitment** |
| Integration Hub (SAP/Tally) | When ERP depth question arises |

---

# Appendix B — Golden Demo Script (15 min)

Reference: `POC_SPRINT.md`

| Act | Duration | Flow |
|-----|----------|------|
| 1 Wedge | 3 min | HVAC pain → offline operator → −31% travel → trapped capital |
| 2 Summer story | 4 min | Heat alert → approve → wave release → PWA pick (2 lines) |
| 3 CFO proof | 3 min | Executive panel → dead stock net savings → Autopilot |
| 4 Depth (optional) | 3 min | 3D twin · full Control Tower |
| 5 Close | 2 min | Buyer decision slide → 4-week POC → next steps |

---

*Document version: June 2026 · Sashflow · Internal + client-facing outline*
