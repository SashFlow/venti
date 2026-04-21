# Receiving Goods Guide

**For:** Dock supervisors, receiving operatives, and QC inspectors responsible for accepting incoming shipments at DIKEN warehouses.

---

## Prerequisites

- Your warehouse levels, zones, aisles, racks, and bins must be set up. See [Warehouse Setup Guide](01-warehouse-setup.md).
- All products being received must exist in the Product Master. See [Product Master Guide](02-product-master.md).
- A Purchase Order (PO) must exist in the system before you can create a GRN against it. See [Procurement Guide](06-procurement.md).
- Know which receiving workflow your warehouse uses: **1-step, 2-step, or 3-step**. Your warehouse manager will confirm this.

---

## Overview

A **Goods Receipt Note (GRN)** is the record created when goods arrive at the warehouse. The GRN links the physical delivery to a Purchase Order, records what was actually received (which may differ from what was ordered), and kicks off the put-away or QC process.

The three receiving workflows differ in how many steps happen between the truck arriving and the goods being available in stock:

| Workflow | Steps | Used At |
|---|---|---|
| 1-Step | Receive → Stock immediately | Local DCs (inter-warehouse transfers) |
| 2-Step | Receive → Put-Away | Regional DCs |
| 3-Step | Receive → QC Hold → Put-Away | National DC (supplier deliveries) |

---

## Section 1: 1-Step Receiving (Direct to Stock)

Use this workflow only when goods arrive from a trusted source (another DIKEN warehouse) and no inspection is required.

1. Go to **Receiving > New GRN**.
2. In the **Source** field, select **Purchase Order** or **Transfer Order** depending on the source.
3. Type or scan the PO number in the search box and click **Load PO**. The expected products and quantities will appear automatically.
4. At the top of the GRN form, confirm:
   - **Receiving Warehouse**: your warehouse
   - **Dock Door**: the door number the truck is at
   - **Supplier / Source Warehouse**: pre-filled from the PO
   - **Delivery Reference**: the supplier's delivery note or vehicle number
   - **Delivery Date**: today's date (auto-filled; change only if backdating an entry)
5. For each product line, enter the **Received Qty**:
   - If the full quantity was delivered, the field will already show the expected quantity. Confirm it by clicking the checkmark.
   - If a partial quantity was delivered, change the number to the actual count.
   - Scan the barcode on each carton to confirm the product code matches.
6. For **serialised products** (AC units, compressors): after entering the quantity, a serial number entry screen will appear. Scan or type each serial number one by one. The system will not let you post the GRN until the number of serial numbers matches the received quantity.
7. Once all lines are entered, click **Post GRN**.
8. The system will:
   - Update stock immediately.
   - Generate bin assignments for each item.
   - Print a GRN summary and bin labels automatically.

> **Warning:** In 1-step receiving, stock is available immediately after posting. Do not use 1-step for supplier deliveries where QC inspection is required.

---

## Section 2: 2-Step Receiving (Receive + Put-Away)

Use this workflow when goods need to be physically counted and moved to a bin before stock is confirmed.

### Step A: Create the GRN (at the dock)

1. Go to **Receiving > New GRN**.
2. Select the PO and click **Load PO**.
3. Confirm the header details (warehouse, dock, supplier, delivery reference, date).
4. For each product line, enter the **Received Qty** and scan barcodes.
5. For serialised products, scan all serial numbers.
6. Click **Save GRN** (not Post — this records the arrival without committing stock).

The GRN status becomes **Received – Pending Put-Away**.

### Step B: Execute Put-Away

1. Go to **Receiving > Pending Put-Away**.
2. Find the GRN you just created and click **Start Put-Away**.
3. The system displays a put-away task list showing each product, the quantity, and the bin it has been assigned to.
4. Take each item to the assigned bin. When you arrive at the bin:
   - Scan the **bin barcode** on the rack label.
   - Scan the **product barcode** on the carton.
   - Confirm the **quantity** being placed in the bin.
5. If you need to split a quantity across multiple bins (e.g., not all units fit in the assigned bin), tap **Split** and scan an alternative bin.
6. Once all items are confirmed in their bins, click **Complete Put-Away**.
7. The GRN status changes to **Posted** and stock becomes available.

> **Tip:** The system assigns bins automatically based on the product's weight class. If the assigned bin is already full, you can tap **Override Bin** to select an alternative — but always keep the same weight-class zone.

---

## Section 3: 3-Step Receiving (Receive + QC + Put-Away)

This is the most thorough workflow, used when goods arrive from external suppliers and must pass a quality check before being stocked.

### Step A: Create the GRN (at the dock)

1. Go to **Receiving > New GRN**.
2. Select the PO and click **Load PO**.
3. Confirm header details.
4. For each line, enter the **Received Qty** and scan barcodes.
5. Note any obvious packaging damage in the **Delivery Condition** field. Select:
   - **Good Condition** — packaging intact, no visible damage
   - **Minor Damage** — some carton damage but product appears unaffected
   - **Significant Damage** — product may be affected; flag for priority QC inspection
6. For serialised products, scan serial numbers.
7. Click **Save GRN**. Do not post yet.

