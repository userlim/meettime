import type { Metadata } from 'next'
import './globals.css'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'MeetTime (Free, 2026) – Schedule Meetings Across Time Zones Instantly',
  description: 'Find the perfect meeting time across any time zone. Visual scheduler, shareable links, no signup. Free tool for remote teams and international scheduling.',
  keywords: 'time zone converter, meeting time planner, world clock meeting scheduler, schedule across time zones, best time to meet, time zone meeting finder, when to schedule call, international meeting planner, overlap hours calculator, remote team scheduler, cross timezone planner, meeting time converter, team time zone tool, global meeting scheduler free, find common meeting time',
  metadataBase: new URL('https://meettime-tawny.vercel.app'),
  openGraph: {
    title: 'MeetTime (Free, 2026) – Schedule Meetings Across Time Zones Instantly',
    description: 'Find the perfect meeting time across any time zone. Visual scheduler, shareable links, no signup. Free tool for remote teams and international scheduling.',
    url: 'https://meettime-tawny.vercel.app',
    siteName: 'MeetTime',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MeetTime',
    description: 'Find the perfect meeting time across any time zone. Visual scheduler, shareable links, no signup. Free tool for remote teams and international scheduling.',
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large' as const,
    'max-snippet': -1,
    'max-video-preview': -1,
  },
  icons: { icon: '/favicon.svg' },
  alternates: {
    canonical: 'https://meettime-tawny.vercel.app',
    languages: {
      'en': 'https://meettime-tawny.vercel.app',
      'x-default': 'https://meettime-tawny.vercel.app',
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="google-site-verification" content="hsjncRi9cl3tz3Otd6SJKurSt_V1bZ0AKO-bdWIGeHM" />
        <meta name="google-site-verification" content="ETO59LUETFhBHTx7GMun0GscvJgzLq2iGWdeAmh3e10" />
        <meta name="google-adsense-account" content="ca-pub-4361110443201092" />
        <Script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4361110443201092" crossOrigin="anonymous" strategy="afterInteractive" />
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-P04TH8XJJ9" strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-P04TH8XJJ9');`}
        </Script>
              {/* BreadcrumbList Schema */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://meettime-tawny.vercel.app"}, {"@type": "ListItem", "position": 2, "name": "MeetTime", "item": "https://meettime-tawny.vercel.app"}]})
        }} />
        {/* Organization & WebSite Schema */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({"@context": "https://schema.org", "@type": "WebSite", "name": "MeetTime", "url": "https://meettime-tawny.vercel.app", "publisher": {"@type": "Organization", "name": "UtiliCalc Tools", "url": "https://utilicalc.vercel.app", "logo": {"@type": "ImageObject", "url": "https://meettime-tawny.vercel.app/favicon.svg"}}, "potentialAction": {"@type": "SearchAction", "target": "https://meettime-tawny.vercel.app/?q={search_term_string}", "query-input": "required name=search_term_string"}})
        }} />
        {/* Preconnect & DNS-Prefetch Hints */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        {/* Speakable Schema */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({"@context": "https://schema.org", "@type": "WebPage", "speakable": {"@type": "SpeakableSpecification", "cssSelector": ["h1", ".keyword-seo-section p"]}})
        }} />
</head>
      <body className="antialiased">
        <header className="border-b border-[rgba(255,255,255,0.06)] bg-white sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <a href="/" className="text-xl font-bold text-indigo-600 flex items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              MeetTime
            </a>
            <a href="/" className="text-sm text-[var(--text-secondary)] hover:text-indigo-600 transition">New Event</a>
          </div>
        </header>
        <main className="flex-1">
          {children}
        </main>
        <footer className="border-t border-[rgba(255,255,255,0.06)] bg-white py-6 text-center text-sm text-[var(--text-muted)]">
          
            <div className="flex flex-wrap justify-center gap-4 mb-3">
              <span className="text-xs text-[var(--text-secondary)] font-semibold uppercase tracking-wider">Related Free Tools:</span>
                <a href="https://timezone-converter-ashy.vercel.app" target="_blank" rel="noopener noreferrer" className="text-[var(--text-muted)] hover:text-white transition-colors text-xs">World Timezone Converter</a>
                <a href="https://emoji-copy-app.vercel.app" target="_blank" rel="noopener noreferrer" className="text-[var(--text-muted)] hover:text-white transition-colors text-xs">Emoji Copy & Paste Tool</a>
                <a href="https://military-draft-calculator.vercel.app" target="_blank" rel="noopener noreferrer" className="text-[var(--text-muted)] hover:text-white transition-colors text-xs">Military Draft Age Calculator</a>
                <a href="https://bmi-calculator-free.vercel.app" target="_blank" rel="noopener noreferrer" className="text-[var(--text-muted)] hover:text-white transition-colors text-xs">Free BMI Calculator</a>
                <a href="https://utilicalc.vercel.app" target="_blank" rel="noopener noreferrer" className="text-[var(--text-muted)] hover:text-white transition-colors text-xs">UtiliCalc All-in-One Tools</a>
            </div>
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
