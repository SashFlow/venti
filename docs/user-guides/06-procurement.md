# Procurement Guide

**For:** Procurement officers and purchasing managers responsible for creating purchase orders, managing supplier relationships, recording landed costs, and managing stock replenishment across DIKEN's warehouse network.

---

## Prerequisites

- Suppliers must be set up in the system before purchase orders can be created (see Section 2 of this guide).
- Products must exist in the Product Master before they can be added to a PO. See [Product Master Guide](02-product-master.md).
- Your warehouse must be configured and assigned the correct warehouse type (National DC, Regional DC, Local DC). See [Warehouse Setup Guide](01-warehouse-setup.md).

---

## Overview

Procurement covers three main activities:

1. **Purchasing** — creating and managing Purchase Orders to bring goods into the DIKEN network.
2. **Landed Cost Management** — recording the additional costs (freight, insurance, customs) that form part of the true cost of goods.
3. **Replenishment** — automatically triggering restocking across the National → Regional → Local DC network based on stock rules.

---

## Section 1: Types of Purchase Orders

The system supports three types of PO, each used in different situations:

| PO Type | When to Use | Example |
|---|---|---|
| **Standard PO** | Regular, planned purchasing for general stock replenishment | Annual contract order for 500 units of split ACs |
| **Make-to-Order (MTO) PO** | A specific customer order requires a product not held in stock; PO is created specifically to fulfil that order | A customer orders a 10-ton chiller — we do not stock these; we order it from the factory |
| **Replenishment PO** | System-generated PO triggered automatically when stock drops below the minimum level | Min stock of 20 units breached; system creates a PO for the reorder quantity |

---

## Section 2: Supplier Management

### Adding a New Supplier

1. Go to **Procurement > Suppliers > New Supplier**.
2. Fill in the **Basic Information** tab:
   - **Supplier Name** — full legal business name
   - **Short Name** — abbreviated name used on documents (e.g., "GREE HK")
   - **Supplier Code** — unique code (system can auto-generate)
   - **Supplier Type** — select: Manufacturer, Distributor, Agent, Service Provider
   - **Country** — country of registration
   - **Currency** — the currency in which this supplier invoices
3. Fill in the **Contact Details** tab:
   - Primary contact name, phone, and email
   - Accounts payable contact (for payment queries)
   - Technical contact (for warranty and product queries)
4. Fill in the **Trade Terms** tab:
   - **Payment Terms** — e.g., 30 days net, 60 days net, Letter of Credit
   - **Default Lead Time (days)** — how many days between PO and delivery
   - **Incoterms** — e.g., FOB, CIF, DDP (determines who pays freight and insurance)
   - **Minimum Order Value** — if the supplier has a minimum order requirement
5. Fill in the **Products** tab:
   - Link the products that this supplier can supply.
   - Set the **Supplier SKU** (their part number for the product) — this prints on the PO so the supplier recognises it.
   - Set the **Supplier Price** and **Currency** for each product.
6. Click **Save Supplier**.

---

## Section 3: Creating a Standard Purchase Order

1. Go to **Procurement > Purchase Orders > New PO**.
2. Select **PO Type: Standard**.
3. Fill in the header:
   - **Supplier** — select from the supplier list
   - **Delivery Warehouse** — where goods will be delivered (usually the National DC for supplier POs)
   - **Expected Delivery Date** — based on the supplier's confirmed lead time
   - **Currency** — auto-filled from supplier settings; change only if agreed differently
   - **Payment Terms** — auto-filled from supplier settings; change if this order is different
   - **Incoterms** — auto-filled; change if agreed differently for this order
4. Add products to the PO:
   - Click **Add Line**.
   - Search for the product by name or SKU.
   - Enter the **Quantity** and **Unit Price** (in the agreed currency).
   - The system will show the **Supplier SKU** alongside the internal SKU.
   - Repeat for each product.
5. Review the **PO Total** (shown at the bottom).
6. Click **Submit for Approval**. Depending on your company settings, POs above a certain value require manager approval before being sent to the supplier.
7. Once approved, click **Send to Supplier**. The system emails the PO PDF to the supplier's email address on file.

---

## Section 4: Creating an MTO (Make-to-Order) Purchase Order

An MTO PO is linked to a specific customer sales order. Goods received against an MTO PO are reserved exclusively for that customer order and cannot be allocated elsewhere.

