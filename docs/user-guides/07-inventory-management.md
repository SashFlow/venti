# Inventory Management Guide

**For:** Warehouse managers, inventory controllers, and supervisors responsible for maintaining accurate stock records, conducting counts, managing replenishment rules, and handling slow-moving or obsolete stock at DIKEN warehouses.

---

## Prerequisites

- Warehouse structure must be set up. See [Warehouse Setup Guide](01-warehouse-setup.md).
- Products must be in the Product Master. See [Product Master Guide](02-product-master.md).
- Stock adjustment approvals may require a manager login. Confirm approval authority with your warehouse manager.

---

## Overview

Inventory management ensures that what the system says is in the warehouse matches what is physically there. This guide covers:

- **Stock Adjustments** — correcting discrepancies
- **Cycle Counts** — regular physical counts to catch discrepancies early
- **Min/Max Replenishment** — automatic stock level rules
- **MTO Triggers** — how special orders affect stock
- **Seasonal Demand Planning** — preparing for peak HVAC season
- **Dead Stock Management** — identifying and clearing slow-moving inventory

---

## Section 1: Stock Adjustment Workflow

A stock adjustment is used to correct the system stock quantity when a physical count reveals a discrepancy — for example, discovering 47 units physically when the system shows 50.

Stock adjustments follow a three-step process: **Request → Approval → Post**.

### Step 1: Create an Adjustment Request

1. Go to **Inventory > Stock Adjustments > New Adjustment**.
2. Select the **Warehouse** and **Zone** where the discrepancy was found.
3. Click **Add Product**.
4. Search for the product and select the specific bin where the discrepancy was found.
5. Enter:
   - **System Quantity** — this is auto-filled from the current stock record (do not change this).
   - **Physical Quantity** — what you actually counted physically.
   - **Variance** — the system calculates this automatically (Physical minus System). A negative variance means stock is missing; a positive variance means there is more stock than recorded.
6. Select the **Adjustment Reason**:

| Reason | Use When |
|---|---|
| Damaged In Warehouse | Goods were damaged while being stored or moved |
| Counting Error (Previous) | The last count was recorded incorrectly |
| Theft / Loss | Stock is missing with no explanation |
| System Entry Error | A receiving or transfer entry was entered incorrectly |
| Expired / Obsolete | Stock has expired or been declared obsolete |
| Found Stock | Physical stock found that was not in the system |
| Cycle Count Variance | Discrepancy identified during a cycle count |

7. Add a note explaining the discrepancy in as much detail as possible.
8. For serialised products: specify exactly which serial numbers are being adjusted (removed or added to the count).
9. Click **Submit for Approval**.

### Step 2: Approval

10. The adjustment request is sent to the assigned approver (usually the warehouse manager or inventory controller).
11. The approver goes to **Inventory > Stock Adjustments > Pending Approval**.
12. They review the request, check the supporting notes, and decide:
    - **Approve** — the adjustment is valid and can be posted.
    - **Reject** — the request needs more investigation; the requestor must do a recount or provide more information.
    - **Request Recount** — the approver asks for a second physical count before deciding.

> **Tip:** For large variances (more than 5% of stock or high-value items), the approver should visit the bin physically before approving. Always investigate the root cause rather than just correcting the number.

### Step 3: Post the Adjustment

13. Once approved, the adjustment status changes to **Approved – Pending Post**.
14. The requestor (or the approver) clicks **Post Adjustment**.
15. The system updates the stock quantity and creates a financial entry (adjusting the stock value accordingly).
16. The adjustment is recorded permanently in the stock history. It cannot be reversed — only offset by a new adjustment.

---

## Section 2: Cycle Count Process

A cycle count is a scheduled physical count of a portion of the warehouse. Unlike an annual full stocktake, cycle counts are done continuously throughout the year so that every bin is counted at least once per cycle period (usually quarterly or monthly, depending on the product type).

### Step 1: Schedule a Cycle Count

1. Go to **Inventory > Cycle Counts > Schedules**.
2. Click **New Schedule**.
3. Set:
   - **Warehouse** and **Zone** to count
   - **Count Frequency** — how often this zone should be counted (e.g., Monthly for high-value items, Quarterly for slow-moving stock)
   - **Count Method** — Blind Count (counters do not see the system quantity before counting) or Open Count (system quantity is visible)
   - **Assigned Counter(s)** — the operative(s) who will perform the count

