/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Strict Mode 해제

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "handtris.s3.ap-northeast-2.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;
