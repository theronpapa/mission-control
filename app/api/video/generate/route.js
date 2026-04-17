export async function POST(request) {
  try {
    const { niche } = await request.json();

    if (!niche) {
      return Response.json({ error: "Missing niche parameter" }, { status: 400 });
    }

    // Simulation mode: return mock video generation status
    return Response.json({
      niche,
      status: "ready",
      videoId: `VID-${Date.now()}`,
      message: `Teaser video for "${niche}" generated (simulation mode)`,
      duration: "30s",
      resolution: "1080p",
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
