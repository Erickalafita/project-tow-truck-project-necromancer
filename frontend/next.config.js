/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*', // Using port 3001
      },
      {
        source: '/auth/:path*',
        destination: 'http://localhost:3001/api/auth/:path*', // Direct auth paths
      },
    ]
  },
}

module.exports = nextConfig 