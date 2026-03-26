import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Capacitor ile APK üretmek için static export modu
  // Vercel deploymentında yoruma alınabilir (Vercel kendi optimizasyonunu kullanır)
  // output: "export",
  images: {
    unoptimized: true, // Static export için gerekli
  },
};

export default nextConfig;
