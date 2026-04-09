import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MeetTime',
    short_name: 'MeetTime',
    description: 'Meeting Time Zone Scheduler',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#14B8A6',
    icons: [
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  }
}
