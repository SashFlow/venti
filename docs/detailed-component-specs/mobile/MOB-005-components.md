# MOB-005: Inbound Scan and Validate - Component Specification

## Screen Reference
- **ID**: MOB-005 | **Name**: Inbound Scan and Validate
- **Base Spec**: `../../mobile-screen-specs/MOB-005 Inbound Scan and Validate.md`
- **Deep Link**: `venti://inbound/scan/:taskId`

## Component Inventory
**Primary**: 1. Scan Area, 2. SKU Display Card, 3. Quantity Input, 4. Validation Status, 5. Save & Continue Button
**Secondary**: 6. Expected/Received Comparison, 7. Expiry Date Picker, 8. Damage Toggle, 9. Serial/Lot Input
**Modals**: Over-Receipt Modal, Duplicate Serial Modal, QC Routing Prompt

## Data Schema
| Field | Type | Validation |
|-------|------|------------|
| sku | string | Scanned or manual |
| expectedQty | number | From PO |
| receivedQty | number | Required, > 0 |
| expiryDate | date | Future date if required |
| manufactureDate | date | Past date if required |
| serial | string | Unique if serialized |
| lot | string | Required if lot-tracked |
| isDamaged | boolean | Default false |

## Layout
**Pattern**: Step-by-step scan flow, one primary action visible at a time
**Scan Area**: Top 40% of screen, large scan icon or camera preview
**Form**: Bottom 60%, scrollable fields
**Sticky Footer**: Save button always visible

## Key Components
- **Scan Prompt**: Large icon, "Scan Shipment Label" then "Scan SKU Barcode" then "Scan Serial" (progressive)
- **SKU Card**: SKU code + description + image thumbnail + expected qty
- **Quantity Stepper**: Large +/- buttons flanking number display (80px height)
- **Expected vs Received**: Side-by-side comparison with variance indicator (red/green)
- **Damage Toggle**: Large toggle switch with "Mark as Damaged" label
- **Expiry Date Picker**: Native date picker (iOS/Android), optional based on SKU config
- **Serial/Lot Input**: Appears if SKU requires, scanner icon for quick scan
- **Save Button**: Full-width, 60px, green when valid, disabled when errors
- **Auto-advance**: On successful save, next line auto-loads or shows completion summary

## Mobile-Specific
- **Scanner-first**: Yes, enforced sequence (shipment → SKU → serial)
- **Gloves-friendly**: Yes, stepper buttons 80px, toggle switch 60px
- **Offline**: Yes, queued writes with conflict resolution
- **Sound/Vibration**: Success beep on valid scan, error vibration + beep on invalid
- **Camera Fallback**: If hardware scanner unavailable, camera-based scanning
- **Manual Entry**: Fallback for failed scans, shows "Enter Manually" link
