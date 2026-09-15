/** @type {import('next').NextConfig} */

// A build identifier that changes on every deploy. On Vercel that's the commit
// SHA; otherwise the build timestamp. It is baked into the client bundle
// (NEXT_PUBLIC_BUILD) AND read back by /api/version, so an installed PWA running
// a stale bundle can detect a newer deploy and reload itself.
const BUILD_ID =
  (process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || '').slice(0, 12) ||
  String(Date.now());

const nextConfig = {
  reactStrictMode: true,
  env: { NEXT_PUBLIC_BUILD: BUILD_ID },
  // Ensure the OG-card fonts are bundled into the /api/og serverless function.
  outputFileTracingIncludes: {
    '/api/og': ['./app/api/og/fonts/**', './app/api/og/assets/**'],
  },
};

export default nextConfig;
