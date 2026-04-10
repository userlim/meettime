import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'How It Works - MeetTime Free Meeting Scheduler',
  description: 'Learn how to use MeetTime to schedule group meetings. Create an event, share the link, and find the best time for everyone.',
}

export default function HowItWorks() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-4 text-gray-100">How MeetTime Works</h1>
      <p className="text-gray-500 mb-10 text-lg">Schedule group meetings in 3 simple steps. No account required.</p>

      <div className="space-y-10">
        <section className="flex gap-4">
          <div className="shrink-0 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg">1</div>
          <div>
            <h2 className="text-xl font-semibold text-gray-200 mb-2">Create an Event</h2>
            <p className="text-gray-400 leading-relaxed">
              Enter your event name, select potential dates from the calendar, choose the time range
              (e.g. 9 AM to 9 PM), and pick your timezone. Click &quot;Create Event&quot; to generate a unique link.
            </p>
          </div>
        </section>

        <section className="flex gap-4">
          <div className="shrink-0 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg">2</div>
          <div>
            <h2 className="text-xl font-semibold text-gray-200 mb-2">Share the Link</h2>
            <p className="text-gray-400 leading-relaxed">
              Copy the share link and send it to all participants via chat, email, or any messaging app.
              Participants don&apos;t need an account &mdash; they simply enter their name and start selecting times.
            </p>
          </div>
        </section>

        <section className="flex gap-4">
          <div className="shrink-0 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg">3</div>
          <div>
            <h2 className="text-xl font-semibold text-gray-200 mb-2">Mark Your Availability</h2>
            <p className="text-gray-400 leading-relaxed">
              Click and drag across the time grid to mark when you&apos;re free. The interface works on both desktop
              (mouse drag) and mobile (touch drag). Your selections are saved instantly.
            </p>
          </div>
        </section>

        <section className="flex gap-4">
          <div className="shrink-0 w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-lg">4</div>
          <div>
            <h2 className="text-xl font-semibold text-gray-200 mb-2">Find the Best Time</h2>
            <p className="text-gray-400 leading-relaxed">
              Switch to the &quot;View Results&quot; tab to see a heatmap of everyone&apos;s availability.
              Darker colors mean more people are free. Hover or tap any slot to see exactly who is available.
              The best time slot is highlighted automatically.
            </p>
          </div>
        </section>
      </div>

      <div className="mt-12 p-6 bg-indigo-50 rounded-2xl">
        <h2 className="text-xl font-semibold text-indigo-900 mb-3">Features</h2>
        <ul className="space-y-2 text-indigo-800">
          <li className="flex items-start gap-2">
            <span className="text-indigo-500 mt-1">&#10003;</span>
            <span>100% free, no signup or credit card needed</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-500 mt-1">&#10003;</span>
            <span>Automatic timezone detection and conversion</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-500 mt-1">&#10003;</span>
            <span>Mobile-friendly with touch drag support</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-500 mt-1">&#10003;</span>
            <span>Visual heatmap shows where most people overlap</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-500 mt-1">&#10003;</span>
            <span>No limit on participants</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-500 mt-1">&#10003;</span>
            <span>Works worldwide with all timezones</span>
          </li>
        </ul>
      </div>

      <div className="mt-10 text-center">
        <a href="/" className="inline-block px-8 py-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 text-lg">
          Create a Free Event Now
        </a>
      </div>
    </div>
  )
}
