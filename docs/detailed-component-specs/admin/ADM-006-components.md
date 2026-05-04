# ADM-006: Barcode and Label Template Manager - Component Specification

## Screen Reference
- **ID**: ADM-006 | **Name**: Barcode and Label Template Manager
- **Base Spec**: `../../admin-screen-specs/ADM-006 Barcode and Label Template Manager.md`
- **Route**: `/admin/label-templates`

## Component Inventory
**Primary**: 1. Template List, 2. Visual Label Editor, 3. Barcode Config, 4. Print Test
**Secondary**: 5. Field Mapper, 6. Template Preview, 7. Printer Selector
**Modals**: Create Template Modal, Test Print Dialog, Barcode Settings

## Data Schema
| Field | Type | Validation |
|-------|------|------------|
| templateId | string | UUID |
| templateName | string | Required |
| labelSize | object | Width/height mm |
| barcodeType | enum | 'CODE128','QR','EAN13' |
| fields | array | Field definitions |

## Layout
**Pattern**: Template list left (25%) + WYSIWYG editor center (55%) + properties right (20%)
**Editor**: Drag-drop canvas with ruler guides

## Key Components
- **Template List**: Name, Type (SKU/Location/Shipment), Size, Status
- **Visual Editor**: WYSIWYG canvas with drag-drop elements (Text, Barcode, Image, Line)
- **Element Palette**: Toolbar with text, barcode, image, line, rectangle tools
- **Barcode Config**: Type dropdown (CODE128, QR, EAN13, UPC), size, rotation
- **Field Mapper**: Map dynamic fields (SKU code, description, qty, date, etc.)
- **Label Size**: Predefined sizes (4x6", 2x1", custom) with unit selector (in/mm)
- **Preview Panel**: Real-time preview with sample data
- **Test Print**: Select printer, print test label with sample data
- **Printer Selector**: Dropdown of registered label printers
- **Grid/Snap**: Toggle grid, snap to grid checkbox
- **Alignment Tools**: Align left/center/right/top/middle/bottom

## Admin-Specific
- **WYSIWYG Editor**: Visual label design with drag-drop
- **Barcode Symbology**: Support multiple barcode types
- **Print Testing**: Test labels before deployment
- **Dynamic Fields**: Map data fields to label elements
