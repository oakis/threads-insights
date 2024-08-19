/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/threads-insights",
  output: "export",
  reactStrictMode: true,
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
};

export default nextConfig;
