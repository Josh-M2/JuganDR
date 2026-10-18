import React, { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, ApiError } from "../../shared/api";
import { DocumentType } from "../../shared/types";
import { ButtonSpinner, Skeleton } from "../../shared/Loading";

type FormValues = Record<
  | "firstName"
  | "middleName"
  | "lastName"
  | "suffix"
  | "age"
  | "mobileNumber"
  | "street"
  | "barangay"
  | "city"
  | "province"
  | "purpose",
  string
>;
const initialValues: FormValues = {
  firstName: "",
  middleName: "",
  lastName: "",
  suffix: "",
  age: "",
  mobileNumber: "",
  street: "",
  barangay: "Jugan",
  city: "Consolacion",
  province: "Cebu",
  purpose: "",
};

export default function RequestForm() {
  const { typeId } = useParams();
  const navigate = useNavigate();
  const [types, setTypes] = useState<DocumentType[]>([]);
  const [values, setValues] = useState<FormValues>(initialValues);
  const [files, setFiles] = useState<Record<string, File | null>>({
    frontId: null,
    backId: null,
    residencyProof: null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api<DocumentType[]>("/document-types")
      .then(setTypes)
      .catch((issue) => setError(issue.message))
      .finally(() => setLoading(false));
  }, []);
  const type = types.find((item) => item.id === typeId);

  function update(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setErrors({});
    if (!type) return;
    const missing = Object.entries(files).find(([, file]) => !file);
    if (missing) {
      setError("Upload all three required documents before submitting.");
      return;
    }
    setBusy(true);
    try {
      const form = new FormData();
      form.append("documentTypeId", type.id);
      Object.entries(values).forEach(([key, value]) => form.append(key, value));
      Object.entries(files).forEach(([key, file]) => {
        if (file) form.append(key, file);
      });
      const result = await api<{ trackingCode: string }>("/requests", {
        method: "POST",
        body: form,
      });
      navigate(`/track/${result.trackingCode}?submitted=1`);
    } catch (issue) {
      const apiIssue = issue as ApiError;
      setError(apiIssue.message || "Unable to submit the request.");
      setErrors(apiIssue.fields || {});
    } finally {
      setBusy(false);
    }
  }

  if (!loading && error && !type)
    return (
      <main className="container page-space narrow-page">
        <Link className="back-link" to="/request">← All documents</Link>
        <div className="alert alert-error" role="alert">{error}</div>
      </main>
    );

  if (loading)
    return (
      <main className="container page-space narrow-page form-skeleton" role="status" aria-label="Loading document form">
        <Link className="back-link" to="/request">← All documents</Link>
        <div className="page-heading">
          <span className="eyebrow">Document request</span>
          <Skeleton width="60%" height="40px" />
          <Skeleton width="80%" height="16px" />
        </div>
        <div className="form-stack">
          {[6, 4, 3].map((count, section) => (
            <section className="form-section" key={section}>
              <div className="section-title">
                <Skeleton width="34px" height="34px" />
                <div>
                  <Skeleton width="190px" height="23px" />
                  <Skeleton className="skeleton-line" width="230px" height="13px" />
                </div>
              </div>
              <div className={section === 2 ? "upload-grid" : "form-grid"}>
                {Array.from({ length: count }, (_, index) => (
                  <div className="field" key={index}>
                    <Skeleton className="skeleton-label" width="85px" />
                    <Skeleton className="skeleton-field" />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    );

  if (!type)
    return (
      <main className="container page-space">
        <h1>Document not found</h1>
        <Link to="/request">View available documents</Link>
      </main>
    );

  const field = (key: keyof FormValues, label: string, required = true, inputType = "text") => (
    <label className="field" key={key}>
      <span>
        {label}
        {required && <b aria-hidden="true"> *</b>}
      </span>
      <input
        name={key}
        type={inputType}
        required={required}
        value={values[key]}
        onChange={(event) => update(key, event.target.value)}
        aria-invalid={Boolean(errors[key])}
        aria-describedby={errors[key] ? `${key}-error` : undefined}
      />
      {errors[key] && (
        <small id={`${key}-error`} className="field-error">
          {errors[key]}
        </small>
      )}
    </label>
  );

  const attachment = (key: string, label: string, hint: string) => (
    <label className="upload-field" key={key}>
      <span className="upload-icon" aria-hidden="true">
        ↑
      </span>
      <strong>{label}</strong>
      <small>{hint}</small>
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp,application/pdf"
        required
        onChange={(event) =>
          setFiles((current) => ({ ...current, [key]: event.target.files?.[0] || null }))
        }
      />
      {files[key] && <em>{files[key]?.name}</em>}
    </label>
  );

  return (
    <main className="container page-space narrow-page">
      <Link className="back-link" to="/request">
        ← All documents
      </Link>
      <div className="page-heading">
        <span className="eyebrow">Document request</span>
        <h1>{type.name}</h1>
        <p>Complete the form below. Your tracking code appears after a successful submission.</p>
      </div>
      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}
      <form onSubmit={submit} className="form-stack">
        <section className="form-section">
          <div className="section-title">
            <span>01</span>
            <div>
              <h2>Your details</h2>
              <p>Use the name shown on your valid ID.</p>
            </div>
          </div>
          <div className="form-grid">
            {field("firstName", "First name")}
            {field("middleName", "Middle name", false)}
            {field("lastName", "Last name")}
            {field("suffix", "Suffix", false)}
            {field("age", "Age", true, "number")}
            {field("mobileNumber", "Mobile number", true, "tel")}
          </div>
        </section>
        <section className="form-section">
          <div className="section-title">
            <span>02</span>
            <div>
              <h2>Address and purpose</h2>
              <p>Tell us where you live and why you need the document.</p>
            </div>
          </div>
          <div className="form-grid">
            {field("street", "Street or purok")}
            {field("barangay", "Barangay")}
            {field("city", "City or municipality")}
            {field("province", "Province")}
          </div>
          <label className="field">
            <span>
              Purpose <b aria-hidden="true">*</b>
            </span>
            <textarea
              required
              rows={4}
              value={values.purpose}
              onChange={(event) => update("purpose", event.target.value)}
              aria-invalid={Boolean(errors.purpose)}
            />
            {errors.purpose && <small className="field-error">{errors.purpose}</small>}
          </label>
        </section>
        <section className="form-section">
          <div className="section-title">
            <span>03</span>
            <div>
              <h2>Required documents</h2>
              <p>Each file must be PDF, PNG, JPEG, or WebP and no larger than 5 MB.</p>
            </div>
          </div>
          <div className="upload-grid">
            {attachment("frontId", "Front of valid ID", "Clear, readable copy")}
            {attachment("backId", "Back of valid ID", "Clear, readable copy")}
            {attachment("residencyProof", "Proof of residency", "Purok certificate or equivalent")}
          </div>
        </section>
        <div className="form-submit">
          <p>
            Double-check your details before sending. You can ask staff to correct them during
            review.
          </p>
          <button className="button button-primary" disabled={busy}>
            {busy && <ButtonSpinner />}{busy ? "Submitting…" : "Submit request"} <span aria-hidden="true">→</span>
          </button>
        </div>
      </form>
    </main>
  );
}
