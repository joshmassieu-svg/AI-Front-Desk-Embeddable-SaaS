import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const websiteId = searchParams.get('websiteId') || 'site_acme_123';

  const leads = await db.getLeadsAsync(websiteId);
  return NextResponse.json({ leads });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { websiteId = 'site_acme_123', conversationId, name, email, phone, company, sourceUrl } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const lead = await db.addLeadAsync({
      websiteId,
      conversationId,
      name: name || 'Anonymous Visitor',
      email,
      phone,
      company,
      sourceUrl,
    });

    return NextResponse.json({ success: true, lead });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error saving lead' }, { status: 500 });
  }
}
