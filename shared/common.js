export function normalizeCommaList(value) {
  return [...new Set(String(value || "").split(",").map((item) => item.trim()).filter(Boolean))];
}

export function toIsoDate(value = new Date()) {
  return new Date(value).toISOString();
}

export function requireFields(record, fields) {
  const missing = fields.filter((field) => !record?.[field]);
  if (missing.length) throw new Error(`Missing required fields: ${missing.join(", ")}`);
  return record;
}
