export const documentTypes = [
  {
    id: "indigency",
    name: "Certificate of Indigency",
    description: "For assistance, scholarship, or other support applications.",
  },
  {
    id: "barangay-certificate",
    name: "Barangay Certificate",
    description: "Proof of a barangay record or local certification.",
  },
  {
    id: "barangay-clearance",
    name: "Barangay Clearance",
    description: "For employment and other clearance requirements.",
  },
  {
    id: "senior-citizen",
    name: "Senior Citizen Certificate",
    description: "Certification for senior citizen requirements.",
  },
  {
    id: "business-permit",
    name: "Barangay Business Permit",
    description: "Barangay endorsement for a local business.",
  },
  {
    id: "no-claims-conflict",
    name: "No Claims and Conflict Certificate",
    description: "Certification of no recorded claim or conflict.",
  },
  {
    id: "residency",
    name: "Certificate of Residency",
    description: "Proof of residence in Barangay Jugan.",
  },
];

export const statuses = ["submitted", "reviewing", "approved", "ready", "released", "rejected"];

export const nextStatuses = {
  submitted: ["reviewing", "rejected"],
  reviewing: ["approved", "rejected"],
  approved: ["ready", "rejected"],
  ready: ["released", "rejected"],
  released: [],
  rejected: [],
};

export const staffConfirmations = {
  approved: "I checked the submitted details and requirements against the available records.",
  ready: "I confirmed the document has been prepared and is ready for pickup.",
  released: "I confirmed the document was handed over through the barangay's release process.",
};

export function getDocumentType(id) {
  return documentTypes.find((item) => item.id === id);
}
