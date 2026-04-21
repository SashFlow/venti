# Product Master Setup Guide

**For:** Product Managers, Procurement Officers, and Warehouse Managers responsible for setting up and maintaining DIKEN's product catalogue in the system.

---

## Prerequisites

- Your warehouse structure must already be set up (levels, zones, aisles, racks, bins). See [Warehouse Setup Guide](01-warehouse-setup.md).
- Have your product catalogue spreadsheet or supplier price list available for reference.
- Know which products are serialised (tracked by individual serial number), which are batch-tracked, and which are refrigerants. Your supply chain manager can confirm this.

---

## Overview

Products in the system are organised in a four-level hierarchy:

**Product Family → Product Model → Product → Product Variant**

Think of it this way:
- **Family**: the broad category — e.g., "Split Air Conditioners"
- **Model**: a specific model line — e.g., "DIKEN InverTech Pro"
- **Product**: a specific configuration of that model — e.g., "InverTech Pro 1.5 Ton, R-410A"
- **Variant**: a variation of that product — e.g., same product but in a different voltage or colour

You must create items from the top of the hierarchy downward. Build the family first, then models within it, then individual products, then variants.

---

## Section 1: Create a Product Family

Product families group related products for reporting, routing, and replenishment rules.

1. Go to **Products > Product Families**.
2. Click **New Family**.
3. Fill in:
   - **Family Name** — e.g., "Split Air Conditioners", "Packaged Units", "VRF Systems", "Spare Parts & Accessories", "Refrigerants"
   - **Family Code** — a short code, e.g., "SAC", "PKG", "VRF", "SPA", "REFRIG"
   - **Default Weight Class** — the weight class that most products in this family will have (Heavy, Medium, or Light). Individual products can override this.
   - **Default Product Type** — select from: Finished Good, Spare Part, Refrigerant, Consumable
   - **Serialised by Default** — toggle on if most products in this family are tracked by serial number (e.g., all air conditioning units)
   - **Batch Tracked by Default** — toggle on if most products use batch/lot tracking (e.g., spare parts)
4. Click **Save Family**.

**Standard DIKEN product families to create:**

| Family Name | Code | Default Type | Serialised | Weight Class |
|---|---|---|---|---|
| Split Air Conditioners | SAC | Finished Good | Yes | Heavy |
| Cassette & Concealed Units | CCU | Finished Good | Yes | Heavy |
| Packaged & Rooftop Units | PKG | Finished Good | Yes | Heavy |
| VRF Systems | VRF | Finished Good | Yes | Heavy |
| Spare Parts & PCBs | SPA | Spare Part | No | Light |
| Refrigerants | REFRIG | Refrigerant | Yes (cylinder) | Heavy |
| Consumables & Accessories | CON | Consumable | No | Light |

---

## Section 2: Create a Product Model

A model represents a product line within a family.

1. Go to **Products > Product Models**.
2. Click **New Model**.
3. Fill in:
   - **Product Family** — select the family this model belongs to
   - **Model Name** — e.g., "InverTech Pro", "CoolMaster VRF-S Series"
   - **Model Code** — e.g., "ITP", "CMVRF-S"
   - **Brand** — e.g., "DIKEN"
   - **Country of Origin** — e.g., "China", "South Korea"
   - **HS Code** — the Harmonised System customs code (get this from your procurement or compliance team)
   - **Warranty Period (months)** — the standard manufacturer warranty for this model line
4. Click **Save Model**.

---

## Section 3: Create a Product

A product is a specific, orderable item within a model.

1. Go to **Products > Products**.
2. Click **New Product**.
3. Fill in the **Basic Information** tab:
   - **Product Model** — select the model
   - **Product Name** — the full descriptive name, e.g., "DIKEN InverTech Pro 1.5 Ton Split AC – R410A – 220V"
   - **Product Code / SKU** — your internal code, e.g., "ITP-15T-R410A-220V"
   - **Barcode** — scan or type the product barcode (EAN-13 or Code-128 format)
   - **Description** — a brief description for warehouse operatives
4. Fill in the **Physical Attributes** tab:
   - **Gross Weight (kg)** — total weight including packaging
   - **Net Weight (kg)** — product weight without packaging
   - **Dimensions (L × W × H in cm)** — outer carton dimensions
   - **Weight Class** — system will suggest based on family default; override if needed
5. Fill in the **HVAC Attributes** tab (these are DIKEN-specific fields):

| Field | What to Enter | Example |
|---|---|---|
| Cooling Capacity (BTU/hr) | The rated cooling capacity | 18,000 |
| Capacity (Tons / kW) | Converted capacity | 1.5 Ton / 5.3 kW |
| Star Rating | Energy efficiency star rating | 3 Star |
| Refrigerant Type | The gas used in the unit | R-410A |
| Voltage / Phase | Electrical specification | 220V / Single Phase |
| SEER Rating | Seasonal Energy Efficiency Ratio | 4.2 |
| Region | Climate zone this product is rated for | Hot & Humid / Desert / Temperate |
| Compressor Type | Type of compressor | Rotary Inverter |

6. Fill in the **Tracking** tab:
   - **Serialised** — toggle on if each unit has an individual serial number (required for all AC units, compressors, VRF modules)
   - **Batch Tracked** — toggle on if stock is tracked by production batch or lot number (typically for spare parts and consumables)
   - **Refrigerant Product** — toggle on if this product is a refrigerant cylinder or contains refrigerant that must be reported separately
   - **Dangerous Goods** — toggle on if applicable (refrigerant cylinders)
   - **FIFO Enforced** — toggle on to require oldest stock to be picked first (recommended for all products)
