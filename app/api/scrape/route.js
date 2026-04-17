import { NextResponse } from 'next/server';

export async function POST(req) {
  const body = await req.json();
  const MATON_API_KEY = process.env.MATON_API_KEY;

  // Apollo organization search by industry/keyword
  if (body.action === 'apollo_search') {
    try {
      const searchBody = {
        q_organization_name: body.query || '',
        page: body.page || 1,
        per_page: body.per_page || 25,
      };
      // Add industry keyword tags if provided
      if (body.industry) {
        searchBody.q_organization_keyword_tags = [body.industry];
      }
      if (body.employees) {
        searchBody.organization_num_employees_ranges = [body.employees];
      }
      if (body.location) {
        searchBody.organization_locations = [body.location];
      }

      const res = await fetch('https://gateway.maton.ai/apollo/v1/organizations/search', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${MATON_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(searchBody),
      });

      const data = await res.json();
      if (data.error) return NextResponse.json({ error: data.error }, { status: 400 });

      const orgs = (data.organizations || []).map(o => ({
        id: o.id,
        name: o.name,
        domain: o.primary_domain,
        industry: o.industry,
        employees: o.estimated_num_employees,
        linkedin: o.linkedin_url,
        location: o.raw_address || o.city || '',
        logo: o.logo_url,
        description: o.short_description,
        keywords: (o.keywords || []).slice(0, 5),
        phone: o.primary_phone?.number || '',
        founded: o.founded_year,
      }));

      return NextResponse.json({
        organizations: orgs,
        total: data.pagination?.total_entries || 0,
        page: data.pagination?.page || 1,
        totalPages: data.pagination?.total_pages || 0,
      });
    } catch (err) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  // Apollo organization enrich (get full details from domain)
  if (body.action === 'apollo_enrich') {
    try {
      const res = await fetch('https://gateway.maton.ai/apollo/v1/organizations/enrich', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${MATON_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: body.domain }),
      });
      const data = await res.json();
      if (data.error) return NextResponse.json({ error: data.error }, { status: 400 });

      const o = data.organization || {};
      return NextResponse.json({
        name: o.name,
        domain: o.primary_domain,
        industry: o.industry,
        employees: o.estimated_num_employees,
        linkedin: o.linkedin_url,
        website: o.website_url,
        description: o.short_description,
        phone: o.primary_phone?.number,
        location: o.raw_address,
        founded: o.founded_year,
        keywords: (o.keywords || []).slice(0, 10),
        techStack: (o.current_technologies || []).slice(0, 10).map(t => t.name || t),
      });
    } catch (err) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  // LinkedIn scrape (existing)
  if (body.url && body.url.includes('linkedin.com')) {
    try {
      const searchQuery = body.url.replace('https://www.linkedin.com/in/', '').replace('https://linkedin.com/in/', '').replace(/\//g, ' ');
      const searchRes = await fetch(`https://api.search.brave.com/res/v1/web/search?q=linkedin+${encodeURIComponent(searchQuery)}`, {
        headers: { 'Accept': 'application/json', 'Accept-Encoding': 'gzip', 'X-Subscription-Token': process.env.BRAVE_API_KEY || '' },
      });
      let profileData = { linkedinUrl: body.url };
      if (searchRes.ok) {
        const data = await searchRes.json();
        const firstResult = data.web?.results?.[0];
        if (firstResult) {
          const title = firstResult.title || '';
          const parts = title.split(' - ');
          const nameParts = (parts[0]?.trim() || '').split(' ');
          profileData.firstName = nameParts[0] || '';
          profileData.lastName = nameParts.slice(1).join(' ') || '';
          profileData.title = parts[1]?.trim() || '';
          profileData.company = (parts[2]?.trim() || '').replace(' | LinkedIn', '');
        }
      }
      return NextResponse.json(profileData);
    } catch (err) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
}
