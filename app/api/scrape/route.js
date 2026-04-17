import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data");
const LEADS_FILE = join(DATA_DIR, "leads.csv");

const MOCK_COMPANIES = [
  { company: "TechVision Sdn Bhd", industry: "Technology", email: "info@techvision.my", phone: "+60 3-1234 5678", website: "techvision.my" },
  { company: "Nusantara Foods", industry: "Food & Beverage", email: "contact@nusantarafoods.com", phone: "+60 3-2345 6789", website: "nusantarafoods.com" },
  { company: "AutoParts Malaysia", industry: "Automotive", email: "sales@autoparts.my", phone: "+60 3-3456 7890", website: "autoparts.my" },
  { company: "Batik Boutique KL", industry: "Fashion & Textiles", email: "hello@batikboutique.my", phone: "+60 3-4567 8901", website: "batikboutique.my" },
  { company: "GreenMed Wellness", industry: "Health & Wellness", email: "enquiry@greenmed.my", phone: "+60 3-5678 9012", website: "greenmed.my" },
  { company: "BuildRight Construction", industry: "Construction", email: "projects@buildright.my", phone: "+60 3-6789 0123", website: "buildright.my" },
  { company: "Skynet Digital", industry: "Technology", email: "biz@skynetdigital.my", phone: "+60 3-7890 1234", website: "skynetdigital.my" },
  { company: "Rasa Utama Catering", industry: "Food & Beverage", email: "order@rasautama.my", phone: "+60 3-8901 2345", website: "rasautama.my" },
  { company: "EV Motors MY", industry: "Automotive", email: "info@evmotors.my", phone: "+60 3-9012 3456", website: "evmotors.my" },
  { company: "Silk & Thread", industry: "Fashion & Textiles", email: "design@silkthread.my", phone: "+60 3-0123 4567", website: "silkthread.my" },
  { company: "HerbaCare Malaysia", industry: "Health & Wellness", email: "support@herbacare.my", phone: "+60 3-1111 2222", website: "herbacare.my" },
  { company: "MegaBuild Systems", industry: "Construction", email: "tender@megabuild.my", phone: "+60 3-3333 4444", website: "megabuild.my" },
  { company: "CloudFirst Asia", industry: "Technology", email: "hello@cloudfirst.asia", phone: "+60 3-5555 6666", website: "cloudfirst.asia" },
  { company: "Warung Digital", industry: "Food & Beverage", email: "info@warungdigital.my", phone: "+60 3-7777 8888", website: "warungdigital.my" },
  { company: "Proton Accessories", industry: "Automotive", email: "shop@protonaccs.my", phone: "+60 3-9999 0000", website: "protonaccs.my" },
];

export async function POST() {
  try {
    await mkdir(DATA_DIR, { recursive: true });

    let existingIds = new Set();
    try {
      const existing = await readFile(LEADS_FILE, "utf-8");
      const lines = existing.trim().split("\n").slice(1);
      lines.forEach((line) => {
        const id = line.split(",")[0];
        if (id) existingIds.add(id);
      });
    } catch {
      // File doesn't exist yet
    }

    const now = new Date().toISOString();
    const newLeads = MOCK_COMPANIES.filter((_, i) => !existingIds.has(`LEAD-${String(i + 1).padStart(3, "0")}`));

    if (newLeads.length === 0) {
      return Response.json({ message: "All leads already scraped", count: 0 });
    }

    const header = "id,company,email,phone,industry,website,status,scraped_at";
    let csv = header + "\n";

    MOCK_COMPANIES.forEach((c, i) => {
      const id = `LEAD-${String(i + 1).padStart(3, "0")}`;
      csv += `${id},${c.company},${c.email},${c.phone},${c.industry},${c.website},new,${now}\n`;
    });

    await writeFile(LEADS_FILE, csv, "utf-8");

    return Response.json({
      message: "Scraping complete (simulation mode)",
      count: MOCK_COMPANIES.length,
      file: "data/leads.csv",
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
