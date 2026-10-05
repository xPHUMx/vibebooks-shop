import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { DIGITAL_PRODUCTS } from '@/lib/productsData';
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

  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle || '',
    category: row.category_id || row.category || 'ebook',
    categoryNameTh: row.category_name_th,
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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const merchantId = searchParams.get('merchantId');
    const merchantName = searchParams.get('merchantName');

    const admin = createAdminClient();
    const serverClient = createClient();
    const client = admin || serverClient;

    const isUuid = (str?: string | null): boolean =>
      Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));

    // 1. ISOLATED MERCHANT QUERY: If queried for a specific merchant (e.g. merchant dashboard)
    // NEVER fall back to global/other stores' products! Return only this merchant's products (or []).
    if (merchantId || merchantName) {
      const validMerchantId = isUuid(merchantId) ? merchantId : null;

      // If merchantId was passed but is invalid, and no merchantName:
      if (merchantId && !validMerchantId && !merchantName) {
        return NextResponse.json({
          success: true,
          source: 'supabase_db',
          products: [],
        });
      }

      let mQuery = client.from('products').select('*');
      if (validMerchantId && merchantName) {
        mQuery = mQuery.or(`merchant_id.eq.${validMerchantId},merchant_name.eq."${merchantName}"`);
      } else if (validMerchantId) {
        mQuery = mQuery.eq('merchant_id', validMerchantId);
      } else if (merchantName) {
        mQuery = mQuery.eq('merchant_name', merchantName);
      }
      if (category && category !== 'all') {
        mQuery = mQuery.eq('category_id', category);
      }

      const { data: mProducts, error: mErr } = await mQuery.order('created_at', { ascending: false });

      if (mErr) {
        console.error('Error fetching merchant products:', mErr);
        return NextResponse.json({ error: mErr.message }, { status: 500 });
      }

      let mapped = (mProducts || []).map(mapDbProductToDigitalProduct);
      if (search && search.trim()) {
        const q = search.toLowerCase().trim();
        mapped = mapped.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.subtitle.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q)
        );
      }

      return NextResponse.json({
        success: true,
        source: 'supabase_db',
        products: mapped,
      });
    }

    // 2. PUBLIC MARKETPLACE / CATALOG QUERY
    let query = client.from('products').select('*');

    if (category && category !== 'all') {
      query = query.eq('category_id', category);
    }

    const { data: dbProducts, error } = await query.order('created_at', { ascending: false });

    // If database returned products, map and return them
    if (!error && dbProducts && dbProducts.length > 0) {
      let mapped = dbProducts.map(mapDbProductToDigitalProduct);

      if (search && search.trim()) {
        const q = search.toLowerCase().trim();
        mapped = mapped.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.subtitle.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q)
        );
      }

      return NextResponse.json({
        success: true,
        source: 'supabase_db',
        products: mapped,
      });
    }

    // Fallback initial products if table is completely empty
    let results = DIGITAL_PRODUCTS;
    if (category && category !== 'all') {
      results = results.filter((p) => p.category === category);
    }
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      results = results.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.subtitle.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({
      success: true,
      source: 'initial_catalog',
      products: results,
    });
  } catch (error) {
    console.error('Products API GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = createAdminClient();
    const serverClient = createClient();
    const client = admin || serverClient;

    const { data: { user } } = await serverClient.auth.getUser();

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
      merchantId,
      merchantName,
      merchantPromptPay,
      curator,
      previewImages,
    } = body;

    if (!title || !price || !fileName) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลสินค้าให้ครบถ้วน (ชื่อสินค้า, ราคา, ชื่อไฟล์)' },
        { status: 400 }
      );
    }

    const productId = body.id || `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const effectiveMerchantId = merchantId || user?.id || null;

    let finalDesc = description || 'สินค้าดิจิทัลลิขสิทธิ์แท้พร้อมสิทธิ์ใช้งานและการส่งมอบไฟล์ผ่านระบบ Vault ทันที';
    if (Array.isArray(previewImages) && previewImages.length > 0) {
      finalDesc += `\n\n<!-- SAMPLES: ${JSON.stringify(previewImages)} -->`;
    }

    // Strict schema matching Supabase PostgreSQL public.products columns
    const newRow = {
      id: productId,
      title: title.trim(),
      subtitle: (subtitle || '').trim(),
      category_id: category || 'ebook',
      price: Number(price),
      original_price: Number(originalPrice || Number(price) * 1.5),
      rating: 5.0,
      rating_count: 1,
      description: finalDesc,
      file_name: fileName,
      file_size: fileSize || '10 MB',
      file_format: fileFormat || 'PDF / Archive',
      cover_image: coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      badge: badge || 'New',
      featured: false,
      curator: curator || 'นายเกียรติภูมิ หารศรีนาถ',
      merchant_id: effectiveMerchantId,
      merchant_name: merchantName || 'ร้านค้าสมาชิก Book Sangdai',
      merchant_promptpay: merchantPromptPay || null,
    };

    const { data, error } = await client
      .from('products')
      .upsert(newRow, { onConflict: 'id' })
      .select()
      .maybeSingle();

    if (error) {
      console.error('Create product error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'สร้างสินค้าดิจิทัลใหม่สำเร็จ',
      product: mapDbProductToDigitalProduct(data || newRow),
    });
  } catch (error) {
    console.error('Products API POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
