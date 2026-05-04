# WEB-022: Returns Operations Workbench - Component Specification

## Screen Reference
- **ID**: WEB-022 | **Name**: Returns Operations Workbench
- **Base Spec**: `../../web-screen-specs/WEB-022 Returns Operations Workbench.md`
- **Route**: `/workspace/:workspaceId/returns/workbench`

## Component Inventory
**Primary**: 1. Return Intake Form, 2. SRN/Receipt Linker, 3. Disposition Router
**Secondary**: 4. Return Category/Cause, 5. Item Condition Summary, 6. Credit Eligibility
**Modals**: Link Documents Modal, Disposition Decision Dialog, Credit Approval

## Data Schema
| Field | Type |
|-------|------|
| returnId | string |
| srnId | string |
| orderReference | string |
| category | enum |
| cause | enum |
| condition | enum |
| disposition | enum |

## Layout
**Pattern**: Form-based intake workflow
**Form**: Step-by-step return creation
**Summary**: Right panel with order/item context

## Key Components
- **Return Intake Form**: SRN input, customer info, return reason, items list
- **SRN Linker**: Scan/search SRN or order number, loads customer/order details
- **Return Category**: Dropdown (Customer Remorse, Defective, Damaged in Transit, Wrong Item)
- **Return Cause**: Dropdown (changes based on category)
- **Item Condition**: Radio per item (New/Unused, Opened, Used, Damaged)
- **Disposition Router**: Based on condition+category, suggests disposition (Resell, Refurb, Scrap, RMA)
- **Credit Eligibility**: Shows if customer eligible for full/partial/no credit
- **Items Table**: Returned items with qty, condition, disposition
- **Route to QC**: Checkbox to send items for inspection
- **Submit Button**: Creates return case, triggers disposition workflow

## Web-Specific
- **Document Linking**: Auto-link SRN to original order
- **Rule-Based Disposition**: Automated disposition suggestions based on condition/policy
- **Credit Calculation**: Automated refund amount calculation
