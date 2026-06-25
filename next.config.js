/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['lh3.googleusercontent.com', 'storage.googleapis.com'],
  },
  async rewrites() {
    // beforeFiles so this runs BEFORE the filesystem route (index.js login page).
    return {
      beforeFiles: [
        {
          source: '/',
          has: [{ type: 'host', value: 'saratogashteibel.org' }],
          destination: '/saratoga-home',
        },
        {
          source: '/',
          has: [{ type: 'host', value: 'www.saratogashteibel.org' }],
          destination: '/saratoga-home',
        },
      ],
    }
  },
}

module.exports = nextConfig
