import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const websiteId = searchParams.get('websiteId') || searchParams.get('id');
  if (!websiteId) {
    return NextResponse.json({ error: 'websiteId parameters required' }, { status: 400 });
  }

  const website = await db.getWebsiteAsync(websiteId);
  return NextResponse.json(website);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Website ID required' }, { status: 400 });
    }

    const updated = await db.updateWebsiteAsync(id, updates);
    return NextResponse.json({ success: true, website: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error updating website' }, { status: 500 });
  }
}
