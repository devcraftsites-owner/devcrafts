/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  watchOptions: {
    pollIntervalMs: 300,
  },
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
