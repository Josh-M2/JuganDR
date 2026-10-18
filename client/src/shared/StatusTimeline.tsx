import React from "react";
import { StatusEvent, formatDate, statusLabels } from "./types";

export default function StatusTimeline({ events, showStaffDetails = false }: { events: StatusEvent[]; showStaffDetails?: boolean }) {
  return (
    <ol className="timeline">
      {events.map((event, index) => (
        <li key={event.id || `${event.status}-${index}`}>
          <span className="timeline-dot" aria-hidden="true" />
          <div>
            <strong>{statusLabels[event.status]}</strong>
            <time>{formatDate(event.createdAt)}</time>
          </div>
          {event.note && <p>{event.note}</p>}
          {showStaffDetails && event.confirmation && <p className="muted">Staff check: {event.confirmation}</p>}
          {showStaffDetails && event.performedBy && <p className="muted">Recorded by {event.performedBy}</p>}
        </li>
      ))}
    </ol>
  );
}
