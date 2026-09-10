export type UserRole = 'juragan' | 'admin';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  storeName: string;
  category: 'Kuliner' | 'Fashion' | 'Kriya' | 'Agribisnis' | 'Jasa' | 'Lainnya';
  city: string;
  whatsapp: string;
  avatarColor: string;
  joinedDate: string;
  status: 'active' | 'verified';
  isGoogleLinked?: boolean;
  googleEmail?: string;
  firebaseUid?: string;
  photoUrl?: string;
}

export interface Product {
  id: string;
  userId: string;
  name: string;
  category: string;
  costPrice: number; // HPP
  sellingPrice: number; // Harga Jual
  stock: number; // Sisa Stok
  minStockAlert: number; // Batas Kritis
  unit: string; // pcs, botol, pack, porsi, potong
  imageUrl?: string;
  updatedAt: string;
}

export interface SaleTransaction {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  profit: number;
  date: string; // YYYY-MM-DD
  paymentMethod: 'QRIS' | 'Tunai' | 'Transfer Bank' | 'Marketplace';
  customerName?: string;
  notes?: string;
}

export interface AdvisorInsight {
  id: string;
  type: 'restock' | 'trend' | 'promo' | 'pricing';
  priority: 'high' | 'medium' | 'low';
  title: string;
  badge: string;
  description: string;
  recommendation: string;
  actionLabel?: string;
  impactedProductId?: string;
}

export interface AdvisorAnalysisResponse {
  summaryTitle: string;
  overallScore: string;
  insights: AdvisorInsight[];
}

export interface ContentGenerationResult {
  hook: string;
  caption: string;
  callToAction: string;
  hashtags: string[];
  platformTips?: string;
}

export type SocialPlatform = 'instagram' | 'tiktok' | 'whatsapp';
export type ContentTone = 'santai' | 'profesional' | 'persuasif' | 'edukatif';

export interface AiActivityLog {
  id: string;
  user: string;
  store: string;
  feature: 'AI Advisor' | 'AI Content Generator';
  timestamp: string;
  model: string;
  status: 'success' | 'fallback';
}

export interface PlatformStats {
  totalAdvisorCalls: number;
  totalContentCalls: number;
  totalAiCalls: number;
  logs: AiActivityLog[];
  activeModel: string;
  uptimeSeconds: number;
}
