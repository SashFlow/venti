# MOB-024: Offline Queue and Sync - Component Specification

## Screen Reference
- **ID**: MOB-024 | **Name**: Offline Queue and Sync
- **Base Spec**: `../../mobile-screen-specs/MOB-024 Offline Queue and Sync.md`
- **Deep Link**: `venti://offline/queue`

## Component Inventory
**Primary**: 1. Queue List, 2. Network/Sync Status Header, 3. Retry Controls, 4. Conflict Resolver
**Secondary**: 5. Status Chips, 6. Per-Item Actions, 7. Payload Details, 8. Background Sync Toggle
**Modals**: Conflict Resolution Dialog, Payload Viewer, Discard Confirmation

## Data Schema
| Field | Type | Validation |
|-------|------|------------|
| queueItemId | string | UUID |
| operation | enum | 'create','update','delete' |
| entity | enum | 'pick','putaway','count','transfer' |
| status | enum | 'pending','syncing','failed','conflict' |
| timestamp | datetime | Queued time |
| payload | object | Operation data |
| conflictDetails | object | Server vs local |

## Layout
**Header**: Network status + sync progress
**Queue List**: Vertical cards with status
**Status Bar**: Fixed at bottom, sync controls
**Drawer**: Conflict resolution + payload viewer

## Key Components
- **Network Status Header**: Online/offline indicator + last sync time + queued items count
- **Sync Progress**: Progress bar showing X of Y items synced
- **Queue Item Card**: Operation icon + entity + timestamp + status chip + action buttons (100px)
- **Status Chips**: Color-coded (Gray: pending, Blue: syncing, Red: failed, Orange: conflict)
- **Retry Button**: Per-item retry or retry-all button
- **Conflict Resolver**: Opens dialog showing local vs server data with merge options
- **Conflict Options**: Keep Local / Accept Server / Manual Merge (3 radio cards)
- **Payload Viewer**: Bottom sheet showing raw operation data for debugging
- **Discard Button**: Remove queued item (requires confirmation)
- **Background Sync Toggle**: Enable/disable auto-sync on network restore
- **Manual Sync Button**: Force immediate sync attempt
- **Clear Succeeded**: Cleanup button to clear successfully synced items

## Mobile-Specific
- **Offline Core**: This IS the offline management screen
- **Gloves-friendly**: Yes, cards 100px
- **Conflict Resolution**: Three-option merge (local/server/merge), shows diff clearly
- **Payload Visibility**: Can inspect full data payload for debugging
- **Background Tolerance**: Syncs in background, doesn't block user
