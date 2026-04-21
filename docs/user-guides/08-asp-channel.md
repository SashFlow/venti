# ASP Channel Guide

**For:** ASP (Authorized Service Provider) coordinators, sales staff managing dealer relationships, and warehouse supervisors responsible for consignment stock at DIKEN service partners.

---

## Prerequisites

- Warehouses must be configured and the National DC must be active. See [Warehouse Setup Guide](01-warehouse-setup.md).
- Products must exist in the Product Master before they can be assigned to ASP catalogues. See [Product Master Guide](02-product-master.md).
- You must have an ASP Coordinator or Manager role to add or edit ASP records.

---

## Overview

Authorized Service Providers (ASPs) are independent service dealers and installation partners authorised to sell and install DIKEN products in their regions. DIKEN supplies them with stock on a **consignment basis** — the stock physically sits at the ASP's premises but remains DIKEN's property until it is sold or consumed.

This guide covers:
- Registering ASPs in the system
- Setting up ASP product catalogues
- Managing consignment stock movements
- Monitoring ASP stock levels and triggering auto-replenishment

---

## Section 1: Registering an ASP

1. Go to **ASP Channel > Authorized Service Providers > New ASP**.
2. Fill in the **Basic Information** tab:
   - **ASP Name** — the full business name of the service provider
   - **ASP Code** — a short unique code, e.g., "KHI-ASP-01"
   - **Region** — the city or region this ASP serves (e.g., Karachi South, Lahore East)
   - **Contact Person** — primary name and phone number
   - **Email** — used for automatic stock alerts and statements
   - **Address** — physical location of the ASP (where consignment stock is held)
3. Fill in the **Trade Terms** tab:
   - **Consignment Terms** — select the agreement type:
     - **Free Consignment** — stock held at no charge until sold
     - **Consignment with Holding Fee** — a periodic fee applies if stock is not turned within the agreed period
   - **Maximum Consignment Value (PKR)** — the credit limit on stock value that can be held at this ASP at any time
   - **Settlement Period (days)** — how often the ASP submits a usage/sales report and settles accounts
4. Fill in the **Assigned Warehouse** tab:
   - **Replenishment Source Warehouse** — the warehouse that will supply this ASP (typically a Regional DC or Local DC)
5. Click **Save ASP**.

---

## Section 2: Setting Up the ASP Product Catalogue

Not all DIKEN products are available to every ASP. Each ASP is assigned a specific list of products they are authorised to hold and sell.

1. Open the ASP record and go to the **Product Catalogue** tab.
2. Click **Add Products**.
3. Search for and select the products this ASP is authorised for.
4. For each product in the ASP's catalogue, set:
   - **Min Stock Level** — the minimum quantity DIKEN wants this ASP to hold at all times. When stock drops below this, a replenishment alert is triggered.
   - **Max Stock Level** — the maximum consignment quantity allowed at this ASP
   - **Auto-Replenish** — toggle on to allow the system to automatically generate a replenishment transfer when stock drops below min level
5. Click **Save Catalogue**.

> **Tip:** The ASP product catalogue is filtered by the **Region** and **Star Rating** attributes on the product record. DIKEN typically restricts ASPs to products rated for their local climate zone. Fill in the Region attribute on the product correctly (see [Product Master Guide](02-product-master.md)).

---

## Section 3: Sending Stock to an ASP (Consignment Dispatch)

When you send stock to an ASP, you are transferring physical custody but not ownership. The system records this as a consignment movement — the stock leaves your warehouse but remains on DIKEN's books as consignment stock (not sold).

1. Go to **ASP Channel > Consignment Transfers > New Transfer**.
2. Select:
   - **ASP** — the destination ASP
   - **Source Warehouse** — the warehouse dispatching the stock
3. Click **Load Recommended Quantities**. The system will suggest quantities based on the ASP's min/max levels and current consignment holdings.
4. Adjust quantities if needed. You can only send products that are in the ASP's approved catalogue.
5. Click **Save Transfer** to create a draft, or **Submit for Approval** if transfers above a certain value require manager sign-off.
6. Once approved, the system creates a **Pick Task** at the source warehouse. The warehouse team picks and packs the goods as in a standard dispatch. See [Picking and Dispatch Guide](04-picking-and-dispatch.md).
7. When the goods leave the warehouse, click **Confirm Dispatched**.
8. When the ASP confirms receipt, go to the transfer record and click **Confirm Received at ASP**. The system updates the ASP's consignment stock ledger.

> **Note:** Consignment stock at the ASP is tracked separately from regular warehouse stock. It does not appear in your warehouse's available stock but does appear in DIKEN's total stock value reports.

---

## Section 4: Monitoring ASP Stock Levels

### ASP Stock Dashboard

