import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service - MeetTime',
  description: 'Terms of Service for MeetTime scheduling tool.',
  robots: { index: false, follow: true },
}

export default function Terms() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-gray-100">Terms of Service</h1>
      <p className="text-sm text-[var(--text-secondary)] mb-8">Last updated: March 30, 2026</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-gray-200">Acceptance of Terms</h2>
        <p className="text-[var(--text-muted)] leading-relaxed">
          By using MeetTime, you agree to these Terms of Service. If you do not agree, please do not use the site.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-gray-200">Use of Service</h2>
        <p className="text-[var(--text-muted)] leading-relaxed">
          MeetTime is provided free of charge for personal and commercial use. You agree not to misuse the service or attempt to access it using methods other than the interface provided.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-gray-200">Data and Privacy</h2>
        <p className="text-[var(--text-muted)] leading-relaxed">
          Event data is stored locally in participants&apos; browsers and shared through encoded URLs. We do not store your scheduling data on any server.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-gray-200">Advertisements</h2>
        <p className="text-[var(--text-muted)] leading-relaxed">
          This site displays advertisements through Google AdSense. Ad content is managed by Google and we are not responsible for the content of these advertisements.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-gray-200">Limitation of Liability</h2>
        <p className="text-[var(--text-muted)] leading-relaxed">
          MeetTime is provided &quot;as is&quot; without warranties. We are not liable for any damages arising from your use of this website or reliance on scheduling data.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-gray-200">Contact</h2>
        <p className="text-[var(--text-muted)] leading-relaxed">
          Questions? Contact us at lth1283910@gmail.com.
        </p>
      </section>
    </div>
  )
}
