/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://pocki-api-env-1.eba-pprtwpab.us-east-1.elasticbeanstalk.com/api/:path*',
            },
        ];
    },
};

module.exports = nextConfig;
