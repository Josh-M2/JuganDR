# Jugan Document Services

A portfolio demo of a document request and tracking app for Barangay Jugan. Residents can submit one of seven document requests with supporting files and track progress live. Staff can review requests, receive live dashboard updates, download private attachments, export a CSV, and prepare a PDF draft through headless Chrome. The default connected backend is Neon Postgres, Neon Object Storage, and Neon Realtime.

## Local setup

Requirements: Node.js 20 or newer, pnpm 8.15.6, and Google Chrome or Chromium for PDF drafts. This version was verified with Node.js 24.18.0.

From the repository root:

```sh
pnpm install --frozen-lockfile
pnpm --dir client install --frozen-lockfile
pnpm --dir server install --frozen-lockfile
pnpm run setup:admin
```

The setup command creates the ignored `server/.env` file with a local administrator email, generated password, and session secret. Open that file to read the password. Keep it private. It does not overwrite an existing file. For connected Neon mode, complete the Neon backend steps below before starting the services.

Start the services in two terminals:

```sh
pnpm dev:server
```

```sh
pnpm dev:client
```

Open [http://localhost:3102](http://localhost:3102). The API health endpoint is [http://127.0.0.1:3101/api/health](http://127.0.0.1:3101/api/health). Port 3100 is used by LeadNest on this machine.

`client/.env.development` contains the local browser API URL. Copy `client/.env.example` to `client/.env.local` only when you need a different URL. See `server/.env.example` for server settings. Restart a service after changing its environment file.

## Neon backend

The linked Neon project is `noisy-wind-27561553`, branch `production`. `neon.ts` declares a private `jugan-request-attachments` bucket and Realtime for `http://localhost:3102`. Authenticate with `pnpm dlx neon@latest login`, then use `pnpm dlx neon@latest deploy -y` when the service config changes. Neon writes the service variables into the ignored root `.env.local`; never commit or copy them into `client/`.

Run `pnpm db:migrate` to apply the normalized schema in `docs/schema.sql`. The migration is recorded in `schema_migrations` and is safe to rerun. The server reads root `.env.local` plus `server/.env` for staff credentials. When `DATABASE_URL` is present, it uses Neon Postgres and private Object Storage. The public tracker and staff pages subscribe to sealed, limited Realtime queries; no periodic polling runs. The Realtime secret stays on the server. Live queries trigger a fresh API read, so applicant and attachment details never enter the live query stream.

Run `pnpm verify:neon` to exercise submission, tracking, staff login, private file download, and pushed status changes in both live subscriptions. It creates fictional data and removes its rows and objects afterward. The verifier exits after cleanup because the SDK can retain a reconnect timer in a standalone Node process.

Without root `.env.local`, the app still starts in local JSON/file mode. It has no cross-tab live updates in that mode; reload a page to see changes made elsewhere. Existing `server/data/` records are **not** automatically copied into Neon. They remain local until explicitly migrated.

## Workflow

1. A resident selects a document and submits their details with the front and back of a valid ID and proof of residency. Each file must be PDF, PNG, JPEG, or WebP and at most 5 MB.
2. The app returns a tracking code in the form `JG-XXXXXXXXXX`. The public tracking page shows status and user-facing notes without applicant contact details or attachments.
3. Staff sign in at `/admin/login`, inspect a request, download its attachments, and move it through `submitted → reviewing → approved → ready → released`. Approval, pickup readiness, and release each require an explicit staff confirmation. A request may be declined with a public reason; declined and released requests are closed.
4. After approval, staff can download a PDF draft. It is labeled as an unsigned draft for official review. It records the application and flags facts still needing confirmation; it is not an issued certificate.

The [staff acceptance review](docs/staff-acceptance.md) records what would need validation before actual barangay use. This portfolio demo uses fictional data and unsigned drafts.

See [the data model](docs/data-model.md) and [PostgreSQL schema](docs/schema.sql) for storage details.

## Interface and loading states

The document picker, request form, public tracker, staff dashboard, and staff request detail page show layout-matched skeletons while their initial data loads. The dashboard keeps its current data visible during live updates, so incoming changes do not replace the table with placeholders. Sign-in, request submission, and staff save actions show a spinner and progress text while their buttons are disabled. Failed requests show an error message instead of an endless loading state. Loading regions have accessible status labels, and animations stop when the browser requests reduced motion.

Client components are organized by feature in `client/src/features/`; shared API, status, live update, and loading components are in `client/src/shared/`. See the [client README](client/README.md) for the UI structure and conventions.

## Commands

```sh
pnpm build           # production client bundle
pnpm typecheck       # TypeScript client check
pnpm check:server    # server syntax check
pnpm test            # API request lifecycle test
pnpm db:migrate      # apply or verify the Neon schema
pnpm verify:neon     # live Neon end-to-end check; cleans up test data
pnpm seed:demo       # add 12 fictional requests for portfolio screenshots
```

The browser bundle uses React, React Router, and plain CSS. Supabase and browser-side DOCX runtime dependencies have been removed. Both packages use pnpm lockfiles.

## Configuration and security

- `server/.env` contains admin credentials and must stay private. To change credentials, edit that file and restart the server. Existing sessions will expire when the session secret changes.
- Set `CHROME_PATH` in `server/.env` if Chrome or Chromium is installed elsewhere. The health endpoint reports whether the configured binary is available.
- Attachments live in a private Neon bucket, and the API requires an admin session to download them. Local mode uses files outside the client with restricted permissions.
- The public tracker only accepts a tracking code and returns status information. It does not return the applicant's name, mobile number, or uploaded files.
- The previous generated `client/public/env.js` exposed an old environment snapshot. It has been removed from the current app. If any private credentials were ever included in that historical file, rotate them before deployment.

Before actual public use, replace the portfolio admin login with durable user and session management, establish data retention rules for personal documents, and review certificate wording with barangay staff.
