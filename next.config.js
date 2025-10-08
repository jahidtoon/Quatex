/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  trailingSlash: false,
  eslint: {
    // Allow production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  // Ensure dynamic chunks resolve correctly behind raw IP/port deployments
  // If you later host behind a subpath, set basePath/assetPrefix accordingly.
};
module.exports = nextConfig;
