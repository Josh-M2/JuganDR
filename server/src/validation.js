import { getDocumentType } from "./domain.js";

function clean(value) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

export function validateRequest(input) {
  input = input || {};
  const value = {
    documentTypeId: clean(input.documentTypeId),
    firstName: clean(input.firstName),
    middleName: clean(input.middleName),
    lastName: clean(input.lastName),
    suffix: clean(input.suffix),
    age: Number(input.age),
    mobileNumber: clean(input.mobileNumber),
    street: clean(input.street),
    barangay: clean(input.barangay),
    city: clean(input.city),
    province: clean(input.province),
    purpose: clean(input.purpose),
  };
  const errors = {};
  if (!getDocumentType(value.documentTypeId)) errors.documentTypeId = "Choose a valid document.";
  for (const [key, label] of [
    ["firstName", "First name"],
    ["lastName", "Last name"],
  ]) {
    if (value[key].length < 2 || value[key].length > 80)
      errors[key] = `${label} must be 2–80 characters.`;
  }
  for (const key of ["middleName", "suffix"]) {
    if (value[key].length > 80) errors[key] = "Use at most 80 characters.";
  }
  if (!Number.isInteger(value.age) || value.age < 18 || value.age > 120)
    errors.age = "Age must be between 18 and 120.";
  if (!/^\+?[0-9]{10,15}$/.test(value.mobileNumber))
    errors.mobileNumber = "Enter a 10–15 digit mobile number.";
  for (const [key, label] of [
    ["street", "Street or purok"],
    ["barangay", "Barangay"],
    ["city", "City or municipality"],
    ["province", "Province"],
  ]) {
    if (value[key].length < 2 || value[key].length > 120)
      errors[key] = `${label} must be 2–120 characters.`;
  }
  if (value.purpose.length < 3 || value.purpose.length > 500)
    errors.purpose = "Purpose must be 3–500 characters.";
  return { value, errors };
}

export function validateAdminEdit(input) {
  const { value, errors } = validateRequest(input);
  return { value, errors };
}
