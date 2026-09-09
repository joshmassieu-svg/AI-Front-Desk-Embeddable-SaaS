import { NextRequest, NextResponse } from 'next/server';
import {
  getWorkplaceInvitations,
  createWorkplaceInvitation,
  revokeWorkplaceInvitation,
} from '@/lib/firestore-service';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const workplaceId = searchParams.get('workplaceId');

  if (!workplaceId) {
    return NextResponse.json({ error: 'workplaceId is required' }, { status: 400 });
  }

  try {
    const invitations = await getWorkplaceInvitations(workplaceId);
    return NextResponse.json({ invitations });
  } catch (err: any) {
    console.error('[workplace/invitations GET] Error:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch invitations' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { workplaceId, workplaceName, email, role, createdBy } = await req.json();

    if (!workplaceId || !email || !role) {
      return NextResponse.json({ error: 'workplaceId, email, and role are required' }, { status: 400 });
    }

    const invitation = await createWorkplaceInvitation(
      workplaceId,
      workplaceName || 'My Workplace',
      email,
      role,
      createdBy || 'system'
    );

    return NextResponse.json({ invitation });
  } catch (err: any) {
    console.error('[workplace/invitations POST] Error:', err);
    return NextResponse.json({ error: err.message || 'Failed to create invitation' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { inviteId } = await req.json();

    if (!inviteId) {
      return NextResponse.json({ error: 'inviteId is required' }, { status: 400 });
    }

    const success = await revokeWorkplaceInvitation(inviteId);
    return NextResponse.json({ success });
  } catch (err: any) {
    console.error('[workplace/invitations DELETE] Error:', err);
    return NextResponse.json({ error: err.message || 'Failed to revoke invitation' }, { status: 500 });
  }
}
