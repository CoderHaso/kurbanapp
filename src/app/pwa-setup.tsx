"use client";

import { useEffect } from "react";

export function PWASetup() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Sayfa tam yüklendiğinde Service Worker'ı arkada kaydeder
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js")
          .then((reg) => console.log("[KurbanApp PWA] Service Worker kaydedildi:", reg.scope))
          .catch((err) => console.error("[KurbanApp PWA] Service Worker hatası:", err));
      });
    }
  }, []);

  return null;
}
