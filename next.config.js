/** @type {import('next').NextConfig} */
const nextConfig = {
  // Set to false to disable React Strict Mode double-invocation in development
  // Note: Strict Mode helps catch bugs, but causes double-fetch during development
  // In production builds, Strict Mode is always disabled regardless of this setting
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com'],
  },
}

module.exports = nextConfig
