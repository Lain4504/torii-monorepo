/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui", "@workspace/data-access"],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-f9fde820e02a4976b08ee6caab4a7c92.r2.dev',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
}

export default nextConfig
