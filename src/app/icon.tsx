import { ImageResponse } from 'next/og'

export const size = {
  width: 512,
  height: 512,
}
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 340,
          background: '#10b981', // Emerald Yeşil Ana Renk
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: '128px', // Mobil cihaz uygulamasındaki gibi hafif oval
          fontWeight: 'bold',
          border: '15px solid #059669' // Hafif çerçeve
        }}
      >
        K
      </div>
    ),
    { ...size }
  )
}
