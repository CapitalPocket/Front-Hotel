/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const base = (
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.NEXT_PUBLIC_BACK_LINK ||
      'http://localhost:8080'
    ).replace(/\/$/, '');
    return [
      {
        source: '/api/:path*',
        destination: `${base}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
