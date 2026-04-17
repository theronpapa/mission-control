import { sheetGet, sheetUpdate, sheetAppend, rowsToObjects } from "../../../lib/sheets.js";
import { sendEmail, checkReplies } from "../../../lib/gmail.js";

const FOLLOWUP_TEMPLATES = {
  1: {
    subject: "Following up — AgriMalaysia 2026 Exhibition Booth",
    body: (company) =>
      `Dear ${company} Team,

I wanted to follow up on our earlier invitation to exhibit at AgriMalaysia 2026 (Sept 10-12, MITEC KL).

Here's what's been confirmed since we last wrote:
- 15,000+ trade visitors expected from across Southeast Asia
- 40 international delegations confirmed
- Smart farming, precision agriculture, and food security zones now mapped out
- Early-bird booth packages still available from RM 3,000

We'd love to have ${company} represented at the event. Would you have any questions about booth options or the exhibition layout?

Happy to arrange a quick call at your convenience.

Warm regards,
AgriMalaysia 2026 Organising Team
Miffitou Tech`,
  },
  2: {
    subject: "Last chance — AgriMalaysia 2026 booth spaces filling fast",
    body: (company) =>
      `Dear ${company} Team,

This is a final reminder about our invitation to AgriMalaysia 2026 (Sept 10-12, MITEC KL).

Booth spaces are filling up quickly — over 60% of premium locations have been reserved. We don't want ${company} to miss this opportunity to connect with 15,000+ qualified agricultural buyers.

Early-bird pricing (from RM 3,000) ends soon.

If you're interested, simply reply to this email and we'll hold a spot for you. If the timing isn't right, no worries at all — we appreciate your consideration.

Best regards,
AgriMalaysia 2026 Organising Team
Miffitou Tech`,
  },
  3: {
    subject: "Final update — AgriMalaysia 2026",
    body: (company) =>
      `Dear ${company} Team,

This will be our last message regarding AgriMalaysia 2026. We understand you may have other priorities right now.

Just in case: we still have a limited number of booth spaces available. If ${company} would like to participate, we're happy to accommodate — just reply to this email.

If this isn't relevant, we won't follow up further. Thank you for your time.

Best regards,
AgriMalaysia 2026 Organising Team
Miffitou Tech`,
  },
};

// Days to wait before each follow-up
const FOLLOWUP_SCHEDULE = { 1: 5, 2: 12, 3: 20 };

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const action = body.action || "send"; // "check" or "send"

    const rows = await sheetGet("Contacts!A1:O");
    const contacts = rowsToObjects(rows);
    const now = new Date();

    // Step 1: Check for replies from CONTACTED contacts
    const contacted = contacts.filter(
      (c) => c["Pipeline Stage"] === "CONTACTED" && c.Email
    );

    let repliedCount = 0;
    let followupsSent = 0;
    const errors = [];

    for (const contact of contacted) {
      const rowIdx = contacts.indexOf(contact) + 2;

      // Check Gmail for replies
      const replies = await checkReplies(contact.Email);
      if (replies.length > 0) {
        // They replied — update to REPLIED
        await sheetUpdate(`Contacts!J${rowIdx}:O${rowIdx}`, [
          ["REPLIED", contact["Email Sent Date"] || "", contact["Followup 1 Sent"] || "", contact["Followup 2 Sent"] || "", contact["Followup 3 Sent"] || "", now.toISOString()],
        ]);
        repliedCount++;
        continue;
      }

      if (action !== "send") continue;

      // Determine which follow-up round to send
      const emailSentDate = contact["Email Sent Date"];
      if (!emailSentDate) continue;

      const daysSinceSent = Math.floor((now - new Date(emailSentDate)) / (1000 * 60 * 60 * 24));
      let roundToSend = 0;

      if (!contact["Followup 3 Sent"] && daysSinceSent >= FOLLOWUP_SCHEDULE[3]) {
        roundToSend = 3;
      } else if (!contact["Followup 2 Sent"] && daysSinceSent >= FOLLOWUP_SCHEDULE[2]) {
        roundToSend = 2;
      } else if (!contact["Followup 1 Sent"] && daysSinceSent >= FOLLOWUP_SCHEDULE[1]) {
        roundToSend = 1;
      }

      if (roundToSend === 0) continue;

      // Send follow-up
      const template = FOLLOWUP_TEMPLATES[roundToSend];
      try {
        await sendEmail({
          to: contact.Email,
          subject: template.subject,
          body: template.body(contact.Company),
        });

        // Update the followup date column (L=1, M=2, N=3)
        const colMap = { 1: "L", 2: "M", 3: "N" };
        await sheetUpdate(`Contacts!${colMap[roundToSend]}${rowIdx}`, [[now.toISOString()]]);

        // If round 3 sent and still no reply after 20 days, mark as NO_REPLY
        if (roundToSend === 3) {
          await sheetUpdate(`Contacts!J${rowIdx}`, [["NO_REPLY"]]);
        }

        // Log to Followups sheet
        await sheetAppend("Followups!A1", [
          [`F-${Date.now()}`, contact.ID, contact.Company, contact.Email, `Round ${roundToSend}`, template.subject, now.toISOString(), "Sent"],
        ]);

        followupsSent++;
      } catch (err) {
        errors.push({ email: contact.Email, round: roundToSend, error: err.message });
      }
    }

    return Response.json({
      message: action === "check" ? "Reply check complete" : "Follow-up cycle complete",
      contacted: contacted.length,
      repliedCount,
      followupsSent,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
