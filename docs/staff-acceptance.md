# Staff acceptance review

This is a review sheet for possible future use by the Barangay Jugan office. The portfolio demo uses Neon Postgres and private Object Storage, with a local JSON fallback. It does not replace the office's approval, signing, record-checking, or release procedures. No barangay staff member has signed off on the wording or workflow in this repository.

## Workflow to walk through with staff

Use fictional applicant details and sample files. Do not upload real IDs during a demo.

| Step | Expected behavior | Staff decision to record |
| --- | --- | --- |
| Submit | Resident chooses one of seven document types, enters contact/address/purpose, uploads front and back of ID plus proof of residency, and gets a tracking code. | Are these fields and three files needed for **each** document type? Are minors or representatives allowed to apply? |
| Review | Staff opens the request and reads the attachments. Changes to applicant details are possible before the request is closed. | Which source records and identity checks are required for each type? Who may correct submitted details? |
| Approve | Staff confirms they checked the submitted details and requirements before changing status to Approved. | What does “Approved” mean, and which staff role can make that decision? |
| Prepare | Staff may download an **unsigned draft** after approval. Staff confirms the document is prepared before marking it Ready for pickup. | Must it be signed and sealed before Ready? Are payments or additional checks required? |
| Release | Staff confirms handover through the office's release process. The request then closes and its details cannot be edited in the app. | Who may collect it? What proof of identity, authorization, receipt, or release log is required? |
| Decline | Staff enters a reason that appears in the public tracker. The request closes; applicants may contact the office or submit a new request. | Is a correction/resubmission step needed instead of closing? What reasons may safely appear in public tracking? |

The public tracker shows only document type, status, dates, and notes. The status form warns staff that notes are public. Staff confirmations and the staff email are visible only on the admin side. Applicants are not automatically notified by SMS or email; they must use their tracking code.

## Document wording to approve

The current Chrome PDF is deliberately a request-based **draft**, not an official certificate. It contains applicant-provided details, the requested purpose, a type-specific statement of what must be verified, a draft banner, and an unsigned signatory area. It does **not** assert that a resident is indigent, cleared, a senior citizen, free of recorded claims, eligible for a business permit, or a verified resident. The former sentence “Issued upon request” was removed because the PDF has not been issued.

Ask the office to provide an approved sample or exact text for each of these types before replacing the draft wording:

1. Certificate of Indigency — eligibility basis and approved purpose language.
2. Barangay Certificate — the specific fact or record being certified; the current form does not ask for this.
3. Barangay Clearance — official record-check language and any validity period.
4. Senior Citizen Certificate — age, identity, and eligibility basis.
5. Barangay Business Permit — business name, location, nature of business, and any required approval fields are **not collected yet**.
6. No Claims and Conflict Certificate — exact office name for this document and the record search that supports it.
7. Certificate of Residency — proof and period of residency, if needed.

Confirm the letterhead, officer title and name, signature/seal area, issue date, reference number, fees, and validity text from actual approved templates. Do not treat the generated draft as ready to sign until these decisions are made.

## Acceptance record

Record the office's answers here or in an issue before public launch:

| Decision | Approved answer / template reference | Reviewer and date |
| --- | --- | --- |
| Document types and names | Pending | Pending |
| Required fields and files by type | Pending | Pending |
| Eligibility and record checks | Pending | Pending |
| Approval, pickup, and release authority | Pending | Pending |
| Decline and correction policy | Pending | Pending |
| Seven official document templates | Pending | Pending |
| Public note and applicant contact policy | Pending | Pending |

Only after these are confirmed should the app generate office-approved certificate text or be used for real requests.
