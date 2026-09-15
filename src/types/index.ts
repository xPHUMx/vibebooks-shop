export interface Book {
  id: string;
  title: string;
  subtitle: string;
  series: string;
  labNumber: number;
  category: 'multimedia' | 'creative-ai' | 'productivity';
  price: number;
  originalPrice: number;
  rating: number;
  ratingCount: number;
  description: string;
  highlights: string[];
  specs: {
    release: string;
    pages: number;
    format: string;
    level: string;
  };
  fileName: string;
  fileSize: string;
  coverImage: string;
  curator: string;
}

export type OrderStatus = 'PENDING' | 'PAID' | 'EXPIRED';

export interface Order {
  id: string; // e.g. ORD-2026-8821
  bookId: string;
  bookTitle: string;
  bookPrice: number;
  fileName: string;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  createdAt: string;
  paidAt?: string;
}
