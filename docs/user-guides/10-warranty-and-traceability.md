# Warranty and Traceability Guide

**For:** Customer service staff who handle warranty claims, warehouse supervisors tracking serialised stock, and quality managers who need full batch and serial-level traceability across the supply chain.

---

## Prerequisites

- Products must be set up in the Product Master with the **Serialised** or **Batch Tracked** toggle enabled before any stock is received. See [Product Master Guide](02-product-master.md).
- Serial numbers must be scanned at the point of receiving before warranty records can be created. See [Receiving Guide](03-receiving.md).
- Warranty records are activated when the unit is sold. For ASP sales, this happens when the ASP submits a sales report. See [ASP Channel Guide](08-asp-channel.md).

---

## Overview

Traceability is the ability to follow any unit or batch of stock from the moment it was received from the supplier through every movement in the warehouse, all the way to the customer's installation site — and backwards again if a warranty claim or return occurs.

DIKEN uses two levels of traceability:

- **Serial-level tracking** — each individual unit has a unique serial number. Used for: all AC units, VRF modules, compressors, and other high-value finished goods.
- **Batch/lot tracking** — groups of items share a batch number (typically a manufacturer's production lot). Used for: spare parts, accessories, and consumables not tracked individually.

This guide covers how to view and use traceability records, how warranty records work, and how to process warranty claims.

---

## Section 1: Serial Number Tracking

### How Serial Numbers Enter the System

Serial numbers are captured at three points:

1. **At receiving (GRN):** Every serialised unit scanned during goods receipt is registered in the system. See [Receiving Guide](03-receiving.md).
2. **At dispatch:** When a pick task includes a serialised product, the picker scans each serial number to confirm exactly which unit left the warehouse.
3. **At installation (via ASP sales report or work order):** The serial number is linked to the customer name, installation address, and installation date.

### Viewing a Serial Number Record

1. Go to **Traceability > Serial Numbers**.
2. Search by serial number, product name, or customer name.
3. Click on the serial number to open its **Trace Record**.

The Trace Record shows the complete history of that unit:

| Field | What It Shows |
|---|---|
| Product | Product name and SKU |
| Serial Number | The unit's unique identifier |
| Manufacturing Date | Date the unit was manufactured (from the GRN receipt or product label) |
| Received Date | Date the unit arrived at the DIKEN warehouse |
| GRN Reference | The Goods Receipt Note that brought this unit in |
| Supplier | The supplier who delivered this unit |
| Batch / Lot | The supplier's production lot (if batch tracked) |
| Warehouse Location History | Every bin the unit has occupied |
| Dispatched Date | When the unit left the warehouse |
| Dispatched To | Customer, ASP, or technician |
| Delivery Note | The outbound delivery note reference |
| Installation Date | When the unit was installed (from ASP sales report or work order) |
| Installation Address | Where the unit is installed |
| Warranty Record | Link to the active warranty for this unit |
| Warranty Expiry | The date warranty cover expires |
| Claims History | Any warranty claims or returns linked to this serial number |

---

## Section 2: Batch / Lot Tracking

### How Batch Records Work

For batch-tracked products, instead of tracking each unit individually, the system tracks groups of units that share the same production lot number from the manufacturer.

Batch details are captured at receiving:
- **Lot Number** — the manufacturer's production batch reference
- **Manufacturing Date** — when this batch was produced
- **Expiry Date** — if the product has a shelf life (e.g., lubricants, sealants, certain spare parts)

### Viewing a Batch Record

1. Go to **Traceability > Batch Lots**.
2. Search by lot number, product name, or supplier.
3. Click on the lot to see:
   - All GRNs that received stock from this lot
   - Current quantity remaining in stock
   - Movements out (which orders this lot was dispatched on)
   - Expiry date and days remaining

### FIFO and FEFO Enforcement

- For serialised products: FIFO is enforced by **manufacturing date** — the unit manufactured earliest is dispatched first.
- For batch-tracked products without expiry: FIFO is enforced by **lot receipt date** — the lot received earliest is dispatched first.
- For batch-tracked products with expiry: FEFO is enforced — the lot closest to its expiry date is dispatched first, regardless of when it was received.

The system handles this automatically in pick tasks. Pickers are always directed to the correct lot based on the dispatch rule configured for that product.

---

## Section 3: Warranty Records

### When a Warranty Record is Created

A warranty record is automatically created when:
- A serialised unit is confirmed as sold through an ASP sales report (see [ASP Channel Guide](08-asp-channel.md)).
- A serialised unit is dispatched directly to a customer on a sales order and the sale is confirmed.
- A technician completes a work order that includes a new unit installation (if the work order module is in use).

### What a Warranty Record Contains

| Field | Contents |
|---|---|
| Serial Number | The specific unit covered |
| Product | Product name and SKU |
| Manufacturing Date | Auto-filled from the serial number trace record |
| Sale Date | The date of the ASP sales report or customer invoice |
| Customer Name | End customer who purchased the unit |
| Installation Address | Where the unit is installed |
| Warranty Period | In months — auto-filled from the product model's warranty setting |
| Warranty Start Date | Typically the sale date (or installation date if configured differently) |
| Warranty Expiry Date | Calculated automatically: Start Date + Warranty Period |
| ASP | The ASP who sold or installed the unit (if applicable) |
| Status | Active / Expired / Voided / Claim Raised |

### Viewing Warranty Records

1. Go to **Warranty > Warranty Registry**.
2. Search by serial number, customer name, or installation address.
3. You can also scan a product barcode or serial number tag from the field team's mobile app to pull up the warranty status instantly.

### Checking if a Unit is Under Warranty

When a customer calls with a complaint:
1. Ask for the serial number (printed on the product label or in the customer's purchase documentation).
2. Go to **Warranty > Warranty Registry** and search for the serial number.
3. The system will show immediately: **Warranty Active** (green), **Warranty Expired** (red), or **Not Found**.
4. For an active warranty, the record also shows:
   - Days remaining on the warranty
   - Whether any previous claims have been made against this unit
   - The original purchase date and ASP

---

## Section 4: Processing a Warranty Claim

### Step 1: Raise an SRN (Sales Return Note) with Warranty Linkage

1. Go to **Returns > New Sales Return Note**.
2. Enter the serial number of the unit being returned.
3. The system will automatically link the SRN to the warranty record and verify:
   - Is the warranty active? (if expired, the system flags it and requires supervisor override to proceed)
   - Has a previous claim been made for this serial number? (to detect repeated failures)
4. In the **Reason Code** field, select **Warranty Claim**.
5. In the **Condition** field, select the appropriate condition (DOA, Defective – Repairable, etc.).
6. Add a description of the fault as reported by the customer.
7. Click **Save SRN**.

See [Returns Processing Guide](05-returns.md) for the full receiving, inspection, and routing workflow after the SRN is created.

### Step 2: Inspection and Decision

After the unit arrives at the warehouse:

1. The inspection team opens the inspection task from **Returns > Inspection Queue**.
2. They verify the serial number against the warranty record.
3. They diagnose the fault and record the findings.
4. They select the warranty decision:
   - **Replace under warranty** — dispatch a replacement unit; initiate a vendor return to the supplier
   - **Repair under warranty** — send to the workshop
   - **Reject warranty claim** — fault is due to improper installation, physical damage, or misuse not covered by warranty (must document the reason clearly)

### Step 3: Replacement Dispatch

If the decision is to replace:
1. The system automatically creates a **Replacement Sales Order** linked to the original SRN and warranty record.
2. A pick task is generated for a replacement unit of the same model.
3. The replacement unit's serial number is scanned at dispatch, and the system links it to the customer's updated warranty record.
4. The warranty period for the replacement unit restarts from the replacement dispatch date (or installation date, per company policy).

### Step 4: Warranty Cost Recovery from Supplier

If the faulty unit is within the manufacturer's warranty provided to DIKEN:
1. Go to **Returns > Vendor Returns > New Vendor Return** (see [Returns Guide](05-returns.md), Section 6).
2. Link the Vendor Return to the SRN and the warranty record.
3. Select the reason: **Supplier Warranty Claim**.
4. The system generates a **Supplier Debit Note** for the cost of the replacement unit and any handling charges.

---

## Section 5: Warranty Claim History and Reporting

### Viewing Claim History for a Serial Number

Open any serial number trace record (see Section 1). The **Claims History** tab shows every warranty claim or return event linked to that unit, in chronological order.

### Warranty Analysis Reports

1. Go to **Reports > Warranty Analysis**.
2. Available reports include:

| Report | What It Shows |
|---|---|
| Claims by Product | Which products generate the most warranty claims — helps identify manufacturing or quality issues |
| Claims by Supplier | Warranty claim rate broken down by supplier — used for supplier debit note negotiations |
| Claims by ASP | Which ASPs have the highest claim rates — may indicate improper installation |
| Claims by Fault Type | Breakdown by fault description — highlights recurring failures |
| Average Time to Claim | How many days after sale the claim is typically raised — early clusters suggest DOA issues |
| Warranty Cost Summary | Total cost of warranty replacements and repairs in the period |

---

## Section 6: Batch Recall (Quality Event Across a Lot)

If a quality defect is discovered that affects an entire production batch (e.g., a manufacturing defect confirmed by the supplier), the system supports a batch recall workflow.

1. Go to **Traceability > Batch Lots**.
2. Find the affected lot by lot number.
3. Click **Initiate Quality Hold on Lot**.
4. Select:
   - **Hold in warehouse** — any remaining stock of this lot in the warehouse is placed on QC hold immediately. No further dispatch is allowed.
   - **Recall from ASPs** — if stock from this lot has been sent to ASPs, the system generates return requests to all affected ASPs.
   - **Customer notification** — generates a list of all customers who received units from this lot, for manual outreach by the customer service team.
5. Click **Confirm Hold**. All affected stock is immediately flagged across the system.

> **Note:** A batch hold does not automatically return stock from customer sites. Customer notification and field action must be managed manually through the customer service team.

---

## Tips and Warnings

- **Serial numbers are the backbone of warranty.** If a serial number was not scanned at receiving or dispatch, the warranty record cannot be created automatically. Always enforce serial number scanning. See [Receiving Guide](03-receiving.md) and [Picking and Dispatch Guide](04-picking-and-dispatch.md).
- **Never process a warranty claim without checking the serial number.** A claim on an expired warranty, or on a unit that was never in your records, must go through the supervisor before any replacement is dispatched.
- **Manufacturing date drives FIFO, not receipt date.** For AC units, the system prioritises dispatch by manufacturing date. A unit manufactured in January should ship before a unit manufactured in March, even if both arrived at the warehouse on the same day.
- **Warranty records follow the unit, not the customer.** If an ASP transfers a unit to a different customer, the warranty stays attached to the serial number. Update the installation address on the warranty record when a unit is relocated.
- **Batch holds are serious events.** Do not initiate a batch hold without manager authorisation. A hold on a large lot stops sales of those products immediately and can have significant commercial impact.

---

## What Happens Next

Serial and batch traceability records are permanent and cannot be deleted. They form the legal and financial record of every unit's lifecycle in the DIKEN network.

- Related guides: [Receiving Goods](03-receiving.md), [Picking and Dispatch](04-picking-and-dispatch.md), [Returns Processing](05-returns.md), [ASP Channel](08-asp-channel.md), [Refrigerant Compliance](09-refrigerant-compliance.md)
