import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const siteId = searchParams.get('siteId') || searchParams.get('websiteId') || 'site_acme_123';

  const website = db.getWebsite(siteId);
  if (!website) {
    return NextResponse.json({ error: 'Website not found' }, { status: 404 });
  }

  return NextResponse.json(website);
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
