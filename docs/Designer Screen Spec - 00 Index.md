# Designer Screen Specification - Index

Purpose: exhaustive screen inventory for UX/UI design, content design, and prototype planning.
Audience: product design, UX writing, engineering, QA.

## How to Use This Pack
- Start with global patterns and shared components.
- Use screen IDs to trace references across files.
- For each screen, design for desktop and mobile breakpoints where noted.
- Ensure all critical states are covered: loading, empty, error, offline, permission denied, success.

## Files in This Pack
- Designer Screen Spec - 01 Global Patterns and IA.md
- Designer Screen Spec - 02 Mobile Warehouse App Screens.md
- Designer Screen Spec - 03 Web Operations and Management Screens.md
- Designer Screen Spec - 04 Admin IAM Configuration Integration Screens.md
- Designer Screen Spec - 05 Analytics Notifications and Reports Screens.md

## Cross-Module User Personas
- Floor Operator (mobile-first)
- QC Inspector
- Warehouse Supervisor
- Inventory Controller
- Replenishment Planner
- Finance and Cost Analyst
- Operations Manager
- System and IAM Admin
- Integration Admin
- Service Technician / ASP Partner

## Screen ID Convention
- MOB-xxx: mobile app screens
- WEB-xxx: web operations screens
- ADM-xxx: admin, IAM, integration screens
- ANL-xxx: analytics and reporting screens
- SHD-xxx: shared overlays and dialogs

## Delivery Checklist for Designers
- Information architecture map per module
- High-fidelity screens for all primary flows
- Interaction specs for task completion and exceptions
- Validation and error copy for all forms
- Design tokens and component variants
- Accessibility notes (contrast, focus, touch size, keyboard)
- Empty/error/skeleton states for all data-heavy views
- Printer and scanner workflow states where applicable

## Definition of Done for Screen Specs
- Every workflow step maps to at least one screen.
- Every screen lists primary actions and data blocks.
- Every transaction screen includes success and failure outcomes.
- Every list view includes filter, sort, search, and bulk-action behavior.
- Every approval or exception path has decision UI defined.
