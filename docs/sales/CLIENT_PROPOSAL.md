# Venti WMS — Client Proposal

**Prepared for:** `[CLIENT NAME]`  
**Prepared by:** Sashflow  
**Date:** `[DATE]`  
**Valid through:** `[DATE + 90 days]`  
**Version:** 1.1

> **First meeting with COO?** Present from [`COO_PITCH_FLOW.md`](COO_PITCH_FLOW.md). Use this document as leave-behind after discovery.

---

## Primary wedge

> **Offline-safe, operator-friendly warehouse execution for Indian HVAC plants — with CFO-grade savings and board-ready visibility in weeks, not years.**

**One sentence:** *Venti is the fastest way to cut warehouse travel, protect summer stock, and give leadership a live view of trapped working capital.*

---

## Internal legend (do not include in client-facing PDF export)

| Tag | Meaning |
|-----|---------|
| `[BUILT]` | Demo-ready in codebase today |
| `[POC]` | Simulated or seeded for demo |
| `[VISION]` | Aspirational — Phase 2+ roadmap |

---

## 1. Executive Summary

`[CLIENT NAME]` operates `[WAREHOUSE COUNT]` distribution center(s) serving India's HVAC market — compressors, coils, capacitors, and aftermarket spare parts across `[REGION]` service networks. Your operational reality is seasonal: **March–June demand spikes** can make or break the install season. When a COMP-class compressor is in the wrong zone or a picker walks 31% farther than necessary, the cost shows up as stockouts, technician idle time, overtime, and **trapped working capital** finance cannot action.

Legacy WMS vendors (Manhattan, Blue Yonder) quote **12–24 month** implementations. Your next summer is **12 weeks** away.

**Sashflow proposes Venti WMS** — focused on three promises, not a generic platform pitch:

| Promise | What `[CLIENT NAME]` gets |
|---------|---------------------------|
| **1. Floor that works** | Simple tablet PWA for low-skill operators; scan-confirm pick/receive; **offline-safe mode in pilot** for dead-zone areas |
| **2. Savings you can measure** | **−31% pick travel** per wave; summer stockout alerts; dead stock rebalance with net ₹ savings |
| **3. Leadership visibility** | One savings cockpit: trapped capital, profit bleed, approve-to-task in under 60 seconds |

3D digital twin, Autopilot, and forecast cards are **proof** that supports these promises — not the reason you buy.

### Quantified outcomes (pilot targets)

| Metric | Target | Mechanism |
|--------|--------|-----------|
| Pick travel reduction | **−31%** per released wave | Route optimizer on layout coordinates `[BUILT]` |
| Operator adoption | Productive in **one shift** | Route-sorted PWA, large touch targets `[BUILT]` |
| Offline floor continuity | Pick/receive in no-network zones | Offline queue + sync on reconnect `[VISION]` pilot |
| Summer stockout prevention | Alert before days-of-cover = 0 | Heat forecast + approve-to-task `[BUILT]` |
| Trapped capital visibility | Dead/slow/excess on one card | Executive Control Tower `[BUILT]` |
| Time to live demo | **4 weeks** | POC sprint |

### HVAC-specific pains we address

- **Summer demand spikes** — compressor and coil stockout avoidance before peak season
- **Spare parts availability** — right SKU in right DC for technician response speed
- **Dead stock** — capacitors and controllers idle 90+ days; rebalance with net ₹ savings
- **Working capital recovery** — finance sees ₹ at risk; operations can act same day
- **Patchy plant connectivity** — offline-safe operator mode (pilot) vs RF guns that fail when Wi-Fi drops

---

## 2. Business Case & ROI Model

### 2.1 Savings waterfall

Venti surfaces cost optimizations across five organizational personas. The following waterfall aggregates typical annual benefit categories for an enterprise HVAC manufacturer with `[SKU COUNT]` SKUs and `[ANNUAL SHIPMENTS]` annual shipments.

