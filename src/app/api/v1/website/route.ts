import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const websiteId = searchParams.get('websiteId') || 'site_acme_123';
  const website = db.getWebsite(websiteId);
  return NextResponse.json(website);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id = 'site_acme_123', ...updates } = body;

    const updated = db.updateWebsite(id, updates);
    return NextResponse.json({ success: true, website: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error updating website' }, { status: 500 });
  }
}
