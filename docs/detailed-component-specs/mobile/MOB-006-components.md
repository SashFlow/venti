# MOB-006: QC Routing Decision Prompt - Component Specification

## Screen Reference
- **ID**: MOB-006 | **Name**: QC Routing Decision Prompt
- **Base Spec**: `../../mobile-screen-specs/MOB-006 QC Routing Decision Prompt.md`
- **Deep Link**: `venti://qc/routing/:itemId`

## Component Inventory
**Primary**: 1. Decision Cards (Send to QC / Bypass QC), 2. Policy Info Panel, 3. Confirm Button
**Secondary**: 4. Override Reason Input, 5. Item Context Display
**Modals**: Override Authorization, Policy Details Drawer

## Data Schema
| Field | Type | Validation |
|-------|------|------------|
| decision | enum | 'send_to_qc','bypass' |
| overrideReason | string | Required if bypassing mandatory QC |
| policyType | enum | 'mandatory','conditional','optional' |

## Layout
**Pattern**: Two-option decision screen (card-based)
**Cards**: 150px height each, stacked vertically
**Spacing**: 20px between cards

## Key Components
- **Decision Cards**: Large touch targets, icon + label + policy hint
  - "Send to QC" card: Default, always available, shows QC queue estimate
  - "Bypass QC" card: Conditionally enabled, shows override requirement if mandatory
- **Policy Panel**: Collapsible info box explaining why QC is required/optional
- **Override Input**: Text area (120px height) for justification if bypassing
- **Confirm Button**: Becomes active after decision selection, changes label based on choice

## Mobile-Specific
- **Gloves-friendly**: Yes, card height 150px
- **Offline**: Partial (can queue decision, requires sync for validation)
- **Policy Enforcement**: Mandatory QC blocks bypass, conditional shows warning
