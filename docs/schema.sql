-- Initial Neon Postgres schema. Applied once by `pnpm db:migrate`.

CREATE TYPE request_status AS ENUM ('submitted', 'reviewing', 'approved', 'ready', 'released', 'rejected');

CREATE TABLE document_types (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL
);

INSERT INTO document_types (id, name, description) VALUES
  ('indigency', 'Certificate of Indigency', 'For assistance, scholarship, or other support applications.'),
  ('barangay-certificate', 'Barangay Certificate', 'Proof of a barangay record or local certification.'),
  ('barangay-clearance', 'Barangay Clearance', 'For employment and other clearance requirements.'),
  ('senior-citizen', 'Senior Citizen Certificate', 'Certification for senior citizen requirements.'),
  ('business-permit', 'Barangay Business Permit', 'Barangay endorsement for a local business.'),
  ('no-claims-conflict', 'No Claims and Conflict Certificate', 'Certification of no recorded claim or conflict.'),
  ('residency', 'Certificate of Residency', 'Proof of residence in Barangay Jugan.');

CREATE TABLE applicants (
  id uuid PRIMARY KEY,
  first_name text NOT NULL,
  middle_name text NOT NULL DEFAULT '',
  last_name text NOT NULL,
  suffix text NOT NULL DEFAULT '',
  age integer NOT NULL CHECK (age BETWEEN 18 AND 120),
  mobile_number text NOT NULL,
  street text NOT NULL,
  barangay text NOT NULL,
  city text NOT NULL,
  province text NOT NULL
);

CREATE TABLE requests (
  id uuid PRIMARY KEY,
  applicant_id uuid NOT NULL REFERENCES applicants(id),
  document_type_id text NOT NULL REFERENCES document_types(id),
  purpose text NOT NULL,
  status request_status NOT NULL DEFAULT 'submitted',
  tracking_code text NOT NULL UNIQUE,
  requested_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  released_at timestamptz,
  admin_note text NOT NULL DEFAULT ''
);
CREATE INDEX requests_status_requested_at_idx ON requests(status, requested_at DESC);

CREATE TABLE attachments (
  id uuid PRIMARY KEY,
  request_id uuid NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('frontId', 'backId', 'residencyProof')),
  storage_key text NOT NULL UNIQUE,
  original_name text NOT NULL,
  mime_type text NOT NULL,
  size_bytes integer NOT NULL CHECK (size_bytes > 0 AND size_bytes <= 5242880),
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (request_id, kind)
);

CREATE TABLE request_status_events (
  id uuid PRIMARY KEY,
  request_id uuid NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  status request_status NOT NULL,
  note text NOT NULL DEFAULT '',
  confirmation text NOT NULL DEFAULT '',
  performed_by text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX request_status_events_request_time_idx ON request_status_events(request_id, created_at);
