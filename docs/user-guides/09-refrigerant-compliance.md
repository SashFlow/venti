# Refrigerant Compliance Guide

**For:** Warehouse managers, QC inspectors, and compliance officers responsible for the safe storage, handling, tracking, and regulatory reporting of refrigerant gases at DIKEN warehouses.

---

## Prerequisites

- The Refrigerant zone must be set up in your warehouse with the Hazardous Material Zone toggle enabled. See [Warehouse Setup Guide](01-warehouse-setup.md).
- Refrigerant products must exist in the Product Master with the **Refrigerant Product** toggle enabled. See [Product Master Guide](02-product-master.md).
- Only users with the **Refrigerant Compliance** role can post cylinder records and generate regulatory reports.

---

## Overview

Refrigerant gases (R-32, R-410A, R-22, and others) are regulated substances. DIKEN is legally required to:
- Track every cylinder by a unique ID from receipt to disposal.
- Record weights at intake, dispatch, and recovery.
- Maintain an audit log of all refrigerant movements.
- Comply with storage safety requirements (ventilation, hazard signage, segregation).

This guide covers the full refrigerant compliance workflow: receiving cylinders, storing them, dispatching them, recovering residual gas from scrapped units, and generating the regulatory audit report.

---

## Section 1: Refrigerant Cylinder Receiving

Refrigerant cylinders follow the standard 3-step receiving workflow (see [Receiving Guide](03-receiving.md)) with additional cylinder-specific steps.

### After the GRN is posted — Recording Cylinder Details

Once the GRN is posted and the cylinders move to the Refrigerant zone, each cylinder must be registered individually in the system.

1. Go to **Compliance > Refrigerant > Cylinder Registry > New Cylinders from GRN**.
2. Select the GRN that contains the refrigerant receipt.
3. The system loads the refrigerant product lines with the received quantities.
4. For each cylinder in the shipment, click **Add Cylinder** and fill in:

| Field | What to Enter | Where to Find It |
|---|---|---|
| Cylinder ID | The unique ID stamped or labelled on the cylinder valve tag | Physical cylinder tag |
| Gas Type | R-32 / R-410A / R-22 / other — pre-filled from product record | Confirm against the cylinder label |
| Gross Weight (kg) | Weigh the cylinder on a calibrated scale and enter the reading | Scale at the receiving dock |
| Tare Weight (kg) | The empty weight of the cylinder (printed on the cylinder body) | Stamped on cylinder shoulder |
| Fill Date | The manufacturing / fill date printed on the cylinder | Cylinder label |
| Supplier Lot Number | The supplier's batch reference | Delivery note or cylinder label |

5. The system automatically calculates **Net Gas Weight = Gross Weight – Tare Weight**.
6. Click **Save Cylinder**. The cylinder is now registered and assigned a unique internal **Cylinder Record ID** (CRI).
7. Repeat for every cylinder in the shipment.
8. Once all cylinders are registered, click **Confirm Registration Complete**.

> **Warning:** Never accept a cylinder without recording the gross weight at intake. Without the intake weight, you cannot prove how much gas was in the cylinder when received. This is required for regulatory and insurance purposes.

---

## Section 2: Cylinder Storage

All refrigerant cylinders must be stored in the designated Refrigerant zone. The system enforces this: put-away tasks for refrigerant products will only show bins within zones marked as Refrigerant type.

### Physical Storage Requirements (non-system)

Ensure the following physical requirements are in place at your site. The system cannot enforce these, but they are your legal obligation:

- Cylinders must be stored upright and secured with chains or straps to prevent falling.
- The Refrigerant zone must have active mechanical ventilation.
- No ignition sources within 3 metres of cylinder storage.
- Hazardous material warning signage must be posted at all entry points to the zone.
- Cylinder storage must be segregated by gas type (R-32 cylinders and R-22 cylinders must not be stored in the same bin area due to different pressure ratings).
- Full cylinders must be stored separately from empty cylinders.

### Viewing Cylinder Status in the System

1. Go to **Compliance > Refrigerant > Cylinder Registry**.
2. Filter by **Status**:
   - **Full** — received and not yet dispatched
   - **Partially Used** — cylinder has been partially dispensed (weight updated after partial use)
   - **Empty** — cylinder has been returned from a job and is empty or near-empty
   - **Returned to Supplier** — cylinder sent back to the gas supplier
   - **Quarantined** — cylinder flagged for inspection (damage, leakage suspected)

---

## Section 3: Dispatching Refrigerant Cylinders

When a refrigerant cylinder is dispatched to a technician, ASP, or customer, the picking process includes additional cylinder confirmation steps.

### During Picking

When a pick task includes a refrigerant cylinder:

1. The picker receives a prompt on the pick screen: **"Refrigerant Cylinder — Scan Cylinder ID"**.
2. Scan the cylinder valve tag barcode (this matches the Cylinder ID registered at receipt).
3. The system confirms the cylinder is assigned to this pick task.
4. Weigh the cylinder before dispatch:
   - Place the cylinder on the weighing scale.
   - Enter the **Pre-Dispatch Weight (kg)** in the prompt on the pick screen.
5. Confirm the weight reading. If the pre-dispatch weight is significantly lower than the intake gross weight (indicating possible leakage), the system will flag the cylinder for inspection and will not allow dispatch.
6. Complete the pick as normal.

### Post-Dispatch Record

After dispatch is confirmed, the system updates the cylinder record:
- Status → **Dispatched**
- Dispatched to: the customer, technician, or ASP name
- Dispatch date and dispatch weight recorded.

---

## Section 4: Recording Cylinder Returns and Empties

When a technician returns a used or empty cylinder to the warehouse:

