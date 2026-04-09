import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'MeetTime - Schedule Across Time Zones'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 40,
          background: 'linear-gradient(135deg, #14B8A6 0%, #14B8A6dd 50%, #14B8A6bb 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'sans-serif',
          padding: '40px',
        }}
      >
        <div style={{ fontSize: 80, marginBottom: 16 }}>🕐</div>
        <div style={{ fontSize: 56, fontWeight: 'bold', textAlign: 'center', marginBottom: 12, textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
          MeetTime
        </div>
        <div style={{ fontSize: 28, opacity: 0.9, textAlign: 'center', maxWidth: '80%' }}>
          Schedule Across Time Zones
        </div>
        <div style={{ fontSize: 20, marginTop: 24, opacity: 0.75, background: 'rgba(255,255,255,0.15)', padding: '8px 24px', borderRadius: 20 }}>
          Free Online Tool • 2026
        </div>
      </div>
    ),
    { ...size }
  )
}
