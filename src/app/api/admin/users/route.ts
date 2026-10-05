import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const admin = createAdminClient();
    const serverClient = createClient();
    const client = admin || serverClient;

    // Verify admin
    const demoRole = req.headers.get('x-demo-role');
    const { data: { user } } = await serverClient.auth.getUser();

    if (!user && demoRole !== 'admin') {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบก่อน' }, { status: 401 });
    }

    if (user?.id) {
      const { data: adminProf } = await client
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (adminProf?.role !== 'admin' && demoRole !== 'admin') {
        return NextResponse.json({ error: 'Forbidden: ต้องใช้สิทธิ์ผู้ดูแลระบบ (Admin)' }, { status: 403 });
      }
    }

    // Fetch all user profiles
    const { data: profiles, error } = await client
      .from('profiles')
      .select('id, email, full_name, avatar_url, role, merchant_status, merchant_applied_at, store_name, store_description, promptpay_id, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admin users:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      users: profiles || [],
    });
  } catch (error) {
    console.error('Admin users GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = createAdminClient();
    const serverClient = createClient();
    const client = admin || serverClient;

    // Verify admin
    const demoRole = req.headers.get('x-demo-role');
    const { data: { user } } = await serverClient.auth.getUser();

    if (!user && demoRole !== 'admin') {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบก่อน' }, { status: 401 });
    }

    if (user?.id) {
      const { data: adminProf } = await client
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (adminProf?.role !== 'admin' && demoRole !== 'admin') {
        return NextResponse.json({ error: 'Forbidden: ต้องใช้สิทธิ์ผู้ดูแลระบบ (Admin)' }, { status: 403 });
      }
    }

    const body = await req.json();
    const { userId, role, merchantStatus, storeName, storeDescription, promptPayId } = body;

    if (!userId || !role) {
      return NextResponse.json({ error: 'Missing userId or role' }, { status: 400 });
    }

    if (!['user', 'merchant', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role. Must be user, merchant, or admin' }, { status: 400 });
    }

    const updates: any = {
      role,
      updated_at: new Date().toISOString(),
    };

    if (merchantStatus !== undefined) updates.merchant_status = merchantStatus;
    if (storeName !== undefined) updates.store_name = storeName;
    if (storeDescription !== undefined) updates.store_description = storeDescription;
    if (promptPayId !== undefined) updates.promptpay_id = promptPayId;

    // If changing role to merchant and status is still PENDING or NONE, approve it
    if (role === 'merchant' && (!merchantStatus || merchantStatus === 'NONE' || merchantStatus === 'PENDING')) {
      updates.merchant_status = 'APPROVED';
    }

    const { data: updated, error } = await client
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Admin update user error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Synchronize all products belonging to this merchant
    if (storeName !== undefined || promptPayId !== undefined) {
      try {
        const prodUpdates: any = {};
        if (storeName !== undefined) prodUpdates.merchant_name = storeName;
        if (promptPayId !== undefined) prodUpdates.merchant_promptpay = promptPayId;
        await client.from('products').update(prodUpdates).eq('merchant_id', userId);
      } catch (pErr) {
        console.warn('Sync merchant products notice:', pErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `อัปเดตบทบาทของ ${updated.email || updated.full_name} เป็น [${role.toUpperCase()}] สำเร็จ`,
      user: updated,
    });
  } catch (error) {
    console.error('Admin users PUT error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
