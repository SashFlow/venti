# DIKEN HVAC WMS — Revised Implementation Plan (V3)
## Gap Analysis + Full Revised Plan

---

## Gap Analysis vs. Original Plan

The following were **completely absent** from the original plan:

| Category | Missing Items |
|---|---|
| **Storage** | Mezzanine floor, pallet locator (forklift-friendly), ground/mezzanine routing by weight class |
| **Replenishment** | MTO for non-stocked items, seasonal surge (buildup/peak/drawdown), weather-informed demand triggers, dual production model (seasonal prebuild vs. JIT), multi-tier DC network (National → Regional → Local) |
| **Picking** | 1/2/3-step receiving & shipping workflows, wave picking (by zone/product/location), batch picking, FIFO/FEFO/date-based dispatch control |
| **Products** | 2,000+ SKU variants per brand, full product hierarchy (Model→Variant→Capacity→Star rating→Region→Component type), attribute-based lookup |
| **Traceability** | Expiration date tracking, manufacturing-date FIFO for warranty, refrigerant compliance (gas cylinders, regulatory, storage) |
| **Reverse Supply Chain** | SRN with reason coding + condition assessment + credit note, DOA/commercial return categories, defective hold zones, inspect/repair/refurbish/scrap workflows, scrap & salvage (compressors, PCBs, copper), vendor returns + supplier debit notes |
| **Valuation** | Landed cost allocation (freight, insurance, customs), cost-per-unit with margin visibility |
| **QC** | QC hold zones, inbound sampling inspection, accept/reject/conditional accept, consignment stock (supplier-owned) |
| **UoM & Forecasting** | Bulk/pack/unit conversions, delivery forecasting (lead time + logistics + production), weather/temperature-based demand signals, dispatch prioritization |
| **ASP Channel** | Authorized Service Provider inventory, consignment tracking per ASP, min stock enforcement + auto-replenishment from central warehouse |
| **Dead Stock** | Automated slow/non-moving flagging, aging analysis, liquidation (write-off + clearance) workflows |

---

## Revised Data Model

### Storage Hierarchy

```
Warehouse
  └── WarehouseLevel          — ground_floor | mezzanine | basement | roof
        └── WarehouseZone     — zone within a level (Bulk, Racking A, Returns, QC Hold, Consignment)
              └── WarehouseAisle
                    └── WarehouseRack / PalletBay
                          └── WarehouseBin  — individual pick location (barcode-addressable)
                                            — type: bin | pallet_slot | mezzanine_shelf
```

**Level routing rule:** Products flagged `heavyItem: true` → ground floor pallet bays. All others → mezzanine shelving. Enforced at put-away.

### Product Master

```
ProductFamily            — top-level family (Split AC, Cassette, Chiller, VRF, Ductless, Parts)
  └── ProductModel       — model name + manufacturer
        └── Product      — base product (SKU, description, category, brand)
              └── ProductVariant
                    — capacity (kW / BTU)
                    — star_rating
                    — region (single-phase, three-phase, climate zone)
                    — refrigerant_type (R32, R410A, R22)
                    — component_type (for parts: compressor, PCB, coil, valve, etc.)
                    — weight_class: light | heavy   ← drives mezzanine vs. ground routing
                    — unit_of_measure + alternate UoMs (unit, pack, pallet)
                    — storage_conditions
                    — is_refrigerant: bool
                    — is_serialized: bool
                    — is_batch_tracked: bool
                    — has_expiry: bool
                    — reorder_type: min_max | mto | seasonal

ProductAttribute         — flexible key-value pairs (EER, SEER, noise_db, pipe_diameter, etc.)
UnitOfMeasure            — unit definitions (EA, PACK, PALLET, KG, L, CYLINDER)
UoMConversion            — conversion ratios between UoMs per product
```

### Inventory & Locations

```
StockLevel               — product × bin × warehouse_level, qty on-hand, reserved, available
StockLedger              — immutable movement log (every in/out with reason, ref, cost, user, timestamp)
SerialNumber             — item-level tracking (serial, mfg_date, warranty_expiry, status, location)
BatchLot                 — batch tracking (lot_number, mfg_date, expiry_date, supplier, qty)
PalletRecord             — pallet ID, content, weight, location, forklift_required, mfg_date (FIFO key)
RefrigerantRecord        — cylinder_id, gas_type, gross_weight, tare_weight, fill_date, status, location
ConsignmentStock         — supplier-owned stock (supplier, product, qty, location, terms)
```

