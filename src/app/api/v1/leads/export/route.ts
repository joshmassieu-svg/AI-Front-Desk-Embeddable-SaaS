import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const websiteId = searchParams.get('websiteId') || 'site_acme_123';

  const leads = db.getLeads(websiteId);

  const header = 'ID,Name,Email,Phone,Company,Source URL,Created At\n';
  const rows = leads.map(l => 
    `"${l.id}","${l.name}","${l.email}","${l.phone || ''}","${l.company || ''}","${l.sourceUrl || ''}","${l.createdAt}"`
  ).join('\n');

  const csvContent = header + rows;

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="leads-export-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
