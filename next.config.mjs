/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Ajuste os domínios das imagens de produto/loja conforme a API/CDN.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
