import React, { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, apiBlob, ApiError, downloadBlob } from "../../shared/api";
import StatusBadge from "../../shared/StatusBadge";
import StatusTimeline from "../../shared/StatusTimeline";
import LiveUpdates from "../../shared/LiveUpdates";
import { ButtonSpinner, Skeleton } from "../../shared/Loading";
import {
  DocumentRequest,
  DocumentType,
  formatDate,
  Status,
  statusLabels,
} from "../../shared/types";

function AdminDetailSkeleton() {
  return (
    <main className="container page-space admin-page detail-skeleton" role="status" aria-label="Loading request details">
      <Link className="back-link" to="/admin">← Dashboard</Link>
      <div className="admin-heading">
        <div>
          <Skeleton width="130px" height="14px" />
          <Skeleton width="280px" height="38px" />
          <Skeleton width="170px" height="15px" />
        </div>
        <Skeleton width="95px" height="28px" />
      </div>
      <div className="detail-grid">
        <div className="detail-main">
          <section className="detail-card">
            <Skeleton className="skeleton-heading" width="190px" />
            <div className="detail-list">
              {Array.from({ length: 5 }, (_, index) => (
                <div key={index}>
                  <Skeleton width="100px" height="12px" />
                  <Skeleton width={index === 4 ? "80%" : "65%"} height="16px" />
                </div>
              ))}
            </div>
          </section>
          <section className="detail-card">
            <Skeleton className="skeleton-heading" width="220px" />
            {[0, 1, 2].map((row) => (
              <div className="skeleton-row attachment-skeleton-row" key={row}>
                <Skeleton width="160px" height="16px" />
                <Skeleton width="80px" height="15px" />
              </div>
            ))}
          </section>
        </div>
        <aside className="detail-side">
          <section className="detail-card">
            <Skeleton className="skeleton-heading" width="160px" />
            <Skeleton width="90px" height="13px" />
            <Skeleton className="skeleton-field" />
            <Skeleton width="120px" height="13px" />
            <Skeleton className="skeleton-field" height="85px" />
          </section>
          <section className="detail-card">
            <Skeleton className="skeleton-heading" width="90px" />
            {[0, 1, 2].map((row) => <Skeleton className="skeleton-line" width="75%" height="16px" key={row} />)}
          </section>
        </aside>
      </div>
    </main>
  );
}

