# Kasir Pintar - Aplikasi Point of Sale

Aplikasi Point of Sale (POS) modern berbasis web yang dibangun dengan Next.js untuk pengelolaan restoran dan retail.

## Teknologi

| Teknologi | Versi |
|-----------|-------|
| Next.js | 16.0.2 |
| React | 19.2.0 |
| TypeScript | 5 |
| Tailwind CSS | 4 |
| Recharts | 3.4.1 |

## Fitur Utama

- **Manajemen Produk** - CRUD produk dengan upload gambar
- **Checkout** - Proses transaksi dengan berbagai metode pembayaran
- **Dashboard** - Statistik penjualan dan grafik analitik
- **Laporan** - Export laporan ke Excel/PDF
- **Manajemen Inventori** - Tracking stok produk

## Instalasi

### Prasyarat

- Node.js 18+ 
- npm atau pnpm
- Backend API berjalan di port 3001

### Langkah Instalasi

```bash
# Clone repository
git clone <repository-url>
cd application

# Install dependencies
npm install

# Salin file environment
cp .env.local.example .env.local

# Jalankan development server
npm run dev
```

### Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_IMAGE_PROXY_HOSTS=res.cloudinary.com,example.com
```

## Struktur Folder

```
application/
├── pages/               # Route halaman (Next.js Pages Router)
│   ├── api/            # API routes (proxy, auth)
│   ├── auth/           # Halaman login/register
│   ├── checkout/       # Halaman checkout & invoice
│   ├── dashboard/      # Halaman dashboard
│   └── reports/        # Halaman laporan
├── public/             # Static assets
├── src/
│   ├── components/     # Komponen React
│   ├── data/           # Data types & mock data
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utilities & API services
│   └── types/          # TypeScript types
└── styles/             # Global CSS
```

## Mockup UI

### Dashboard View
![Dashboard View](mockup/Dashboard%20View.png)

### Product View
![Product View](mockup/Product%20View.png)

### Detail Product
![Detail Product](mockup/Detail%20Product.png)

### Checkout View
![Checkout View](mockup/Checkout%20View.png)

## Scripts

```bash
npm run dev      
npm run build   
npm run start    
npm run lint
```

## Konfigurasi

### Next.js Config

File `next.config.ts` berisi konfigurasi untuk:
- Image domains (Cloudinary, API server)
- Rewrites untuk proxy API

### Tailwind Config

Aplikasi menggunakan Tailwind CSS v4 dengan PostCSS.