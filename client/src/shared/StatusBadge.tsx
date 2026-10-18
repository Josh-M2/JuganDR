import React from "react";
import { Status, statusLabels } from "./types";

export default function StatusBadge({ status }: { status: Status }) {
  return <span className={`status-badge status-${status}`}>{statusLabels[status]}</span>;
}