```
Pick labor savings (−31% travel)
  + Dead stock holding cost avoided
  + Stockout / expedite freight avoided
  + Reverse leakage recovered
  + OTIF penalty / churn avoided
  + Manager time (Autopilot)
  ─────────────────────────────────
  = Total annual benefit
  − Venti subscription + implementation
  ─────────────────────────────────
  = Net benefit · Payback period
```

[IMAGE: DIAGRAM — Savings waterfall chart]
  File: docs/sales/assets/savings-waterfall.png

### 2.2 ROI worksheet (editable)

| Line item | Annual savings | Venti mechanism | Tag |
|-----------|----------------|-----------------|-----|
| Pick labor (−31% travel × `[__]` pickers × ₹/hr, incl. peak OT) | `[₹____]` | Route optimizer | `[BUILT]` |
| Summer stockout / expedite avoided (compressors, coils) | `[₹____]` | Heat forecast + Autopilot | `[BUILT]` |
| Dead stock holding cost avoided | `[₹____]` | Rebalance + capital-at-risk | `[BUILT]` |
| Technician SLA penalty avoided | `[₹____]` | Spare parts availability + maintenance alerts | `[BUILT]` |
| Reverse leakage recovered | `[₹____]` | Returns wizard + recovery yield | `[BUILT/POC]` |
| OTIF penalty / churn avoided | `[₹____]` | Bottleneck zones + wave optimization | `[BUILT]` |
| Rework from mis-picks reduced | `[₹____]` | Route-sorted PWA + first-pass accuracy | `[BUILT]` |
| **Total annual benefit** | **`[₹____]`** | | |
| Venti subscription + implementation | `[₹____]` | See Section 11 | |
| **Net annual benefit** | **`[₹____]`** | | |
| **Payback period** | **`[__ months]`** | | |

### 2.3 Cost of inaction

Without action, `[CLIENT NAME]` continues to bleed profit from invisible bottlenecks:

- **Profit bleed rate:** ₹`[X]`/hr from delayed inbound freight, idle high-holding stock, and delayed AMC services `[BUILT/POC]`
- **Trapped capital:** ₹`[X]` Cr in dead, slow-moving, and excess inventory `[BUILT]`
- **OTIF erosion:** Projected decline visible via EMA forecast before customers complain `[BUILT]`
- **Legacy WMS timeline:** 18–24 months before comparable intelligence is live with Manhattan or Blue Yonder

---

## 3. Use Case Catalog — Cost Optimizations & Hidden Insights

Venti's home dashboard serves five personas, each surfacing hidden money leaks that legacy WMS reports bury in spreadsheets.

### 3.1 Master savings map

| Cost lever | Hidden insight | Demo framing | Tag |
|------------|----------------|--------------|-----|
| Profit bleed | Cost-of-delay ticker with named bottleneck | ₹45.50/hr bleed rate | `[BUILT/POC]` |
| Pick labor waste | Naive vs optimized route on layout coordinates | −31% travel per wave | `[BUILT]` |
| Seasonal stockout | Extreme-heat forecast → days-of-cover → replenishment qty | Avoid lost sales + expedite | `[BUILT]` |
| Dead capital | 90+ day no-movement SKUs | ₹X across N SKUs | `[BUILT]` |
| Inventory capital at risk | Dead + slow + excess breakdown | ₹X Cr executive card | `[BUILT]` |
| Dead stock rebalance | Holding cost (6mo) − freight = net savings | Per-opportunity ₹ on approve | `[BUILT]` |
| Component failure drain | Replacement parts Pareto (YTD) | Top failure SKUs by ₹ | `[BUILT]` |
| Repeat failure pattern | Same SKU returned multiple times | Quality/supplier signal | `[BUILT]` |
| Repair vs replace | REFURBISH vs SCRAP vs RESTOCK mix | Higher repair = lower COGS | `[BUILT]` |
| AMC non-return exposure | Wholesale cores not returned | ₹X unreturned value | `[BUILT]` |
| Reverse value gap | Pending vs recovered per warehouse | Cash in returns pipeline | `[BUILT]` |
| Recovery opportunity | Repairable backlog asset value | ₹X recovery potential | `[BUILT]` |
| Recovery yield | % of return value recovered | Improve refurb rate | `[BUILT]` |
| OTIF erosion | 7-day trend + EMA forecast | Project before SLA miss | `[BUILT]` |
| Bottleneck zones | Highest avg task completion delay | Target labor reallocation | `[BUILT]` |
| FIFO non-compliance | Lots picked out of expiry order | Reduce write-offs | `[BUILT]` |
| High-value reverse aging | Expensive returns unprocessed | ₹X pending, N days avg | `[BUILT]` |
| Regional imbalance | Warehouse balance scores + transfer need | Right-stock-right-DC | `[BUILT]` |
| High-value concentration | Top components = X% of inventory | Supply risk | `[BUILT]` |
| First-pass accuracy | Pick/receive errors → rework | Labor + satisfaction | `[BUILT]` |
| Open task aging | Tasks stuck open | Floor productivity leak | `[BUILT]` |
| Predictive maintenance | Field failure estimate → pre-position parts | Avoid emergency ship | `[BUILT]` |
| Geospatial transit risk | In-transit + weather overlay | Proactive reroute | `[BUILT/POC]` |
| Landed cost ledger | PURCHASE, FREIGHT, HOLDING_COST, COGS | CFO visibility | `[BUILT]` |
| Autopilot savings | Rules auto-create tasks | Manager hours saved | `[BUILT]` |

