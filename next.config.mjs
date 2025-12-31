/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ensure Cloudflare can transform HTML
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, s-maxage=31536000, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