1. Go to **ASP Channel > Stock Overview**.
2. This dashboard shows all ASPs with:
   - **Current Consignment Holdings** — quantity and value of stock at each ASP
   - **Min Level Status** — green (above min), amber (at min), red (below min)
   - **Days Since Last Sale** — calculated from ASP sales reports submitted
   - **Pending Replenishment** — transfers already in progress

3. Click on any ASP to drill into their product-level stock detail.

### Replenishment Alerts

When an ASP's stock for a product drops below the configured minimum level, the system:
1. Sends an email alert to the ASP Coordinator assigned to that region.
2. Creates a **Replenishment Alert** in **ASP Channel > Replenishment Alerts**.
3. If **Auto-Replenish** is toggled on for that product, automatically creates a draft consignment transfer for review.

To process a replenishment alert:
1. Go to **ASP Channel > Replenishment Alerts**.
2. Open the alert.
3. Review the recommended quantity and adjust if needed.
4. Click **Create Transfer** to generate the consignment dispatch.

---

## Section 5: Recording ASP Sales (Stock Consumption)

When an ASP sells or installs a product, they report it to DIKEN. This is how the consignment stock is consumed and ownership transfers.

1. Go to **ASP Channel > Sales Reports**.
2. Click **New Sales Report**.
3. Select the ASP and the reporting period.
4. For each product sold or consumed by the ASP:
   - Enter the **Quantity Sold/Consumed**.
   - Enter the **Serial Numbers** of units sold (mandatory for serialised products such as AC units — each serial must match a unit in that ASP's consignment stock).
   - Enter the **Customer Name** and **Installation Address** (used to activate warranty records).
5. Click **Submit Sales Report**.

The system will:
- Reduce the ASP's consignment stock ledger by the quantities reported.
- Transfer ownership of those units from DIKEN's consignment stock to "Sold".
- Create a **Sales Invoice** from DIKEN to the ASP for the units consumed.
- Activate the **Warranty Record** for each serialised unit sold (linked to the installation date and serial number).

> **Tip:** ASPs should submit sales reports at least once per settlement period. If a report is overdue, the coordinator receives an automated reminder.

---

## Section 6: ASP Stock Returns (Excess Consignment Return)

When an ASP wants to return unsold consignment stock to DIKEN:

1. Go to **Returns > New Sales Return Note**.
2. Set the **Return Type** to **ASP Consignment Return**.
3. Select the **ASP** making the return.
4. The system loads the ASP's current consignment stock list. Select the products and quantities being returned.
5. Set the **Reason Code** to **Excess Stock**.
6. Set the **Condition** for each product (all should be Good – Resalable for consignment returns; flag any damaged items separately with reason Damaged – Cosmetic or Damaged – Non-Repairable).
7. Click **Save SRN**.

Returned consignment goods follow the standard returns receiving and inspection workflow. See [Returns Processing Guide](05-returns.md) for details.

> **Note:** Credit notes are not issued for consignment returns in the normal sense — since the ASP was never invoiced for the stock, no credit is owed. The system simply closes the consignment holding and returns the stock to the DIKEN warehouse.

---

## Section 7: ASP Product List Restrictions

You can control exactly which products each ASP can see, request, and sell:

1. Open the ASP record and go to the **Product Catalogue** tab.
2. To add a product: click **Add Product**, search, and add it with min/max levels.
3. To remove a product: click the product line and click **Remove from Catalogue**. You cannot remove a product if the ASP currently holds consignment stock of it — reduce the stock to zero first by processing a return.
4. To temporarily suspend a product (e.g., a model being phased out): click the product line and toggle **Active** off. The ASP cannot request more stock, but their existing holding remains visible.

---

## Tips and Warnings

- **Consignment stock is DIKEN's asset until sold.** Never write off consignment stock at an ASP without a formal investigation. If an ASP reports loss or theft of consignment goods, raise an SRN and escalate to management before adjusting the records.
- **Serial numbers are mandatory for AC unit consignment.** Without serial numbers at dispatch, you cannot track which specific unit was sold by the ASP. If the ASP reports a sale but serial numbers are missing, do not post the sales report — contact the ASP to obtain the serial numbers.
- **Do not exceed the Maximum Consignment Value.** The system will warn you when creating a transfer that would push an ASP over their credit limit. Get management approval before proceeding.
- **Unsold consignment stock ages the same as warehouse stock.** Review the Days Since Last Sale metric on the ASP dashboard regularly. Consignment stock sitting at an ASP for more than 180 days without movement should be recalled and reviewed as part of dead stock management.
- **ASP product lists drive what they can order.** If an ASP calls to request a product not on their list, add it to the catalogue first before creating the consignment transfer.

---

## What Happens Next

Stock at ASPs is activated as a warranty record when sold. Warranties, serial tracking, and service history connect back to the unit's receipt at the warehouse.

- Related guides: [Returns Processing](05-returns.md), [Warranty and Traceability](10-warranty-and-traceability.md), [Inventory Management](07-inventory-management.md), [Picking and Dispatch](04-picking-and-dispatch.md)