### 3.2 Persona use case stories

#### Persona 1 — Warehouse Associate `[BUILT]`

- **Hidden leak:** Open tasks aging + low first-pass accuracy → rework loops
- **Venti insight:** Task aging KPI, first-pass accuracy %, reverse processing buckets (0–3d / 4–7d / 7+d)
- **Cost optimization:** Route-optimized pick lists in PWA → fewer mis-picks → less rework labor

#### Persona 2 — Control Lead `[BUILT]`

- **Hidden leak:** OTIF slipping; bottleneck zones invisible; FIFO violations
- **Venti insight:** OTIF % with sparkline, bottleneck zone chart, FIFO compliance %, high-value reverse aging ₹
- **Cost optimization:** Wave release + route optimizer → OTIF recovery; heat-wave alert prevents stockout

#### Persona 3 — Inventory & Quality Lead `[BUILT]`

- **Hidden leak:** Dead stock, repeat component failures, wrong repair/replace decisions
- **Venti insight:** Dead stock ₹, component failure Pareto, repeat failure rate, AMC return compliance, repair vs replace mix
- **Cost optimization:** Dead stock rebalance with net savings; shift disposition toward REFURBISH vs SCRAP

[IMAGE: SCREENSHOT — Component failure Pareto chart]
  File: docs/sales/assets/component-failure-pareto.png

#### Persona 4 — Regional Supply Chain Manager `[BUILT]`

- **Hidden leak:** Wrong DC has stock; AMC cores not returned; recovery backlog growing
- **Venti insight:** Transfer need units, warehouse balance scores, reverse value gap, AMC non-return exposure ₹
- **Cost optimization:** Approve cross-DC transfer insight; geospatial reroute on in-transit freight

#### Persona 5 — Executive (CFO / COO) `[BUILT]`

- **Hidden leak:** ₹X Cr inventory capital at risk; reverse leakage; component cost drain
- **Venti insight:** Capital-at-risk card, OTIF forecast, reverse leakage, recovery yield %, component cost drain top-10
- **Cost optimization:** One-screen board narrative — trapped capital + overnight Autopilot actions

### 3.3 Flagship story — HVAC summer spike

1. **Forecast** — Extreme heat → COMP-400A compressor at Hyderabad DC has 4 days cover `[BUILT]`
2. **Decide** — Control Tower shows stockout risk; manager approves replenishment `[BUILT]`
3. **Automate** — Autopilot creates replenishment task; low-stock rule fires `[BUILT]`
4. **Execute** — Summer spike wave released; route optimizer saves 31% picker travel `[BUILT]`
5. **Measure** — OTIF holds at 94%+; profit bleed ticker drops `[BUILT/POC]`
6. **Recover** — RMA inspection → RESTOCK → 3D bin turns green `[BUILT/POC]`

