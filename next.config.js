/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'sonoff.tech','static.tp-link.com','ezviz.com',
      'images.unsplash.com','picsum.photos','placehold.co',
      'asg.com.eg','aura.eg','www.amazon.eg',
    ],
    unoptimized: true,
  },
  experimental: { serverActions: true },
}
module.exports = nextConfig
