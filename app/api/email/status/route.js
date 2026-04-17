import { sheetGet, rowsToObjects } from "../../../lib/sheets.js";

export async function GET() {
  try {
    const rows = await sheetGet("Contacts!A1:O");
    const contacts = rowsToObjects(rows);

    const total = contacts.length;
    const stages = {};
    for (const c of contacts) {
      const stage = c["Pipeline Stage"] || "NEW";
      stages[stage] = (stages[stage] || 0) + 1;
    }

    // Count emails from Emails sheet
    const emailRows = await sheetGet("Emails!A1:H");
    const emails = rowsToObjects(emailRows);

    // Count followups
    const followupRows = await sheetGet("Followups!A1:H");
    const followups = rowsToObjects(followupRows);

    return Response.json({
      total,
      stages,
      sent: emails.length,
      followups: followups.length,
      replied: stages["REPLIED"] || 0,
      registered: stages["REGISTERED"] || 0,
      noReply: stages["NO_REPLY"] || 0,
    });
  } catch (error) {
    return Response.json(
      { total: 0, stages: {}, sent: 0, followups: 0, replied: 0, registered: 0, noReply: 0, error: error.message },
      { status: 500 }
    );
  }
}
