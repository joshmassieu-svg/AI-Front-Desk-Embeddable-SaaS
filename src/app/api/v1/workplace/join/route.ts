import { NextRequest, NextResponse } from 'next/server';
import { getInvitationByCode, acceptWorkplaceInvitation } from '@/lib/firestore-service';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Invite code is required' }, { status: 400 });
  }

  try {
    const invitation = await getInvitationByCode(code);
    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 444 });
    }
    return NextResponse.json({ invitation });
  } catch (err: any) {
    console.error('[workplace/join GET] Error:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch invitation' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { inviteCode, userId, userEmail } = await req.json();

    if (!inviteCode || !userId || !userEmail) {
      return NextResponse.json({ error: 'inviteCode, userId, and userEmail are required' }, { status: 400 });
    }

    const result = await acceptWorkplaceInvitation(inviteCode, userId, userEmail);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, workplaceId: result.workplaceId });
  } catch (err: any) {
    console.error('[workplace/join POST] Error:', err);
    return NextResponse.json({ error: err.message || 'Failed to join workplace' }, { status: 500 });
  }
}
