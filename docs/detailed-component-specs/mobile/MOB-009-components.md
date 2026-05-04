# MOB-009: Pick Execution by Scan - Component Specification

## Screen Reference
- **ID**: MOB-009 | **Name**: Pick Execution by Scan
- **Base Spec**: `../../mobile-screen-specs/MOB-009 Pick Execution by Scan.md`
- **Deep Link**: `venti://pick/:taskId`

## Component Inventory
**Primary**: 1. Step Sequence Display, 2. Bin Scan Area, 3. SKU Scan Area, 4. Quantity Input, 5. Confirm Line Button
**Secondary**: 6. Progress Meter, 7. FEFO Indicator, 8. Substitute Picker, 9. Short Pick Shortcut
**Modals**: Wrong Bin Modal, Expired Lot Modal, Substitute Selection Drawer

## Data Schema
| Field | Type | Validation |
|-------|------|------------|
| binLocation | string | Scanned bin |
| sku | string | Scanned SKU |
| requiredQty | number | From wave |
| pickedQty | number | Confirmed qty |
| lotNumber | string | If lot-tracked |
| expiryDate | date | FEFO validation |

## Layout
**Pattern**: Sequential step flow (Step 1: Scan Bin → Step 2: Scan SKU → Step 3: Confirm Qty)
**Current Step**: Top 60%, large instruction + scan area
**Progress**: Header bar, "Line X of Y"
**Footer**: Confirm button (sticky)

## Key Components
- **Step Indicator**: Large step number + instruction (e.g., "1. Scan Bin A12-03-05")
- **Bin Display**: After scan, shows bin code + zone, green check, proceeds to SKU step
- **SKU Display**: After scan, shows SKU + description + image, proceeds to qty step
- **Quantity Input**: Large stepper (+/-) or numpad input, shows required vs picked
- **FEFO Indicator**: Shows expiry date, warns if not oldest lot, "Use Lot [X] Expiring [Date]"
- **Substitute Button**: Appears if substitute allowed, opens bottom sheet with substitute SKUs
- **Short Pick Link**: "Can't find qty?" link, navigates to MOB-010
- **Progress Bar**: Visual progress through pick list
- **Confirm Button**: Green, 60px, "Confirm Pick" label

## Mobile-Specific
- **Scanner-first**: Yes, enforced sequence (bin then SKU, no skipping)
- **Gloves-friendly**: Yes, large touch targets throughout
- **Offline**: Yes, queued picks with conflict resolution
- **Sound/Vibration**: 
  - Success beep (2-tone) on valid scan
  - Error beep (harsh) + vibration on wrong bin/SKU
  - Completion tone (3-tone melody) on line complete
- **Hardware Scanner**: Preferred, camera fallback available
- **Auto-advance**: Valid scan auto-proceeds to next step
- **FEFO Enforcement**: Can block pick if policy requires, shows override option if allowed
