# ANL-015: Export and Data Extract Center - Component Specification

## Screen Reference
- **ID**: ANL-015 | **Name**: Export and Data Extract Center
- **Base Spec**: `../../analytics-screen-specs/ANL-015 Export and Data Extract Center.md`
- **Route**: `/analytics/data-export`

## Component Inventory
**Primary**: 1. Export Queue, 2. Extract Config Form, 3. Download Manager
**Secondary**: 4. Data Source Selector, 5. Filter Options, 6. Format Options
**Modals**: Create Extract Dialog, Export Progress, Download Ready

## Data Schema
| Field | Type | Validation |
|-------|------|------------|
| extractId | string | UUID |
| dataSource | enum | 'orders','inventory','transactions' |
| filters | object | Filter configuration |
| format | enum | 'excel','csv','json','parquet' |
| status | enum | 'queued','processing','ready','expired' |
| fileSize | number | Bytes |
| expiresAt | datetime | Download expiry |

## Layout
**Pattern**: Extract config + queue list + downloads
**Config**: Top form for creating extracts
**Queue**: Middle section showing processing status
**Downloads**: Bottom section with ready files

## Key Components
- **Data Source**: Dropdown (Orders, Inventory, Transactions, Shipments, etc.)
- **Date Range**: Date range picker for historical data
- **Filter Builder**: Add filters by field (status, warehouse, SKU category, etc.)
- **Field Selector**: Choose specific fields to export (reduces file size)
- **Format Options**: Radio (Excel, CSV, JSON, Parquet) with format info
- **Compression**: Checkbox to compress output (ZIP)
- **Extract Button**: Queue export job
- **Export Queue**: Table (Data Source, Filters, Status, Progress %, ETA)
- **Progress Indicator**: Visual progress bar for processing jobs
- **Download Manager**: Table (File Name, Size, Created, Expires, Download Button)
- **Auto-Expire**: Files expire after 7 days with warning
- **Notification**: Alert when export ready
- **Large Export Warning**: Warn if extract will be >100MB

## Analytics-Specific
- **Bulk Export**: Large dataset extraction
- **Async Processing**: Queue-based for large jobs
- **Format Flexibility**: Support multiple data formats
