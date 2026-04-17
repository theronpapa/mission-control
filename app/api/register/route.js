import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import QRCode from "qrcode";

const DATA_DIR = join(process.cwd(), "data");
const REG_FILE = join(DATA_DIR, "registrations.json");

export async function GET() {
  try {
    const data = await readFile(REG_FILE, "utf-8");
    return Response.json({ registrations: JSON.parse(data) });
  } catch {
    return Response.json({ registrations: [] });
  }
}

export async function POST(request) {
  try {
    await mkdir(DATA_DIR, { recursive: true });

    const body = await request.json();
    const { company, email, phone, booth } = body;

    if (!company || !email) {
      return Response.json({ error: "Company and email are required" }, { status: 400 });
    }

    let registrations = [];
    try {
      const existing = await readFile(REG_FILE, "utf-8");
      registrations = JSON.parse(existing);
    } catch {
      // No existing file
    }

    const id = `REG-${String(registrations.length + 1).padStart(3, "0")}`;
    const regData = `Exhibition Registration\nID: ${id}\nCompany: ${company}\nEmail: ${email}\nBooth: ${booth || "TBD"}`;

    const qrCode = await QRCode.toDataURL(regData, {
      width: 256,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    });

    const registration = {
      id,
      company,
      email,
      phone: phone || "",
      booth: booth || "TBD",
      qrCode,
      registeredAt: new Date().toISOString(),
    };

    registrations.push(registration);
    await writeFile(REG_FILE, JSON.stringify(registrations, null, 2), "utf-8");

    return Response.json({
      message: "Registration successful",
      id,
      qrCode,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
