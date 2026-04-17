import { sheetGet, rowsToObjects } from "../../lib/sheets.js";

export async function GET() {
  try {
    const contactRows = await sheetGet("Contacts!A1:O");
    const contacts = rowsToObjects(contactRows);

    const emailRows = await sheetGet("Emails!A1:H");
    const emails = rowsToObjects(emailRows);

    const followupRows = await sheetGet("Followups!A1:H");
    const followups = rowsToObjects(followupRows);

    const regRows = await sheetGet("Booths!A1:Z");
    const registrations = regRows.length > 1 ? regRows.length - 1 : 0;

    const totalLeads = contacts.length;
    const emailsSent = emails.length;
    const followupCount = followups.length;

    // Count pipeline stages
    const stages = {};
    for (const c of contacts) {
      const stage = c["Pipeline Stage"] || "NEW";
      stages[stage] = (stages[stage] || 0) + 1;
    }

    const replied = stages["REPLIED"] || 0;
    const contacted = stages["CONTACTED"] || 0;
    const noReply = stages["NO_REPLY"] || 0;
    const registered = stages["REGISTERED"] || 0;

    const costPerLead = 15.5;
    const emailCostPerSend = 0.8;
    const boothFee = 2500;

    const campaignCost = Math.round(totalLeads * costPerLead + emailsSent * emailCostPerSend);
    const registrationRevenue = registered * boothFee;
    const netROI = registrationRevenue - campaignCost;
    const responseRate = emailsSent > 0 ? Math.round((replied / emailsSent) * 100) : 0;

    return Response.json({
      totalLeads,
      emailsSent,
      emailsOpened: contacted + replied + registered,
      emailsReplied: replied,
      emailsBounced: 0,
      followups: followupCount,
      registrations: registered,
      responseRate,
      stages,
      costPerLead: costPerLead.toFixed(2),
      campaignCost: campaignCost.toFixed(2),
      registrationRevenue: registrationRevenue.toFixed(2),
      netROI: netROI.toFixed(2),
      currency: "RM",
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
