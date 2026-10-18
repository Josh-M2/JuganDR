export type Status = "submitted" | "reviewing" | "approved" | "ready" | "released" | "rejected";

export interface DocumentType {
  id: string;
  name: string;
  description: string;
}

export interface Applicant {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  age: number;
  mobileNumber: string;
  street: string;
  barangay: string;
  city: string;
  province: string;
}

export interface StatusEvent {
  id?: string;
  status: Status;
  note: string;
  confirmation?: string;
  performedBy?: string;
  createdAt: string;
}

export interface Attachment {
  id: string;
  kind: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

export interface DocumentRequest {
  id: string;
  trackingCode: string;
  documentTypeId: string;
  documentType: DocumentType;
  applicant: Applicant;
  purpose: string;
  status: Status;
  requestedAt: string;
  updatedAt: string;
  releasedAt: string | null;
  adminNote: string;
  attachments: Attachment[];
  history: StatusEvent[];
  nextStatuses?: Status[];
  staffConfirmations?: Partial<Record<Status, string>>;
}

export interface PublicTracking {
  trackingCode: string;
  documentType: string;
  status: Status;
  requestedAt: string;
  updatedAt: string;
  history: StatusEvent[];
}

export const statusLabels: Record<Status, string> = {
  submitted: "Submitted",
  reviewing: "Under review",
  approved: "Approved",
  ready: "Ready for pickup",
  released: "Released",
  rejected: "Declined",
};

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Manila",
  }).format(new Date(date));
}
