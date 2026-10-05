import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { UserProfile } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');

    const admin = createAdminClient();
    const serverClient = createClient();

    // 1. Try to get authenticated user from session cookies first
    let targetId: string | null | undefined = userId;
    let targetEmail: string | null | undefined = email;

    let authUser: any = null;
    if (!targetId && !targetEmail) {
      try {
        const { data: { user } } = await serverClient.auth.getUser();
        if (user) {
          authUser = user;
          targetId = user.id;
          targetEmail = user.email || undefined;
        }
      } catch (authErr) {
        console.warn('Session user fetch notice:', authErr);
      }
    }

    if (!targetId && !targetEmail) {
      return NextResponse.json(
        { error: 'Unauthenticated: No user session found' },
        { status: 401 }
      );
    }

    // 2. Fetch from Supabase public.profiles table
    const client = admin || serverClient;
    let query = client.from('profiles').select('*');
    if (targetId) {
      query = query.eq('id', targetId);
    } else if (targetEmail) {
      query = query.eq('email', targetEmail);
    }

    const { data: profileRow } = await query.maybeSingle();

    if (profileRow) {
      let storeLogo = (profileRow as any).store_logo_url || '';
      if (!storeLogo && targetId && admin) {
        try {
          const { data: uData } = await admin.auth.admin.getUserById(targetId);
          storeLogo = uData?.user?.user_metadata?.store_logo_url || '';
        } catch {}
      }

      const profile: UserProfile = {
        id: profileRow.id,
        email: profileRow.email,
        fullName: profileRow.full_name || profileRow.email?.split('@')[0],
        avatarUrl: profileRow.avatar_url || '',
        role: profileRow.role || 'user',
        merchantStatus: (profileRow.merchant_status as any) || 'NONE',
        merchantAppliedAt: profileRow.merchant_applied_at,
        storeName: profileRow.store_name,
        storeDescription: profileRow.store_description,
        promptPayId: profileRow.promptpay_id,
        storeLogoUrl: storeLogo,
        createdAt: profileRow.created_at,
      };
      return NextResponse.json({ success: true, profile });
    }

    // 3. Fallback: If auth user is valid but profile row not yet inserted, auto-upsert and return
    if (authUser) {
      const defaultName =
        authUser.user_metadata?.full_name ||
        authUser.user_metadata?.name ||
        authUser.email?.split('@')[0] ||
        'User';
      const defaultAvatar =
        authUser.user_metadata?.avatar_url ||
        authUser.user_metadata?.picture ||
        '';

      const fallbackProfile: UserProfile = {
        id: authUser.id,
        email: authUser.email || '',
        fullName: defaultName,
        avatarUrl: defaultAvatar,
        role: 'user',
        merchantStatus: 'NONE',
        createdAt: new Date().toISOString(),
      };

      try {
        await client.from('profiles').upsert(
          {
            id: authUser.id,
            email: authUser.email,
            full_name: defaultName,
            avatar_url: defaultAvatar,
            role: 'user',
            merchant_status: 'NONE',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );
      } catch {}

      return NextResponse.json({ success: true, profile: fallbackProfile });
    }

    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  } catch (error) {
    console.error('Profile API GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      email,
      fullName,
      avatarUrl,
      role,
      merchantStatus,
      merchantAppliedAt,
      storeName,
      storeDescription,
      promptPayId,
      storeLogoUrl,
    } = body;

    const serverClient = createClient();
    const admin = createAdminClient();

    let targetId: string | undefined = id;
    let targetEmail: string | undefined = email;

    // Check session
    try {
      const { data: { user } } = await serverClient.auth.getUser();
      if (user) {
        targetId = user.id;
        targetEmail = user.email || targetEmail;
      }
    } catch {}

    if (!targetId) {
      return NextResponse.json(
        { error: 'Missing user identification for update' },
        { status: 400 }
      );
    }

    // Update user_metadata if storeLogoUrl or avatarUrl provided
    if (admin && targetId && (storeLogoUrl !== undefined || avatarUrl !== undefined)) {
      try {
        const { data: uData } = await admin.auth.admin.getUserById(targetId);
        const prevMeta = uData?.user?.user_metadata || {};
        const newMeta: any = { ...prevMeta };
        if (storeLogoUrl !== undefined) newMeta.store_logo_url = storeLogoUrl;
        if (avatarUrl !== undefined) newMeta.avatar_url = avatarUrl;
        await admin.auth.admin.updateUserById(targetId, { user_metadata: newMeta });
      } catch (metaErr) {
        console.warn('Update user metadata notice:', metaErr);
      }
    }

    const updates: any = {
      updated_at: new Date().toISOString(),
    };
    if (fullName !== undefined) updates.full_name = fullName;
    if (avatarUrl !== undefined) updates.avatar_url = avatarUrl;
    if (role !== undefined) updates.role = role;
    if (merchantStatus !== undefined) updates.merchant_status = merchantStatus;
    if (merchantAppliedAt !== undefined) updates.merchant_applied_at = merchantAppliedAt;
    if (storeName !== undefined) updates.store_name = storeName;
    if (storeDescription !== undefined) updates.store_description = storeDescription;
    if (promptPayId !== undefined) updates.promptpay_id = promptPayId;
    if (targetEmail) updates.email = targetEmail;

    const client = admin || serverClient;

    // First try update on existing profile row
    let { data: updateData, error: updateErr } = await client
      .from('profiles')
      .update(updates)
      .eq('id', targetId)
      .select()
      .maybeSingle();

    // If row doesn't exist yet, fetch email from auth and upsert
    if (!updateData) {
      let userEmail = targetEmail;
      if (!userEmail && admin) {
        try {
          const { data: uData } = await admin.auth.admin.getUserById(targetId);
          userEmail = uData?.user?.email;
        } catch {}
      }

      const { data: insertData, error: insertErr } = await client
        .from('profiles')
        .upsert({ id: targetId, email: userEmail || 'user@example.com', ...updates })
        .select()
        .single();

      updateData = insertData;
      updateErr = insertErr;
    }

    if (updateErr) {
      console.error('Supabase profile update error:', updateErr);
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    // Automatically synchronize all products belonging to this merchant with their store name & PromptPay
    if (targetId && (storeName !== undefined || promptPayId !== undefined)) {
      try {
        const prodSync: any = {};
        if (storeName !== undefined) prodSync.merchant_name = storeName;
        if (promptPayId !== undefined) prodSync.merchant_promptpay = promptPayId;
        await client.from('products').update(prodSync).eq('merchant_id', targetId);
      } catch (syncErr) {
        console.warn('Sync products merchant promptpay error:', syncErr);
      }
    }

    const updatedProfile: UserProfile = {
      id: updateData?.id || targetId,
      email: updateData?.email || targetEmail || '',
      fullName: updateData?.full_name || fullName || '',
      avatarUrl: updateData?.avatar_url || avatarUrl || '',
      role: updateData?.role || role || 'user',
      merchantStatus: (updateData?.merchant_status as any) || merchantStatus || 'NONE',
      merchantAppliedAt: updateData?.merchant_applied_at || merchantAppliedAt,
      storeName: updateData?.store_name || storeName,
      storeDescription: updateData?.store_description || storeDescription,
      promptPayId: updateData?.promptpay_id || promptPayId,
      storeLogoUrl: storeLogoUrl !== undefined ? storeLogoUrl : (updateData?.store_logo_url || ''),
      createdAt: updateData?.created_at || new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'อัปเดตข้อมูลโปรไฟล์เรียบร้อยแล้ว',
      profile: updatedProfile,
    });
  } catch (error) {
    console.error('Profile API PUT error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
