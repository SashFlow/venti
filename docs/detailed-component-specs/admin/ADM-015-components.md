# ADM-015: SAP Mapping Studio - Component Specification

## Screen Reference
- **ID**: ADM-015 | **Name**: SAP Mapping Studio
- **Base Spec**: `../../admin-screen-specs/ADM-015 SAP Mapping Studio.md`
- **Route**: `/admin/integrations/sap-mapping`

## Component Inventory
**Primary**: 1. Source/Target Schema Viewers, 2. Field Mapper, 3. Transformation Editor, 4. Validation Panel
**Secondary**: 5. Line-Level Context, 6. Sample Data Tester, 7. Mapping Templates
**Modals**: Add Mapping Dialog, Transformation Builder, Test Payload

## Data Schema
| Field | Type | Validation |
|-------|------|------------|
| mappingId | string | UUID |
| documentType | enum | 'inbound_delivery','goods_receipt','transfer_order' |
| sourceField | string | SAP field path |
| targetField | string | Venti field path |
| transformation | string | Mapping logic/formula |
| required | boolean | Mandatory mapping |

## Layout
**Pattern**: Dual-pane schema + mapping panel
**Left**: Source schema (SAP)
**Right**: Target schema (Venti)
**Center**: Mapping lines connecting fields
**Bottom**: Transformation editor

## Key Components
- **Source Schema**: Tree view of SAP document structure (Header, Line Items, etc.)
- **Target Schema**: Tree view of Venti document structure
- **Field Mapper**: Drag-drop from source to target, creates mapping line
- **Mapping Lines**: Visual connections between mapped fields
- **Transformation Editor**: Formula builder for field transformations (e.g., CONCAT, DATE_FORMAT, LOOKUP)
- **Required Field Indicator**: Red asterisk on required fields, validation warns if unmapped
- **Line-Level Context**: Switch between header and line item mappings
- **Sample Data**: Load sample SAP payload, preview transformation output
- **Validation Panel**: Lists missing required mappings, data type mismatches
- **Mapping Templates**: Save/load common mapping patterns
- **Test Button**: Run sample payload through mapping, see output

## Admin-Specific
- **Visual Mapping**: Drag-drop field mapping interface
- **Transformation Support**: Formula-based field transformations
- **Validation**: Pre-validation before deployment
