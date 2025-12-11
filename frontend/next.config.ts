/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy', 
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.cloudflareinsights.com https://challenges.cloudflare.com https://ajax.cloudflare.com http://localhost:3000;
              style-src 'self' 'unsafe-inline';
              img-src 'self' data: https:;
              connect-src 'self' https://web-y.app https://challenges.cloudflare.com http://localhost:3000;
              font-src 'self' data:;
              frame-src https://challenges.cloudflare.com http://localhost:3000;
              object-src 'none';
              base-uri 'self';
              form-action 'self';
              frame-ancestors 'none';
              upgrade-insecure-requests;
            `.replace(/\s{2,}/g, ' ').trim()
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          }
        ],
      },
    ];
  },
};

export default nextConfig;
