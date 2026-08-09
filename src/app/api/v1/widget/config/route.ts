import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { TransientFirestoreError } from '@/lib/db';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Website-Id',
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const siteId = searchParams.get('siteId') || searchParams.get('websiteId');

  if (!siteId) {
    return NextResponse.json({ error: 'siteId query parameter is required' }, { status: 400, headers: corsHeaders });
  }

  let website;
  try {
    website = await db.getWebsiteAsync(siteId);
  } catch (err) {
    if (err instanceof TransientFirestoreError) {
      // We couldn't confirm the site exists or not — do NOT report 404 for
      // this. A 404 here gets cached/trusted by callers; a 503 correctly
      // signals "try again" instead of looking like a permanently missing site.
      return NextResponse.json(
        { error: 'Temporarily unable to load configuration, please retry' },
        { status: 503, headers: { ...corsHeaders, 'Retry-After': '1' } }
      );
    }
    throw err;
  }

  if (!website) {
    return NextResponse.json({ error: 'Website not found' }, { status: 404, headers: corsHeaders });
  }

  return NextResponse.json(website, { headers: corsHeaders });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}