### Replenishment & Planning

```
ReplenishmentRule        — per product × location:
                           — type: min_max | mto | seasonal | multi_tier
                           — min_qty, max_qty, reorder_point, reorder_qty
                           — lead_time_days
                           — preferred_supplier

SeasonalDemandPlan       — product, year, phase (pre_season | peak | post_season), target_qty, dates
WeatherDemandSignal      — region, temperature_threshold, signal_type, adjustment_factor, active
DistributionTier         — NATIONAL_DC | REGIONAL_DC | LOCAL_DC — relationships between warehouses
TierReplenishmentRule    — triggers for upstream warehouse to push to downstream
```

### Procurement & Receiving

```
PurchaseOrder            — PO header (supplier, warehouse, type: standard | MTO | replenishment, status)
PurchaseOrderLine        — product, qty, UoM, unit_cost, landed_cost_allocation
LandedCost               — PO-level: freight, insurance, customs, other — allocated by weight/value/qty
GoodsReceiptNote (GRN)   — receiving event against PO
GRNLine                  — product, expected_qty, received_qty, accepted_qty, rejected_qty, qc_status
QCInspection             — GRN → sampling plan, pass/fail, accept | reject | conditional_accept
InboundQCHold            — hold record linking product qty to QC_HOLD zone

ReceivingWorkflow        — type: ONE_STEP | TWO_STEP | THREE_STEP
                           1-step: receive + putaway in one action
                           2-step: receive to dock → putaway separately
                           3-step: receive → QC → putaway
```

### Picking, Packing, Dispatch

```
PickingWave              — group of pick jobs (criteria: zone | product_type | destination | time)
BatchPick                — multiple orders grouped into one picker run
PickJob                  — individual pick assignment (picker, bin sequence, status)
PickJobLine              — product, bin, qty_to_pick, qty_picked, exception_reason
PackingSlip              — linked to fulfilled pick job
DispatchRule             — per product/category: FIFO | FEFO | DATE_BASED | LIFO
ShipmentWorkflow         — ONE_STEP | TWO_STEP | THREE_STEP (mirror of receiving)
```

### Reverse Supply Chain

```
SalesReturnNote (SRN)    — return header (customer, order_ref, return_date, reason_code)
SRNLine                  — product, serial/lot, qty, reason_code, condition: good | defective | doa | damaged
ReturnCategory           — WARRANTY | DOA | COMMERCIAL | DEFECTIVE
DefectiveHoldRecord      — links SRN line to hold zone; status: pending_inspection | repair | refurbish | scrap
InspectionRecord         — inspector, findings, decision: repair | refurbish | scrap | return_to_stock | return_to_vendor
ScrapRecord              — scrapped qty, salvaged components (compressor, PCB, copper_tubing, refrigerant recovered)
VendorReturn             — supplier debit note (supplier, product, qty, reason, debit_note_ref, status)
CreditNote               — generated from SRN (customer credit, linked to SRN)
WarrantyRecord           — serial_number, mfg_date, sale_date, warranty_end, claim_history
```

### Valuation & Costing

```
CostLayer                — FIFO/AVCO cost layers per product
ProductCost              — current cost_per_unit, landed_cost, margin
InventoryValuationLedger — periodic snapshots for financial reporting
```

### QC, Adjustments, Dead Stock

```
StockAdjustment          — reason, qty, cost_impact, approval_status, approver
CycleCount               — scheduled, in_progress, completed — per zone/bin
CycleCountLine           — expected_qty, counted_qty, variance, disposition
DeadStockFlag            — product, warehouse, flagged_date, days_no_movement, aging_bucket (30/60/90/180+)
LiquidationWorkflow      — type: write_off | clearance_sale | return_to_supplier — status, approval
```

### Service Parts & ASP Channel

