// Brauzer faqat /api/v1 ga murojaat qiladi (bir origin): cookie va CSRF muammosiz ishlaydi.
// Diqqat: rewrites qiymati BUILD paytida qotadi (Docker'da build arg sifatida beriladi).
const API = process.env.API_INTERNAL_URL ?? 'http://localhost:4000';

/** @type {import('next').NextConfig} */
export default {
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: { proxyTimeout: 3_600_000 }, // AI oqimi va bildirishnoma SSE 30 soniyada uzilmasligi uchun
  async rewrites() {
    return [{ source: '/api/v1/:path*', destination: `${API}/api/v1/:path*` }];
  },
};