> **Tip:** Blind counting (where the counter does not see the system quantity) produces more accurate results because the counter is not unconsciously influenced by the expected number. Use blind counting whenever possible.

4. Click **Save Schedule**. The system will automatically generate count tasks on the scheduled dates.

### Step 2: Perform the Count

On the scheduled date, the assigned counter:

1. Goes to **Inventory > Cycle Counts > My Count Tasks**.
2. Opens the task and reviews the bins assigned to count.
3. Goes to the first bin physically:
   - Scans the bin barcode to confirm location.
   - Counts all items in the bin.
   - Enters the count quantity in the app.
   - For serialised items: scans each serial number.
4. Moves to the next bin until all assigned bins are counted.
5. Clicks **Submit Count** when all bins in the task are done.

### Step 3: Variance Review

6. Go to **Inventory > Cycle Counts > Variance Review** (accessible to supervisors/managers).
7. The system compares the counted quantities to the system quantities and displays variances.
8. For each variance line, the reviewer decides:
   - **Recount** — if the variance seems unlikely, send the counter back for a second count.
   - **Investigate** — assign someone to check for damage, misplacement, or a recent unrecorded movement.
   - **Approve Adjustment** — if the variance is confirmed after investigation, approve a stock adjustment (this creates an adjustment automatically).
9. Once all variances are resolved, click **Close Cycle Count**.

### Cycle Count Frequency Recommendations for DIKEN

| Product Category | Recommended Frequency |
|---|---|
| AC Units (high value, serialised) | Monthly |
| VRF Systems | Monthly |
| Spare Parts (PCBs, motors) | Quarterly |
| Refrigerant Cylinders | Monthly (regulatory requirement) |
| Consumables and Accessories | Quarterly |
| Packaging Materials | Bi-annually |

---

## Section 3: Min/Max Replenishment Rules

Replenishment rules tell the system when to automatically request more stock.

- **Min Level (Minimum Stock):** When stock falls to or below this number, a replenishment is triggered.
- **Max Level (Maximum Stock):** The system orders enough stock to bring the quantity back to this level.
- **Reorder Quantity:** An optional fixed quantity to order every time (instead of ordering up to the max level).

### Setting Min/Max Rules

1. Go to **Products > [Select Product]**.
2. Click the **Warehouse Settings** tab.
3. Select the warehouse you want to set rules for.
4. Enter the **Min Stock Level**, **Max Stock Level**, and optionally the **Reorder Quantity**.
5. Click **Save**.

### Viewing Products Below Min Level

- Go to **Inventory > Replenishment Alerts**.
- This dashboard shows all products where current stock is at or below the minimum level.
- The **Days of Stock Remaining** column (calculated from average daily sales) shows how urgently a replenishment is needed.
- From this dashboard, you can click **Create Replenishment PO** to generate a purchase order, or **Create Transfer Request** to request stock from a higher-tier warehouse.

### Calculating the Right Min Level

A good min level should provide enough stock to last through the lead time (the time between ordering and receiving). A simple formula:

**Min Level = Average Daily Sales × (Lead Time in Days + Safety Buffer Days)**

Example:
- Product: DIKEN 1.5T Split AC
- Average daily sales: 3 units
- Supplier lead time: 45 days
- Safety buffer: 7 days
- Min Level = 3 × (45 + 7) = 156 units

> **Tip:** In peak season (April–July for cooling products), daily sales increase significantly. Consider temporarily raising your min levels before peak season. See Section 6 of this guide.

---

## Section 4: Make-to-Order (MTO) Stock Triggers

Make-to-Order products are not held as regular stock. Instead, a specific purchase order is raised only when a customer places an order for that item.

Products can be flagged as MTO in two ways:

**Always MTO:** Set on the product record — go to **Products > [Product] > Stock Settings** and set **Procurement Policy = Make-to-Order**. These products will never appear in regular replenishment reports. Every sales order for them automatically triggers an MTO purchase request.

**Triggered MTO:** A product normally held in stock becomes an MTO trigger when regular stock is exhausted and no replenishment is imminent. The system flags this automatically when:
- Stock = 0
- No PO is in progress
- A sales order exists that requires the product

