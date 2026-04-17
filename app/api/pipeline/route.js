import { sheetGet, sheetUpdate, rowsToObjects } from "../../lib/sheets.js";

export async function GET() {
  try {
    const rows = await sheetGet("Contacts!A1:O");
    const contacts = rowsToObjects(rows);

    const stages = {
      NEW: [],
      CONTACTED: [],
      REPLIED: [],
      REGISTERED: [],
      BOOTH_CONFIRMED: [],
      NO_REPLY: [],
      NOT_INTERESTED: [],
    };

    for (const c of contacts) {
      const stage = c["Pipeline Stage"] || "NEW";
      if (stages[stage]) {
        stages[stage].push(c);
      } else {
        stages.NEW.push(c);
      }
    }

    const summary = {};
    for (const [key, arr] of Object.entries(stages)) {
      summary[key] = arr.length;
    }

    return Response.json({ stages, summary, total: contacts.length });
  } catch (error) {
    return Response.json({ stages: {}, summary: {}, total: 0, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { contactId, stage } = await request.json();
    if (!contactId || !stage) {
      return Response.json({ error: "contactId and stage required" }, { status: 400 });
    }

    const rows = await sheetGet("Contacts!A1:O");
    const contacts = rowsToObjects(rows);

    const idx = contacts.findIndex((c) => c.ID === contactId);
    if (idx === -1) {
      return Response.json({ error: "Contact not found" }, { status: 404 });
    }

    const rowIdx = idx + 2;
    await sheetUpdate(`Contacts!J${rowIdx}`, [[stage]]);

    return Response.json({ message: `Contact ${contactId} moved to ${stage}` });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
