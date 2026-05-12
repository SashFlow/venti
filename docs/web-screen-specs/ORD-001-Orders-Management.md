# ORD-001: Orders Management — User Guide

## Overview

The Orders module is the operational hub for all inbound, outbound, fulfillment, and transfer activity in the warehouse. It is accessible at **`/app/orders`** and is organized into five tabs.

| Tab | Order Type | Description |
|-----|-----------|-------------|
| **Inbound** | Purchase Orders (PO) | Goods arriving from suppliers |
| **Outbound** | Sales Orders (SO) | Goods leaving for customers |
| **Transfer** | Inventory Movements | Internal stock movements between bins/zones |
| **Manifest** | Shipments | Carrier manifests and dispatch tracking |
| **Fulfill** | Waves & Shipments | Pick-and-pack fulfillment batches |

---

## Tab: Inbound (Purchase Orders)

### Creating a Purchase Order

1. Click **Create** (top-right) or navigate to `/app/orders/inbound/new`.
2. Fill in the required fields:
   - **PO Number** — Your unique reference (e.g. `PO-2026-001`).
   - **Warehouse** — Which warehouse will receive this stock.
   - **Supplier** — The vendor sending the goods.
   - **Expected Delivery Date** *(optional)* — When you expect the shipment.
   - **Notes** *(optional)* — Internal notes.
3. Add **Line Items**:
   - Select a **SKU** from the product catalog.
   - Enter **Qty** (required) and **Unit Cost** (optional).
   - Optionally set a per-line **Expected Date**.
   - Click **Add Line** to add more lines. At least one line is required.
4. Click **Create Purchase Order**. You will be taken to the PO detail page.

### Viewing a Purchase Order

Click any row in the Inbound table to open the detail page at `/app/orders/inbound/{id}`.

The detail page shows:
- Order status, supplier, warehouse, dates, and who created/approved it.
- A summary with total lines, ordered qty, received qty, and estimated cost.
- A full line items table with SKU, UOM, ordered qty, received qty, unit cost, and per-line status.

### Purchase Order Statuses

| Status | Meaning |
|--------|---------|
| `DRAFT` | Created but not yet submitted |
| `PENDING` | Awaiting approval |
| `APPROVED` | Approved — ready to receive |
| `RECEIVING` | Receiving in progress (ASN active) |
| `RECEIVED` | All lines fully received |
| `CLOSED` | Administratively closed |
| `CANCELLED` | Order was cancelled |

---

## Tab: Outbound (Sales Orders)

### Creating a Sales Order

1. Click **Create** (top-right) or navigate to `/app/orders/outbound/new`.
2. Fill in the required fields:
   - **Order Number** — Your unique reference (e.g. `SO-2026-001`).
   - **Warehouse** — Which warehouse fulfills this order.
   - **Priority** — `CRITICAL`, `HIGH`, `NORMAL` (default), or `LOW`.
3. Optionally fill in:
   - **Customer** — Select from the customer master.
   - **Customer Name / Email / Reference** — Can be typed manually.
   - **Requested Ship Date** / **Required By Date** — SLA dates.
   - **Notes**.
4. Add **Line Items** with SKU, Qty, and optional Unit Price.
5. Click **Create Sales Order**.

### Marking Orders as Shipped

- **Single order**: Click the **Ship** button on the row in the Outbound table.
- **Bulk**: Check multiple rows and click **Ship Selected** (top-right).

Orders in status `FULLY_SHIPPED`, `CANCELLED`, or `CLOSED` cannot be shipped again.

### Fulfill Button

Click **Fulfill** in the Outbound tab to go directly to the Wave creation form, where you can batch selected sales orders into a pick wave.

### Viewing a Sales Order

Click any row to open the detail page at `/app/orders/outbound/{id}`.

The detail page shows:
- Order info: warehouse, customer, dates, priority.
- Summary: total lines, ordered/allocated/picked/shipped quantities, estimated order value.
- Line items table with full pick/ship status per SKU.

---

## Tab: Transfer (Inventory Movements)

### Creating a Transfer

1. Click **Create Transfer** or navigate to `/app/orders/transfers/new`.
2. Fill in:
   - **Warehouse** *(required)* — Where the movement occurs.
   - **Reference Number** *(optional)* — e.g. `TRF-2026-001`.
   - **Inventory Item ID** *(required)* — The ID of the specific inventory item to move. You can find this in the Inventory module.
   - **From Storage Unit ID** *(optional)* — Origin bin/shelf.
   - **To Storage Unit ID** *(optional)* — Destination bin/shelf.
   - **Quantity** *(required)* — Amount to move.
   - **Notes** *(optional)*.
