# MOB-002: Shift Start and Device Health - Component Specification

## Screen Reference
- **ID**: MOB-002 | **Name**: Shift Start and Device Health
- **Base Spec**: `../../mobile-screen-specs/MOB-002 Shift Start and Device Health.md`
- **Deep Link**: `venti://shift/start`

## Component Inventory
**Primary**: 1. Health Check Cards (Scanner/Battery/Network/Printer), 2. Diagnostic Checklist, 3. Start Shift Button
**Secondary**: 4. Status Badges, 5. Retest Buttons, 6. Critical Alert Banner
**Modals**: Device Diagnostic Details, Battery Low Warning

## Data Schema
| Field | Type | Validation |
|-------|------|------------|
| scannerStatus | enum | 'pass','fail','warning' |
| batteryLevel | number | 0-100 |
| networkStrength | enum | 'excellent','good','poor','none' |
| printerConnected | boolean | N/A |

## Layout - Mobile Optimized
**Pattern**: Vertical card stack, health checks as expandable cards
**Card height**: 80px collapsed, 200px expanded
**Status indicators**: Traffic light colors (red/yellow/green)

## Key Components
- **Health Cards**: Icon + status + last checked time + expand action
- **Scanner Test**: Inline scan input, test barcode image, pass/fail feedback
- **Battery Indicator**: Percentage + visual bar + charging status
- **Start Shift Button**: Full-width,disabled until all critical checks pass, 60px height

## Mobile-Specific
- **Scanner-first**: Yes, can trigger test scan
- **Gloves-friendly**: Yes, large touch targets (min 56px)
- **Offline**: Partial (cached last status, warns if can't validate)
- **Hardware Integration**: Battery API, scanner SDK, network status
- **Sound/Vibration**: Success tone on pass, error vibration on fail
