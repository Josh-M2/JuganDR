import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, downloadBlob } from "../../shared/api";
import StatusBadge from "../../shared/StatusBadge";
import { DocumentRequest, formatDate, Status, statusLabels } from "../../shared/types";
import LiveUpdates from "../../shared/LiveUpdates";
import { Skeleton } from "../../shared/Loading";

const filters: (Status | "all")[] = [
  "all",
  "submitted",
  "reviewing",
  "approved",
  "ready",
  "released",
  "rejected",
];

function csvValue(value: unknown) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [filter, setFilter] = useState<Status | "all">("all");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");

  const refresh = useCallback(async () => {
    try {
      setRequests(await api<DocumentRequest[]>("/admin/requests"));
      setError("");
    } catch (issue) {
      if ((issue as { status?: number }).status === 401)
        navigate("/admin/login", { replace: true });
      else setError((issue as Error).message);
    }
  }, [navigate]);

  useEffect(() => {
    Promise.all([api<{ email: string }>("/admin/me"), api<DocumentRequest[]>("/admin/requests")])
      .then(([user, data]) => {
        setEmail(user.email);
        setRequests(data);
      })
      .catch((issue) =>
        issue.status === 401 ? navigate("/admin/login", { replace: true }) : setError(issue.message)
      )
      .finally(() => setLoading(false));
  }, [navigate]);

  const visible = useMemo(
    () =>
      requests.filter((request) => {
        const name = [request.applicant.firstName, request.applicant.lastName]
          .join(" ")
          .toLowerCase();
        return (
          (filter === "all" || request.status === filter) &&
          (!search ||
            `${name} ${request.trackingCode} ${request.documentType.name}`
              .toLowerCase()
              .includes(search.toLowerCase()))
        );
      }),
    [requests, filter, search]
  );

  async function logout() {
    await api("/admin/logout", { method: "POST" });
    navigate("/admin/login", { replace: true });
  }

  function exportCsv() {
    const header = ["Tracking code", "Document", "Applicant", "Mobile", "Status", "Requested at"];
    const rows = visible.map((request) => [
      request.trackingCode,
      request.documentType.name,
      `${request.applicant.firstName} ${request.applicant.lastName}`,
      request.applicant.mobileNumber,
      statusLabels[request.status],
      request.requestedAt,
    ]);
    const csv = [header, ...rows].map((row) => row.map(csvValue).join(",")).join("\r\n");
    downloadBlob(
      new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" }),
      "jugan-requests.csv"
    );
  }

  return (
    <main className="container page-space admin-page">
      <div className="admin-heading">
        <div>
          <span className="eyebrow">Staff dashboard</span>
          <h1>Document requests</h1>
          <p>Review submissions and keep applicants informed at each step.</p>
        </div>
        <div className="admin-actions">
          <span className="muted staff-email">{email}</span>
          <button className="button button-light" onClick={logout}>
            Sign out
          </button>
        </div>
      </div>
      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}
      {email && <LiveUpdates endpoint="/admin/live/requests" onChange={refresh} />}
      <div className="summary-grid" aria-busy={loading}>
        <div className="summary-card">
          <span>Total requests</span>
          {loading ? <Skeleton className="skeleton-metric" width="55px" /> : <strong>{requests.length}</strong>}
        </div>
        <div className="summary-card">
          <span>Needs review</span>
          {loading ? <Skeleton className="skeleton-metric" width="55px" /> : (
            <strong>{requests.filter((item) => ["submitted", "reviewing"].includes(item.status)).length}</strong>
          )}
        </div>
        <div className="summary-card">
          <span>Ready for pickup</span>
          {loading ? <Skeleton className="skeleton-metric" width="55px" /> : (
            <strong>{requests.filter((item) => item.status === "ready").length}</strong>
          )}
        </div>
        <div className="summary-card">
          <span>Released</span>
          {loading ? <Skeleton className="skeleton-metric" width="55px" /> : (
            <strong>{requests.filter((item) => item.status === "released").length}</strong>
          )}
        </div>
      </div>
      <div className="list-panel">
        <div className="list-toolbar">
          <label className="field search-field">
            <span>Search requests</span>
            <input
              placeholder="Name, code, or document"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <button className="button button-light" onClick={exportCsv} disabled={!visible.length}>
            Export CSV
          </button>
        </div>
        <div className="filter-row" aria-label="Filter by status">
          {filters.map((status) => (
            <button
              key={status}
              className={filter === status ? "filter active" : "filter"}
              onClick={() => setFilter(status)}
            >
              {status === "all" ? "All" : statusLabels[status]}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="table-wrap" role="status" aria-label="Loading requests">
            <table aria-hidden="true">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Document</th>
                  <th>Received</th>
                  <th>Status</th>
                  <th><span className="sr-only">Action</span></th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }, (_, index) => (
                  <tr key={index}>
                    <td><Skeleton className="skeleton-cell" width="130px" /><Skeleton className="skeleton-cell" width="90px" /></td>
                    <td><Skeleton className="skeleton-cell" width="160px" /></td>
                    <td><Skeleton className="skeleton-cell" width="100px" /></td>
                    <td><Skeleton className="skeleton-cell" width="85px" /></td>
                    <td><Skeleton className="skeleton-cell" width="42px" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : !visible.length ? (
          <div className="empty-state">
            <h2>No requests found</h2>
            <p>New submissions will appear here. Try another filter or search.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Document</th>
                  <th>Received</th>
                  <th>Status</th>
                  <th>
                    <span className="sr-only">Action</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((request) => (
                  <tr key={request.id}>
                    <td>
                      <strong>
                        {request.applicant.firstName} {request.applicant.lastName}
                      </strong>
                      <small>{request.trackingCode}</small>
                    </td>
                    <td>{request.documentType.name}</td>
                    <td>{formatDate(request.requestedAt)}</td>
                    <td>
                      <StatusBadge status={request.status} />
                    </td>
                    <td>
                      <Link className="text-link" to={`/admin/requests/${request.id}`}>
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
