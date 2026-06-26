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
  async redirects() {
    // This repo now serves ONLY the Saratoga vote + donation. The leftover JK
    // client-portal pages are dead weight here — bounce them to the donation
    // home so the portal is unreachable from this domain.
    return ['/dashboard', '/financials', '/reset-password'].map((source) => ({
      source,
      destination: '/saratoga-home',
      permanent: false,
    }))
  },
}

module.exports = nextConfig
