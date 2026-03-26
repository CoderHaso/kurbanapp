import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'KurbanApp - Güvenilir Kurbanlık',
    short_name: 'KurbanApp',
    description: 'Canlı yayınlı kurbanlık satın alım ve takip platformu.',
    start_url: '/',
    display: 'standalone', /* Bu sayede tarayıcı UI kaybolur, tam ekran uygulama gibi açılır */
    background_color: '#080c13',
    theme_color: '#10b981', /* Zümrüt Yeşili ana renk */
    icons: [
      {
        src: '/icon-512.svg', /* Fiziksel SVG dosyasını gösterir */
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'maskable'
      },
      {
        src: '/icon-512.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
      }
    ],
  }
}