7. Click **Save Product**.

> **Warning:** Once a product is marked as Serialised and stock has been received against it, you cannot turn off the Serialised toggle. Set this correctly before receiving any stock.

---

## Section 4: Create Product Variants

Use variants when the same product exists in slightly different versions that share the same model and most attributes.

1. Open a product and click the **Variants** tab.
2. Click **Add Variant**.
3. Define the variant attributes that differ from the base product:
   - **Variant Name** — e.g., "White", "Gold", "240V"
   - **Variant Code** — appended to the product SKU, e.g., "-WHT", "-GLD", "-240V"
   - **Barcode** — the specific barcode for this variant
   - **Weight / Dimensions** — if different from the base product
   - **Price Adjustment** — if this variant has a different cost
4. Click **Save Variant**.

> **Tip:** If the difference between two products is significant (different refrigerant type, different capacity), create a new product rather than a variant. Variants are for minor differences in the same item.

---

## Section 5: Unit of Measure (UoM) Setup

Units of Measure tell the system how products are counted, ordered, and stored.

### Standard UoMs for DIKEN

Go to **Configuration > Units of Measure** and ensure the following are set up:

| UoM Name | Code | Used For |
|---|---|---|
| Each | EA | Individual units — one AC unit, one PCB |
| Pack | PACK | Multi-unit retail packs of accessories |
| Pallet | PLT | Full pallet of goods from a supplier |
| Cylinder | CYL | Refrigerant gas cylinders |
| Kilogram | KG | Refrigerant gas sold/transferred by weight |
| Metre | MTR | Copper pipe or ducting sold by length |

### Setting Up UoM Conversions

Conversion ratios tell the system how to convert between purchase UoM and stock UoM.

**Example: Receiving a pallet of AC units**

- Purchase UoM: PLT (Pallet)
- Stock UoM: EA (Each)
- Conversion: 1 PLT = 4 EA

**To set a conversion:**

1. Go to **Configuration > Units of Measure**.
2. Open the UoM you want to add a conversion for (e.g., PLT).
3. Click **Add Conversion**.
4. Set:
   - **Convert From**: PLT
   - **Convert To**: EA
   - **Ratio**: 4 (meaning 1 PLT = 4 EA)
   - **Product** — leave blank to apply to all products, or select a specific product if the ratio differs
5. Click **Save Conversion**.

**Common DIKEN conversions to set up:**

| From | To | Ratio | Notes |
|---|---|---|---|
| PLT | EA | 4 | Standard 1.5T/2T split AC units, 4 per pallet |
| PLT | EA | 6 | Small 1T units, 6 per pallet |
| PACK | EA | 12 | Accessories pack (remote controls, filters) |
| CYL | KG | Varies | Set per product based on cylinder size |

> **Tip:** If a conversion ratio varies by product (e.g., cylinders come in 10 kg, 13 kg, or 22.7 kg sizes), set the conversion at the product level, not globally.

---

## Section 6: Assign Products to Warehouses

Once a product is created, you need to activate it in each warehouse where it will be stocked.

1. Open the product and go to the **Warehouse Settings** tab.
2. Click **Add Warehouse**.
3. Select the warehouse.
4. Set the following per warehouse:
   - **Min Stock Level** — minimum quantity below which a replenishment is triggered
   - **Max Stock Level** — maximum quantity the warehouse should hold
   - **Reorder Quantity** — how much to order when stock hits the minimum
   - **Default Storage Zone** — where this product should normally be put away
5. Click **Save**.

> **Tip:** For the National DC, set higher min/max levels. For Local DCs, set lower levels appropriate for local demand. See the [Procurement Guide](06-procurement.md) for how replenishment flows between warehouses.

---

## Section 7: Managing Product Attributes

You can edit any product attribute at any time, but some changes have important consequences:

| Attribute | What to know before changing |
|---|---|
| Weight Class | Changing this will affect future put-away routing but will NOT move existing stock |
| Refrigerant Type | Changing this updates compliance reporting from the date of change onward |
| Serialised | Cannot be turned off once stock has been received |
| Batch Tracked | Can be turned on at any time; affects future receipts, not existing stock |
| Region | Used for demand planning and ASP product lists; update when product spec changes |
| FIFO Enforced | Turning this on will enforce FIFO on future picks; existing picks in progress are not affected |

---

## Tips and Warnings

- **Always set the barcode before receiving any stock.** If a product has no barcode, operatives cannot scan it at the dock.
- **Use standard naming conventions.** Agree on a naming format with your team and stick to it. Inconsistent product names cause confusion on reports.
- **Do not create duplicate products.** Before creating a new product, search for it first. Duplicate records split your stock history.
- **Refrigerant products must have "Refrigerant Product" toggled on.** Without this, the system will not apply compliance tracking. See [Refrigerant Compliance](09-refrigerant-compliance.md).
- **HVAC attributes drive the ASP product list.** The Region and Star Rating fields are used to filter which products ASPs can order. Fill them in accurately.

---

## What Happens Next

With your product master set up, you are ready to start receiving goods into the warehouse.

- Next guide: [Receiving Goods](03-receiving.md)
- Related guides: [Warehouse Setup](01-warehouse-setup.md), [Refrigerant Compliance](09-refrigerant-compliance.md), [Warranty and Traceability](10-warranty-and-traceability.md)
