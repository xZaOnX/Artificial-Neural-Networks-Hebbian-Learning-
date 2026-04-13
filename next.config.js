/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    if (process.env.NODE_ENV !== "development") {
      return [];
    }

    const localApiOrigin = process.env.LOCAL_API_ORIGIN ?? "http://127.0.0.1:5328";

    return [
      {
        source: "/api/:path*",
        destination: `${localApiOrigin}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
