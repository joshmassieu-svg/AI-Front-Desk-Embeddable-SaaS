import { NextRequest, NextResponse } from 'next/server';
import { getUserWorkplacesFromFirestore, switchUserWorkplaceInFirestore } from '@/lib/firestore-service';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const email = searchParams.get('email') || '';

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  try {
    const workplaces = await getUserWorkplacesFromFirestore(userId, email);
    return NextResponse.json({ workplaces });
  } catch (err: any) {
    console.error('[workplace/user-workplaces GET] Error:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch user workplaces' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, workplaceId } = await req.json();

    if (!userId || !workplaceId) {
      return NextResponse.json({ error: 'userId and workplaceId are required' }, { status: 400 });
    }

    const success = await switchUserWorkplaceInFirestore(userId, workplaceId);
    if (!success) {
      return NextResponse.json({ error: 'Failed to switch workplace' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[workplace/user-workplaces POST] Error:', err);
    return NextResponse.json({ error: err.message || 'Error switching workplace' }, { status: 500 });
  }
}
