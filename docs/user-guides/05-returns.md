# Returns Processing Guide

**For:** Customer service staff, warehouse supervisors, and QC inspectors who process returned goods from customers, and for procurement officers who handle vendor returns to suppliers.

---

## Prerequisites

- The original sales order or delivery note number must be available to link the return correctly.
- The warehouse's Returns zone must be set up. See [Warehouse Setup Guide](01-warehouse-setup.md).
- For credit note generation, the sales or finance team must have appropriate access roles.
- For vendor returns, the original Purchase Order or GRN number must be available.

---

## Overview

Returns follow one of two paths depending on who is returning goods:

- **Customer returns (Sales Return Note / SRN):** A customer sends back goods they previously purchased. The goods arrive at the warehouse and must be inspected and either returned to stock or processed for disposal.
- **Vendor returns:** DIKEN sends defective or rejected goods back to the supplier.

Both processes begin with a formal return document in the system. Never accept physical goods at the dock without first creating a return document — this protects stock accuracy and ensures the correct credit or debit note is raised.

---

## Section 1: Creating a Sales Return Note (SRN)

An SRN is created either by customer service (when a customer calls to report a problem) or by the warehouse (when goods arrive at the dock without prior notice).

1. Go to **Returns > New Sales Return Note**.
2. In the **Source Document** field, type the original Delivery Note number or Sales Order number and click **Load**. The system will fill in the customer name, products delivered, and quantities.
3. If the customer does not have the delivery note number, search by customer name and date range.
4. For each item being returned, enter:
   - **Return Quantity** — how many units are being returned
   - **Reason Code** — select from the standard list:

| Reason Code | Use When |
|---|---|
| Purchased in Error | Customer ordered the wrong model or capacity |
| Duplicate Order | Customer received a second delivery they did not want |
| Product Defective | Unit not functioning correctly on installation |
| Dead on Arrival (DOA) | Unit failed immediately after first use |
| Transit Damage | Physical damage sustained during delivery |
| Customer Dissatisfied | No product fault; customer simply unhappy |
| Warranty Claim | Failure within the warranty period (link to warranty record) |
| Excess Stock | Dealer/ASP returning unsold stock (consignment) |

5. Select the **Condition** of the returned item:

| Condition | Description |
|---|---|
| Good – Resalable | Unused and fully intact; can go directly back to stock |
| Good – Open Box | Used briefly but fully functional; may need repackaging |
| Defective – Repairable | Has a fault but can be repaired (e.g., PCB failure) |
| DOA – Dead on Arrival | Failed on first use; needs technician assessment |
| Damaged – Cosmetic | Physical damage but unit may still function |
| Damaged – Non-Repairable | Severe damage; cannot be repaired; flag for scrap |

6. If the return is a **Warranty Claim**, click **Link Warranty Record** and search for the warranty by serial number. The system will confirm whether the unit is within the warranty period.
7. For serialised products: enter or scan the serial number of each unit being returned.
8. Add any notes or attach photos of the returned goods condition.
9. Click **Save SRN** to create the record. The SRN number is generated and displayed.

---

## Section 2: Automatic Routing Based on Condition

Once the SRN is saved, the system automatically routes the returned goods to the appropriate location:

| Condition | Routed To |
|---|---|
| Good – Resalable | Back to regular Bulk Storage bin |
| Good – Open Box | Returns zone (for repackaging before returning to stock) |
| Defective – Repairable | QC Hold zone |
| DOA | QC Hold zone (priority flag) |
| Damaged – Cosmetic | Returns zone (for assessment) |
| Damaged – Non-Repairable | QC Hold zone (for scrap authorisation) |

The system generates a put-away task for the warehouse operative to move the goods to the correct zone.

1. Go to **Returns > Pending Returns Receiving**.
2. Open the pending returns task linked to the SRN.
3. Physically receive the goods at the dock:
   - Scan the SRN barcode (printed on the returns label).
   - Scan each product barcode and serial number.
   - Confirm quantities.
4. Click **Confirm Receipt**.
5. Move goods to the zone indicated on the task screen and scan the zone barcode to confirm placement.

---

## Section 3: Inspection Workflow for Returned Goods

All returned goods that are not Good – Resalable must go through an inspection before any decision is made.

1. Go to **Returns > Inspection Queue**.
2. Open the inspection task for the returned goods.
3. The inspector reviews each unit:

### For Defective – Repairable Units:
1. Check the unit and diagnose the fault.
2. Record the fault description in the **Fault Log** field.
3. Select the **Recommended Action**:
   - **Repair in-house** — send to the workshop team
   - **Refurbish** — clean, repackage, and return to stock at a lower grade
   - **Escalate to Supplier** — unit needs supplier repair or replacement
   - **Scrap** — unit cannot be repaired at reasonable cost
4. Click **Submit Inspection Result**.

### For DOA Units:
1. The system flags DOA units for priority review.
2. Verify the serial number, purchase date, and whether the unit is within the warranty period.
3. Select the action:
   - **Replace under warranty** — initiate a replacement dispatch and a vendor return
   - **Repair under warranty** — send to workshop
   - **Reject warranty claim** — if the fault is due to improper installation or misuse (document the reason)
