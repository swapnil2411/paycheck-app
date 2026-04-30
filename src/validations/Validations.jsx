// ✅ Email — must be valid and contain no spaces
export function ValidateEmail(text) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return regex.test(text);
}

export function ValidateName(text) {
  const regex = /^[A-Za-z']{1,50}$/;
  return regex.test(text);
}

export function ValidateMobileNumber(text) {
  const regex = /^\+?[0-9]{10,15}$/;
  return regex.test(text);
}

export function ValidatePan(text) {
  const regex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return regex.test(text);
}

export function ValidateCompanyName(text) {
  const regex = /^(?!\s)[A-Za-z'\s]{1,50}(?<!\s)$/;
  return regex.test(text);
}