1. Go to **Procurement > Purchase Orders > New PO**.
2. Select **PO Type: Make-to-Order**.
3. In the **Linked Sales Order** field, search for and select the customer's sales order that triggered this purchase.
4. The product and quantity fields will auto-fill from the sales order.
5. Select the supplier and fill in pricing and delivery details.
6. Click **Submit for Approval** → **Send to Supplier** as with a standard PO.

> **Tip:** When goods arrive against an MTO PO, the system automatically reserves them for the linked sales order. The pick list for that sales order will be generated as soon as the GRN is posted.

---

## Section 5: Creating a Replenishment Purchase Order

Replenishment POs can be created manually or automatically:

**Manual creation:**
1. Go to **Procurement > Replenishment Dashboard**.
2. The dashboard shows all products where current stock has fallen below the minimum level.
3. Review the list and tick the products you want to reorder.
4. Click **Create POs**. The system groups products by their preferred supplier and creates one PO per supplier.
5. Review each draft PO and adjust quantities if needed.
6. Submit and send as with a standard PO.

**Automatic creation:**
- If your warehouse settings have **Auto-Replenishment** enabled, the system creates replenishment PO drafts automatically every night (or at the scheduled time set by your administrator).
- Procurement officers receive a notification each morning listing draft replenishment POs awaiting review.
- Go to **Procurement > Purchase Orders** and filter by **Status: Draft – Auto-Generated**.
- Review, approve, and send.

---

## Section 6: Landed Cost Entry

When goods are imported, the price on the supplier invoice is rarely the full cost of the goods. Freight charges, insurance premiums, and customs duties all add to the true cost. The system calls these additional costs **Landed Costs**.

Recording landed costs is important because:
- The true cost of goods affects your gross margin calculations.
- Landed costs are allocated across all products in the shipment, updating the cost per unit on each product's stock record.

### Step 1: Create a Landed Cost Entry

1. After a GRN is posted, go to **Procurement > Landed Costs > New Landed Cost**.
2. In the **Reference GRN(s)** field, select the GRN(s) this landed cost applies to. You can link one landed cost entry to multiple GRNs if they were all part of the same shipment.
3. Click **Load Products**. The system will list all products received on the linked GRNs with their quantities.

### Step 2: Add Cost Components

4. Click **Add Cost Component** for each landed cost item:

| Component | What It Covers | Example |
|---|---|---|
| Sea/Air Freight | Cost of transporting goods from the origin port to Pakistan | USD 3,500 |
| Origin Charges | Loading, port handling fees at the origin | USD 200 |
| Insurance | Cargo insurance premium | USD 150 |
| Customs Duty | Import duty charged by Pakistan Customs | PKR 85,000 |
| Additional Customs Duty | ACD or other supplemental duties | PKR 12,000 |
| Port Handling | Karachi port / Torkham charges | PKR 8,000 |
| Inland Freight | Cost to deliver from port to warehouse | PKR 15,000 |
| Bank Charges | Letter of credit or bank transfer fees | PKR 5,000 |
| Other | Any other cost not covered above | — |

5. For each component, enter:
   - **Amount** and **Currency**
   - **Exchange Rate** (if the currency differs from your base currency — the system will show the current rate but you can override it with the actual rate used)

### Step 3: Select Allocation Method

6. Choose how the landed costs will be spread across the products in the shipment:

| Method | How It Works | Best Used When |
|---|---|---|
| **By Quantity** | Cost is divided equally per unit | Products are similar in size and weight |
| **By Value** | Cost is allocated proportional to product invoice value | Products vary greatly in price |
| **By Weight** | Cost is allocated proportional to gross weight | Freight cost is the main landed cost |
| **By Volume** | Cost is allocated proportional to cubic volume | Bulky goods with varying sizes |

7. Select the method and click **Calculate Allocation**. The system will show you how the costs are distributed across each product line.
8. Review the allocation. If a line looks wrong (e.g., a very high-value item getting too little allocation), you can switch methods or manually adjust individual line allocations.

### Step 4: Post the Landed Cost

9. Click **Post Landed Cost**.
10. The system updates the **Landed Cost per Unit** on each product's stock record. This affects:
    - The cost of goods sold (COGS) calculations for items that have been sold.
    - The stock valuation on the balance sheet.
    - The cost per unit shown on product reports.

> **Warning:** Landed costs must be posted before the end of the accounting period in which the goods were received. Posting them late can cause discrepancies in your financial reports. Work with your finance team to confirm the deadline.

