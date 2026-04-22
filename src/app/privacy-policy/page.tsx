import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - MeetTime',
  description: 'Privacy Policy for MeetTime scheduling tool.',
  robots: { index: false, follow: true },
}

export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-gray-100">Privacy Policy</h1>
      <p className="text-sm text-[#4E5968] mb-8">Last updated: March 30, 2026</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-gray-200">Information We Collect</h2>
        <p className="text-[#8B95A1] leading-relaxed">
          MeetTime does not collect personal information directly. Event data (names and availability selections) is stored locally in your browser. We use Google Analytics to understand how visitors interact with our website, which may include browser type, referring site, and visit timestamps.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-gray-200">Cookies</h2>
        <p className="text-[#8B95A1] leading-relaxed">
          We use cookies through third-party services like Google Analytics and Google AdSense. These cookies help us analyze website traffic and serve relevant advertisements. You can control cookie settings through your browser preferences.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-gray-200">Google AdSense</h2>
        <p className="text-[#8B95A1] leading-relaxed">
          We use Google AdSense to display advertisements. Google AdSense may use cookies and web beacons to serve ads based on your prior visits. You can opt out of personalized advertising by visiting Google Ads Settings.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-gray-200">Google Analytics</h2>
        <p className="text-[#8B95A1] leading-relaxed">
          We use Google Analytics to analyze website usage. Google Analytics gathers information through cookies. You can opt out by installing the Google Analytics Opt-out Browser Add-on.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-gray-200">Data Storage</h2>
        <p className="text-[#8B95A1] leading-relaxed">
          Event scheduling data is stored in your browser&apos;s local storage and shared via encoded URLs. This data is not transmitted to or stored on our servers.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-gray-200">Contact</h2>
        <p className="text-[#8B95A1] leading-relaxed">
          If you have any questions about this Privacy Policy, contact us at lth1283910@gmail.com.
        </p>
      </section>
    </div>
  )
}
