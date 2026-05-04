# WEB-021: QC Inspection Detail - Component Specification

## Screen Reference
- **ID**: WEB-021 | **Name**: QC Inspection Detail
- **Base Spec**: `../../web-screen-specs/WEB-021 QC Inspection Detail.md`
- **Route**: `/workspace/:workspaceId/qc/inspection/:itemId`

## Component Inventory
**Primary**: 1. Inspection Checklist Form, 2. Evidence Upload, 3. Disposition Picker, 4. Submit Inspection
**Secondary**: 5. Defect Taxonomy, 6. Disposition Impact Preview
**Modals**: Photo Upload Dialog, Defect Details Modal, Disposition Confirmation

## Data Schema
| Field | Type |
|-------|------|
| itemId | string |
| checklistSections | array |
| defects | array |
| disposition | enum |
| evidence | array |

## Layout
**Pattern**: Form-based inspection page
**Checklist**: Expandable sections
**Evidence**: Right panel upload area
**Footer**: Disposition selector + submit

## Key Components
- **Inspection Form**: Multi-section checklist (Visual, Functional, Packaging, Documentation)
- **Checklist Items**: Pass/Fail/N/A radio per item
- **Defect Taxonomy**: Hierarchical defect categories (Cosmetic > Scratch > Minor/Major)
- **Evidence Upload**: Drag-drop photo upload, supports multiple images
- **Photo Gallery**: Thumbnail grid with lightbox view
- **Disposition Picker**: Radio cards (Pass, Pass with Notes, Reject, RMA, Salvage)
- **Disposition Impact**: Shows what happens next (Pass → Release to stock, Reject → Quarantine)
- **Submit Button**: Completes inspection, executes disposition
- **Save Draft**: Auto-save in progress inspections

## Web-Specific
- **Multi-Photo Upload**: Drag-drop batch upload
- **Defect Hierarchy**: Organized taxonomy for consistent classification
- **Impact Preview**: Shows downstream effects of disposition decision
