/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Place hero/product photos are served from Unsplash in the sample data.
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
};

export default nextConfig;
