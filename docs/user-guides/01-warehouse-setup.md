# Warehouse Setup Guide

**For:** Warehouse Managers and System Administrators responsible for configuring the physical layout of DIKEN warehouses in the system.

---

## Prerequisites

- You must have a Manager or Administrator login account.
- Have the physical warehouse floor plan available (with dimensions, floor levels, and zone markings).
- Know which receiving and shipping workflow your warehouse uses (1-step, 2-step, or 3-step). Confirm this with your operations manager before starting.

---

## Overview

Setting up your warehouse in the system follows a top-down structure:

**Warehouse → Levels → Zones → Aisles → Racks → Bins**

Each level of this structure must be created before the next. For example, you cannot create a zone without first creating the level it belongs to. Work through each section of this guide in order.

---

## Section 1: Create the Warehouse

1. From the main menu, go to **Configuration > Warehouses**.
2. Click **New Warehouse**.
3. Fill in the following fields:
   - **Warehouse Name** — e.g., "DIKEN National DC – Karachi"
   - **Short Code** — a 3–5 letter code used on labels, e.g., "KHI-DC"
   - **Address** — full physical address of the warehouse
   - **Contact Person** — the warehouse manager's name and phone number
   - **Warehouse Type** — select from: National DC, Regional DC, or Local DC
4. Click **Save**.

> **Tip:** The warehouse type determines how multi-tier replenishment works. Make sure you select the correct type. See the [Procurement Guide](06-procurement.md) for details on replenishment tiers.

---

## Section 2: Set Up Warehouse Levels

Levels represent the physical floors or elevated platforms in your warehouse (for example, a ground floor and a mezzanine level).

1. Open the warehouse you just created and click the **Levels** tab.
2. Click **Add Level**.
3. Fill in:
   - **Level Name** — e.g., "Ground Floor" or "Mezzanine Level 1"
   - **Level Code** — e.g., "GF" or "MZ1"
   - **Floor Height (metres)** — the height from ground to this level (Ground Floor = 0)
   - **Max Load Capacity (kg per sq. metre)** — check with your facilities team
   - **Suitable For** — select the weight classes this level can handle:
     - Ground Floor: select **Heavy (>50 kg)**, **Medium (10–50 kg)**, and **Light (<10 kg)**
     - Mezzanine: select **Light (<10 kg)** only (unless your mezzanine is rated for heavier loads)
4. Click **Save Level**.
5. Repeat for each physical level in your warehouse.

> **Warning:** Do not assign heavy items (outdoor units, compressors, large chillers) to mezzanine levels unless your mezzanine has been structurally certified for that load. Incorrect weight-class settings can generate incorrect put-away instructions.

---

## Section 3: Set Up Zones

Zones divide each level into functional areas. DIKEN warehouses typically use the following standard zones:

| Zone Name | Purpose | Recommended Level |
|---|---|---|
| Bulk Storage | Main storage for saleable stock | Ground Floor and/or Mezzanine |
| QC Hold | Items awaiting quality inspection | Ground Floor, near dock |
| Returns | Returned goods awaiting processing | Ground Floor |
| Staging | Orders picked and waiting for dispatch | Ground Floor, near dispatch dock |
| Refrigerant | Refrigerant cylinders (regulated storage) | Ground Floor, ventilated area |

**To create a zone:**

1. Inside the warehouse, go to the **Zones** tab.
2. Click **Add Zone**.
3. Fill in:
   - **Zone Name** — use the standard names above for consistency
   - **Zone Code** — e.g., "BULK", "QCHOLD", "RTN", "STG", "REFRIG"
   - **Level** — select which floor level this zone is on
   - **Zone Type** — select from: Storage, QC, Returns, Staging, Refrigerant
   - **Temperature Controlled** — toggle on if this zone has climate control (required for Refrigerant zone)
   - **Hazardous Material Zone** — toggle on for the Refrigerant zone
4. Click **Save Zone**.

> **Tip:** You can create multiple Bulk Storage zones on different levels (e.g., one on the ground floor for heavy items, one on the mezzanine for light items). Give them distinct names such as "Bulk – Ground" and "Bulk – Mezzanine".

---

## Section 4: Set Up Aisles

Aisles are the corridors running through each zone. They help the system generate logical pick and put-away paths.

1. Go to the **Aisles** tab inside a zone.
2. Click **Add Aisle**.
3. Fill in:
   - **Aisle Name** — e.g., "Aisle A", "Aisle B"
   - **Aisle Code** — e.g., "A", "B", "C"
   - **Aisle Type** — select Drive-Through, Dead-End, or Cross-Aisle
   - **Direction** — North-South or East-West (used for optimising pick paths)
4. Click **Save Aisle**.
5. Repeat for all aisles in the zone.

---

## Section 5: Set Up Racks

Racks are the physical shelving structures within an aisle. Each rack has one or more levels (bays).

1. Inside an aisle, go to the **Racks** tab.
2. Click **Add Rack**.
3. Fill in:
   - **Rack Name** — e.g., "Rack A-01", "Rack A-02"
   - **Rack Code** — e.g., "A01", "A02"
   - **Rack Type** — select from:
     - **Pallet Rack** — for heavy items stored on pallets (ground floor)
     - **Shelving Rack** — for smaller items (mezzanine or light goods areas)
     - **Cantilever Rack** — for long items such as duct sections
     - **Floor Bay** — an open floor area for very large or very heavy items
   - **Number of Levels** — how many shelf levels this rack has (e.g., 4)
   - **Max Weight per Shelf (kg)** — check the rack manufacturer's rating plate
