import { readFile } from "fs/promises";
import { join } from "path";

const LEADS_FILE = join(process.cwd(), "data", "leads.csv");

export async function GET() {
  try {
    const csv = await readFile(LEADS_FILE, "utf-8");
    const lines = csv.trim().split("\n");
    const headers = lines[0].split(",");
    const leads = lines.slice(1).map((line) => {
      const values = line.split(",");
      const obj = {};
      headers.forEach((h, i) => {
        obj[h.trim()] = values[i]?.trim() || "";
      });
      return obj;
    });
    return Response.json({ leads });
  } catch {
    return Response.json({ leads: [] });
  }
}
