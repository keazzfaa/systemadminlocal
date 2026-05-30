// Excel export utility using SheetJS (via CDN-like inline)
// We'll use a simple CSV export as fallback since xlsx lib may not install in vite easily

export function exportToExcel(data, filename, headers) {
  // Build CSV
  const rows = [headers, ...data.map(row => headers.map(h => {
    const key = Object.keys(row).find(k => k === h || toCamel(h) === k);
    return row[key] ?? row[Object.keys(row)[headers.indexOf(h)]] ?? "";
  }))];
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF"+csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename + ".csv"; a.click();
  URL.revokeObjectURL(url);
}

function toCamel(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+(.)/g, (m, c) => c.toUpperCase());
}

export function exportJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename + ".json"; a.click();
  URL.revokeObjectURL(url);
}
