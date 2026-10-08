import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { DIGITAL_PRODUCTS, getCategoryName } from '@/lib/productsData';
import { DigitalProduct } from '@/types';

export const dynamic = 'force-dynamic';

function mapDbProductToDigitalProduct(row: any): DigitalProduct {
  let cleanDesc = row.description || '';
  let previewImages: string[] = Array.isArray(row.preview_images) ? row.preview_images : [];

  if (previewImages.length === 0 && cleanDesc.includes('<!-- SAMPLES:')) {
    const sampleMatch = cleanDesc.match(/<!-- SAMPLES:\s*(\[[\s\S]*?\])\s*-->/);
    if (sampleMatch) {
      try {
        previewImages = JSON.parse(sampleMatch[1]);
        cleanDesc = cleanDesc.replace(sampleMatch[0], '').trim();
      } catch {}
    }
  }

  const cat = row.category_id || row.category || 'ebook';

  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle || '',
    category: cat,
    categoryNameTh: row.category_name_th || getCategoryName(cat),
    price: Number(row.price),
    originalPrice: Number(row.original_price || row.price * 1.5),
    rating: Number(row.rating || 5.0),
    ratingCount: Number(row.rating_count || 10),
    description: cleanDesc,
    previewImages: previewImages,
    highlights: Array.isArray(row.highlights) ? row.highlights : [],
    features: Array.isArray(row.features) ? row.features : [],
    specs: typeof row.specs === 'object' && row.specs !== null ? row.specs : {},
    fileName: row.file_name || 'asset.zip',
    fileSize: row.file_size || '15 MB',
    fileFormat: row.file_format || 'Digital Archive',
    coverImage: row.cover_image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    curator: row.curator || 'นายเกียรติภูมิ หารศรีนาถ',
    badge: row.badge,
    isFeatured: Boolean(row.is_featured || row.featured),
    merchantId: row.merchant_id,
    merchantName: row.merchant_name || 'Book Sangdai Official',
    merchantPromptPay: row.merchant_promptpay,
  };
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const admin = createAdminClient();
    const serverClient = createClient();
    const client = admin || serverClient;

    // 1. Try fetching from Supabase DB
    const { data: dbProduct } = await client
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (dbProduct) {
      // If merchant_id exists, fetch merchant store details
      let merchantProfile = null;
      if (dbProduct.merchant_id) {
        const { data: mProf } = await client
          .from('profiles')
          .select('id, full_name, avatar_url, store_name, store_description, promptpay_id')
          .eq('id', dbProduct.merchant_id)
          .maybeSingle();
        merchantProfile = mProf;
      }

      return NextResponse.json({
        success: true,
        product: mapDbProductToDigitalProduct(dbProduct),
        merchant: merchantProfile,
      });
    }

    // 2. Fallback to initial products catalog
    const local = DIGITAL_PRODUCTS.find((p) => p.id === id);
    if (local) {
      return NextResponse.json({
        success: true,
        product: local,
        merchant: {
          store_name: local.merchantName || 'Book Sangdai Official',
          full_name: local.curator,
        },
      });
    }

    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  } catch (error) {
    console.error('Product GET by id error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = decodeURIComponent(params.id);
    const admin = createAdminClient();
    const serverClient = createClient();
    const client = admin || serverClient;

    // 1. Verify user authentication
    const demoRole = req.headers.get('x-demo-role');
    const authHeader = req.headers.get('authorization');
    const bearerToken = authHeader?.replace(/^Bearer\s+/i, '')?.trim() || null;

    let user: any = null;
    if (bearerToken) {
      if (admin) {
        try {
          const { data: tokenUser } = await admin.auth.getUser(bearerToken);
          if (tokenUser?.user) user = tokenUser.user;
        } catch (e) {}
      }
      if (!user) {
        try {
          const { data: tokenUser } = await serverClient.auth.getUser(bearerToken);
          if (tokenUser?.user) user = tokenUser.user;
        } catch (e) {}
      }
    }
    if (!user) {
      try {
        const { data: cookieUser } = await serverClient.auth.getUser();
        if (cookieUser?.user) user = cookieUser.user;
      } catch (e) {}
    }

    if (!user && demoRole !== 'admin' && demoRole !== 'merchant') {
      return NextResponse.json(
        { error: 'กรุณาเข้าสู่ระบบก่อนดำเนินการแก้ไขสินค้า' },
        { status: 401 }
      );
    }

    // 2. Fetch the target product
    let product: any = null;
    const { data: dbProduct, error: fetchErr } = await client
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (dbProduct) {
      product = dbProduct;
    } else {
      const local = DIGITAL_PRODUCTS.find((p) => p.id === id);
      if (local) {
        const initialRow = {
          id: local.id,
          title: local.title,
          subtitle: local.subtitle || '',
          category_id: local.category || 'ebook',
          price: local.price,
          original_price: local.originalPrice,
          description: local.description,
          file_name: local.fileName,
          file_size: local.fileSize,
          file_format: local.fileFormat,
          cover_image: local.coverImage,
          curator: local.curator,
          badge: local.badge,
          featured: local.isFeatured,
          merchant_name: local.merchantName,
          merchant_promptpay: local.merchantPromptPay,
          merchant_id: user?.id || null,
        };
        const { data: inserted } = await client.from('products').insert(initialRow).select().maybeSingle();
        product = inserted || initialRow;
      }
    }

    if (!product) {
      return NextResponse.json({ error: 'ไม่พบสินค้านี้ในระบบ' }, { status: 404 });
    }

    // 3. Verify permissions: Merchant can only edit their own product (or Admin)
    let isAdmin = demoRole === 'admin';
    let isOwner = demoRole === 'merchant';
    if (user?.id) {
      const { data: userProfile } = await client
        .from('profiles')
        .select('role, store_name, full_name')
        .eq('id', user.id)
        .maybeSingle();

      if (userProfile?.role === 'admin' || user.user_metadata?.role === 'admin') isAdmin = true;
      if (product.merchant_id === user.id) isOwner = true;
      if (
        userProfile?.store_name &&
        product.merchant_name &&
        userProfile.store_name.trim().toLowerCase() === product.merchant_name.trim().toLowerCase()
      ) {
        isOwner = true;
      }
      if (
        userProfile?.full_name &&
        product.curator &&
        userProfile.full_name.trim().toLowerCase() === product.curator.trim().toLowerCase()
      ) {
        isOwner = true;
      }
      if (
        (userProfile?.role === 'merchant' || user.user_metadata?.role === 'merchant') &&
        (!product.merchant_id || product.merchant_id === user.id)
      ) {
        isOwner = true;
      }
    }

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: 'คุณไม่มีสิทธิ์แก้ไขสินค้านี้ เนื่องจากไม่ใช่เจ้าของร้านค้าหรือผู้ดูแลระบบ' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      title,
      subtitle,
      category,
      price,
      originalPrice,
      description,
      fileName,
      fileSize,
      fileFormat,
      coverImage,
      badge,
      isFeatured,
      curator,
      merchantName,
      merchantPromptPay,
      previewImages,
    } = body;

    const updates: any = {};
    if (title !== undefined) updates.title = title.trim();
    if (subtitle !== undefined) updates.subtitle = (subtitle || '').trim();
    if (category !== undefined) updates.category_id = category;
    if (price !== undefined) updates.price = Number(price);
    if (originalPrice !== undefined) updates.original_price = Number(originalPrice);

    let finalDesc = description !== undefined ? description : product.description;
    if (previewImages !== undefined) {
      finalDesc = (finalDesc || '').replace(/<!-- SAMPLES:\s*\[[\s\S]*?\]\s*-->/, '').trim();
      if (Array.isArray(previewImages) && previewImages.length > 0) {
        finalDesc += `\n\n<!-- SAMPLES: ${JSON.stringify(previewImages)} -->`;
      }
      updates.description = finalDesc;
    } else if (description !== undefined) {
      updates.description = description;
    }

    if (fileName !== undefined) updates.file_name = fileName;
    if (fileSize !== undefined) updates.file_size = fileSize;
    if (fileFormat !== undefined) updates.file_format = fileFormat;
    if (coverImage !== undefined) updates.cover_image = coverImage;
    if (badge !== undefined) updates.badge = badge;
    if (isFeatured !== undefined) updates.featured = Boolean(isFeatured);
    if (curator !== undefined) updates.curator = curator;
    if (merchantName !== undefined) updates.merchant_name = merchantName;
    if (merchantPromptPay !== undefined) updates.merchant_promptpay = merchantPromptPay;
    if (!product.merchant_id && user?.id) updates.merchant_id = user.id;

    const { data: updated, error: updateErr } = await client
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateErr) {
      console.error('Update product error:', updateErr);
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'อัปเดตข้อมูลผลิตภัณฑ์เรียบร้อยแล้ว',
      product: mapDbProductToDigitalProduct(updated),
    });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const admin = createAdminClient();
    const serverClient = createClient();
    const client = admin || serverClient;

    // 1. Verify user authentication
    const demoRole = req.headers.get('x-demo-role');
    const authHeader = req.headers.get('authorization');
    const bearerToken = authHeader?.replace(/^Bearer\s+/i, '')?.trim() || null;

    let user: any = null;
    if (bearerToken) {
      if (admin) {
        try {
          const { data: tokenUser } = await admin.auth.getUser(bearerToken);
          if (tokenUser?.user) user = tokenUser.user;
        } catch (e) {
          console.warn('Bearer auth check error:', e);
        }
      }
      if (!user) {
        try {
          const { data: tokenUser } = await serverClient.auth.getUser(bearerToken);
          if (tokenUser?.user) user = tokenUser.user;
        } catch (e) {}
      }
    }
    if (!user) {
      try {
        const { data: cookieUser } = await serverClient.auth.getUser();
        if (cookieUser?.user) user = cookieUser.user;
      } catch (e) {
        console.warn('Cookie auth check error:', e);
      }
    }

    if (!user && demoRole !== 'admin') {
      return NextResponse.json(
        { error: 'กรุณาเข้าสู่ระบบก่อนดำเนินการลบสินค้า' },
        { status: 401 }
      );
    }

    // 2. Fetch the target product
    const { data: product, error: fetchErr } = await client
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!product) {
      // If it doesn't exist in Supabase DB (e.g. mock item or already deleted),
      // allow successful response so frontend can cleanly remove it from view
      return NextResponse.json({
        success: true,
        message: 'ลบผลิตภัณฑ์ออกจากคลังเรียบร้อยแล้ว',
      });
    }

    // 3. Verify permissions: Merchant can only delete their own product (or Admin)
    let isAdmin = demoRole === 'admin';
    let isOwner = false;
    if (user?.id) {
      const { data: userProfile } = await client
        .from('profiles')
        .select('role, store_name')
        .eq('id', user.id)
        .maybeSingle();

      if (userProfile?.role === 'admin') isAdmin = true;
      if (product.merchant_id === user.id) isOwner = true;
      if (
        userProfile?.store_name &&
        product.merchant_name &&
        userProfile.store_name.trim().toLowerCase() === product.merchant_name.trim().toLowerCase()
      ) {
        isOwner = true;
      }
    }

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: 'คุณไม่มีสิทธิ์ลบสินค้านี้ เนื่องจากไม่ใช่เจ้าของร้านค้าหรือผู้ดูแลระบบ' },
        { status: 403 }
      );
    }

    // 4. If merchant (non-admin), check for pending orders
    if (!isAdmin) {
      const { data: linkedItems } = await client
        .from('order_items')
        .select('order_id')
        .eq('product_id', id);

      let hasPendingOrders = false;
      if (linkedItems && linkedItems.length > 0) {
        const orderIds = Array.from(new Set(linkedItems.map((item) => item.order_id)));
        const { data: pendingOrders } = await client
          .from('orders')
          .select('id, status')
          .in('id', orderIds)
          .eq('status', 'PENDING');

        if (pendingOrders && pendingOrders.length > 0) {
          hasPendingOrders = true;
        }
      }

      if (hasPendingOrders) {
        return NextResponse.json(
          {
            error: 'ไม่สามารถลบสินค้านี้ได้ เนื่องจากมีคำสั่งซื้อที่ค้างอยู่ กรุณาดำเนินการจัดส่งหรือจัดการคำสั่งซื้อก่อน',
          },
          { status: 400 }
        );
      }
    }

    // 5. Clean up any linked order_items or legacy orders if foreign key restricts
    try {
      await client.from('order_items').delete().eq('product_id', id);
    } catch {}

    // 6. Proceed with product deletion
    const { error: deleteErr } = await client.from('products').delete().eq('id', id);

    if (deleteErr) {
      return NextResponse.json({ error: deleteErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'ลบผลิตภัณฑ์ออกจากร้านค้าเรียบร้อยแล้ว',
    });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
