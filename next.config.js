/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const base =
      process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.pockiaction.xyz';
    return [
      {
        source: '/api/:path*',
        destination: `${base}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
