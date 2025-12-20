import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@workspace/ui', '@workspace/dtos', '@workspace/protocol'],
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
