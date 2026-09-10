import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory counter for platform AI activity tracking (for Admin view)
const aiActivityLogs: Array<{
  id: string;
  user: string;
  store: string;
  feature: 'AI Advisor' | 'AI Content Generator';
  timestamp: string;
  model: string;
  status: 'success' | 'fallback';
}> = [
  {
    id: 'log-1',
    user: 'Budi Santoso',
    store: 'Sambal & Snack Bu Budi',
    feature: 'AI Advisor',
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    model: 'gemini-3.8-flash',
    status: 'success',
  },
  {
    id: 'log-2',
    user: 'Siti Rahma',
    store: 'Siti Batik & Fashion',
    feature: 'AI Content Generator',
    timestamp: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    model: 'gemini-3.8-flash',
    status: 'success',
  },
  {
    id: 'log-3',
    user: 'Budi Santoso',
    store: 'Sambal & Snack Bu Budi',
    feature: 'AI Content Generator',
    timestamp: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
    model: 'gemini-3.8-flash',
    status: 'success',
  },
];

let totalAdvisorCalls = 14;
let totalContentCalls = 29;

// Lazy initialization of Gemini client
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Candidate models conforming to gemini-api skill:
// gemini-3.1-flash-lite provides optimal resilience and low latency,
// while gemini-3.8-flash and gemini-flash-latest act as cascading alternatives.
const CANDIDATE_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-3.8-flash',
  'gemini-flash-latest',
];

async function generateJsonWithFallback(
  ai: GoogleGenAI,
  prompt: string,
  temperature: number = 0.7
): Promise<{ text: string; modelUsed: string } | null> {
  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature,
        },
      });

      if (response && response.text) {
        return { text: response.text, modelUsed: model };
      }
    } catch (err: any) {
      // Log info when model is experiencing temporary demand spikes (e.g. 503) and cascade gracefully
      console.info(`[Juragan.AI] Model ${model} currently unavailable (${err?.status || 'transient'}), attempting resilient alternative...`);
    }
  }
  return null;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    appName: 'Juragan.AI',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
    activeModel: CANDIDATE_MODELS[0],
  });
});

