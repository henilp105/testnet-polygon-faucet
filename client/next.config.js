/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: false,
    async rewrites() {
        return [
          {
            source: '/:path*',
            destination: 'https://polygon-faucet-api.vercel.app/:path*',
          },
        ]
      },
  };
