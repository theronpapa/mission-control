import { readFile } from "fs/promises";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data");

export async function GET() {
  try {
    let totalLeads = 0;
    try {
      const csv = await readFile(join(DATA_DIR, "leads.csv"), "utf-8");
      totalLeads = csv.trim().split("\n").length - 1;
    } catch {
      // No leads yet
    }

    let emailStats = { sent: 0, opened: 0, replied: 0, bounced: 0, followups: 0 };
    try {
      const log = JSON.parse(await readFile(join(DATA_DIR, "email_log.json"), "utf-8"));
      emailStats = {
        sent: log.length,
        opened: log.filter((e) => e.opened).length,
        replied: log.filter((e) => e.replied).length,
        bounced: log.filter((e) => e.bounced).length,
        followups: log.filter((e) => e.followupSent).length,
      };
    } catch {
      // No email log yet
    }

    let registrations = 0;
    try {
      const regs = JSON.parse(await readFile(join(DATA_DIR, "registrations.json"), "utf-8"));
      registrations = regs.length;
    } catch {
      // No registrations yet
    }

    const costPerLead = 15.50;
    const emailCostPerSend = 0.80;
    const boothFee = 2500;

    const campaignCost = Math.round((totalLeads * costPerLead) + (emailStats.sent * emailCostPerSend));
    const registrationRevenue = registrations * boothFee;
    const netROI = registrationRevenue - campaignCost;
    const responseRate = emailStats.sent > 0 ? Math.round((emailStats.replied / emailStats.sent) * 100) : 0;

    return Response.json({
      totalLeads,
      emailsSent: emailStats.sent,
      emailsOpened: emailStats.opened,
      emailsReplied: emailStats.replied,
      emailsBounced: emailStats.bounced,
      followups: emailStats.followups,
      registrations,
      responseRate,
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
