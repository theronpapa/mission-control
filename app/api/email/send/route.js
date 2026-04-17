import { sheetGet, sheetUpdate, sheetAppend, rowsToObjects } from "../../../lib/sheets.js";
import { sendEmail } from "../../../lib/gmail.js";

const TEMPLATES = {
  initial: {
    subject: "Invitation to Exhibit at AgriMalaysia 2026 — MITEC KL, Sept 10-12",
    body: (company, category) =>
      `Dear ${company} Team,

We are pleased to invite ${company} to exhibit at AgriMalaysia 2026, Malaysia's premier agricultural technology exhibition, taking place 10-12 September 2026 at MITEC, Kuala Lumpur.

As a key player in ${category || "the agricultural sector"}, your participation would be invaluable to the 15,000+ trade visitors and 40 international delegations expected at the event.

Exhibition highlights:
- 13,000 sqm exhibition space with 450+ exhibitors
- Focus areas: smart farming, agri-tech, precision agriculture, food security
- Booth packages starting from RM 3,000 (standard 3m x 3m)
- Direct access to Malaysian and Southeast Asian agricultural buyers

We would love to discuss how a booth at AgriMalaysia 2026 can benefit ${company}.

Would you be available for a quick call this week to discuss booth options?

Warm regards,
AgriMalaysia 2026 Organising Team
Miffitou Tech
miffitoucompany@gmail.com`,
  },
};

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const limit = body.limit || 10;

    const rows = await sheetGet("Contacts!A1:O");
    const contacts = rowsToObjects(rows);

    // Only send to contacts with Pipeline Stage = "NEW"
    const toSend = contacts.filter((c) => c["Pipeline Stage"] === "NEW" && c.Email).slice(0, limit);

    if (toSend.length === 0) {
      return Response.json({ message: "No new contacts to email", sent: 0 });
    }

    let sentCount = 0;
    const errors = [];
    const now = new Date().toISOString();
    const emailLogRows = [];

    for (const contact of toSend) {
      try {
        const template = TEMPLATES.initial;
        await sendEmail({
          to: contact.Email,
          subject: template.subject,
          body: template.body(contact.Company, contact.Category),
        });

        // Find the row index for this contact (1-based, +1 for header)
        const rowIdx = contacts.indexOf(contact) + 2;

        // Update Pipeline Stage to CONTACTED and set Email Sent Date
        await sheetUpdate(`Contacts!G${rowIdx}:K${rowIdx}`, [["Contacted", "", now, "CONTACTED", now]]);

        // Log to Emails sheet
        emailLogRows.push([
          `E-${String(sentCount + 1).padStart(3, "0")}`,
          contact.Company,
          contact.Email,
          template.subject,
          now,
          "Sent",
          "Gmail",
          now,
        ]);

        sentCount++;
      } catch (err) {
        errors.push({ email: contact.Email, error: err.message });
      }
    }

    // Append all email logs at once
    if (emailLogRows.length > 0) {
      await sheetAppend("Emails!A1", emailLogRows);
    }

    return Response.json({
      message: `Campaign sent via Gmail`,
      sent: sentCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
