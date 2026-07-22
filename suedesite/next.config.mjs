/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ensure the OG-card fonts are bundled into the /api/og serverless function.
  outputFileTracingIncludes: {
    '/api/og': ['./app/api/og/fonts/**'],
  },
};

export default nextConfig;