```
AuthorizedServiceProvider — ASP name, region, contact, consignment_terms
ASPInventory             — ASP, product, qty_on_consignment, min_stock_level, last_replenishment
ASPReplenishmentTrigger  — auto-trigger from central warehouse when ASP drops below min
```

### Work Orders & Last Mile

```
WorkOrder                — field job (technician, customer, site, equipment, type: install | service | delivery)
WorkOrderPart            — parts pre-staged, consumed, returned
DeliveryRoute            — route with stops, technician vehicle stock
InstallationRecord       — equipment installed (serial), installation date, commissioning notes
```

---

## Revised MVP Feature Set (All Non-Negotiable)

### Feature Group 1 — Inventory Control & Replenishment
- [ ] Min/max rules per SKU × bin × warehouse with auto-PO/manufacturing order trigger
- [ ] MTO: non-stocked items trigger supplier/production order on customer demand capture
- [ ] Seasonal planning: pre-season buildup targets, peak dispatch velocity config, post-season drawdown
- [ ] Weather/temperature demand signal integration (configurable threshold → adjustment factor)
- [ ] Dual production mode toggle: seasonal-prebuild vs. JIT/linear
- [ ] Multi-tier replenishment: National DC → Regional DC → Local DC push/pull rules

### Feature Group 2 — Storage & Location Management
- [ ] Warehouse level management: ground floor + mezzanine (extensible to more)
- [ ] Weight-class routing: heavy items → ground floor pallet bays; light items → mezzanine shelving
- [ ] Bin locator: structured addressing (Zone-Aisle-Rack-Level-Bin), barcode-driven
- [ ] Pallet locator: pallet-slot locations, forklift flag, FIFO by manufacturing date
- [ ] Mezzanine management: separate pick routes, weight/access restrictions enforced
- [ ] Inter-warehouse transfers with full ledger tracking (in-transit as a location)
- [ ] Automated warehouse resupply (downstream warehouse triggers upstream pull)
- [ ] 1-step / 2-step / 3-step receiving and shipping workflows (configurable per warehouse)

### Feature Group 3 — Picking, Packing, Dispatch, Delivery
- [ ] Batch picking: group multiple orders into a single pick run
- [ ] Wave picking: group by zone, product type, or location
- [ ] FIFO enforcement at dispatch (by manufacturing date for HVAC units)
- [ ] FEFO enforcement for items with expiry dates (refrigerants, lubricants)
- [ ] Date-based dispatch prioritization
- [ ] Last-mile: technician vehicle assignment, delivery + installation combined workflow
- [ ] Installation tracking with commissioning record and serial capture at site

### Feature Group 4 — SKU & Product Master
- [ ] Full product hierarchy: Family → Model → Product → Variant
- [ ] Attributes: capacity, star rating, refrigerant type, region, component type, EER, SEER, pipe diameter, etc.
- [ ] Attribute-based search and filtering (faceted search)
- [ ] Support 2,000+ variants per brand with no performance degradation
- [ ] UoM management: EA, PACK, PALLET, CYLINDER — with conversion ratios

### Feature Group 5 — Traceability, Compliance, Warranty
- [ ] Lot/batch tracking with manufacturing date and expiry
- [ ] Serial-level tracking (individual units from receipt to delivery to installation site)
- [ ] Manufacturing date FIFO enforced in dispatch
- [ ] Refrigerant compliance module: cylinder tracking (ID, gas type, weight, fill date), storage compliance, regulatory audit log
- [ ] Warranty record linked to serial + manufacturing date + sale
- [ ] Warranty return linked back through chain to original lot/serial

### Feature Group 6 — Reverse Supply Chain
- [ ] Sales Return Note (SRN): reason codes, condition assessment, linked to original order + serial/lot
- [ ] Return categories: WARRANTY, DOA, COMMERCIAL, DEFECTIVE
- [ ] Automatic credit note generation from approved SRN
- [ ] Defective unit routing: auto-hold zone assignment, inspection workflow (repair | refurbish | scrap)
- [ ] Scrap & salvage: log recoverable components (compressor, PCB, copper, refrigerant gas recovered)
- [ ] Vendor return: raise supplier debit note, track resolution, update inventory and AP