export default function AdminDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState<DocumentRequest | null>(null);
  const [types, setTypes] = useState<DocumentType[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [nextStatus, setNextStatus] = useState<Status | "">("");
  const [note, setNote] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [editing, setEditing] = useState(false);
  const [edit, setEdit] = useState<Record<string, string>>({});
  const [fields, setFields] = useState<Record<string, string>>({});

  async function load() {
    const item = await api<DocumentRequest>(`/admin/requests/${id}`);
    setRequest(item);
    setNextStatus("");
    setEdit({
      documentTypeId: item.documentTypeId,
      purpose: item.purpose,
      firstName: item.applicant.firstName,
      middleName: item.applicant.middleName,
      lastName: item.applicant.lastName,
      suffix: item.applicant.suffix,
      age: String(item.applicant.age),
      mobileNumber: item.applicant.mobileNumber,
      street: item.applicant.street,
      barangay: item.applicant.barangay,
      city: item.applicant.city,
      province: item.applicant.province,
    });
  }

  useEffect(() => {
    Promise.all([
      api<DocumentRequest>(`/admin/requests/${id}`),
      api<DocumentType[]>("/document-types"),
    ])
      .then(([item, list]) => {
        setRequest(item);
        setTypes(list);
        setEdit({
          documentTypeId: item.documentTypeId,
          purpose: item.purpose,
          firstName: item.applicant.firstName,
          middleName: item.applicant.middleName,
          lastName: item.applicant.lastName,
          suffix: item.applicant.suffix,
          age: String(item.applicant.age),
          mobileNumber: item.applicant.mobileNumber,
          street: item.applicant.street,
          barangay: item.applicant.barangay,
          city: item.applicant.city,
          province: item.applicant.province,
        });
      })
      .catch((issue) =>
        issue.status === 401 ? navigate("/admin/login", { replace: true }) : setError(issue.message)
      );
  }, [id, navigate]);

  async function changeStatus(event: FormEvent) {
    event.preventDefault();
    if (!nextStatus) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await api(`/admin/requests/${id}/status`, {
        method: "POST",
        body: JSON.stringify({ status: nextStatus, note, confirmed }),
      });
      await load();
      setNote("");
      setConfirmed(false);
      setMessage("Status updated. The applicant can see the new progress now.");
    } catch (issue) {
      setError((issue as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function saveEdit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setFields({});
    try {
      await api(`/admin/requests/${id}`, { method: "PUT", body: JSON.stringify(edit) });
      await load();
      setEditing(false);
      setMessage("Request details saved.");
    } catch (issue) {
      const problem = issue as ApiError;
      setError(problem.message);
      setFields(problem.fields || {});
    } finally {
      setBusy(false);
    }
  }

  async function getFile(path: string, filename: string) {
    setError("");
    try {
      downloadBlob(await apiBlob(path), filename);
    } catch (issue) {
      setError((issue as Error).message);
    }
  }

  if (!request) {
    if (!error) return <AdminDetailSkeleton />;
    return (
      <main className="container page-space">
        <Link className="back-link" to="/admin">← Dashboard</Link>
        <div className="alert alert-error" role="alert">{error}</div>
      </main>
    );
  }
  const fullName = [
    request.applicant.firstName,
    request.applicant.middleName,
    request.applicant.lastName,
    request.applicant.suffix,
  ]
    .filter(Boolean)
    .join(" ");
  const address = [
    request.applicant.street,
    request.applicant.barangay,
    request.applicant.city,
    request.applicant.province,
  ].join(", ");
  const editField = (key: string, label: string, type = "text") => (
    <label className="field" key={key}>
      <span>{label}</span>
      <input
        type={type}
        value={edit[key] || ""}
        onChange={(event) => setEdit((current) => ({ ...current, [key]: event.target.value }))}
        required={!["middleName", "suffix"].includes(key)}
      />
      {fields[key] && <small className="field-error">{fields[key]}</small>}
    </label>
  );

  return (
    <main className="container page-space admin-page">
      <Link className="back-link" to="/admin">
        ← Back to dashboard
      </Link>
      <div className="admin-heading">
        <div>
          <span className="eyebrow">{request.trackingCode}</span>
          <h1>{request.documentType.name}</h1>
          <p>Submitted {formatDate(request.requestedAt)}</p>
        </div>
        <StatusBadge status={request.status} />
      </div>
      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}
      {message && (
        <div className="alert alert-success" role="status">
          {message}
        </div>
      )}
      <LiveUpdates
        endpoint="/admin/live/requests"
        onChange={() => { if (!editing && !busy) void load(); }}
      />
      <div className="detail-grid">
        <div className="detail-main">
          <section className="detail-card">
            <div className="card-heading">
              <h2>Applicant details</h2>
              <button className="text-button" disabled={["released", "rejected"].includes(request.status)} onClick={() => setEditing((current) => !current)}>
                {editing ? "Cancel editing" : "Edit details"}
              </button>
            </div>
            {editing ? (
              <form onSubmit={saveEdit} className="form-stack">
                <div className="form-grid">
                  {editField("firstName", "First name")}
                  {editField("middleName", "Middle name")}
                  {editField("lastName", "Last name")}
                  {editField("suffix", "Suffix")}
                  {editField("age", "Age", "number")}
                  {editField("mobileNumber", "Mobile number")}
                  {editField("street", "Street or purok")}
                  {editField("barangay", "Barangay")}
                  {editField("city", "City or municipality")}
                  {editField("province", "Province")}
                </div>
                <label className="field">
                  <span>Document type</span>
                  <select
                    value={edit.documentTypeId}
                    onChange={(event) =>
                      setEdit((current) => ({ ...current, documentTypeId: event.target.value }))
                    }
                  >
                    {types.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Purpose</span>
                  <textarea
                    value={edit.purpose || ""}
                    onChange={(event) =>
                      setEdit((current) => ({ ...current, purpose: event.target.value }))
                    }
                    required
                    rows={3}
                  />
                </label>
                <button className="button button-primary" disabled={busy}>
                  {busy && <ButtonSpinner />}{busy ? "Saving…" : "Save details"}
                </button>
              </form>
            ) : (
              <dl className="detail-list">
                <div>
                  <dt>Full name</dt>
                  <dd>{fullName}</dd>
                </div>
                <div>
                  <dt>Age</dt>
                  <dd>{request.applicant.age}</dd>
                </div>
                <div>
                  <dt>Mobile number</dt>
                  <dd>{request.applicant.mobileNumber}</dd>
                </div>
                <div>
                  <dt>Address</dt>
                  <dd>{address}</dd>
                </div>
                <div>
                  <dt>Purpose</dt>
                  <dd>{request.purpose}</dd>
                </div>
              </dl>
            )}
          </section>
          <section className="detail-card">
            <h2>Submitted requirements</h2>
            <div className="attachment-list">
              {request.attachments.map((file) => (
                <div key={file.id}>
                  <div>
                    <strong>
                      {file.kind === "frontId"
                        ? "Front of ID"
                        : file.kind === "backId"
                        ? "Back of ID"
                        : "Proof of residency"}
                    </strong>
                    <small>
                      {file.originalName} · {(file.size / 1024 / 1024).toFixed(1)} MB
                    </small>
                  </div>
                  <button
                    className="text-button"
                    onClick={() =>
                      getFile(`/admin/requests/${id}/attachments/${file.id}`, file.originalName)
                    }
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
          </section>
          <section className="detail-card">
            <h2>Certificate draft</h2>
            <p className="muted">
              After approval, download a PDF draft for office review. Its wording and signatory
              details still need approval before use. This is not an issued certificate.
            </p>
            <button
              className="button button-light"
              disabled={!["approved", "ready", "released"].includes(request.status)}
              onClick={() => getFile(`/admin/requests/${id}/pdf`, `${request.trackingCode}.pdf`)}
            >
              Download PDF draft
            </button>
          </section>
        </div>
        <aside className="detail-side">
          <section className="detail-card">
            <h2>Update progress</h2>
            {request.nextStatuses?.length ? (
              <form onSubmit={changeStatus} className="form-stack">
                <label className="field">
                  <span>Next status</span>
                  <select
                    required
                    value={nextStatus}
                    onChange={(event) => {
                      setNextStatus(event.target.value as Status);
                      setConfirmed(false);
                    }}
                  >
                    <option value="">Choose a status</option>
                    {request.nextStatuses.map((status) => (
                      <option key={status} value={status}>
                        {statusLabels[status]}
                      </option>
                    ))}
                  </select>
                </label>
                {nextStatus && request.staffConfirmations?.[nextStatus] && (
                  <label className="staff-check">
                    <input
                      type="checkbox"
                      checked={confirmed}
                      onChange={(event) => setConfirmed(event.target.checked)}
                      required
                    />
                    <span>{request.staffConfirmations[nextStatus]}</span>
                  </label>
                )}
                <label className="field">
                  <span>
                    {nextStatus === "rejected"
                      ? "Reason for applicant"
                      : "Update visible to applicant (optional)"}
                  </span>
                  <textarea
                    rows={3}
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    required={nextStatus === "rejected"}
                    maxLength={500}
                  />
                  <small>This note appears on the public tracking page. Do not include private details.</small>
                </label>
                <button
                  className="button button-primary"
                  disabled={
                    busy || !nextStatus || (Boolean(request.staffConfirmations?.[nextStatus]) && !confirmed)
                  }
                >
                  {busy && <ButtonSpinner />}{busy ? "Saving…" : "Save status"}
                </button>
              </form>
            ) : (
              <p className="muted">This request is closed. Its details and status can no longer be changed.</p>
            )}
          </section>
          <section className="detail-card">
            <h2>Activity</h2>
            <StatusTimeline events={request.history} showStaffDetails />
          </section>
        </aside>
      </div>
    </main>
  );
}
