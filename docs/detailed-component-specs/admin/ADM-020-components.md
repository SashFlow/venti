# ADM-020: Data Import and Bulk Action Center - Component Specification

## Screen Reference
- **ID**: ADM-020 | **Name**: Data Import and Bulk Action Center
- **Base Spec**: `../../admin-screen-specs/ADM-020 Data Import and Bulk Action Center.md`
- **Route**: `/admin/data/bulk-import`

## Component Inventory
**Primary**: 1. File Uploader, 2. Preview Table, 3. Validation Panel, 4. Commit/Rollback Controls
**Secondary**: 5. Template Downloads, 6. Row-Level Error Display, 7. Progress Tracker
**Modals**: Upload Dialog, Validation Results, Commit Confirmation, Rollback Confirmation

## Data Schema
| Field | Type | Validation |
|-------|------|------------|
| importId | string | UUID |
| importType | enum | 'sku','location','user','inventory_adjustment' |
| filename | string | Uploaded filename |
| totalRows | number | Row count |
| validRows | number | Passed validation |
| errorRows | number | Failed validation |
| status | enum | 'uploaded','validating','preview','committed','rolledback' |

## Layout
**Pattern**: Wizard workflow (Upload → Validate → Preview → Commit)
**Upload**: File drop zone
**Preview**: Table with validation indicators
**Errors**: Bottom panel with error list

## Key Components
- **Import Type Selector**: Dropdown (SKU Master, Locations, Users, Inventory Adjustment, Orders)
- **Template Download**: Per import type, downloads CSV template with headers
- **File Uploader**: Drag-drop zone for CSV/Excel files
- **Upload Progress**: Progress bar during upload
- **Validation Phase**: Auto-validates on upload, shows progress
- **Preview Table**: Shows all rows with validation status (green checkmark, red X, yellow warning)
- **Row Validation**: Color-coded rows (green=valid, red=error, yellow=warning)
- **Error Panel**: Lists all errors with row number, field, error message
- **Error Details**: Click error to jump to row in preview
- **Preview Actions**: Edit cells inline to fix errors (re-validates on change)
- **Commit Button**: Applies all valid rows (with option to skip errors or abort)
- **Rollback Button**: Appears after commit, reverses the import within time window (e.g., 1 hour)
- **Progress Tracker**: Shows committed rows count, real-time updates
- **Import History**: List of past imports with status, download original file

## Admin-Specific
- **Multi-Step Validation**: Catch errors before commit
- **Preview Before Commit**: Review all changes
- **Rollback Safety**: Undo imports if mistakes detected
- **Template-Based**: Structured CSV templates for consistency