### Feature Group 7 — Inventory Valuation & Costing
- [ ] Landed cost allocation per PO: freight, insurance, customs, other — split by qty / weight / value
- [ ] Cost-per-unit updated on every GRN with landed costs included
- [ ] FIFO cost layers maintained
- [ ] Margin visibility per product (cost vs. selling price)
- [ ] Inventory valuation snapshot for month-end financial reporting

### Feature Group 8 — QC, Adjustments, Hygiene
- [ ] Inbound QC: sampling plan, accept / reject / conditional accept per GRN
- [ ] QC hold zone: stock quarantined pending inspection
- [ ] Cycle count: continuous, zone-by-zone, non-disruptive to live operations
- [ ] Stock adjustment with reason code, approval gate, cost impact
- [ ] Scrapping workflow with write-off record
- [ ] Consignment stock: tracked separately (supplier-owned, not on balance sheet until consumed)

### Feature Group 9 — UoM, Forecasting, Demand Signals
- [ ] UoM conversions throughout (receive in pallets, sell in units, report in both)
- [ ] Delivery forecasting engine: supplier lead time + production time + logistics time = expected arrival
- [ ] Weather-integrated demand: temperature-threshold rules per region trigger demand signal
- [ ] Dispatch prioritization queue (high-demand products move to front)

### Feature Group 10 — Service Parts & ASP Channel
- [ ] ASP (Authorized Service Provider) registry
- [ ] Consignment stock per ASP with movement tracking
- [ ] Minimum stock enforcement per ASP — alert + auto-replenishment from central warehouse
- [ ] ASP-specific product lists (not all SKUs visible to all ASPs)

### Feature Group 11 — Dead Stock Management
- [ ] Automated aging analysis: flag at 30/60/90/180+ days no movement
- [ ] Slow-mover vs. non-mover classification
- [ ] Liquidation workflow: write-off approval | clearance sale discount | return to supplier
- [ ] Dead stock dashboard with financial exposure value

---

## Revised Data Model Sprint Breakdown

| Sprint | Data Models | Focus |
|---|---|---|
| **1** | Warehouse, WarehouseLevel, WarehouseZone, WarehouseAisle, WarehouseBin, WarehouseBinType | Storage hierarchy with mezzanine |
| **2** | ProductFamily, ProductModel, Product, ProductVariant, ProductAttribute, UoM, UoMConversion | Full product master (2k+ variant ready) |
| **3** | StockLevel, StockLedger, PalletRecord, ConsignmentStock | Inventory core + pallet tracking |
| **4** | BatchLot, SerialNumber, RefrigerantRecord, WarrantyRecord | Traceability stack |
| **5** | ReplenishmentRule, SeasonalDemandPlan, WeatherDemandSignal, DistributionTier | Replenishment & planning models |
| **6** | PurchaseOrder, POLine, LandedCost, GRN, GRNLine, ReceivingWorkflow | Procurement + receiving |
| **7** | QCInspection, InboundQCHold, StockAdjustment, CycleCount, CycleCountLine | QC & hygiene |
| **8** | PickingWave, BatchPick, PickJob, PickJobLine, PackingSlip, DispatchRule, ShipmentWorkflow | Picking & dispatch |
| **9** | SalesReturnNote, SRNLine, DefectiveHoldRecord, InspectionRecord, ScrapRecord, VendorReturn, CreditNote | Reverse supply chain |
| **10** | CostLayer, ProductCost, InventoryValuationLedger | Costing & valuation |
| **11** | DeadStockFlag, LiquidationWorkflow, ASP, ASPInventory, ASPReplenishmentTrigger | Dead stock + ASP channel |
| **12** | WorkOrder, WorkOrderPart, DeliveryRoute, InstallationRecord | Last-mile + field service |

---

## Revised Build Sequence (UI + API)

