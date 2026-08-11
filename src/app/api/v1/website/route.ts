import { NextRequest, NextResponse } from 'next/server';
import { db, TransientFirestoreError } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const websiteId = searchParams.get('websiteId') || searchParams.get('id');
  if (!websiteId) {
    return NextResponse.json({ error: 'websiteId parameters required' }, { status: 400 });
  }

  try {
    const website = await db.getWebsiteAsync(websiteId);
    if (!website) {
      return NextResponse.json({ error: 'Website not found' }, { status: 404 });
    }
    return NextResponse.json(website);
  } catch (err) {
    if (err instanceof TransientFirestoreError) {
      return NextResponse.json(
        { error: 'Temporarily unable to load website, please retry' },
        { status: 503, headers: { 'Retry-After': '1' } }
      );
    }
    throw err;
  }
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
    if (err instanceof TransientFirestoreError) {
      return NextResponse.json(
        { error: 'Temporarily unable to save, please retry' },
        { status: 503, headers: { 'Retry-After': '1' } }
      );
    }
    return NextResponse.json({ error: err.message || 'Error updating website' }, { status: 500 });
  }
}
