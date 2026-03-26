"use client";

import { motion } from "framer-motion";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ ease: "easeOut", duration: 0.2 }}
      // ÖNEMLİ: willChange veya transform KULLANILMIYOR.
      // willChange/transform yeni bir "containing block" oluşturur ve
      // fixed position'lı elemanlar (Drawer, BottomNav, Header) hatalı konumlanır.
    >
      {children}
    </motion.div>
  );
}