In either case:
1. The procurement officer receives an MTO notification in **Procurement > MTO Requests**.
2. They review the request, confirm the customer order, and create an MTO PO against the supplier.
3. The goods are received and reserved exclusively for the triggering sales order.

---

## Section 5: Seasonal Demand Planning

DIKEN's HVAC products have strong seasonal patterns — demand for cooling products peaks before and during summer (March–July), while heating products peak October–February.

### Viewing Historical Demand

1. Go to **Reports > Demand Analysis**.
2. Select a product or product family.
3. Set the date range to the last 2–3 years.
4. The report shows monthly sales quantities and highlights seasonal peaks.

### Setting Seasonal Min/Max Levels

1. Go to **Inventory > Seasonal Planning**.
2. Click **New Seasonal Rule**.
3. Set:
   - **Product or Product Family**
   - **Warehouse**
   - **Season Name** — e.g., "Pre-Summer Peak 2026"
   - **Season Start Date** and **Season End Date**
   - **Seasonal Min Level** — the elevated minimum during peak season
   - **Seasonal Max Level** — the elevated maximum during peak season
4. Click **Save Seasonal Rule**.

During the defined dates, the seasonal min/max overrides the regular min/max. After the season ends, the system automatically reverts to the standard rules.

> **Tip:** Create seasonal rules at least 60 days before the season start, accounting for the supplier lead time. For imported products, lead time is often 45–60 days, so seasonal stock needs to be ordered in February for the April–July peak.

---

## Section 6: Dead Stock Flagging and Liquidation

Dead stock is inventory that has not moved (no sales, no transfers out) for a defined period. It ties up warehouse space and working capital.

### Viewing Dead Stock

1. Go to **Reports > Dead Stock Analysis**.
2. Set the **No-Movement Threshold** (e.g., 180 days — stock not moved in 6 months).
3. The report lists all products below the threshold with:
   - Current quantity
   - Last movement date
   - Stock value (at cost)
   - Days since last movement

### Taking Action on Dead Stock

From the Dead Stock report, select one or more products and choose an action:

**1. Mark for Liquidation**
- Stock is flagged as "For Liquidation" in the system.
- The sales team can offer these products at a discounted price.
- To sell liquidation stock, create a sales order with the **Liquidation Price** (which can be below the standard cost; the system will warn you but allow it if you have manager authorisation).

**2. Transfer to Another Warehouse**
- If a different warehouse in the network has demand for this stock, create a transfer order.
- Go to **Inventory > Transfer Orders > New Transfer** and select the dead stock product for transfer.

**3. Scrap / Write-Off**
- For stock that cannot be sold (damaged, obsolete model discontinued):
  1. Go to the dead stock product in the report.
  2. Click **Initiate Write-Off**.
  3. Enter the quantity to write off and the reason.
  4. Submit for manager approval.
  5. Once approved, the stock is removed from the inventory count and the cost is posted as a write-off expense.

**4. Return to Supplier**
- If the supplier accepts returns on unsold stock (common with distributors), create a Vendor Return.
- See [Returns Guide](05-returns.md) for the Vendor Return process.

---

## Tips and Warnings

- **Never adjust stock without a valid reason code.** Unexplained adjustments raise audit flags and make it impossible to track patterns of loss or error.
- **The approval workflow is there for a reason.** Do not look for ways to bypass it. Unapproved adjustments are a significant internal control risk.
- **Do counts during quiet periods.** Cycle counts are most accurate when the warehouse is not actively receiving or dispatching goods. Schedule counts during lunch breaks or before warehouse opens.
- **Investigate every non-trivial variance.** A recurring variance in the same bin or for the same product usually signals a process problem (e.g., a picker who always goes to the wrong bin) or a loss/theft issue.
- **Seasonal planning requires sales input.** Do not set seasonal min levels based only on warehouse data. Get the sales team to share their forecast for the coming peak season before finalising rules.

---

## What Happens Next

Accurate inventory is the foundation for all other warehouse activities. Well-managed stock levels reduce both stockouts and overstock, improving service levels and reducing costs.

- Related guides: [Procurement](06-procurement.md), [Receiving](03-receiving.md), [Picking and Dispatch](04-picking-and-dispatch.md), [ASP Channel](08-asp-channel.md)
