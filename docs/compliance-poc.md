# Venti WMS — Compliance Posture (POC)

One-page summary for enterprise prospects in India (DPDP awareness + ISO posture).

## Access control

- Role-based access via organization membership and role groups
- Operator PWA scoped to floor workflows (`/operator`)
- Admin surfaces require authenticated session

## Encryption

- TLS in transit for all API and web traffic
- Database credentials via environment secrets (no secrets in client bundles)

## Audit trail

- `AuditLog` records user actions (approvals, disposition, imports, deletes)
- Audit log UI at `/app/audit-logs` with organization-scoped query API
- IP address and user agent captured where available

## Data residency (target)

- Production target: **ap-south-1** (Mumbai) for India enterprise deployments
- POC/demo environments may run in other regions — called out in sales deck

## DPDP — data principal rights (placeholders)

| Right | POC handling |
|-------|----------------|
| Access (Art. 15 / DPDP equivalent) | Export request UI — WIP toast references right to access |
| Erasure | Settings contact + documented erasure request workflow (manual) |
| Correction | Profile and master data edit in admin UI |
| Grievance | Privacy policy link in org settings |

## ISO 27001 posture (not certified)

- Documented RBAC, audit logging, and change control via git
- Vendor risk and formal ISMS certification are **post-POC**

## Privacy

- Privacy policy: `/legal/privacy-policy`
- India DPDP notice paragraph in organization settings