[IMAGE: STORYBOARD — 6-panel HVAC summer spike with ₹ callouts]
  File: docs/sales/assets/hvac-summer-storyboard.png

---

## 4. Understanding Your Operations

| Field | Value |
|-------|-------|
| Client name | `[CLIENT NAME]` |
| Industry | HVAC / industrial manufacturing |
| Distribution centers | `[WAREHOUSE COUNT]` |
| Active SKUs | `[SKU COUNT]` |
| Annual shipments | `[ANNUAL SHIPMENTS]` |
| Primary ERP | `[ERP SYSTEM — e.g. SAP B1, Tally]` |
| Current WMS | `[INCUMBENT — e.g. Manhattan, Blue Yonder, Excel]` |
| Peak season | `[e.g. March–June HVAC summer]` |
| Key pain points | `[STOCKOUTS / OTIF / DEAD STOCK / OPERATOR ADOPTION / COMPLIANCE]` |

---

## 5. Floor Execution — Operator PWA & Offline-Safe Mode

### 5.1 Built for low-skill operators `[BUILT]`

Indian HVAC plants depend on operators who cannot spend weeks learning RF gun menu trees. Venti's Operator PWA is designed for **one shift to productivity**:

- Install on standard Android tablet or iPad — no app store, no MDM project
- **Single-task screen:** scan → confirm qty → next bin (always route-sorted)
- Large touch targets · minimal text · barcode wedge or camera input
- Wrong SKU → visible error · correct SKU → progress advances
- Receive flow with putaway suggestion card

### 5.2 Offline-safe operation `[VISION]` — pilot deliverable

Many Indian warehouses have **dead zones** — mezzanine levels, metal racking, far corners — where Wi-Fi and RF signals drop during peak season. Legacy RF terminals stop; pickers revert to paper; savings disappear.

**Venti pilot includes offline-safe operator mode:**

| Capability | Description |
|------------|-------------|
| Local task queue | Assigned pick/receive lines cached on device |
| Offline scan confirm | Confirmations stored locally when no network |
| Sync on reconnect | Queue uploads automatically; conflicts flagged for supervisor |
| Degraded UX | Route order, bin code, SKU, qty — no admin functions required offline |

This is a primary differentiator vs Manhattan RF and Blue Yonder floor UX — positioned for **pilot Phase (Weeks 5–12)**, demo-ready narrative in POC.

### 5.3 Pick-path optimization `[BUILT]`

- TSP heuristic on real bin coordinates
- `naiveDistanceM` vs `optimizedDistanceM` with `savingsPercent` on every wave
- Multi-picker zone partition with cart assignment `[BUILT/POC]`

---

## 6. Leadership Visibility — Intelligence & Automation

*Supporting proof for Promise #3. Not the primary purchase driver.*

### 6.1 Predictive analytics `[BUILT]`

- **Demand forecasting** — SKU velocity, days-of-cover, extreme-heat scenario, suggested replenishment
- **Predictive maintenance** — field unit failure estimate, parts pre-positioning for technicians
- **Dead stock intelligence** — cross-DC rebalance; holding cost − freight = net savings
- **Geospatial risk** — in-transit transfers with weather overlay `[BUILT/POC]`

### 6.2 Financial control tower `[BUILT]`

- Cost-of-delay profit bleed ticker (₹/hr with bottleneck identification)
- Capital & Cost Ledger — PURCHASE, FREIGHT, HOLDING_COST, COGS, INVENTORY_GAIN, RTV_CREDIT
- Inventory capital at risk — dead, slow-moving, excess stock breakdown
- Component cost drain Pareto — top replacement parts by annual ₹

### 6.3 Autopilot rules engine `[BUILT]`

| Rule | Trigger | Action |
|------|---------|--------|
| Low-stock replenish | SKU below minimum threshold | Create replenishment task |
| Wave auto-release | Configured daily time | Release pending pick waves |
| Dead-stock rebalance | Dead stock above threshold | Suggest cross-DC transfer |

