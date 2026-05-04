# ADM-008: Workflow Configuration - Component Specification

## Screen Reference
- **ID**: ADM-008 | **Name**: Workflow Configuration
- **Base Spec**: `../../admin-screen-specs/ADM-008 Workflow Configuration.md`
- **Route**: `/admin/workflows`

## Component Inventory
**Primary**: 1. Workflow List, 2. Visual Graph Editor, 3. Step Config Forms, 4. Branching Logic
**Secondary**: 5. Step Library, 6. Condition Builder, 7. Validation Panel
**Modals**: Add Step Modal, Condition Editor, Flow Validator, Test Workflow

## Data Schema
| Field | Type | Validation |
|-------|------|------------|
| workflowId | string | UUID |
| workflowName | string | Required |
| steps | array | Step definitions |
| transitions | array | Step connections |
| conditions | object | Branch conditions |

## Layout
**Pattern**: Workflow list left (25%) + canvas center (55%) + properties right (20%)
**Canvas**: Node-based flow editor with connections

## Key Components
- **Workflow List**: Name, Type (Inbound/Outbound/etc.), Status, Last Modified
- **Visual Canvas**: Node graph with drag-drop steps, connecting lines
- **Step Nodes**: Rounded rectangles with step name, icon, status
- **Step Library**: Sidebar with available steps (Receive, Validate, QC, Putaway, etc.)
- **Connection Lines**: Arrows between steps, click to add conditions
- **Branching Logic**: Diamond nodes for conditional branches (if/else)
- **Condition Builder**: IF qty > 100 OR SKU category = Hazmat THEN route to QC
- **Step Config**: Click node opens properties (name, owner role, SLA, required fields)
- **Multi-Step Selection**: Radio buttons for 1-step, 2-step, 3-step receiving flows
- **Validation Panel**: Shows errors (disconnected steps, missing conditions, circular refs)
- **Test Mode**: Simulate workflow with sample data, highlights path taken

## Admin-Specific
- **Visual Workflow Editor**: Node-based flow diagram with drag-drop
- **Conditional Branching**: IF/THEN logic with visual branches
- **Step Library**: Reusable workflow step templates
- **Flow Validation**: Checks for disconnected steps, circular logic
