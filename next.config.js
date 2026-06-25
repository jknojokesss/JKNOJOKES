/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['lh3.googleusercontent.com', 'storage.googleapis.com'],
  },
  async rewrites() {
    // On the saratogashteibel.org domain, the bare root serves the vote ballot.
    // Scoped by host so jknojokes.com's root is unaffected.
    return [
      {
        source: '/',
        has: [{ type: 'host', value: 'saratogashteibel.org' }],
        destination: '/shul-vote',
      },
      {
        source: '/',
        has: [{ type: 'host', value: 'www.saratogashteibel.org' }],
        destination: '/shul-vote',
      },
    ]
  },
}

module.exports = nextConfig