3. Click **Create Transfer**.

### Completing a Transfer

- **From the table**: Click **Complete** on the row.
- **From the detail page**: Click **Mark Complete** (top-right).

Transfers in status `COMPLETED`, `CANCELLED`, or `FAILED` cannot be completed.

---

## Tab: Manifest (Shipments)

### Creating a Shipment

1. Click **Create Shipment** or navigate to `/app/orders/manifests/new`.
2. Fill in:
   - **Warehouse** *(required)*.
   - **Sales Order** *(required)* — The outbound order this shipment fulfills.
   - **Shipment Number** *(required)* — e.g. `SHIP-2026-001`.
   - **Tracking Number** *(optional)* — Carrier tracking.
   - **Scheduled Dispatch** *(optional)* — Date/time.
   - **Notes** *(optional)*.
3. Click **Create Shipment**.

### Dispatching and Delivering

From the shipment detail page (`/app/orders/manifests/{id}`):

- When status is `READY_TO_SHIP` → click **Mark Dispatched**.
- When status is `DISPATCHED` → click **Mark Delivered**.

The manifest table shows carrier, shipment reference, and shipment count. Click any row to open the detail page.

---

## Tab: Fulfill (Waves & Shipments)

The Fulfill tab has two sections: **Batches** (pick waves) and **Unbatched Shipments**.

### Creating a Wave

1. Click **New Wave** in the Batches section header, or navigate to `/app/orders/fulfill/new`.
2. Fill in:
   - **Warehouse** *(required)*.
   - **Wave Number** *(required)* — e.g. `WV-2026-001`.
   - **Wave Type** — `Single Order`, `Batch`, `Zone`, or `Cluster`.
   - **Notes** *(optional)*.
3. Select one or more **Sales Orders** to include in the wave. Open orders appear in a scrollable checklist. At least one order is required.
4. Click **Create Wave**.

### Viewing a Wave

Click any batch row to open the wave detail page at `/app/orders/fulfill/{id}`.

The detail page shows:
- Wave info: warehouse, type, release info, dates.
- Pick summary: total orders, lines, qty to pick, qty picked, and % progress.
- **Sales Orders in Wave** table with links back to each SO detail page.
- **Pick Lines** table showing per-SKU pick quantities.

### Progressing Shipments

In the **Unbatched Shipments** section:

- **Single shipment**: Click **Ready** (moves `PENDING → READY_TO_SHIP`) or **Dispatch** (moves `READY_TO_SHIP → DISPATCHED`).
- **Bulk**: Check multiple rows and click **Progress Selected**.

---

## Filters

Each tab has filter chips in the toolbar (Create Date, Order Status, Warehouse, etc.). These are available for use and can be combined with the search bar for precise results.

The search bar in each tab supports free-text search on key fields:
- **Inbound**: PO number, supplier name, warehouse name.
- **Outbound**: Order number, customer name, warehouse name.
- **Transfer**: Reference number, warehouse name.

---

## Navigation Shortcuts

| Action | Route |
|--------|-------|
| All Orders | `/app/orders` |
| New Purchase Order | `/app/orders/inbound/new` |
| New Sales Order | `/app/orders/outbound/new` |
| New Transfer | `/app/orders/transfers/new` |
| New Shipment | `/app/orders/manifests/new` |
| New Wave | `/app/orders/fulfill/new` |
| PO Detail | `/app/orders/inbound/{id}` |
| SO Detail | `/app/orders/outbound/{id}` |
| Transfer Detail | `/app/orders/transfers/{id}` |
| Shipment Detail | `/app/orders/manifests/{id}` |
| Wave Detail | `/app/orders/fulfill/{id}` |

---

## Tips

- **Row click** anywhere in a table row navigates to the detail page for that record.
- **Checkbox rows** (outbound orders, shipments) require clicking the checkbox itself — the row click area excludes the checkbox and action buttons to avoid accidental navigation.
- Use **keyboard shortcuts** in inputs — `Tab` moves between fields on create forms.
- The **Back arrow** on all create/detail pages returns to the orders list.