---

## Section 7: How Cost-per-Unit Is Updated

After landed costs are posted, the system recalculates the cost per unit for each affected product using a **Weighted Average Cost** method:

- Existing stock in the warehouse retains its previous cost.
- The newly received batch carries the new cost (supplier price + allocated landed costs).
- When stock from the new batch is sold, the COGS is recorded at the new cost.
- The product's average cost (shown on the product record) is recalculated as a weighted average of all unsold stock.

**Example:**
- You have 10 units in stock at PKR 85,000 each.
- You receive 20 more units. Supplier price PKR 80,000 each + PKR 5,000 landed cost each = PKR 85,000 per new unit.
- In this case the cost stays at PKR 85,000 and the weighted average does not change.
- But if the landed cost pushes the new batch to PKR 92,000 per unit, the weighted average across all 30 units would be recalculated accordingly.

---

## Section 8: Multi-Tier Replenishment

DIKEN's network operates on three tiers. Stock flows downward through the tiers:

```
National DC (Karachi)
    ↓  supplies
Regional DC (Lahore / Islamabad / Faisalabad)
    ↓  supplies
Local DC / Branch Warehouse
    ↓  supplies
ASP (consignment)
```

The system manages replenishment automatically between tiers. Here is how it works:

### How a Replenishment is Triggered

1. A product at a **Local DC** drops below its minimum stock level.
2. The system generates a **Transfer Request** from the Local DC to its assigned Regional DC.
3. If the Regional DC also has insufficient stock, the system escalates and generates a **Transfer Request** from the Regional DC to the National DC.
4. If the National DC also has insufficient stock, the system generates a **Purchase Order** to the external supplier.

### Viewing the Replenishment Chain

1. Go to **Procurement > Replenishment Dashboard**.
2. Select a warehouse and view:
   - **Current Stock** vs **Min Level** vs **Max Level** for each product.
   - **Pending Transfer Requests** from downstream warehouses.
   - **Suggested Replenishment Actions** (transfer from upstream or new PO).

### Processing a Transfer Request

When the National DC receives a transfer request from a Regional DC:
1. Go to **Inventory > Transfer Orders > Incoming Requests**.
2. Review the request. Check that sufficient stock is available.
3. Approve the transfer by clicking **Approve and Create Transfer Order**.
4. A transfer order is created, which triggers a pick task at the National DC and an expected receipt at the Regional DC.
5. Once picked and dispatched, the Regional DC will receive the goods using the standard receiving workflow. See [Receiving Guide](03-receiving.md).

### Setting Replenishment Rules

Replenishment rules (min/max levels, reorder quantities) are set per product per warehouse:

1. Go to **Products > [Select Product] > Warehouse Settings**.
2. Click on the warehouse you want to set rules for.
3. Set:
   - **Min Stock** — the quantity that triggers a replenishment request
   - **Max Stock** — the target quantity after replenishment (the system will order enough to reach this level)
   - **Reorder Qty** — the standard quantity to order (overrides max-based calculation if set)
   - **Replenishment Source** — Auto (system decides based on network) or Fixed (always replenish from a specific warehouse or supplier)
4. Click **Save**.

---

## Tips and Warnings

- **Send the PO PDF to the supplier, not just verbal confirmation.** The PO is the binding purchase document. Always get the supplier to acknowledge it in writing.
- **Record landed costs as soon as the invoices are received**, not when you get around to it. Delays in posting landed costs mean your stock valuation and margin reports are inaccurate in the interim.
- **Do not delete a PO that has a GRN against it.** You can cancel remaining open lines on a PO, but deleting a PO with stock received against it will corrupt your records. Contact your administrator.
- **MTO POs must be linked to a sales order.** An unlinked MTO PO behaves like a standard PO and the reserved stock may be picked for other orders.
- **Monitor the Replenishment Dashboard daily.** In peak season (pre-summer cooling season), stock at Local DCs can drop fast. Set alerts in the dashboard to notify you when stock hits the minimum level.

---

## What Happens Next

Goods ordered on a PO will be received into the warehouse when they arrive. Landed costs should be posted as soon as all cost invoices (freight, customs) are received.

- Next guide: [Inventory Management](07-inventory-management.md)
- Related guides: [Receiving](03-receiving.md), [Warehouse Setup](01-warehouse-setup.md), [Product Master](02-product-master.md)
