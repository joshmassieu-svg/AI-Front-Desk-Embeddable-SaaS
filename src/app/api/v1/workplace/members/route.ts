import { NextRequest, NextResponse } from 'next/server';
import { getWorkplaceMembers, removeWorkplaceMember } from '@/lib/firestore-service';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const workplaceId = searchParams.get('workplaceId');

  if (!workplaceId) {
    return NextResponse.json({ error: 'workplaceId is required' }, { status: 400 });
  }

  try {
    const members = await getWorkplaceMembers(workplaceId);
    return NextResponse.json({ members });
  } catch (err: any) {
    console.error('[workplace/members GET] Error:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch members' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { workplaceId, targetUserId } = await req.json();

    if (!workplaceId || !targetUserId) {
      return NextResponse.json({ error: 'workplaceId and targetUserId are required' }, { status: 400 });
    }

    const success = await removeWorkplaceMember(workplaceId, targetUserId);
    if (!success) {
      return NextResponse.json({ error: 'Failed to remove member' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[workplace/members DELETE] Error:', err);
    return NextResponse.json({ error: err.message || 'Error deleting member' }, { status: 500 });
  }
}