| Sprint | Deliverable |
|---|---|
| **13** | Warehouse setup UI: levels, zones, aisles, bins — visual map with mezzanine/ground floor toggle |
| **14** | Product catalog: hierarchy browser, attribute filter, 2k+ SKU search (faceted, fast) |
| **15** | 3-step receiving workflow + GRN + inbound QC + pallet/bin put-away routing by weight class |
| **16** | Replenishment rules UI: min/max, MTO toggle, seasonal plan editor, weather signal config |
| **17** | Multi-tier DC dashboard: stock visibility across National/Regional/Local, push/pull controls |
| **18** | Wave & batch picking UI: wave builder, batch assignment, mobile picker screen (scan-optimized) |
| **19** | FIFO/FEFO dispatch enforcement: picking order logic, manufacturing date visibility on pick screen |
| **20** | Landed cost allocation: PO cost entry, allocation method selector, cost-per-unit propagation |
| **21** | Reverse supply chain: SRN creation, return routing, defective hold zone, inspection workflow |
| **22** | Scrap & salvage, vendor return, credit note, supplier debit note |
| **23** | Refrigerant compliance module: cylinder registry, movement log, regulatory report |
| **24** | ASP channel: ASP registry, consignment tracking, min stock alerts, auto-replenishment |
| **25** | Dead stock dashboard: aging buckets, slow/non-mover flags, liquidation workflow |
| **26** | Forecasting engine: lead-time calculator, weather demand signal dashboard, dispatch priority queue |
| **27** | Inventory valuation: FIFO cost layers, month-end snapshot, margin visibility by product |
| **28** | Role-aware onboarding wizards (all 8 roles, revised to match full feature set) |
| **29** | Director/owner KPI dashboard: stock value, margin, ASP health, dead stock exposure, demand signals |
| **30** | UAT with DIKEN — floor staff, supervisors, procurement, finance, ASP coordinators |

---

## User Workflows — Revised (Key Changes)

### Warehouse Staff — Receiving (Now 3-Step)
1. Dock arrival scan → GRN opened against PO
2. **Step 1 — Receive to dock:** Count and confirm each line, flag short/damaged, generate QC hold for flagged items
3. **Step 2 — QC inspection:** QC hold items sampled, accept/reject/conditional recorded
4. **Step 3 — Put-away:** System assigns bin based on product weight class (heavy → ground floor pallet bay, light → mezzanine shelf). Barcode-guided route. Pallet items: forklift flag shown, manufacturing date captured for FIFO.

### Warehouse Supervisor — Wave Picking Setup
1. Open order queue for the day
2. Create wave: select orders, group by zone or product type (e.g., all outdoor units together, all filters together)
3. Assign wave to picker team
4. Monitor wave completion in real time
5. Exception management: short picks, substitutions, backorders

### Procurement Manager — Multi-Tier Replenishment
1. Regional DC dashboard shows stock below threshold
2. System auto-suggests pull from National DC
3. Procurement approves or adjusts quantities
4. Transfer order raised, in-transit stock shown on ledger
5. Local DC receives and confirms

### Finance — Landed Cost Flow
1. GRN completed → PO cost posted without freight
2. Freight/customs invoice arrives → landed cost entry against PO
3. System reallocates cost to all lines (by qty / weight / value — configurable)
4. Cost-per-unit updated across stock layers
5. Month-end: inventory valuation snapshot generated, pushed to finance export

### Returns Coordinator — SRN Flow
1. Customer contacts with return request
2. SRN raised: link to original order, select product(s), enter reason code + condition
3. System determines routing: good condition → return to stock; defective/DOA → hold zone
4. Inspection record completed: repair | refurbish | scrap
5. Scrap: salvageable components logged (compressor recovered, copper recovered, gas reclaimed)
6. Credit note auto-generated for approved return, linked to customer AR

---

## What This Means for Timeline

The original 12-sprint plan was scoped for ~40% of what V3 requires. The revised plan is **30 sprints** (including UAT). Depending on team size:

- **2 developers:** ~15 months
- **3 developers:** ~10 months
- **4 developers (2 pairs, parallel sprints):** ~7–8 months

The recommended approach is to build in **two tracks in parallel once the data models are complete (after Sprint 12):**
- Track A: Warehouse operations (receiving, picking, dispatch, returns)
- Track B: Commercial + financial (procurement, valuation, ASP, forecasting)

---

Ready to start on Sprint 1 (storage hierarchy with mezzanine) or Sprint 2 (product master)? The data models are the critical path — everything else depends on them.

Made changes.