# MOB-013: Bin-to-Bin Transfer - Component Specification

## Screen Reference
- **ID**: MOB-013 | **Name**: Bin-to-Bin Transfer
- **Base Spec**: `../../mobile-screen-specs/MOB-013 Bin-to-Bin Transfer.md`
- **Deep Link**: `venti://transfer/bin-to-bin`

## Component Inventory
**Primary**: 1. Step Form (Source → Qty → Destination), 2. Reason Code Picker, 3. Confirm Transfer Button
**Secondary**: 4. SKU Display, 5. Capacity Warnings, 6. Source/Dest Context
**Modals**: Destination Full Warning, Transfer Confirmation

## Data Schema
| Field | Type | Validation |
|-------|------|------------|
| sourceBin | string | Scanned bin |
| destinationBin | string | Scanned bin |
| sku | string | From source bin |
| quantity | number | > 0, <= available |
| reasonCode | enum | 'reorg','damaged','temp_storage','other' |

## Layout
**Pattern**: Linear 3-step form
**Steps**: Source scan (top) → Qty input (middle) → Destination scan (bottom)
**Progress**: Step indicator at top

## Key Components
- **Step 1**: "Scan Source Bin" prompt, validates bin exists
- **Step 2**: Shows bin contents, quantity stepper input, reason dropdown
- **Step 3**: "Scan Destination Bin" prompt, capacity check, confirm button
- **Reason Picker**: Quick select common reasons (Reorganization, Damaged Storage, etc.)
- **Capacity Warning**: If destination approaching full, shows yellow/red warning

## Mobile-Specific
- **Scanner-first**: Yes, enforced bin scan sequence
- **Gloves-friendly**: Yes, stepper 80px, large scan areas
- **Offline**: Yes, fully supported with queued sync
- **Hardware Scanner**: Preferred for rapid bin scanning
