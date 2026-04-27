export function buildQrValue(item) {
  return JSON.stringify({
    id: item.id,
    code: item.code,
    name: item.name,
    category: item.category,
    location: item.location || "",
  });
}

export function buildLabelData(item) {
  return {
    id: item.id,
    code: item.code,
    title: item.shortLabel?.trim() || item.name,
    name: item.name,
    category: item.category,
    location: item.location || "",
    qrValue: buildQrValue(item),
  };
}

export function escapeHtml(text = "") {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}