### 6.4 AI executive briefing `[VISION]`

- LLM-generated morning summary from live KPIs (CFO follow-up; not POC headline)

---

## 7. Proposed Solution — Module Scope

| Module | Capability | Tag |
|--------|------------|-----|
| **Operator PWA** | Pick, receive, scan — route-sorted, low-skill UX | `[BUILT]` |
| **Offline-safe mode** | Local queue, offline confirm, sync on reconnect | `[VISION]` pilot |
| **Route optimizer** | −31% travel proof on every wave | `[BUILT]` |
| **Control Tower** | 5-persona dashboard, capital at risk, summer alerts | `[BUILT]` |
| **Analytics** | Predictive alerts, financial ledger, cost-of-delay | `[BUILT]` |
| **Autopilot** | Rules engine, execution queue | `[BUILT]` |
| **Warehouse** | 2D layout, 3D twin (supervisor proof) | `[BUILT]` |
| **Orders** | Inbound, outbound, transfer, manifest, fulfill | `[BUILT]` |
| **Returns** | RMA wizard, disposition, recovery yield | `[BUILT/POC]` |
| **Integrations** | SAP B1, Tally, Shopify | `[VISION]` Phase 2 |

---

## 8. Competitive Differentiation — A Buyer Decision

Manhattan and Blue Yonder are mature, capable systems. They win when **deep SAP/Oracle EDI on day one** matters more than **live before next summer**. Venti wins when the priority is floor adoption, measured savings, and HVAC-specific execution in Indian plants.

### 8.1 When to choose Venti

| Your priority | Venti | Typical legacy path |
|---------------|-------|---------------------|
| **Live before peak season** | 4-week POC | 12–24 month SI project |
| **Low-skill operator adoption** | Simple tablet PWA, one-shift training | RF gun + multi-day certification |
| **Floor works in dead zones** | Offline-safe operator mode (pilot) | RF stops when Wi-Fi drops |
| **Measured pick savings** | −31% on every wave, stored in system | Separate labor-management project |
| **Summer stockout prevention** | Heat forecast → approve → task | Manual safety-stock spreadsheets |
| **CFO sees trapped capital** | ₹ at risk on one executive card | Month-end inventory reports |
| **India data posture** | DPDP, audit trail, Mumbai residency by design | Compliance as SI add-on |

### 8.2 When Manhattan / Blue Yonder may fit better

- Multi-year global rollout with existing SAP/Oracle investment and dedicated SI budget
- Requirement for mature yard management, 3PL billing, or certified ISO 27001 on day one
- Organization can wait 18+ months before operators change workflow

### 8.3 Comparison table (reference)

| Dimension | Venti WMS | Manhattan Associates | Blue Yonder |
|-----------|-----------|---------------------|-------------|
| **Time to value** | POC 4 weeks; pilot 8–12 weeks | 12–24 month rollout | 12–18+ months |
| **Operator UX** | Tablet PWA + offline pilot | RF terminal | RF terminal |
| **Pick optimization** | Built-in −31% proof | Labor module + SI | Slotting + SI |
| **Summer demand alerts** | Native approve-to-task | Config + SI | Luminate (separate) |
| **Executive savings view** | One Control Tower login | WMi + reports | Luminate (separate) |
| **ERP integration** | Phase 2 (SAP B1, Tally) | Deep SAP/Oracle | Deep ERP/EDI |
| **India compliance** | DPDP by design | Client-driven | SI engagement |

[IMAGE: COMPARISON — Buyer decision matrix]
  File: docs/sales/assets/comparison-blueyonder-manhattan.png

### 8.4 Gaps (discuss if asked)

ERP connectors, yard management, and ISO 27001 certification are Phase 2. Not POC blockers for plants prioritizing **floor execution + summer stock + trapped capital**.

---

## 9. Technical Architecture

### 9.1 Platform overview

- **Deployment:** Multi-tenant cloud SaaS
- **Application:** Next.js web app + Operator PWA (`/operator`)
- **API:** Type-safe ORPC procedures with organization-scoped access
- **Database:** PostgreSQL via Prisma — full WMS domain model
- **3D rendering:** Three.js digital twin from layout coordinates
- **Route engine:** TSP heuristic package (`packages/utils/lib/route-optimizer`)

