# ADM-004: SKU and Catalog Admin - Component Specification

## Screen Reference
- **ID**: ADM-004 | **Name**: SKU and Catalog Admin
- **Base Spec**: `../../admin-screen-specs/ADM-004 SKU and Catalog Admin.md`
- **Route**: `/admin/sku-catalog`

## Component Inventory
**Primary**: 1. SKU Table, 2. SKU Form, 3. Lifecycle Status Manager, 4. Substitution Editor
**Secondary**: 5. Attribute Set Builder, 6. Variant Manager, 7. Compliance Flags
**Modals**: Create SKU Modal, Add Variant Modal, Substitution Picker, Attribute Editor

## Data Schema
| Field | Type | Validation |
|-------|------|------------|
| sku | string | Unique, required |
| description | string | Max 255 chars |
| category | string | From taxonomy |
| lifecycle | enum | 'active','discontinued','obsolete' |
| serialized | boolean | Tracking mode |
| lotTracked | boolean | Tracking mode |

## Layout
**Pattern**: Table view + detail panel
**Table**: SKU list left (40%), detail right (60%)
**Tabs**: Basic Info / Variants / Substitutes / Attributes

## Key Components
- **SKU Table**: SKU, Description, Category, Status chip, Actions
- **Lifecycle Manager**: Status dropdown (Active, Phasing Out, Discontinued, Obsolete) with effective dates
- **SKU Form**: Basic info (SKU, description, category, UOM, dimensions, weight)
- **Serialization Flags**: Checkboxes for serialized, lot-tracked, expiry-tracked
- **Variant Manager**: Create variants (Size, Color, etc.) with variant matrix
- **Substitution Editor**: List of acceptable substitutes with priority
- **Attribute Set**: Custom attribute builder (Compliance attrs: FDA-approved, Hazmat class, etc.)
- **Category Taxonomy**: Hierarchical category selector
- **Compliance Section**: Checkboxes for regulatory flags (Hazmat, Controlled, Perishable)

## Admin-Specific
- **Lifecycle Management**: Status transitions with effective dates
- **Variant System**: Product variants with matrix view
- **Substitution Rules**: Priority-based substitute configuration
- **Attribute Sets**: Flexible custom attribute builder