4. Click **Save Rack**.

> **Tip:** For HVAC outdoor units and large packaged chillers, use Floor Bay type on the ground floor. These items are too heavy and bulky for standard shelving.

---

## Section 6: Set Up Bins

Bins are the individual storage locations within a rack. This is where the system tracks stock down to the exact position.

1. Inside a rack, go to the **Bins** tab.
2. You can create bins one at a time or in bulk:

**Creating bins in bulk (recommended):**
- Click **Generate Bins**.
- Enter the number of columns (positions across the rack) and rows (levels on the rack).
- The system will automatically name bins using the format: Aisle – Rack – Column – Level (e.g., A-01-01-L1, A-01-01-L2, etc.)
- Click **Confirm Generation**.

**Creating a single bin:**
- Click **Add Bin**.
- Fill in Bin Code, Column, Level, Max Weight (kg), Max Volume (cubic metres), and Bin Type (Standard, Pallet, Oversize).
- Click **Save Bin**.

3. After creating bins, set the **Weight Class** for each bin (or apply a default to all bins in a rack):
   - Ground floor pallet racks → **Heavy**
   - Ground floor standard shelving → **Medium**
   - Mezzanine shelving → **Light**

> **Why this matters:** When a new shipment is received, the system reads the weight class of each product and automatically routes it to a bin with a matching weight class. Heavy outdoor units are sent to ground floor pallet bays; light spare parts and accessories go to mezzanine shelves. This routing is automatic — the warehouse operative just follows the instruction on their screen.

---

## Section 7: Configure Receiving Workflows

The system supports three receiving workflows. Your operations manager will have decided which one your warehouse uses. Configure it as follows:

1. Go to **Configuration > Warehouses**, open your warehouse, and click the **Workflows** tab.
2. Under **Inbound Workflow**, select one of:

### 1-Step Receiving
Goods arrive and go directly into stock. No separate QC or put-away step.
- Best for: Local DCs receiving trusted inter-warehouse transfers.
- Select **1-Step (Direct to Stock)**.

### 2-Step Receiving
Goods are received at the dock (creating a GRN), then put away as a separate step.
- Best for: Regional DCs receiving from the National DC.
- Select **2-Step (Receive + Put-Away)**.

### 3-Step Receiving
Goods are received at the dock, held in the QC Hold zone for inspection, then put away after QC is passed.
- Best for: National DC receiving from external suppliers.
- Select **3-Step (Receive + QC + Put-Away)**.

3. If you selected 3-Step, also configure:
   - **QC Sampling Plan** — select Full Inspection, AQL Sampling, or Random Spot Check
   - **Default QC Hold Zone** — select the QC Hold zone you created in Section 3

4. Click **Save Workflow Settings**.

---

## Section 8: Configure Shipping Workflows

1. Still on the **Workflows** tab, scroll to **Outbound Workflow**.
2. Select one of:

### 1-Step Shipping
Pick list is confirmed and the delivery order is created in one action.
- Best for: Local DCs with small, simple orders.

### 2-Step Shipping
Picking is done first, then a separate dispatch confirmation step is required.
- Best for: Regional DCs with moderate order volumes.

### 3-Step Shipping
Picking, then a packing/staging step, then a final dispatch confirmation.
- Best for: National DC or large-volume dispatch operations.

3. Set the **Default Staging Zone** for outbound orders (the Staging zone created in Section 3).
4. Click **Save Workflow Settings**.

---

## Section 9: Weight-Class Routing Rules

The system uses weight-class rules to automatically assign put-away bins. Review and confirm the defaults:

1. Go to **Configuration > Routing Rules > Weight Class Rules**.
2. You will see a table of rules. Confirm the following are set for your warehouse:

| Weight Class | Target Level | Target Zone | Target Bin Type |
|---|---|---|---|
| Heavy (>50 kg) | Ground Floor | Bulk – Ground | Pallet Rack or Floor Bay |
| Medium (10–50 kg) | Ground Floor | Bulk – Ground | Shelving Rack |
| Light (<10 kg) | Mezzanine | Bulk – Mezzanine | Shelving Rack |

3. If any rule is missing, click **Add Rule** and fill in the fields.
4. Click **Save Rules**.

> **Tip:** Products are assigned a weight class in the Product Master. If a product's weight class is not set, the system will fall back to the Medium rule. Always set weight class on the product record to get accurate routing.

---

## Tips and Warnings

- **Label everything physically after setting it up in the system.** Print bin labels from **Configuration > Print Bin Labels** and attach them to each rack position. Operatives cannot scan a bin that has no label.
- **Do not delete a bin that has stock in it.** The system will warn you, but always check before removing a bin. Move any stock first using a stock adjustment.
- **Zone types are fixed after creation.** If you assign the wrong zone type, you will need to create a new zone with the correct type. Contact your system administrator.
- **Refrigerant zones require hazardous material approval** before the system will allow refrigerant products to be put away there. Ensure the toggle is enabled on the zone.

---

## What Happens Next

Once your warehouse structure is in place, the next step is to load your product catalogue so the system knows what items will be stored and how to handle them.

- Next guide: [Product Master Setup](02-product-master.md)
- Related guides: [Receiving](03-receiving.md), [Refrigerant Compliance](09-refrigerant-compliance.md)