[IMAGE: DIAGRAM — Control Tower → API → 3D Twin + PWA + PostgreSQL]
  File: docs/sales/assets/architecture-diagram.png

### 9.2 Security & compliance

| Control | Implementation |
|---------|----------------|
| Authentication | Session-based auth with organization membership |
| Authorization | RBAC via role groups; warehouse-scoped permissions |
| Encryption | TLS in transit; secrets via environment variables |
| Audit trail | `AuditLog` — user, action, timestamp, IP, user agent |
| Data residency | Production target: **ap-south-1 (Mumbai)** |
| DPDP | Access, erasure, correction, grievance workflows (see Section 14) |
| Privacy policy | `/legal/privacy-policy` |

Reference: `docs/compliance-poc.md`

---

## 10. Implementation Plan

### Phase 1 — POC (Weeks 1–4)

| Week | Deliverable |
|------|-------------|
| 1 | Layout import, 3D twin with heatmap, API alignment, PWA scaffold |
| 2 | Route optimizer wired to fulfill flow; −31% metrics on wave release |
| 3 | AI insights grounded in SQL; Autopilot rules; Control Tower live |
| 4 | Operator pick/receive flows; golden demo script; executive readout |

**POC success criteria:**

| # | Belief | Proof |
|---|--------|-------|
| 1 | Venti works on your floor | Operator PWA pick/receive on tablet |
| 2 | Pick savings are measurable | −31% travel on released wave |
| 3 | Summer stock is protected | Heat alert → approve → task |
| 4 | CFO sees trapped capital | Executive capital-at-risk card |
| 5 | Leadership can act fast | Approve-to-task < 60 seconds |
| 6 | Enterprise-ready for India | RBAC, audit logs, DPDP posture |

### Phase 2 — Pilot (Weeks 5–12)

- Live warehouse with production SKU master
- Operator rollout on tablets (pick + receive)
- **Offline-safe operator mode** — local queue, sync on reconnect
- ERP interface specification (SAP B1 / Tally)
- Autopilot rule tuning for client thresholds
- Dead stock and demand insight calibration

### Phase 3 — Production (Month 4+)

- Multi-DC rollout
- Integration Hub connectors (per roadmap)
- AGV / WCS protocol bridge (MQTT, VDA 5050)
- ISO 27001 certification path (if required)

[IMAGE: TIMELINE — 4-week POC vs 18-month legacy]
  File: docs/sales/assets/timeline-poc-vs-legacy.png

---

## 11. Investment

| Tier | Scope | Annual / one-time |
|------|-------|-------------------|
| **POC** | 1 warehouse, 4-week sprint, demo + executive readout | `[₹____]` one-time |
| **Pilot** | 1 live DC, operators, ERP spec, 8–12 weeks | `[₹____]` / year |
| **Enterprise** | Multi-DC, integrations, dedicated CSM | `[₹____]` / year |

**Included in all tiers:** Operator PWA, route optimizer (−31% proof), Control Tower, summer stockout alerts, Autopilot, audit logs, RBAC.

**Pilot tier adds:** Offline-safe floor mode, live SKU master, operator rollout.

**Optional add-ons:**
- Additional distribution center: `[₹____]` / DC / year
- Integration connector (SAP B1, Tally): `[₹____]` one-time + `[₹____]` / year maintenance
- Custom ML model training: `[₹____]` (pilot phase)

*Pricing to be finalized upon discovery call.*

---

## 12. Intelligence Roadmap Appendix

Near-term capabilities presented in sales conversations. Target phases are indicative.

