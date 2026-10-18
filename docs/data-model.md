# Data model

The connected app persists normalized rows in Neon Postgres and private objects in Neon Object Storage. Without Neon environment variables, it can still use a local JSON snapshot at `server/data/store.json`. Each entity has its own ID. Moving a request between workflow stages changes one status and appends an event; it never copies the request between stage tables.

| Entity | Key fields | Relationship |
| --- | --- | --- |
| `applicants` | ID, name, age, mobile number, address | Referenced by `requests.applicant_id` |
| `document_types` | `id`, name, description | Seeded by the SQL migration; referenced by `requests.document_type_id` |
| `requests` | `id`, applicant ID, document type ID, purpose, status, unique tracking code, dates | Parent of attachments and status events |
| `attachments` | `id`, request ID, kind, object key, original filename, MIME type, size | Private object metadata for one request |
| `request_status_events` | `id`, request ID, status, public note, staff confirmation, staff email, time | Append-only workflow history |

The [PostgreSQL schema](schema.sql) has foreign keys, unique tracking codes, attachment uniqueness per kind, status constraints, and indexed request/event reads. The server uses transactions for submissions and status changes. Objects are uploaded first; if the database insert fails, the server removes them. Private downloads pass through the staff API. The local JSON adapter writes an atomic snapshot and assumes one server process.

The former `incoming`, `outgoing`, `released`, and `rejected` tables repeated an entire request in each workflow stage. This model keeps one request row and a status history. Applicant and document type details are referenced by ID instead of copied into each status table. Public tracking returns only the document type, status, timestamps, and public notes. Staff confirmations and staff email remain on the admin side.