The system automatically creates a **QC Inspection Task** and routes all received items to the **QC Hold zone**.

### Step B: Move Goods to QC Hold Zone

1. Dock operatives move the goods to the QC Hold zone (using forklift or pallet jack as appropriate).
2. Go to **Receiving > QC Tasks**.
3. Open the QC task linked to this GRN.
4. Confirm receipt in QC Hold by scanning the QC Hold zone barcode and clicking **Confirm Moved to QC**.

### Step C: QC Inspection

The QC inspector works through the inspection task:

1. Go to **Quality > QC Inspections > Pending**.
2. Open the task and review the **Sampling Plan**:
   - **Full Inspection**: every unit must be inspected
   - **AQL Sampling**: the system specifies how many units to inspect from the batch (based on AQL tables). Inspect only those units.
   - **Random Spot Check**: the system selects a random number for inspection

3. For each unit in the sample:
   - Scan the unit's barcode or serial number.
   - Complete the inspection checklist (the checklist is defined per product family — for AC units this typically includes: packaging integrity, model label check, refrigerant charge intact, no dents or scratches, remote control included).
   - Record the result: **Pass**, **Fail**, or **Conditional Pass**.

4. After inspecting the sample, record the overall outcome for each GRN line:

| Outcome | Meaning | What Happens |
|---|---|---|
| **Accept** | All inspected units passed | Goods proceed to put-away |
| **Conditional Accept** | Minor issues noted but goods are usable | Goods proceed to put-away with a note; a follow-up action is created |
| **Reject** | Significant quality failure | Goods stay in QC Hold; a supplier claim is created |

5. Click **Submit QC Result**.

### Step D: Handling Rejected or Short Goods

**Short Delivery (fewer units than ordered):**
- The system automatically marks the difference as a **Short Line** on the GRN.
- A **Short Delivery Notification** is sent to the procurement team.
- You can choose to close the PO line as partially fulfilled, or keep it open for the supplier to deliver the balance.

**Damaged Goods:**
1. In the GRN, click the line with damaged goods.
2. Click **Mark as Damaged**.
3. Select the damage type: Packaging Only, Product Damaged – Repairable, Product Damaged – Scrap.
4. Enter the quantity affected.
5. Add a note and, if possible, attach a photo.
6. The system will automatically route these items to the **QC Hold** zone (for repairable items) or flag them for disposal (for scrap).
7. A supplier claim draft is created automatically — the procurement team will review and send it.

**Rejected goods from QC:**
- Rejected goods remain in the QC Hold zone.
- The QC Inspector clicks **Initiate Vendor Return** on the QC task.
- See [Returns Guide](05-returns.md) for the full vendor return process.

### Step E: Put-Away After QC

Once a GRN line has been accepted or conditionally accepted:

1. Go to **Receiving > Pending Put-Away**.
2. The system shows only the accepted lines and their assigned bins.
3. Follow the same put-away steps as Section 2, Step B above.
4. Conditionally accepted items are put-away with a **Quality Note** flagged on their stock record. Pickers will see this note when the item is selected for dispatch.

---

## Section 4: Barcode Scanning at the Dock

All receiving tasks are designed to be done with a barcode scanner or the mobile app on a handheld device.

**General scanning rules:**
- Always scan the **bin barcode first**, then the **product barcode**. This prevents putting the wrong product in a bin.
- If a barcode does not scan, try manual entry by tapping **Type Code** and entering the number. If the code is still not recognised, do not proceed — contact your supervisor. Never receive goods without confirming the product code in the system.
- For serialised products, the scanner will prompt you to scan each serial number individually. Scan them one by one, not in bulk.

**What happens if a scan gives an error:**

| Error Message | Likely Cause | What To Do |
|---|---|---|
| "Product not found" | Product not in the catalogue | Contact your product manager to add the product |
| "PO line already fully received" | Duplicate delivery or system already updated | Check with the procurement team |
| "Serial number already in stock" | Possible duplicate unit or system entry error | Do not receive — escalate to your supervisor |
| "Bin weight limit exceeded" | Too much weight already in the bin | The system will suggest the next available bin |

---

## Tips and Warnings

- **Never post a GRN before verifying the product codes.** A wrong product on a GRN affects stock levels and financial records.
- **Photograph all damaged goods before moving them.** Photos support supplier claims and insurance reports.
- **For refrigerant cylinders:** a special receiving workflow applies. Scan the cylinder ID, record the gross weight at receipt, and the system will calculate the gas fill weight from the tare weight on the product record. See [Refrigerant Compliance](09-refrigerant-compliance.md).
- **Multiple deliveries against one PO:** you can create more than one GRN against a single PO. The system will track cumulative received quantities and show the remaining open quantity on the PO.
- **The GRN cannot be edited after posting.** If you make an error after posting, you must process a stock adjustment. See [Inventory Management](07-inventory-management.md).

---

## What Happens Next

After goods are received and put away, they are available for picking and dispatch.

- Next guide: [Picking and Dispatch](04-picking-and-dispatch.md)
- Related guides: [Procurement](06-procurement.md), [Returns](05-returns.md), [Refrigerant Compliance](09-refrigerant-compliance.md), [Warranty and Traceability](10-warranty-and-traceability.md)
