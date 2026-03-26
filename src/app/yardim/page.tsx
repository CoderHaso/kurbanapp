"use client";

import { motion } from "framer-motion";
import { MessageCircle, Phone, HelpCircle, ChevronRight } from "lucide-react";

export default function YardimPage() {
  const SSS = [
    { s: "Kurban alımı nasıl gerçekleşiyor?", c: "Uygulama üzerinden beğendiğiniz kurbanı rezerve edip, güvenli ödeme ile satın alabilirsiniz. Kesim süreci bayram günü size canlı yayınla izletilir." },
    { s: "Hisse almak güvenli mi?", c: "Evet. Tüm hisseli hayvanlarımız veteriner kontrolünden geçer, tamamen helal kesim standartlarına uygun pay edilir." },
    { s: "Canlı yayını nereden izleyeceğim?", c: "Bayram sabahı 'Kurbanlarım' sekmesinde yer alan Canlı Yayın Odası butonu ile kesiminizi evinizden izleyebilirsiniz." },
    { s: "Sakatatları alabilecek miyim?", c: "Kesim sonrası tercih formunda sakatat tercihlerinizi (kelle, paça, ciğer vb.) isteyebilir veya vakfa bağışlayabilirsiniz." }
  ];

  return (
    <div className="min-h-screen pb-24 pt-20 px-4 max-w-2xl mx-auto">
      
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Yardım & Destek 🎧</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Bizimle iletişime geçin veya aşağıdaki sıkça sorulan sorulara göz atın.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-6"
      >
        {/* Canlı Destek */}
        <div className="grid grid-cols-2 gap-3">
          <a
            href="https://wa.me/905551234567"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-50 hover:bg-green-100 dark:bg-green-950/20 dark:hover:bg-green-950/40 border border-green-200 dark:border-green-900 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-colors group"
          >
            <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 mb-2 group-hover:scale-110 transition-transform">
              <MessageCircle size={22} />
            </div>
            <h3 className="font-bold text-sm text-green-700 dark:text-green-400">WhatsApp</h3>
            <p className="text-[10px] text-green-600 dark:text-green-500 mt-0.5">7/24 Canlı Destek</p>
          </a>

          <a
            href="tel:+905551234567"
            className="bg-[var(--bg-secondary)] hover:bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-colors group"
          >
            <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 mb-2 group-hover:scale-110 transition-transform">
              <Phone size={22} />
            </div>
            <h3 className="font-bold text-sm text-blue-600 dark:text-blue-400">Müşteri HD</h3>
            <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">09:00 - 18:00</p>
          </a>
        </div>

        {/* SSS */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-[var(--border-color)] flex items-center gap-2">
            <HelpCircle size={18} className="text-[var(--accent-main)]" />
            <h2 className="font-bold text-sm uppercase tracking-wider text-[var(--text-secondary)]">Sıkça Sorulan Sorular</h2>
          </div>
          <div className="divide-y divide-[var(--border-color)]">
            {SSS.map((item, i) => (
              <details key={i} className="group p-4 bg-[var(--bg-secondary)] hover:bg-[var(--bg-primary)] transition-colors cursor-pointer">
                <summary className="font-semibold text-sm text-[var(--text-primary)] list-none flex justify-between items-center outline-none">
                  {item.s}
                  <ChevronRight size={16} className="text-[var(--text-secondary)] group-open:rotate-90 transition-transform" />
                </summary>
                <p className="text-xs text-[var(--text-secondary)] mt-3 leading-relaxed border-l-2 border-[var(--accent-main)] pl-3">
                  {item.c}
                </p>
              </details>
            ))}
          </div>
        </div>

      </motion.div>
    </div>
  );
}
