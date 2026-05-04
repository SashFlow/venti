# MOB-020: Return Inspection Capture - Component Specification

## Screen Reference
- **ID**: MOB-020 | **Name**: Return Inspection Capture
- **Base Spec**: `../../mobile-screen-specs/MOB-020 Return Inspection Capture.md`
- **Deep Link**: `venti://returns/inspect/:returnId`

## Component Inventory
**Primary**: 1. Inspection Checklist, 2. Photo Capture Panel, 3. Note Input, 4. Disposition Selector, 5. Submit Inspection Button
**Secondary**: 6. Section Navigation, 7. Pass/Fail Toggles, 8. QC Case ID Display
**Modals**: Photo Viewer, Disposition Decision Tree

## Data Schema
| Field | Type | Validation |
|-------|------|------------|
| checklistSections | array | Packaging, Physical, Functional |
| sectionItems | array | Per-section checklist items |
| itemStatus | enum | 'pass','fail','na' |
| photos | array | Evidence photos |
| notes | string | Inspection notes |
| disposition | enum | 'resell','refurb','scrap','rma' |
| qcCaseId | string | Generated ID |

## Layout
**Header**: Return ID + item SKU
**Checklist**: Scrollable sections with items
**Photo Panel**: Bottom sheet, quick capture
**Footer**: Disposition + Submit

## Key Components
- **Checklist Sections**: Expandable sections (Packaging Condition, Physical Inspection, Functional Test)
- **Checklist Items**: Per item, toggle for Pass/Fail/N/A (60px height)
- **Photo Capture**: Quick camera button per section, thumbnail gallery
- **Note Input**: Text area (120px) per section or overall
- **Disposition Selector**: Radio cards (Resellable, Needs Refurb, Scrap, RMA to Vendor)
- **Pass/Fail Summary**: Real-time count of passed vs failed items
- **QC Case ID**: Auto-generated, displayed at top
- **Section Progress**: Shows completion per section
- **Submit Button**: Disabled until all required sections complete

## Mobile-Specific
- **Partial One-Handed**: Camera requires two hands, rest is one-handed
- **Gloves-friendly**: Yes, checklist 60px, photo buttons large
- **Offline**: Partial (captures locally, syncs later)
- **Camera**: Quick access, multiple photos per section
- **Disposition Tree**: Guides user to correct disposition based on failures
