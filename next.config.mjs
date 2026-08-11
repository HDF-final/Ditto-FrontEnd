/** @type {import('next').NextConfig} */
const nextConfig = {

  images: {
    // Place hero/product photos are served from Unsplash in the sample data.
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
  allowedDevOrigins: ["127.0.0.1", "192.168.2.181"],
};

export default nextConfig;
