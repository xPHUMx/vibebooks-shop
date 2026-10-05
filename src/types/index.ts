export type ProductCategory =
  | 'all'
  | 'ebook'
  | 'notion'
  | 'figma'
  | 'code'
  | 'assets'
  | 'multimedia'
  | 'creative-ai'
  | 'productivity';

export interface DigitalProduct {
  id: string;
  title: string;
  subtitle: string;
  category: ProductCategory;
  categoryNameTh?: string;
  price: number;
  originalPrice: number;
  rating: number;
  ratingCount: number;
  description: string;
  highlights: string[];
  features?: string[];
  specs?: {
    release: string;
    format: string;
    version?: string;
    support?: string;
    pages?: number;
    level?: string;
  };
  fileName: string;
  fileSize: string;
  fileFormat?: string;
  coverImage: string;
  previewImages?: string[];
  curator: string;
  badge?: string;
  isFeatured?: boolean;
  demoUrl?: string;
  merchantId?: string;
  merchantName?: string;
  merchantPromptPay?: string;
}

export type Product = DigitalProduct;

// Backwards compatibility alias for existing code
export type Book = DigitalProduct & {
  series?: string;
  labNumber?: number;
};

export type OrderStatus = 'PENDING' | 'PAID' | 'EXPIRED';

export interface CartItem {
  product: DigitalProduct;
  quantity: number;
}

export interface OrderItem {
  id?: string;
  productId: string;
  title: string;
  price: number;
  fileName: string;
  fileSize?: string;
  fileFormat?: string;
}

export interface Order {
  id: string; // e.g. ORD-2026-8821
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  totalAmount: number;
  status: OrderStatus;
  items: OrderItem[];
  promptpayRef?: string;
  createdAt: string;
  paidAt?: string;

  slipUrl?: string;
  merchantId?: string;
  merchantName?: string;
  merchantPromptPay?: string;
  // Backwards compatibility fields for legacy book checkout:
  bookId?: string;
  bookTitle?: string;
  bookPrice?: number;
  fileName?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  role: 'admin' | 'merchant' | 'user';
  merchantStatus?: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';
  merchantAppliedAt?: string;
  storeName?: string;
  storeDescription?: string;
  promptPayId?: string;
  storeLogoUrl?: string;
  createdAt?: string;
}

export interface CommunityComment {
  id: string;
  userId?: string;
  author: string;
  avatarUrl?: string;
  avatarColor?: string;
  role?: string;
  isAuthor?: boolean;
  bookId?: string;
  bookTitle?: string;
  rating: number;
  content: string;
  likes: number;
  likedByMe?: boolean;
  createdAt: string;
}

