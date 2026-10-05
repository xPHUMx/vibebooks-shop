import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const admin = createAdminClient();
    const serverClient = createClient();

    // Verify admin access
    const demoRole = req.headers.get('x-demo-role');
    const { data: { user } } = await serverClient.auth.getUser();

    const client = admin || serverClient;

    if (user?.id) {
      const { data: prof } = await client
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (prof?.role !== 'admin' && demoRole !== 'admin') {
        return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
      }
    }

    // Fetch pending merchant applications (or all applications)
    const { data: applications, error } = await client
      .from('profiles')
      .select('id, email, full_name, avatar_url, role, merchant_status, merchant_applied_at, store_name, store_description, promptpay_id, created_at')
      .neq('merchant_status', 'NONE')
      .order('merchant_applied_at', { ascending: false });

    if (error) {
      console.error('Error fetching merchant applications:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      applications: applications || [],
    });
  } catch (error) {
    console.error('Admin merchants GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = createAdminClient();
    const serverClient = createClient();
    const body = await req.json();
    const { userId, action } = body; // action: 'approve' | 'reject'

    if (!userId || !action) {
      return NextResponse.json({ error: 'Missing userId or action' }, { status: 400 });
    }

    const client = admin || serverClient;

    if (action === 'approve') {
      const { data, error } = await client
        .from('profiles')
        .update({
          role: 'merchant',
          merchant_status: 'APPROVED',
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .maybeSingle();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'อนุมัติคำขอเปิดร้านค้าสำเร็จ ผู้ใช้งานได้รับบทบาทพ่อค้าแล้ว',
        profile: data,
      });
    } else if (action === 'reject') {
      const { data, error } = await client
        .from('profiles')
        .update({
          role: 'user',
          merchant_status: 'REJECTED',
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .maybeSingle();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'ปฏิเสธคำขอเปิดร้านค้าเรียบร้อยแล้ว',
        profile: data,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Admin merchants POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
