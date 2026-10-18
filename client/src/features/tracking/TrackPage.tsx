import React, { FormEvent, useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { api } from "../../shared/api";
import StatusBadge from "../../shared/StatusBadge";
import StatusTimeline from "../../shared/StatusTimeline";
import { formatDate, PublicTracking } from "../../shared/types";
import LiveUpdates from "../../shared/LiveUpdates";
import { Skeleton } from "../../shared/Loading";

export default function TrackPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [input, setInput] = useState(code || "");
  const [result, setResult] = useState<PublicTracking | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(Boolean(code));

  const refresh = useCallback(async () => {
    if (!code) return;
    try {
      const data = await api<PublicTracking>(`/track/${encodeURIComponent(code)}`);
      setResult(data);
      setError("");
    } catch (issue) {
      setResult(null);
      setError((issue as Error).message);
    } finally {
      setLoading(false);
    }
  }, [code]);

  useEffect(() => {
    setInput(code || "");
    setResult(null);
    setLoading(Boolean(code));
    if (code) void refresh();
  }, [code, refresh]);

  function lookup(event: FormEvent) {
    event.preventDefault();
    if (input.trim()) navigate(`/track/${encodeURIComponent(input.trim().toUpperCase())}`);
  }

  return (
    <main className="container page-space narrow-page">
      <div className="page-heading">
        <span className="eyebrow">Request tracker</span>
        <h1>Follow your document</h1>
        <p>Enter the tracking code you received after submitting your request.</p>
      </div>
      {params.get("submitted") === "1" && result && (
        <div className="alert alert-success" role="status">
          Request received. Save your tracking code: <strong>{result.trackingCode}</strong>
        </div>
      )}
      <form className="track-search" onSubmit={lookup}>
        <label className="field">
          <span>Tracking code</span>
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="JG-XXXXXXXXXX"
            required
          />
        </label>
        <button className="button button-primary">Check status</button>
      </form>
      {loading && (
        <div className="tracking-card tracking-skeleton" role="status" aria-label="Checking your request">
          <div className="tracking-head">
            <div>
              <Skeleton width="130px" height="13px" />
              <Skeleton className="skeleton-heading" width="240px" />
            </div>
            <Skeleton width="95px" height="28px" />
          </div>
          <Skeleton width="65%" height="14px" />
          <div className="skeleton-progress">
            <Skeleton width="85px" height="19px" />
            {[0, 1, 2].map((step) => (
              <div className="skeleton-row" key={step}>
                <Skeleton width="14px" height="14px" />
                <Skeleton width={step === 1 ? "55%" : "75%"} height="15px" />
              </div>
            ))}
          </div>
        </div>
      )}
      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}
      {result && !loading && (
        <div className="tracking-card">
          <div className="tracking-head">
            <div>
              <span className="eyebrow">{result.trackingCode}</span>
              <h2>{result.documentType}</h2>
            </div>
            <StatusBadge status={result.status} />
          </div>
          <p className="muted">
            Submitted {formatDate(result.requestedAt)} · Updated {formatDate(result.updatedAt)}
          </p>
          <h3>Progress</h3>
          <StatusTimeline events={result.history} />
          <p className="tracking-help">
            {result.status === "rejected"
              ? "This request is closed. Read the staff reason above, then contact the barangay office if you need help or want to submit a new request."
              : result.status === "ready"
              ? "Your request is marked ready for pickup. Bring your tracking code and original requirements to the barangay office."
              : result.status === "released"
              ? "This request has been marked released by barangay staff."
              : "Updates appear automatically while this page is open. Keep your tracking code for future visits."}
          </p>
        </div>
      )}
      {code && result && (
        <LiveUpdates endpoint={`/live/track/${encodeURIComponent(code)}`} onChange={refresh} />
      )}
      {!code && (
        <div className="info-panel">
          <h2>Don't have a code yet?</h2>
          <p>Submit a document request first. Your code is shown immediately after submission.</p>
          <Link to="/request" className="text-link">
            Start a request →
          </Link>
        </div>
      )}
    </main>
  );
}
