import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../shared/api";
import { DocumentType } from "../../shared/types";
import { Skeleton } from "../../shared/Loading";

export default function DocumentPicker() {
  const [types, setTypes] = useState<DocumentType[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api<DocumentType[]>("/document-types")
      .then(setTypes)
      .catch((issue) => setError(issue.message))
      .finally(() => setLoading(false));
  }, []);
  return (
    <main className="container page-space">
      <div className="page-heading">
        <span className="eyebrow">Start a request</span>
        <h1>Choose your document</h1>
        <p>
          Select the document that matches your purpose. The same guided form is used for every
          type.
        </p>
      </div>
      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}
      {!loading && !error && !types.length && (
        <div className="info-panel"><h2>No documents available</h2><p>Please check back later.</p></div>
      )}
      <div className="document-grid" role={loading ? "status" : undefined} aria-label={loading ? "Loading available documents" : undefined}>
        {loading && Array.from({ length: 6 }, (_, index) => (
          <div className="document-card document-card-skeleton" key={index} aria-hidden="true">
            <Skeleton width="25px" height="14px" />
            <Skeleton width="75%" height="24px" />
            <div>
              <Skeleton className="skeleton-line" width="100%" height="13px" />
              <Skeleton className="skeleton-line" width="70%" height="13px" />
            </div>
            <Skeleton className="skeleton-card-link" width="100px" height="14px" />
          </div>
        ))}
        {types.map((type, index) => (
          <Link to={`/request/${type.id}`} className="document-card" key={type.id}>
            <span className="document-number">{String(index + 1).padStart(2, "0")}</span>
            <h2>{type.name}</h2>
            <p>{type.description}</p>
            <span className="card-link">
              Start request <span aria-hidden="true">→</span>
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