4. Click **Submit DOA Assessment**.

### For Scrap Units:
1. Open the unit's record and click **Authorise for Scrap**.
2. A scrap authorisation must be approved by the warehouse manager before any disposal can occur.
3. Once approved, the unit is removed from stock (stock count decreases by 1).
4. Log the disposal in the scrap register.

---

## Section 4: Salvage Logging

For units that are scrapped or being sent for disposal, the system allows salvageable components to be logged and retained as spare parts stock.

1. Open the scrapped unit's record and click **Log Salvage Parts**.
2. For each recoverable component, click **Add Salvage Item**:
   - **Component Type** — select from: Compressor, PCB / Control Board, Copper Pipe, Fan Motor, Refrigerant Gas, Condenser Coil, Evaporator Coil, Other
   - **Condition** — Working, Reusable, Scrap
   - **Quantity / Weight** — for copper and refrigerant, enter weight in kg; for discrete components, enter unit count
   - **Recovered Refrigerant** — if refrigerant is being recovered from the unit, this must be recorded here and in the Refrigerant Compliance module. See [Refrigerant Compliance](09-refrigerant-compliance.md).
3. Click **Save Salvage Log**.

The system will add Working and Reusable components to the spare parts stock register, tagged as Salvaged. These can be used internally or sold at a salvage price.

> **Warning:** Refrigerant gas must never be vented to atmosphere. Recovery is legally required. All refrigerant recovery must be logged here and must comply with local environmental regulations. See [Refrigerant Compliance](09-refrigerant-compliance.md).

---

## Section 5: Credit Note Generation

Once an SRN is confirmed and the return is processed, the finance team can generate a credit note for the customer.

1. Go to **Returns > Completed SRNs** and open the SRN.
2. Click **Generate Credit Note**.
3. Review the credit note details:
   - **Credit Amount** — automatically calculated from the original sale price of the returned items
   - **Restocking Fee** — if applicable (configured per return reason code in settings), a percentage will be deducted. For example, "Purchased in Error" may have a 10% restocking fee.
   - **Credit Method** — select how the credit will be applied:
     - **Against Future Invoice** — credit sits on the customer's account
     - **Refund** — initiate a direct refund (requires finance approval)
     - **Replacement** — credit is used to fund a replacement dispatch
4. Click **Post Credit Note**. The credit note is sent to the finance system and a copy is emailed to the customer automatically.

> **Tip:** For warranty claims, the credit note is typically zero (goods are replaced, not refunded). Use Credit Method = Replacement and link it to the replacement sales order.

---

## Section 6: Vendor Returns

When rejected goods from a supplier or goods that need to be returned under a supplier warranty need to go back, you process a Vendor Return.

1. Go to **Returns > Vendor Returns > New Vendor Return**.
2. Select the **Supplier** from the list.
3. Link the original **GRN number** (the receipt where these goods came in).
4. For each product being returned:
   - Select the product.
   - Enter the quantity.
   - Select the reason:
     - **Quality Rejection (post-GRN QC)** — goods failed inspection
     - **Supplier Warranty Claim** — unit failed within supplier warranty period
     - **Wrong Goods Supplied** — supplier sent incorrect product
     - **Overshipment** — more units delivered than ordered
5. Enter or scan the serial numbers of units being returned.
6. Select the **Return Method**:
   - **Return for Replacement** — supplier to send replacement units
   - **Return for Credit** — supplier to issue a credit against future purchases
   - **Return for Repair** — supplier will repair and return
7. Click **Save Vendor Return**. A **Vendor Return Authorisation (VRA)** number is generated.
8. Communicate the VRA number to the supplier along with the return shipment.
9. When the goods are physically dispatched back to the supplier, go to the Vendor Return record and click **Confirm Dispatched**.
10. When the supplier confirms receipt and issues a credit or replacement, go back to the Vendor Return record and click **Close with Credit** or **Close with Replacement**.

---

## Tips and Warnings

- **Always create the SRN before accepting goods at the dock.** If goods arrive without an SRN and you are not sure what they are, quarantine them in the Returns zone and contact customer service before proceeding.
- **Serial numbers are critical for warranty claims.** If a serial number has been scratched off or cannot be read, the system cannot verify the warranty. Photograph the unit and escalate to your supervisor before proceeding.
- **Do not return defective goods directly to Bulk Storage.** Even if the customer says the unit is "working fine", it must go through the inspection workflow before being returned to stock. This protects the next customer.
- **Excess consignment stock from ASPs** follows the same SRN process but uses reason code "Excess Stock". For details on ASP consignment management, see [ASP Channel Guide](08-asp-channel.md).
- **Credit notes require manager approval** if the credit amount exceeds the threshold set in your company's finance settings (ask your finance team what this threshold is).

---

## What Happens Next

Returned goods that are repaired and returned to stock enter the normal inventory. Scrapped units are removed from stock. Vendor returns close out supplier liabilities.

- Related guides: [Picking and Dispatch](04-picking-and-dispatch.md), [Inventory Management](07-inventory-management.md), [Refrigerant Compliance](09-refrigerant-compliance.md), [Warranty and Traceability](10-warranty-and-traceability.md), [ASP Channel](08-asp-channel.md)
