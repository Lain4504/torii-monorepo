/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui", "@workspace/data-access"],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-f9fde820e02a4976b08ee6caab4a7c92.r2.dev',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://35.239.151.115:8080/api/:path*',
      },
    ];
  },
}

export default nextConfig
