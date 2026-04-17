import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data");
const EMAIL_LOG_FILE = join(DATA_DIR, "email_log.json");

export async function POST() {
  try {
    await mkdir(DATA_DIR, { recursive: true });

    let log = [];
    try {
      const existing = await readFile(EMAIL_LOG_FILE, "utf-8");
      log = JSON.parse(existing);
    } catch {
      return Response.json({ error: "No email log found. Send campaign first." }, { status: 400 });
    }

    let followupCount = 0;
    log = log.map((entry) => {
      if (!entry.replied && !entry.bounced && !entry.followupSent) {
        followupCount++;
        return { ...entry, followupSent: true, followupAt: new Date().toISOString() };
      }
      return entry;
    });

    await writeFile(EMAIL_LOG_FILE, JSON.stringify(log, null, 2), "utf-8");

    return Response.json({
      message: "Follow-ups sent (simulation mode)",
      followupsSent: followupCount,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