1. Go to **Compliance > Refrigerant > Cylinder Returns > New Return**.
2. Scan or enter the **Cylinder ID**.
3. The system displays the cylinder's history: received weight, dispatch weight, dispatched to.
4. Weigh the returned cylinder and enter the **Return Weight (kg)**.
5. The system calculates **Gas Consumed = Dispatch Weight – Return Weight**.
6. Select the **Return Status**:
   - **Empty** — cylinder is empty; ready to return to supplier
   - **Partially Used** — cylinder still has gas remaining; update and return to stock
   - **Damaged** — cylinder is physically damaged; flag for quarantine
   - **Leaking** — suspected gas leakage; flag for urgent quarantine and investigation
7. Add notes if needed.
8. Click **Save Return**.

For **Partially Used** cylinders: the system updates the cylinder's gross weight to the return weight and returns it to the Refrigerant zone stock for future dispatch.

For **Empty** cylinders: the cylinder is flagged as empty. It can be included in a vendor return to the gas supplier for refilling. See Section 6.

For **Damaged** or **Leaking** cylinders: the cylinder is placed in Quarantine status. A safety incident must be logged and the cylinder must not be moved until cleared by a qualified technician. Contact your HSEQ team immediately.

---

## Section 5: Refrigerant Gas Recovery from Scrapped Units

When an AC unit is scrapped and it contains refrigerant (charge in the circuit), the refrigerant must be recovered before the unit is disposed of. This is a legal requirement — venting refrigerant to atmosphere is prohibited.

This step is triggered from the Returns workflow when a unit is marked for scrap. See [Returns Processing Guide](05-returns.md), Section 4 (Salvage Logging).

In the salvage log, when you select **Component Type = Refrigerant Gas**:

1. Enter the **Gas Type** (from the unit's product record).
2. Enter the **Estimated Recovered Weight (kg)** — this is the amount of gas recovered using a recovery machine.
3. Enter the **Recovery Cylinder ID** — the ID of the recovery cylinder used to capture the gas.
4. Click **Save**.

The system creates a new cylinder record for the recovered gas, flagged as **Recovered Gas – For Disposal or Reclaim** depending on your company policy.

> **Important:** Recovered gas from old or damaged units (especially R-22 legacy equipment) may not be suitable for reuse and must be sent to a licensed refrigerant reclamation facility. Do not mix recovered gas with new virgin refrigerant stocks.

---

## Section 6: Returning Empty Cylinders to the Supplier

Most refrigerant cylinders are returnable assets — the supplier charges a deposit and expects cylinders back after they are emptied.

1. Go to **Compliance > Refrigerant > Cylinder Returns to Supplier > New Return**.
2. Select the **Supplier**.
3. Click **Add Cylinders** and select from the list of cylinders with status **Empty** that belong to this supplier.
4. Verify the cylinder IDs match the physical cylinders being packed for return.
5. Click **Confirm Cylinder Return List**.
6. The system generates a **Cylinder Return Document** — print it and include it with the return shipment.
7. When the supplier confirms receipt, go back to this record and click **Confirm Supplier Received**. The cylinder record status updates to **Returned to Supplier** and the deposit credit is noted on the supplier account.

---

## Section 7: Generating the Regulatory Audit Report

The Refrigerant Compliance module produces a complete audit trail suitable for submission to regulatory authorities.

1. Go to **Compliance > Refrigerant > Audit Report**.
2. Set the reporting period (e.g., quarterly or annual).
3. Select the **Warehouse** (or All Warehouses for a consolidated report).
4. Click **Generate Report**.

The report includes:

| Section | Contents |
|---|---|
| Cylinder Inventory | All cylinders received in the period: Cylinder ID, gas type, fill date, intake weight, supplier |
| Dispatches | All cylinders dispatched: Cylinder ID, dispatch date, dispatch weight, dispatched to |
| Returns | All cylinders returned: return date, return weight, gas consumed, return status |
| Gas Recovery | All refrigerant recovered from scrapped units |
| Cylinder Returns to Supplier | All empty cylinders returned, with confirmation status |
| Net Gas Balance | Opening stock + received – dispatched – recovered – returned = closing stock |

5. Click **Export to PDF** or **Export to Excel** for submission.

> **Note:** Regulatory reporting requirements vary by jurisdiction. Confirm with your legal or HSEQ team what is required and at what frequency before scheduling this report.

---

## Tips and Warnings

- **Weigh every cylinder at every step.** Intake weight, pre-dispatch weight, and return weight together form the complete mass balance record. Missing any one of these leaves a gap in the audit trail.
- **Quarantine a leaking cylinder immediately.** Refrigerant leaks are a health and safety hazard (especially R-32, which is flammable). Do not attempt to move a leaking cylinder without qualified personnel and proper PPE. Evacuate the immediate area and call your HSEQ team.
- **Do not mix gas types.** Each gas type has its own pressure rating and chemical properties. Mixing R-32 and R-410A, for example, creates a non-standard mixture that cannot be used in equipment and is difficult and costly to reclaim. Store and handle each gas type separately.
- **Empty cylinders still have pressure.** Always treat cylinders as pressurised, even when labelled empty. Never cut, puncture, or apply heat to a cylinder.
- **Recovery is a legal requirement.** Technicians in the field must use certified recovery equipment before decommissioning any unit. If a technician reports they released refrigerant to atmosphere, this must be reported to your HSEQ officer. The system requires a recovery weight entry; a zero entry flags for supervisor review.

---

## What Happens Next

Refrigerant compliance records feed into the regulatory audit report. All cylinder movements are permanently recorded in the audit log and cannot be deleted.

- Related guides: [Warehouse Setup](01-warehouse-setup.md), [Receiving Goods](03-receiving.md), [Returns Processing](05-returns.md), [Picking and Dispatch](04-picking-and-dispatch.md)
