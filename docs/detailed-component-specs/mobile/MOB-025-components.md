# MOB-025: Profile and Scanner Settings - Component Specification

## Screen Reference
- **ID**: MOB-025 | **Name**: Profile and Scanner Settings
- **Base Spec**: `../../mobile-screen-specs/MOB-025 Profile and Scanner Settings.md`
- **Deep Link**: `venti://settings`

## Component Inventory
**Primary**: 1. Grouped Settings List, 2. Profile Section, 3. Scanner Section, 4. Device Section, 5. Diagnostics Section
**Secondary**: 6. Language Selector, 7. Paired Device State, 8. Firmware Details, 9. Save Button
**Modals**: Device Pairing Dialog, Diagnostic Export, Unpair Confirmation

## Data Schema
| Field | Type | Validation |
|-------|------|------------|
| userId | string | Current user |
| language | string | ISO 639-1 |
| scannerType | enum | 'hardware','camera' |
| scannerPaired | boolean | Pairing status |
| scannerModel | string | Device model |
| firmwareVersion | string | Version number |
| sound Enabled | boolean | Toggle |
| vibrationEnabled | boolean | Toggle |
| hapticFeedback | boolean | Toggle |

## Layout
**Pattern**: Grouped list settings (iOS Settings-style)
**Sections**: Profile / Scanner / Devices / Diagnostics
**List Items**: 60px height
**Toggle Switches**: Right-aligned in list items

## Key Components
- **Profile Section**:
  - User info (name, email, role) - read-only
  - Language selector (dropdown)
  - Logout button
- **Scanner Section**:
  - Scanner type (Hardware/Camera) - radio
  - Paired device display (model + battery if hardware)
  - Pair/Unpair button
  - Test scan mode (quick test area)
  - Beep on scan toggle
  - Vibrate on scan toggle
- **Device Section**:
  - App version
  - Firmware version (if hardware scanner)
  - Last sync time
  - Clear cache button
- **Diagnostics Section**:
  - Network status details
  - Battery status
  - Storage usage
  - Export diagnostics button (generates log file)
  - Support contact info

## Special Components
- **Device Pairing Dialog**: Scan pairing QR code or enter device ID manually
- **Unpair Confirmation**: Warns that unpairing requires re-pairing to use scanner
- **Firmware Badge**: Shows "Update Available" if new firmware exists
- **Test Scan Mode**: Quick scan input to test scanner functionality
- **Diagnostic Export**: Generates and shares diagnostic log file for support

## Mobile-Specific
- **Gloves-friendly**: Yes, list items 60px
- **Offline**: Partial (preference save cached, device pairing requires network)
- **Safe Defaults**: All critical settings have safe defaults
- **Pairing Recovery**: If pairing lost, clear instructions to re-pair
- **Firmware Status**: Visible indicator if firmware out of date
