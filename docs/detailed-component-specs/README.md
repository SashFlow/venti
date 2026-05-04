# Detailed Component Specifications

This directory contains detailed, design-handoff-ready component specifications for all screens in the Venti WMS platform.

## Purpose

These specifications extend the base screen specs (13-section template) with detailed UI component breakdowns, data schemas, layouts, and interaction patterns ready for UI/UX design and front-end implementation.

## Directory Structure

```
detailed-component-specs/
├── auth/         # Authentication screen components (AUTH-001 to AUTH-008)
├── mobile/       # Mobile app screen components (MOB-001 to MOB-025)
├── web/          # Web operations screen components (WEB-001 to WEB-026)
├── admin/        # Admin screen components (ADM-001 to ADM-020)
├── analytics/    # Analytics screen components (ANL-001 to ANL-015)
└── shared/       # Shared component specs (SHD-001 to SHD-005)
```

## Component Spec Template

Each component specification file follows this structure:

### 1. Screen Reference
- **Screen ID**: Reference to base screen spec
- **Screen Name**: Full screen name
- **Related Base Spec**: Link to original 13-section spec file

### 2. Component Inventory
Complete list of all UI components on the screen, organized by hierarchy:

**Primary Components** (critical path):
- Component type (Button, Input, Card, Table, etc.)
- Component label/name
- Purpose

**Secondary Components** (supporting UI):
- Component type and purpose

**Tertiary Components** (hidden/expandable):
- Component type and purpose

**Modal/Overlay Components**:
- Modal/drawer/popover components that appear conditionally

### 3. Data Schema
Field-level specifications for all data displayed and collected:

| Field Name | Type | Required | Validation | Default Value | Display Format |
|------------|------|----------|------------|---------------|----------------|
| Example: `email` | string | Yes | Email format | null | lowercase |

### 4. Layout Specification

**Container Structure**:
- Overall layout pattern (single column, grid, split panel, etc.)
- Max width constraints
- Responsive breakpoints

**Grid/Flexbox Details**:
- Desktop layout (>1280px)
- Tablet layout (768-1279px)
- Mobile layout (<768px) [for web responsive views]

**Spacing System**:
- Padding: internal spacing
- Margins: external spacing
- Gap: spacing between elements

### 5. Component Details

For each major component, specify:

#### Component Name: [Component Type]
- **Type**: Button, Input, Card, Table, Modal, Drawer, etc.
- **Variant**: Primary, secondary, ghost, danger, etc.
- **Size**: Small, medium, large, custom
- **State variations**: Default, hover, focus, active, disabled, loading, error
- **Content**: Text labels, placeholders, helper text
- **Props/Attributes**: Key properties
- **Interactions**: Click, hover, focus behaviors
- **Validation**: Client-side validation rules
- **Error states**: Error messages and recovery actions

### 6. Modal/Drawer/Popover Specifications

For each overlay component:

**Modal/Drawer Name**: [Purpose]
- **Trigger**: What action/event opens it
- **Size**: Width, height, max dimensions
- **Dismissal**: Close button, outside click, escape key, backdrop
- **Header**: Title, close button, context info
- **Body**: Content components and layout
- **Footer**: Action buttons and layout
- **States**: Loading, empty, error states specific to modal
- **Data flow**: What data is passed in, what is returned

### 7. Interaction Flows

Step-by-step interaction patterns for complex flows:

**Flow Name**: [Primary user action]
1. User action → System response
2. Next action → Response
3. Success/error handling
4. Navigation outcome

### 8. State Management

**Local State** (component-only):
- List of state variables and their purposes

**Shared/Global State** (across components/screens):
- State dependencies and sources

**Data Fetching**:
- API endpoints or data sources
- Loading patterns (skeleton, spinner, etc.)
- Cache strategies
- Error handling

### 9. Accessibility Notes

**Keyboard Navigation**:
- Tab order
- Keyboard shortcuts
- Focus management

**Screen Reader Support**:
- ARIA labels and roles
- Landmark regions
- Dynamic announcements

**Visual Accessibility**:
- Color contrast requirements
- Focus indicators
- Text sizing

### 10. Responsive Behavior

**Desktop (>1280px)**:
- Full-featured layout
- Multi-column where applicable

**Tablet (768-1279px)**:
- Adjusted layouts
- Collapsible sections

**Mobile (<768px)** [for web responsive]:
- Single-column layouts
- Stacked components
- Touch-optimized controls

### 11. Design Tokens Reference

**Colors**:
- Primary action colors
- Status colors (success, warning, error, info)
- Text colors (primary, secondary, tertiary)
- Border colors

**Typography**:
- Font sizes for headers, body, captions
- Font weights
- Line heights

**Spacing**:
- Specific spacing values used (4px, 8px, 16px, 24px, 32px, etc.)

**Shadows & Elevations**:
- Card shadows
- Modal/drawer elevations

**Borders & Radii**:
- Border radius values
- Border widths

---

## File Naming Convention

Each component spec file is named:
```
{SCREEN-ID}-components.md
```

Examples:
- `AUTH-001-components.md` - Web Login component spec
- `MOB-005-components.md` - Inbound Scan component spec
- `WEB-011-components.md` - Inventory Explorer component spec
- `ADM-010-components.md` - Role and Permission Manager component spec
- `ANL-001-components.md` - Operational KPI Dashboard component spec
- `SHD-001-components.md` - Global Search Overlay component spec

---

## Usage Guidelines

### For Designers
Use these specs to:
- Create high-fidelity mockups with accurate component details
- Ensure consistency across screens
- Design with complete understanding of data, states, and interactions

### For Frontend Developers
Use these specs to:
- Understand component requirements before implementation
- Plan component reusability and architecture
- Implement correct validation, states, and error handling

### For Product/QA
Use these specs to:
- Write test cases covering all states and interactions
- Validate design completeness
- Ensure user flows are fully specified

---

## Related Documentation

- **Base Screen Specs**: `/docs/[module]-screen-specs/` directories contain the original 13-section specifications
- **Routes**: `/docs/Routes.md` contains comprehensive routing information
- **Global Patterns**: `/docs/Designer Screen Spec - 01 Global Patterns and IA.md` contains shared component patterns
- **Flow Mappings**: `/docs/Designer Screen Spec - 06 Flow to Screen Mapping and State Coverage.md` contains user flow context

---

## Notes

- Component specs are **design-handoff level**, not implementation-level. They focus on UI/UX details, not code architecture.
- When components are reused across screens, reference the shared pattern rather than duplicating full specification.
- Modal/drawer/popover specs are embedded in the component spec of their trigger screen, not separate files.
- State definitions should cover loading, empty, error, and success states at minimum.
- Data schemas should be complete enough for designers to create realistic mockups and developers to understand field requirements.
