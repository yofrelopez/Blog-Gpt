/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains:
    [
      'cdn.auth0.com',
      'lh3.googleusercontent.com',
      's.gravatar.com',
    ],
  },
}

module.exports = nextConfig
