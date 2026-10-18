import React, { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../shared/api";
import { ButtonSpinner } from "../../shared/Loading";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api("/admin/login", { method: "POST", body: JSON.stringify({ email, password }) });
      navigate("/admin", { replace: true });
    } catch (issue) {
      setError((issue as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="container page-space auth-page">
      <div className="form-section">
        <span className="eyebrow">Staff access</span>
        <h1>Sign in to the dashboard</h1>
        <p className="muted">Use the local admin credentials configured on the server.</p>
        {error && (
          <div className="alert alert-error" role="alert">
            {error}
          </div>
        )}
        <form onSubmit={submit} className="form-stack">
          <label className="field">
            <span>Email address</span>
            <input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <button className="button button-primary" disabled={busy}>
            {busy && <ButtonSpinner />}{busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
