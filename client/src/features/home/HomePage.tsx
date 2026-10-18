import React from "react";
import { Link } from "react-router-dom";

const steps = [
  {
    number: "01",
    title: "Choose a document",
    text: "Select the certificate or clearance you need.",
  },
  {
    number: "02",
    title: "Send your details",
    text: "Fill in one form and attach your requirements.",
  },
  {
    number: "03",
    title: "Track the progress",
    text: "Use your private tracking code to see updates.",
  },
];

export default function HomePage() {
  return (
    <main>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="eyebrow">Barangay Jugan · Online services</span>
            <h1>Barangay documents, with a clearer path from request to pickup.</h1>
            <p className="hero-copy">
              Submit your details, upload the required documents, and follow each update using a
              tracking code.
            </p>
            <div className="hero-actions">
              <Link className="button button-primary" to="/request">
                Start a request <span aria-hidden="true">→</span>
              </Link>
              <Link className="button button-light" to="/track">
                Track an existing request
              </Link>
            </div>
          </div>
          <div className="hero-card" aria-label="Request process overview">
            <div className="hero-card-top">
              <span className="mini-mark">J</span>
              <span>Document services</span>
            </div>
            <div className="hero-card-body">
              <p className="hero-card-kicker">One request, one tracking code</p>
              <h2>Know where your request stands.</h2>
              <div className="sample-progress">
                <span className="sample-active" />
                <span className="sample-active" />
                <span />
                <span />
              </div>
              <div className="sample-progress-labels">
                <span>Submitted</span>
                <span>Review</span>
                <span>Ready</span>
                <span>Released</span>
              </div>
            </div>
            <p className="hero-card-foot">Updates are available any time using your code.</p>
          </div>
        </div>
      </section>
      <section className="section container">
        <div className="section-heading">
          <span className="eyebrow">How it works</span>
          <h2>Three simple steps</h2>
        </div>
        <div className="step-grid">
          {steps.map((step) => (
            <article className="step-card" key={step.number}>
              <span>{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="notice-section">
        <div className="container notice-grid">
          <div>
            <span className="eyebrow">Before you begin</span>
            <h2>Have your requirements ready.</h2>
            <p>
              You'll need the front and back of a valid ID and proof of residency. PDF, PNG, JPEG,
              and WebP files are accepted up to 5 MB each.
            </p>
          </div>
          <Link className="button button-outline" to="/request">
            View available documents <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
