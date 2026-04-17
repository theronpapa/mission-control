import QRCode from "qrcode";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return Response.json({ error: "Missing id parameter" }, { status: 400 });
  }

  try {
    const qrDataURL = await QRCode.toDataURL(`Exhibition Pass: ${id}`, {
      width: 256,
      margin: 2,
    });
    return Response.json({ qrCode: qrDataURL });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
