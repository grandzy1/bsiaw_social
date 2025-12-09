import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        // Zastosuj te nagłówki do wszystkich ścieżek w aplikacji
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            // Poniżej znajduje się wartość polityki (jedna długa linia)
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;",
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff', // <--- TO JEST NOWA LINIJKA
          },
        ],
      },
    ]
  },
};

export default nextConfig;
