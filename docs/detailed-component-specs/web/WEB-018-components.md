# WEB-018: Cycle Count Planning Board - Component Specification

## Screen Reference
- **ID**: WEB-018 | **Name**: Cycle Count Planning Board
- **Base Spec**: `../../web-screen-specs/WEB-018 Cycle Count Planning Board.md`
- **Route**: `/workspace/:workspaceId/cycle-count/planning`

## Component Inventory
**Primary**: 1. Count Plan Generator, 2. Counter Assignment, 3. Bin Freeze Calendar
**Secondary**: 4. ABC Class Coverage, 5. Planned vs Completed Tracking
**Modals**: Generate Plan Modal, Assignment Dialog, Freeze Schedule Editor

## Data Schema
| Field | Type |
|-------|------|
| planId | string |
| class | enum |
| binCount | number |
| assignedTo | string |
| freezeStart | datetime |
| freezeEnd | datetime |

## Layout
**Pattern**: Calendar view + planning tools
**Calendar**: Monthly view with freeze periods
**Tools**: Left panel with generators and assignments

## Key Components
- **Plan Generator**: Create plan by ABC class, zone, date range
- **ABC Coverage**: Shows class distribution (A: 80% value/20% items, monthly; B: 15%/30%, quarterly; C: 5%/50%, annual)
- **Counter Assignment**: Drag-drop routes to counters
- **Freeze Calendar**: Visual calendar showing freeze windows
- **Bin Freeze**: Select bins to freeze (lock inventory during count)
- **Planned vs Completed**: Progress tracking per plan
- **Generate Button**: Creates routes based on rules (ABC frequency, zone rotation)

## Web-Specific
- **Calendar Visualization**: Monthly freeze period display
- **Drag-Drop Assignment**: Assign routes to counters visually
- **Rule-Based Generation**: Automated plan creation by ABC/zone
