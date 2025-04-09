/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    esmExternals: 'loose'
  },
  webpack: (config) => {
    config.externals = [...config.externals, { canvas: "canvas" }]; // required to make pdfjs work
    return config;
  },
  // 禁用服务器端渲染这些包，因为它们依赖于浏览器API
  transpilePackages: ['framer-motion', 'string-similarity', 'use-sound'],
};

module.exports = nextConfig;