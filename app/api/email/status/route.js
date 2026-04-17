import { readFile } from "fs/promises";
import { join } from "path";

const EMAIL_LOG_FILE = join(process.cwd(), "data", "email_log.json");

export async function GET() {
  try {
    const data = await readFile(EMAIL_LOG_FILE, "utf-8");
    const log = JSON.parse(data);

    return Response.json({
      sent: log.length,
      opened: log.filter((e) => e.opened).length,
      replied: log.filter((e) => e.replied).length,
      bounced: log.filter((e) => e.bounced).length,
      followups: log.filter((e) => e.followupSent).length,
    });
  } catch {
    return Response.json({ sent: 0, opened: 0, replied: 0, bounced: 0, followups: 0 });
  }
}
