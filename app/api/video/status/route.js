export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get("id");

  return Response.json({
    videoId: videoId || "unknown",
    status: "ready",
    progress: 100,
  });
}