| Feature | Sales headline | Target phase | Tag |
|---------|----------------|--------------|-----|
| Offline-safe PWA | Pick/receive in dead zones; sync on reconnect | **Pilot W5–12** | `[VISION]` |
| Demand ML Models | Seasonal & weather-aware SKU forecasting | Pilot Q2 | `[VISION]` |
| Dynamic Slotting AI | Bins that reorganize before you ask | Production Q3 | `[VISION]` |
| Labor Forecasting | Predict tomorrow's picker headcount | Production Q3 | `[VISION]` |
| Carbon & ESG Dashboard | Pick-path emissions savings | Production Q3 | `[VISION]` |
| Supplier Risk Scoring | ASN delay prediction | Production Q3 | `[VISION]` |
| Voice-Activated Ops | "Hey Venti, release Zone B wave" | Production Q4 | `[VISION]` |
| Digital Twin What-If | Simulate layout change before moving a rack | Production Q3 | `[VISION]` |
| Customer OTIF Promise Engine | Know SLA misses 48h early | Production Q3 | `[VISION]` |
| Anomaly Detection | Shrinkage & miscount alerts | Production Q3 | `[VISION]` |
| Smart Replenishment Network | Multi-DC auto-balancing | Production Q3 | `[VISION]` |
| Integration Hub | SAP · Tally · Shopify | Pilot Q2–Q3 | `[VISION]` |

---

## 13. Assumptions & Dependencies

### Client provides

- Warehouse layout data (CAD, Excel, or walkthrough for 2D editor import)
- SKU master and product hierarchy export
- Sample order history (inbound + outbound) for seed calibration
- ERP interface specification and IT contact
- Named executive sponsor and warehouse manager for POC
- iPad or Android tablet for operator PWA testing

### Sashflow provides

- Venti cloud environment (POC tenant)
- Seed data script or import from client master
- 4-week POC sprint with weekly check-ins
- Golden demo script and executive readout
- ROI worksheet completion support

### Out of scope (POC)

- Production ERP / EDI connectors
- Real AGV / WCS protocols (MQTT, VDA 5050)
- ML model training pipelines
- Full allocation / reservation engine
- Native iOS / Android apps
- ISO 27001 certification or penetration test
- Multi-region deployment
- 3PL billing, yard management

---

## 14. Compliance & Data Protection

### DPDP — data principal rights

| Right | Handling |
|-------|----------|
| Access | Export request UI; documented access workflow |
| Erasure | Settings contact + manual erasure request workflow |
| Correction | Profile and master data edit in admin UI |
| Grievance | Privacy policy link in organization settings |

### Audit trail

- All approvals, dispositions, imports, and deletes logged
- Query API at `/app/audit-logs` with organization scope
- IP address and user agent captured where available

### Data residency

- Production target: **ap-south-1 (Mumbai)** for India enterprise deployments
- POC/demo environments may run in other regions — disclosed in contract

### ISO 27001

- Documented RBAC, audit logging, and change control via git
- Formal ISMS certification is post-POC

---

## 15. Terms & Next Steps

### Proposed next steps

| Step | Owner | Target date |
|------|-------|-------------|
| Discovery call (60 min) | Both | `[DATE]` |
| NDA / DPA execution (if required) | Legal | `[DATE]` |
| POC SOW signature | Both | `[DATE]` |
| POC kickoff — layout + SKU import | Sashflow + Client IT | Week 1 |
| Executive readout — live demo + ROI | Both | Week 4 |
| Pilot go/no-go decision | Client executive sponsor | `[DATE]` |

### Acceptance

| | |
|---|---|
| **Client** | |
| Name | `[NAME]` |
| Title | `[TITLE]` |
| Signature | _________________________ |
| Date | `[DATE]` |
| **Sashflow** | |
| Name | `[SALES NAME]` |
| Title | `[TITLE]` |
| Signature | _________________________ |
| Date | `[DATE]` |

### Contact

**Sashflow**  
Email: `[EMAIL]`  
Phone: `[PHONE]`  
Web: sashflow.com

**Team**

| Name | Role |
|------|------|
| Sai Yalla | Co-Founder & CEO |
| Sandip Patel | Co-Founder & CPO |
| Shipra Goyal | Co-Founder & CFO |
| Sahil | Co-Founder |

---

*This proposal is confidential and intended solely for `[CLIENT NAME]`. © `[YEAR]` Sashflow. All rights reserved.*
