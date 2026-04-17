import { NextResponse } from 'next/server';

export async function POST(req) {
  const body = await req.json();
  const { url } = body;

  if (!url || !url.includes('linkedin.com')) {
    return NextResponse.json({ error: 'Please provide a valid LinkedIn URL' }, { status: 400 });
  }

  try {
    const MATON_API_KEY = process.env.MATON_API_KEY;

    // Try scraping via Brave search for public info
    const searchQuery = url.replace('https://www.linkedin.com/in/', '').replace('https://linkedin.com/in/', '').replace(/\//g, ' ');

    const searchRes = await fetch(`https://api.search.brave.com/res/v1/web/search?q=linkedin+${encodeURIComponent(searchQuery)}`, {
      headers: { 'Accept': 'application/json', 'Accept-Encoding': 'gzip', 'X-Subscription-Token': process.env.BRAVE_API_KEY || '' },
    });

    let profileData = { linkedinUrl: url };

    if (searchRes.ok) {
      const data = await searchRes.json();
      const firstResult = data.web?.results?.[0];
      if (firstResult) {
        const title = firstResult.title || '';
        const parts = title.split(' - ');
        const namePart = parts[0]?.trim() || '';
        const titlePart = parts[1]?.trim() || '';
        const companyPart = parts[2]?.trim() || '';

        const nameParts = namePart.split(' ');
        profileData.firstName = nameParts[0] || '';
        profileData.lastName = nameParts.slice(1).join(' ') || '';
        profileData.title = titlePart;
        profileData.company = companyPart?.replace(' | LinkedIn', '') || '';
        profileData.description = firstResult.description || '';
      }
    }

    return NextResponse.json(profileData);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
