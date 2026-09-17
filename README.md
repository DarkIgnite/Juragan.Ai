# 🏪 Juragan.AI — AI Business Companion untuk UMKM Indonesia

[![Hackathon UNISKA 2026](https://img.shields.io/badge/UNISKA_Hackathon-2026-blue.svg?style=for-the-badge)](https://uniska-bjm.ac.id)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Express.js](https://img.shields.io/badge/Express.js-Backend_Proxy-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-3.8_Flash-8E75C2?style=for-the-badge&logo=google&logoColor=white)](https://aistudio.google.com/)

> **Juragan.AI** adalah platform terintegrasi berbasis Artificial Intelligence (AI) yang dirancang khusus untuk memodernisasi UMKM (Usaha Mikro, Kecil, dan Menengah) di Indonesia. Dilengkapi sistem kasir (POS) pintar, peringatan stok otomatis, analisis keuangan, asisten konsultasi suara berbahasa Indonesia, generator konten promosi multi-channel, serta dashboard monitoring multi-tenant bagi administrator ekosistem.

---

## 📑 Daftar Isi

1. [Latar Belakang & Masalah UMKM](#-latar-belakang--masalah-umkm)
2. [Fitur Utama Solusi](#-fitur-utama-solusi)
3. [Arsitektur & Tech Stack](#-arsitektur--tech-stack)
4. [Kredensial Demo untuk Juri & Pengujian](#-kredensial-demo-untuk-juri--pengujian)
5. [Langkah Instalasi](#-langkah-instalasi)
6. [Parameter Konfigurasi](#-parameter-konfigurasi)
7. [User Guide (Panduan Penggunaan Lengkap)](#-user-guide-panduan-penggunaan-lengkap)
8. [Struktur Folder Proyek](#-struktur-folder-proyek)
9. [Keamanan & Integritas Data](#-keamanan--integritas-data)
10. [Tim Pengembang](#-tim-pengembang)

---

## 💡 Latar Belakang & Masalah UMKM

UMKM menyumbang lebih dari 60% PDB Indonesia, namun 80%+ masih menghadapi kendala krusial:
- **Pencatatan Keuangan Manual & Tercampur**: Uang kas pribadi dan kas operasional toko sering tercampur tanpa kalkulasi HPP (*Harga Pokok Penjualan*) yang akurat.
- **Stok Mati & Habis Tak Terpantau**: Banyak barang kadaluwarsa atau stok habis mendadak sehingga kehilangan potensi omzet penjualan.
- **Keterbatasan Pemasaran Digital**: Pemilik usaha kesulitan merangkai teks promosi menarik untuk media sosial dan WhatsApp.
- **Biaya Konsultan Bisnis Mahal**: UMKM mikro tidak mampu menyewa analis bisnis untuk mengevaluasi kesehatan arus kas mereka.

**Juragan.AI hadir sebagai solusi terjangkau, mudah digunakan, dan langsung dapat dieksekusi dari browser maupun smartphone.**

---

## ✨ Fitur Utama Solusi

| Fitur | Deskripsi | Teknologi Pendukung |
| :--- | :--- | :--- |
| 📊 **POS Kasir Pintar & Struk WA** | Input transaksi cepat, hitung kembalian otomatis, cetak struk digital, dan kirim nota resmi via WhatsApp 1-klik. | React 19, Local State & Firestore |
| 📦 **Manajemen Stok & Alert Kritis** | Monitoring HPP, harga jual, margin keuntungan (%), dan indikator stok menipis otomatis. | Responsive UI, Modal Management |
| 🧠 **AI Advisor Bisnis UMKM** | Analisis kesehatan toko, margin kotor, rekomendasi restock, strategi *bundling*, dan mitigasi risiko usaha. | Google Gemini 3.8 Flash, Server Proxy |
| 📢 **AI Content Marketing Generator** | Pembuat materi promosi instan untuk Instagram Feed/Reels, TikTok Script, dan WhatsApp Broadcast dalam berbagai gaya bahasa. | Google GenAI SDK, Structured JSON Prompting |
| 🎙️ **Juragan Voice AI (Asisten Suara)** | Konsultasi interaktif dua arah berbahasa Indonesia (Voice Input $\rightarrow$ Voice Output) untuk cek stok dan rekap omzet. | Web Speech Recognition & Speech Synthesis |
| 📑 **Laporan Laba Rugi & Cetak Dokumen** | Rekapitulasi omzet, total modal HPP, margin kotor, filter rentang waktu, dan ekspor dokumen PDF dengan stempel *Juragan.AI Verified*. | Print CSS, Canvas Confetti |
| 👥 **Dual Role & Super Admin View** | Hak akses berbasis peran: **Admin Pusat** (agregat nasional seluruh UMKM) dan **Juragan** (spesifik toko masing-masing). | RBAC (Role-Based Access Control) |

---

## 🛠️ Arsitektur & Tech Stack

```
[ Frontend (React 19 + Tailwind v4 + Vite) ]
                     │
         (HTTP API Proxy / Port 3000)
                     ▼
  [ Backend Node.js / Express 4.21 + tsx ]
         │                        │
         ▼                        ▼
[ Google Gemini AI Engine ]   [ Cloud Firestore & Auth ]
 (Model: gemini-3.8-flash)     (Persistent Multi-User DB)
```

- **Frontend**: React 19, Vite 6, Tailwind CSS v4, Lucide React, Motion, Canvas Confetti.
- **Backend**: Node.js v22, Express.js (sebagai secure API proxy yang melindungi API key dari browser).
- **AI Engine**: `@google/genai` TypeScript SDK (Model: `gemini-3.8-flash` dan `gemini-3.1-flash-lite` dengan fallback handling).
- **Database & Auth**: Firebase Authentication (Google Sign-In) & Cloud Firestore untuk persistensi transaksi riil.

---

## 🔑 Kredensial Demo untuk Juri & Pengujian

Aplikasi telah dilengkapi dengan **Sistem Fast Role-Switcher** sehingga dewan juri tidak perlu membuat akun baru dari awal untuk menguji kedua role:

### 1. Daftar Akun Demo Siap Pakai

| Role | Nama Akun | Email Demo | Toko / Instansi | Kategori Usaha | Wilayah |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 👑 **Super Admin** | **Admin Pusat Juragan.AI** | `admin@juragan.ai` | Juragan.AI Super Admin | Pusat Jasa & Pembina UMKM | DKI Jakarta |
| 👨‍🍳 **Juragan (User 1)** | **Budi Santoso** | `budi@sambaljuara.id` | Sambal & Snack Bu Budi | Kuliner & Makanan Olahan | Surabaya, Jawa Timur |
| 👗 **Juragan (User 2)** | **Siti Rahmawati** | `siti@sitibatik.com` | Siti Batik & Fashion | Fashion, Tekstil & Kriya | Surakarta, Jawa Tengah |

### 2. Cara Beralih Antar-Role (1-Klik)

1. Pada navigasi atas (kanan atas), klik tombol **"Ganti Akun / Toko"** (atau klik foto profil lalu pilih **"Ganti Akun & Toko Demo"**).
2. Modal pemilih akun akan muncul dengan daftar seluruh akun terdaftar.
3. Klik tombol **"Masuk Sebagai Role Ini"**:
   - Memilih **Admin Pusat** akan membuka halaman **Dashboard Super Admin** (monitoring agregat seluruh toko, metrik transaksi nasional, status verifikasi mitra).
   - Memilih **Budi Santoso** atau **Siti Rahmawati** akan membuka **Workspace Juragan UMKM** yang menampilkan katalog produk, kasir POS, AI Advisor, dan riwayat transaksi toko tersebut.
4. *Opsi Tambahan*: Anda juga dapat menggunakan tombol **"Masuk dengan Akun Google"** untuk login menggunakan akun Google pribadi melalui Firebase Authentication.

---

## 🚀 Langkah Instalasi

Ikuti langkah-langkah berikut untuk menjalankan Juragan.AI di komputer lokal:

### 1. Prasyarat Sistem
- **Node.js**: Versi `18.x`, `20.x`, atau `22.x` (disarankan LTS).
- **Package Manager**: `npm` (bawaan Node.js), `pnpm`, atau `yarn`.
- **Browser Modern**: Google Chrome, Microsoft Edge, atau Mozilla Firefox dengan izin mikrofon aktif (untuk fitur Voice AI).

### 2. Kloning Repository
```bash
git clone https://github.com/<username>/juragan-ai.git
cd juragan-ai
```

### 3. Instal Dependensi
```bash
npm install
```

### 4. Konfigurasi Environment Variable
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```

Buka file `.env` dan masukkan API Key Google Gemini Anda:
```env
# Dapatkan kunci gratis di: https://aistudio.google.com/app/apikey
GEMINI_API_KEY="AIzaSy...atau...kunci_resmi_anda"
PORT=3000
```

> **Catatan Keamanan**: File `.env` sudah terdaftar di `.gitignore` sehingga kunci rahasia Anda aman dan tidak akan terunggah ke GitHub.

### 5. Jalankan Server Pengembangan
```bash
npm run dev
```
Buka browser Anda dan akses:
👉 **`http://localhost:3000`**

### 6. Perintah Tambahan
- **Build untuk Production**:
  ```bash
  npm run build
  ```
- **Menjalankan Hasil Build Production**:
  ```bash
  npm start
  ```
- **Validasi Linting & Type Check**:
  ```bash
  npm run lint
  ```

---

## ⚙️ Parameter Konfigurasi

Seluruh variabel konfigurasi lingkungan diatur melalui file `.env`:

| Nama Variabel | Wajib / Opsional | Default | Keterangan |
| :--- | :---: | :---: | :--- |
| `GEMINI_API_KEY` | **Wajib** | *Kosong* | Kunci API Google Gemini untuk mengaktifkan AI Advisor, Pembuat Konten, dan Voice AI. |
| `PORT` | Opsional | `3000` | Port tempat aplikasi Express backend dan antarmuka web Vite dijalankan. |
| `NODE_ENV` | Opsional | `development` | Mode runtime aplikasi (`development` atau `production`). |
| `APP_URL` | Opsional | `http://localhost:3000` | URL basis aplikasi (berguna saat deployment ke Cloud Run / VPS). |

---

## 📖 User Guide (Panduan Penggunaan Lengkap)

### 🧑‍💼 A. Panduan untuk Role: Juragan UMKM

#### 1. Menambah & Mengelola Katalog Produk
1. Klik tab **"Produk & Stok"** pada navigasi atas.
2. Klik tombol **"+ Tambah Produk"**.
3. Isi informasi produk:
   - **Nama Produk**: misal `Sambal Bawang Pedas Nampol (150g)`
   - **Kategori**: Makanan, Minuman, Fashion, Kerajinan, dll.
   - **HPP (Harga Modal)**: Biaya produksi per unit (misal `Rp15.000`).
   - **Harga Jual**: Harga ke konsumen (misal `Rp25.000`). Sistem akan otomatis menghitung estimasi margin keuntungan per produk.
   - **Stok Awal & Batas Minimal Peringatan Stok**: Angka kritis untuk memicu peringatan restock (misal jika stok $\le$ 5).
4. Klik **"Simpan Produk"**.

#### 2. Melakukan Transaksi Penjualan (Kasir POS)
1. Klik tombol **"+ Catat Penjualan"** di header atau di halaman kasir.
2. Pilih produk yang dibeli oleh pelanggan dan masukkan jumlah kuantitas (`Qty`).
3. Masukkan nama pelanggan dan nomor WhatsApp (opsional untuk struk otomatis).
4. Pilih metode pembayaran: **Tunai**, **QRIS**, atau **Transfer Bank**.
5. Masukkan nominal uang yang diterima. Sistem otomatis menghitung jumlah kembalian.
6. Klik **"Selesaikan Transaksi"**.
7. Anda dapat langsung mengklik **"Kirim Struk WhatsApp"** untuk membuka WhatsApp Web/App dengan format invoice rapi yang siap dikirimkan kepada pembeli.

#### 3. Menggunakan AI Advisor Bisnis (Konsultan AI)
1. Buka tab **"AI Advisor"**.
2. Klik tombol **"Analisis Ulang Bisnis"**.
3. Mesin Gemini AI akan memproses data riil toko Anda (seluruh produk, stok, omzet, dan transaksi) untuk menghasilkan:
   - **Ringkasan Kondisi Finansial Toko**: Status kesehatan margin usaha.
   - **Rekomendasi Aksi Cepat**: Peringatan produk yang menipis beserta perkiraan modal yang harus disiapkan.
   - **Strategi Bundling & Upselling**: Rekomendasi memaketkan barang laris dengan produk lambat laku (*slow-moving*).
   - **Peluang Ekspansi & Tren Pasar**: Ide varian produk baru berdasarkan tren konsumen.

#### 4. Membuat Materi Pemasaran (AI Content Generator)
1. Buka tab **"Konten Pemasaran"**.
2. Pilih produk yang ingin dipromosikan dari katalog Anda.
3. Pilih target saluran:
   - 📸 **Instagram Feed / Reels** (lengkap dengan ide visual dan hashtag viral).
   - 🎵 **TikTok Video Script** (skrip video 15-30 detik dengan hook pembuka & Call To Action).
   - 💬 **WhatsApp Broadcast Promo** (teks personal yang siap dibagikan ke grup kontak pelanggan).
4. Pilih gaya bahasa (Tone): *Promo Diskon & Mendesak*, *Santai & Ramah*, *Edukatif & Manfaat Produk*, atau *Profesional Elegan*.
5. Klik **"Buat Konten Promosi"**.
6. Klik **"Salin Teks"** untuk langsung menempelkan konten ke aplikasi media sosial Anda.

#### 5. Konsultasi Suara Interaktif (Juragan Voice AI)
1. Klik tombol mengambang hijau bergambar mikrofon di pojok kanan bawah (**"Tanya Juragan AI"**).
2. Izinkan akses mikrofon pada browser Anda.
3. Tekan ikon mikrofon dan bicaralah secara alami dalam bahasa Indonesia, misalnya:
   - *"Halo Juragan AI, produk apa saja yang stoknya mau habis hari ini?"*
   - *"Berapa total omzet penjualan saya minggu ini?"*
   - *"Kasih rekomendasi cara naikin omzet toko saya dong!"*
4. Sistem akan mentranskripsikan suara Anda, menganalisis data toko Anda melalui Gemini, dan membalas melalui suara yang ramah beserta teks di layar.

#### 6. Mencetak Laporan Keuangan & Laba Rugi
1. Buka tab **"Riwayat Transaksi"**.
2. Klik tombol **"Laporan Laba Rugi"**.
3. Pilih periode rekapitulasi: *Hari Ini*, *7 Hari Terakhir*, *Bulan Ini*, atau *Semua Waktu*.
4. Periksa ringkasan total pendapatan, total modal HPP keluar, laba kotor bersih, dan rata-rata nilai transaksi.
5. Klik **"Cetak / Simpan PDF"** untuk mengunduh laporan keuangan berstandar akuntansi resmi dengan stempel validasi digital.

---

### 👑 B. Panduan untuk Role: Super Admin

#### 1. Masuk ke Mode Super Admin
1. Klik tombol **"Ganti Akun / Toko"** di kanan atas.
2. Pilih kartu **Admin Pusat Juragan.AI** (`admin@juragan.ai`).

#### 2. Monitoring Agregat Ekosistem UMKM
- **Ringkasan Nasional**: Melihat total UMKM aktif yang terdaftar, total perputaran omzet gabungan, total variasi produk UMKM, dan total transaksi yang berhasil diproses.
- **Tabel Direktori UMKM Mitra**:
  - Memeriksa profil tiap pemilik usaha (Nama Pemilik, Nama Toko, Kota, Kategori Usaha, No. WhatsApp).
  - Memantau jumlah produk dan performa penjualan masing-masing toko mitra.
  - Memverifikasi status kepatuhan dan keaktifan toko (*Verified Partner*).
- **Metrik Sistem & Latensi AI**: Memantau kesehatan API server, performa model Gemini, dan statistik penggunaan modul cerdas.

---

## 📂 Struktur Folder Proyek

```
juragan-ai/
├── dist/                     # Hasil bundle build production
├── public/                   # Asset statis, favicon, dan ikon
├── src/
│   ├── components/           # Komponen UI modular
│   │   ├── AdminDashboardView.tsx     # Tampilan dashboard Super Admin
│   │   ├── AiAdvisorView.tsx          # Tampilan modul AI Advisor analitik
│   │   ├── ContentGeneratorView.tsx   # Tampilan generator konten promosi
│   │   ├── FinancialReportModal.tsx   # Modal rekapitulasi laba rugi & cetak
│   │   ├── Header.tsx                 # Navigasi atas, tema & profil
│   │   ├── JuraganDashboardView.tsx   # Workspace utama pemilik UMKM
│   │   ├── ProductCatalogView.tsx     # Tabel & grid inventori produk
│   │   ├── RoleSwitcherModal.tsx      # Modal cepat ganti role demo
│   │   ├── SaleTransactionModal.tsx   # Modal kasir POS & struk WhatsApp
│   │   ├── TransactionHistoryView.tsx # Riwayat penjualan & filter
│   │   └── VoiceConsultationModal.tsx # Modul interaksi suara Juragan Voice AI
│   ├── data/
│   │   └── seedData.ts       # Data demo awal UMKM (produk, transaksi, user)
│   ├── lib/
│   │   └── firebase.ts       # Inisialisasi Firebase Auth & Firestore
│   ├── types.ts              # Deklarasi TypeScript interfaces & models
│   ├── App.tsx               # Root component & routing state
│   ├── main.tsx              # Entry point React
│   └── index.css             # Konfigurasi Tailwind CSS v4
├── .env.example              # Dokumentasi variabel lingkungan
├── metadata.json             # Konfigurasi metadata platform AI Studio
├── package.json              # Dependensi npm & build scripts
├── server.ts                 # Express backend server & secure AI proxy
├── tsconfig.json             # Konfigurasi TypeScript compiler
└── vite.config.ts            # Konfigurasi bundler Vite
```

---

## 🛡️ Keamanan & Integritas Data

1. **Server-Side API Key Protection**:
   - Kunci API Google Gemini disimpan secara eksklusif pada sisi server container (`server.ts` melalui file `.env`).
   - Browser klien tidak pernah memiliki akses langsung ke API Key, mencegah pencurian kuota maupun kebocoran kunci rahasia (*credential scraping*).
2. **Isolasi Multi-Tenant Data**:
   - Setiap transaksi dan produk dikaitkan dengan `userId` pemilik masing-masing.
   - Juragan hanya dapat melihat dan memanipulasi data tokonya sendiri, sementara peran Admin diautentikasi untuk memantau data dalam kapasitas agregat pembinaan.
3. **Penyaringan Konten Aman**:
   - Seluruh prompt interaksi Gemini dilengkapi dengan guardrail instruksi bisnis ramah UMKM untuk mencegah output yang menyesatkan atau merugikan keuangan pemilik usaha.

---

## 🏆 Tim Pengembang & Kontak

Proyek ini diajukan dan dikembangkan untuk **Lomba Hackathon UNISKA 2026**:

- **Nama Tim**: Tim Juragan.AI
- **Institusi**: Universitas Islam Kalimantan Muhammad Arsyad Al Banjari (UNISKA)
- **Kontak**: `ryanfadhila18@gmail.com`
- **Lisensi**: MIT License — Terbuka untuk pengembangan digitalisasi UMKM Indonesia.

---

*“Majukan Usaha, Maksimalkan Laba bersama Juragan.AI — Sahabat Digital UMKM Indonesia.”* 🚀🇮🇩
