const SHEET_ID = "1w9OZLWwKaZl_eOLC_7aEmrIuETRGc4zpQ8-qY0PN4yk";
const GATEWAY = "https://gateway.maton.ai/google-sheets/v4/spreadsheets";

function getKey() {
  const key = process.env.MATON_API_KEY;
  if (!key) throw new Error("MATON_API_KEY not set");
  return key;
}

async function sheetGet(range) {
  const url = `${GATEWAY}/${SHEET_ID}/values/${encodeURIComponent(range)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${getKey()}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Sheets GET ${range}: ${res.status}`);
  const data = await res.json();
  return data.values || [];
}

async function sheetUpdate(range, values) {
  const url = `${GATEWAY}/${SHEET_ID}/values/${encodeURIComponent(range)}?valueInputOption=RAW`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${getKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ values }),
  });
  if (!res.ok) throw new Error(`Sheets PUT ${range}: ${res.status}`);
  return res.json();
}

async function sheetAppend(range, values) {
  const url = `${GATEWAY}/${SHEET_ID}/values/${encodeURIComponent(range)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ values }),
  });
  if (!res.ok) throw new Error(`Sheets APPEND ${range}: ${res.status}`);
  return res.json();
}

async function sheetClear(range) {
  const url = `${GATEWAY}/${SHEET_ID}/values/${encodeURIComponent(range)}:clear`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getKey()}`,
      "Content-Type": "application/json",
    },
    body: "{}",
  });
  if (!res.ok) throw new Error(`Sheets CLEAR ${range}: ${res.status}`);
  return res.json();
}

// Parse rows into objects using header row
function rowsToObjects(rows) {
  if (!rows || rows.length < 2) return [];
  const headers = rows[0];
  return rows.slice(1).map((row) => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = row[i] || "";
    });
    return obj;
  });
}

export { sheetGet, sheetUpdate, sheetAppend, sheetClear, rowsToObjects, SHEET_ID };