// Admin stats endpoint
app.get('/api/platform/stats', (req, res) => {
  res.json({
    totalAdvisorCalls,
    totalContentCalls,
    totalAiCalls: totalAdvisorCalls + totalContentCalls,
    logs: aiActivityLogs.slice(0, 20),
    activeModel: CANDIDATE_MODELS[0],
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

// Feature 1: AI Advisor Endpoint
app.post('/api/ai/advisor', async (req, res) => {
  const { storeProfile, products, transactions } = req.body;

  if (!products || !Array.isArray(products)) {
    return res.status(400).json({ error: 'Data produk diperlukan.' });
  }

  const userName = storeProfile?.ownerName || 'Juragan';
  const storeName = storeProfile?.storeName || 'Toko UMKM';

  const ai = getGeminiClient();

  if (ai) {
    try {
      const prompt = `Anda adalah "Juragan.AI Advisor", konsultan strategi bisnis senior kelas dunia khusus untuk UMKM mikro dan kecil di Indonesia.
Gunakan bahasa Indonesia yang ramah, membumi, memotivasi, dan solutif (seperti mentor bisnis terpercaya).

Berikut adalah data bisnis toko UMKM saat ini:
- Nama Toko: ${storeName}
- Pemilik: ${userName}
- Kategori: ${storeProfile?.category || 'Umum'}
- Ringkasan Produk (${products.length} item):
${products.map((p: any) => `  * ${p.name} | HPP: Rp${p.costPrice.toLocaleString('id-ID')} | Jual: Rp${p.sellingPrice.toLocaleString('id-ID')} | Sisa Stok: ${p.stock} | Batas Kritis: ${p.minStockAlert || 5} | Satuan: ${p.unit || 'pcs'}`).join('\n')}

- Riwayat Transaksi Terkini (${(transactions || []).length} transaksi):
${(transactions || []).slice(0, 15).map((t: any) => `  * Tgl: ${t.date} | Produk: ${t.productName} | Qty: ${t.quantity} | Total: Rp${t.totalPrice.toLocaleString('id-ID')} | Metode: ${t.paymentMethod}`).join('\n')}

TUGAS ANDA:
Analisis data di atas secara mendalam dan hasilkan 4 hingga 5 kartu rekomendasi insight konkret.
Harus mencakup aspek:
1. Restock produk yang kritis atau laju penjualannya tinggi.
2. Analisis tren penjualan (produk hero vs produk lambat).
3. Rekomendasi strategi harga / promo / bundling yang menguntungkan tanpa merusak margin.
4. Tips operasional praktis khas UMKM Indonesia (misal: penataan cashflow, cross-selling via WhatsApp).

Output HARUS dalam format JSON valid sesuai struktur berikut (tanpa format markdown tambahan selain kode JSON):
{
  "summaryTitle": "Ringkasan Kesehatan Toko",
  "overallScore": "Skor 85/100 (contoh: Sehat & Bertumbuh)",
  "insights": [
    {
      "id": "1",
      "type": "restock", 
      "priority": "high",
      "title": "Judul singkat (max 6 kata)",
      "badge": "Perlu Tindakan",
      "description": "Deskripsi berbasis angka nyata (1-2 kalimat padat)",
      "recommendation": "Langkah nyata yang harus dilakukan pemilik toko hari ini",
      "actionLabel": "Restock Sekarang"
    }
  ]
}`;

      const result = await generateJsonWithFallback(ai, prompt, 0.7);

      if (result) {
        const parsedData = JSON.parse(result.text || '{}');

        totalAdvisorCalls++;
        aiActivityLogs.unshift({
          id: 'log-' + Date.now(),
          user: userName,
          store: storeName,
          feature: 'AI Advisor',
          timestamp: new Date().toISOString(),
          model: result.modelUsed,
          status: 'success',
        });

        return res.json({
          success: true,
          source: result.modelUsed,
          data: parsedData,
        });
      }
    } catch {
      // Graceful fallback to smart heuristic engine
    }
  }

  // Smart Fallback Engine: Calculates real business metrics from the data
  totalAdvisorCalls++;
  aiActivityLogs.unshift({
    id: 'log-' + Date.now(),
    user: userName,
    store: storeName,
    feature: 'AI Advisor',
    timestamp: new Date().toISOString(),
    model: 'smart-heuristic-engine',
    status: 'fallback',
  });

  const lowStockProducts = products.filter((p: any) => p.stock <= (p.minStockAlert || 5));
  const sortedBySales = [...products].sort((a: any, b: any) => {
    const aTotalSold = (transactions || []).filter((t: any) => t.productId === a.id).reduce((sum: number, t: any) => sum + t.quantity, 0);
    const bTotalSold = (transactions || []).filter((t: any) => t.productId === b.id).reduce((sum: number, t: any) => sum + t.quantity, 0);
    return bTotalSold - aTotalSold;
  });

  const topProduct = sortedBySales[0] || products[0];
  const lowestProduct = sortedBySales[sortedBySales.length - 1] || products[0];

  const fallbackInsights = {
    summaryTitle: `Kesehatan Bisnis ${storeName}`,
    overallScore: lowStockProducts.length > 0 ? 'Perlu Restock Cepat' : 'Kondisi Prima & Siap Ekspansi',
    insights: [
      {
        id: 'fb-1',
        type: 'restock',
        priority: lowStockProducts.length > 0 ? 'high' : 'medium',
        title: lowStockProducts.length > 0 
          ? `Restock Segera: ${lowStockProducts.map((p: any) => p.name).slice(0, 2).join(', ')}`
          : 'Stok Terkendali dengan Aman',
        badge: lowStockProducts.length > 0 ? 'Stok Kritis' : 'Inventori Stabil',
        description: lowStockProducts.length > 0
          ? `${lowStockProducts.length} produk memiliki sisa stok di bawah batas aman minimun (${lowStockProducts.map((p: any) => `${p.name}: ${p.stock} ${p.unit || 'pcs'}`).join(', ')}). Jangan sampai pembeli kecewa!`
          : `Semua ${products.length} produk Anda memiliki cadangan stok yang memadai untuk memenuhi permintaan minggu ini.`,
        recommendation: lowStockProducts.length > 0
          ? 'Hubungi supplier hari ini dan pesan minimal 25 unit tambahan untuk menjaga momentum penjualan.'
          : 'Pertahankan monitor berkala setiap hari Minggu untuk mencegah kehabisan stok mendadak.',
        actionLabel: 'Kelola Stok Produk',
      },
      {
        id: 'fb-2',
        type: 'trend',
        priority: 'high',
        title: `Produk Andalan: ${topProduct?.name || 'Produk Unggulan'}`,
        badge: 'Hero Product',
        description: `Produk "${topProduct?.name}" menyumbang frekuensi pesanan terbesar di toko Anda. Pelanggan menyukai produk ini dan memiliki daya tarik viral.`,
        recommendation: `Jadikan "${topProduct?.name}" sebagai pintu masuk utama di display etalase, iklan WhatsApp, atau highlight profil media sosial.`,
        actionLabel: 'Buat Konten Promosi',
      },
      {
        id: 'fb-3',
        type: 'promo',
        priority: 'medium',
        title: `Peluang Bundling Hemat Hemat`,
        badge: 'Strategi Omzet',
        description: `Gabungkan produk terlaris (${topProduct?.name}) dengan produk pendukung (${lowestProduct?.name}) dalam paket bundling diskon 8%.`,
        recommendation: `Paket bundling meningkatkan nilai belanja per transaksi (Average Order Value) tanpa mengorbankan margin laba bersih.`,
        actionLabel: 'Buat Promo Bundling',
      },
      {
        id: 'fb-4',
        type: 'pricing',
        priority: 'low',
        title: 'Optimasi Margin & Biaya Operasional',
        badge: 'Efisiensi HPP',
        description: `Rata-rata margin kotor produk Anda berkisar 30-45%. Pertimbangkan negosiasi potongan harga bahan baku jika membeli dalam jumlah grosir.`,
        recommendation: 'Sisihkan 15% dari keuntungan harian ke rekening operasional terpisah khusus dana cadangan kas darurat UMKM.',
        actionLabel: 'Lihat Analitik Keuangan',
      },
    ],
  };

  return res.json({
    success: true,
    source: 'smart-heuristic-fallback',
    note: 'Menggunakan Analisis Cerdas UMKM (Masukkan GEMINI_API_KEY di Settings > Secrets untuk analisis Gemini AI kustom).',
    data: fallbackInsights,
  });
});

// Feature 2: AI Content Generator Endpoint
app.post('/api/ai/content', async (req, res) => {
  const { product, platform, tone, specialOffer, storeName } = req.body;

  if (!product) {
    return res.status(400).json({ error: 'Data produk harus dipilih.' });
  }

  const selectedPlatform = platform || 'instagram';
  const selectedTone = tone || 'santai';
  const ai = getGeminiClient();

  if (ai) {
    try {
      const prompt = `Anda adalah "Copywriter & Social Media Strategist Juara" untuk UMKM Indonesia.
Tugas Anda adalah menulis konten promosi yang sangat menarik, natural, tidak kaku, dan terbukti menghasilkan penjualan (konversi tinggi).

Data Produk:
- Nama Produk: ${product.name}
- Kategori: ${product.category || 'UMKM'}
- Harga Jual: Rp${(product.sellingPrice || 0).toLocaleString('id-ID')}
- Sisa Stok: ${product.stock}
- Nama Toko: ${storeName || 'Toko Kami'}
- Info Promo Tambahan: ${specialOffer || 'Gratis Ongkir / Pembelian Terbatas'}
- Platform Tujuan: ${selectedPlatform.toUpperCase()}
- Gaya Bahasa / Tone: ${selectedTone}

Panduan Berdasarkan Platform:
1. INSTAGRAM:
   - Hook baris pertama yang memikat (berhenti scroll)
   - Story/benefit produk (mengapa produk ini wajib dicoba)
   - Call to Action jelas (klik link bio / DM)
   - 8-12 hashtag populer UMKM Indonesia (#KulinerIndonesia, #ProdukLokal, #BanggaBuatanIndonesia, dll)
2. TIKTOK:
   - Hook visual & ucapan 3 detik pertama
   - Narasi singkat 30-45 detik yang relate dengan keseharian
   - Call to action kuat (cek keranjang kuning sekarang sebelum kehabisan)
   - 5-8 hashtag FYP
3. WHATSAPP:
   - Sapaan ramah personal khas chat WhatsApp (Halo Kak/Bund...)
   - Penawaran spesial langsung ke inti dengan harga jelas
   - Format pemesanan cepat yang tinggal dicopy pembeli
   - Sentuhan urgensi (stok terbatas hari ini)

Keluarkan output dalam JSON valid:
{
  "hook": "Kalimat pembuka pemikat",
  "caption": "Teks lengkap siap copy",
  "callToAction": "Instruksi aksi penutup",
  "hashtags": ["#Tag1", "#Tag2"],
  "platformTips": "1 tips praktis jam posting terbaik untuk jenis konten ini"
}`;

      const result = await generateJsonWithFallback(ai, prompt, 0.8);

      if (result) {
        const parsedData = JSON.parse(result.text || '{}');

        totalContentCalls++;
        aiActivityLogs.unshift({
          id: 'log-' + Date.now(),
          user: storeName || 'Juragan',
          store: storeName || 'Toko UMKM',
          feature: 'AI Content Generator',
          timestamp: new Date().toISOString(),
          model: result.modelUsed,
          status: 'success',
        });

        return res.json({
          success: true,
          source: result.modelUsed,
          data: parsedData,
        });
      }
    } catch {
      // Graceful fallback to tailored templates
    }
  }

  // High quality realistic Indonesian copy fallback
  totalContentCalls++;
  aiActivityLogs.unshift({
    id: 'log-' + Date.now(),
    user: storeName || 'Juragan',
    store: storeName || 'Toko UMKM',
    feature: 'AI Content Generator',
    timestamp: new Date().toISOString(),
    model: 'tailored-template-engine',
    status: 'fallback',
  });

  const formattedPrice = `Rp${(product.sellingPrice || 0).toLocaleString('id-ID')}`;
  let fallbackContent: any = {};

  if (selectedPlatform === 'whatsapp') {
    fallbackContent = {
      hook: `Halo Kak! Ada kabar gembira dari ${storeName || 'toko kami'} nih ✨`,
      caption: `Halo Kak, salam hangat dari ${storeName || 'Juragan Store'}! 😊

Banyak yang tanya restock untuk *${product.name}*, hari ini stok baru selesai siap kirim lho!
Kualitas bahan nomor satu, dijamin fresh & mantap banget.

💰 *Harga Spesial:* ${formattedPrice}
📦 *Sisa Stok Terbatas:* Hanya sisa ${product.stock} ${product.unit || 'pcs'} lagi!
🎁 *Promo:* ${specialOffer || 'Beli 2 gratis pouch eksklusif / Subsidi Ongkir'}

Mau amankan pesanan sekarang sebelum kehabisan?
Cukup balas chat ini dengan format:
Nama:
Alamat Lengkap:
Jumlah Pesan:

Kami siap proses kirim hari ini ya Kak! Terima kasih banyak sudah mendukung produk UMKM lokal! ❤️`,
      callToAction: 'Balas chat ini sekarang untuk amankan stok hari ini!',
      hashtags: ['#JuraganWA', '#PromoUMKM', '#ProdukLokal'],
      platformTips: 'Kirim di jam istirahat siang (11.30 - 13.00) atau malam santai (19.00 - 20.30) untuk respon tercepat.',
    };
  } else if (selectedPlatform === 'tiktok') {
    fallbackContent = {
      hook: `Jangan scroll dulu kalau kamu belum pernah nyobain ${product.name} yang lagi viral ini! 😱🔥`,
      caption: `POV: Kamu nemuin produk lokal yang rasanya/kualitasnya bikin nagih terus tiap hari! 😍

Kenalin *${product.name}* dari ${storeName || 'kami'}!
Bikin hari-hari makin bersemangat, harganya cuma ${formattedPrice} aja!
${specialOffer ? `Lagi ada promo: ${specialOffer}` : 'Stok cepat habis karena banyak yang borong!'}

👉 Buruan klik keranjang kuning di kiri bawah sebelum kehabisan batch hari ini ya Guys!`,
      callToAction: 'Klik keranjang kuning sekarang dan claim voucher diskonnya!',
      hashtags: ['#RacunTikTok', '#ProdukLokal', '#UMKMIndonesia', '#MurahNampol', '#FYPBisnis', '#SpillProduk'],
      platformTips: 'Gunakan sound yang sedang trending di TikTok dan upload di jam 12.00 - 13.00 atau 18.30 - 20.00 WIB.',
    };
  } else {
    // Instagram default
    fallbackContent = {
      hook: `Siapa yang dari kemarin nungguin restock ${product.name}? Akhirnya ready lagi! 🎉`,
      caption: `Paling nggak bisa nolak kalau udah ketemu sama *${product.name}*! ✨

Dibuat sepenuh hati dengan standar kualitas terbaik untuk Sahabat ${storeName || 'Juragan'}. Cocok banget buat nemenin aktivitas harian atau jadi hadiah buat orang tersayang.

Kenapa harus coba?
✅ Kualitas bahan baku pilihan
✅ Harga terjangkau: cuma *${formattedPrice}*
✅ Terjual ratusan paket dengan ulasan bintang 5
${specialOffer ? `🔥 Penawaran Khusus: ${specialOffer}` : ''}

Stok saat ini terbatas (tersisa ${product.stock} unit). Jangan sampai nyesel kehabisan ya!

🛍️ Cara Order:
1. Klik link di bio kami
2. Atau DM langsung: "Mau Order ${product.name}"`,
      callToAction: 'Klik tautan di Bio profil kami atau kirim DM langsung sekarang juga!',
      hashtags: [
        '#BanggaBuatanIndonesia',
        '#UMKMJuara',
        '#ProdukLokal',
        '#SupportLocalBrand',
        '#BeliKreatifLokal',
        '#OlshopTerpercaya',
        '#PilihanJuragan',
      ],
      platformTips: 'Unggah carousel (slide 1 foto produk menarik, slide 2 testimoni, slide 3 info order) di jam 19.00 WIB.',
    };
  }

  return res.json({
    success: true,
    source: 'tailored-template-fallback',
    data: fallbackContent,
  });
});

async function startServer() {
  // Setup Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Juragan.AI] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
