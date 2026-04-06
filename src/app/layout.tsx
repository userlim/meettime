import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  title: 'MeetTime - Free Group Schedule Coordinator | Find the Best Meeting Time',
  description: 'Free online meeting scheduler. Create an event, share the link, and find the perfect time for everyone. Supports timezones worldwide. No signup required.',
  keywords: [
    'meeting scheduler', 'group schedule', 'find meeting time', 'when to meet',
    'availability poll', 'schedule coordinator', 'time picker', 'free meeting planner',
    'group availability', 'team scheduling tool', 'meeting time finder',
  ],
  metadataBase: new URL('https://meettime-tawny.vercel.app'),
  openGraph: {
    title: 'MeetTime - Find the Best Meeting Time for Everyone',
    description: 'Create a free scheduling poll. Share the link and let everyone mark their available times. No signup needed.',
    type: 'website',
    siteName: 'MeetTime',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MeetTime - Free Group Schedule Coordinator',
    description: 'Find the perfect meeting time for your group. Free, fast, no signup.',
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  },
  icons: { icon: '/favicon.svg' },
  alternates: { canonical: '/' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="google-site-verification" content="hsjncRi9cl3tz3Otd6SJKurSt_V1bZ0AKO-bdWIGeHM" />
        <meta name="google-site-verification" content="ETO59LUETFhBHTx7GMun0GscvJgzLq2iGWdeAmh3e10" />
        <meta name="google-adsense-account" content="ca-pub-4361110443201092" />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4361110443201092" crossOrigin="anonymous"></script>
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-P04TH8XJJ9" strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-P04TH8XJJ9');`}
        </Script>
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <a href="/" className="text-xl font-bold text-indigo-600 flex items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              MeetTime
            </a>
            <a href="/" className="text-sm text-gray-500 hover:text-indigo-600 transition">New Event</a>
          </div>
        </header>
        <main className="flex-1">
          {children}
        </main>
        <footer className="border-t border-gray-200 bg-white py-6 text-center text-sm text-gray-400">
          <div className="flex flex-wrap justify-center gap-4 mb-3">
            <a href="/privacy-policy" className="text-indigo-500 hover:text-indigo-700 text-xs">Privacy Policy</a>
            <a href="/terms" className="text-indigo-500 hover:text-indigo-700 text-xs">Terms of Service</a>
            <a href="/how-it-works" className="text-indigo-500 hover:text-indigo-700 text-xs">How It Works</a>
          </div>
          &copy; 2026 MeetTime. Free for everyone.
        </footer>
      </body>
    </html>
  )
}
