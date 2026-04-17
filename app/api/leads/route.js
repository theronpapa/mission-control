import { sheetGet, rowsToObjects } from "../../lib/sheets.js";

export async function GET() {
  try {
    const rows = await sheetGet("Contacts!A1:O");
    const leads = rowsToObjects(rows);
    return Response.json({ leads });
  } catch (error) {
    return Response.json({ leads: [], error: error.message }, { status: 500 });
  }
}
