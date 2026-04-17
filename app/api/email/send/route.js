import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data");
const LEADS_FILE = join(DATA_DIR, "leads.csv");
const EMAIL_LOG_FILE = join(DATA_DIR, "email_log.json");

export async function POST() {
  try {
    await mkdir(DATA_DIR, { recursive: true });

    let leads = [];
    try {
      const csv = await readFile(LEADS_FILE, "utf-8");
      const lines = csv.trim().split("\n");
      const headers = lines[0].split(",");
      leads = lines.slice(1).map((line) => {
        const values = line.split(",");
        const obj = {};
        headers.forEach((h, i) => {
          obj[h.trim()] = values[i]?.trim() || "";
        });
        return obj;
      });
    } catch {
      return Response.json({ error: "No leads found. Run scraper first." }, { status: 400 });
    }

    let log = [];
    try {
      const existing = await readFile(EMAIL_LOG_FILE, "utf-8");
      log = JSON.parse(existing);
    } catch {
      // No existing log
    }

    const alreadySent = new Set(log.map((e) => e.leadId));
    const now = new Date().toISOString();

    const newEmails = leads
      .filter((l) => !alreadySent.has(l.id))
      .map((lead) => {
        const rand = Math.random();
        return {
          leadId: lead.id,
          company: lead.company,
          email: lead.email,
          sentAt: now,
          status: "sent",
          opened: rand > 0.3,
          replied: rand > 0.7,
          bounced: rand < 0.05,
          followupSent: false,
        };
      });

    log = [...log, ...newEmails];
    await writeFile(EMAIL_LOG_FILE, JSON.stringify(log, null, 2), "utf-8");

    return Response.json({
      message: "Campaign sent (simulation mode)",
      sent: newEmails.length,
      total: log.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
