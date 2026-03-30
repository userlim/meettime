'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function getTimezoneList() {
  try {
    return Intl.supportedValuesOf('timeZone')
  } catch {
    return ['UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Asia/Seoul', 'Asia/Tokyo']
  }
}

function getUserTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return 'UTC'
  }
}

function generateId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

function CalendarPicker({ selectedDates, onToggleDate }: { selectedDates: string[], onToggleDate: (d: string) => void }) {
  const [viewDate, setViewDate] = useState(new Date())
  const today = new Date()
  today.setHours(0,0,0,0)

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1))
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1))

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600" aria-label="Previous month">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"/></svg>
        </button>
        <span className="font-semibold text-gray-800">{MONTHS[month]} {year}</span>
        <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600" aria-label="Next month">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"/></svg>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {DAYS.map(d => <div key={d} className="text-xs font-medium text-gray-400 py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />
          const dateObj = new Date(year, month, day)
          const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
          const isPast = dateObj < today
          const isSelected = selectedDates.includes(dateStr)
          return (
            <button
              key={dateStr}
              disabled={isPast}
              onClick={() => !isPast && onToggleDate(dateStr)}
              className={`calendar-day w-full aspect-square flex items-center justify-center text-sm font-medium rounded-lg
                ${isPast ? 'disabled text-gray-300' : isSelected ? 'selected bg-indigo-600 text-white' : 'text-gray-700 hover:bg-indigo-50 cursor-pointer'}`}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function HomePage() {
  const router = useRouter()
  const [eventName, setEventName] = useState('')
  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [startHour, setStartHour] = useState(9)
  const [endHour, setEndHour] = useState(21)
  const [timezone, setTimezone] = useState(getUserTimezone())
  const [creating, setCreating] = useState(false)

  const timezones = useMemo(() => getTimezoneList(), [])

  const toggleDate = useCallback((dateStr: string) => {
    setSelectedDates(prev =>
      prev.includes(dateStr)
        ? prev.filter(d => d !== dateStr)
        : [...prev, dateStr].sort()
    )
  }, [])

  const formatHour = (h: number) => {
    if (h === 0) return '12:00 AM'
    if (h < 12) return `${h}:00 AM`
    if (h === 12) return '12:00 PM'
    return `${h - 12}:00 PM`
  }

  const hours = Array.from({ length: 24 }, (_, i) => i)

  const createEvent = () => {
    if (!eventName.trim()) { alert('Please enter an event name.'); return }
    if (selectedDates.length === 0) { alert('Please select at least one date.'); return }
    if (startHour >= endHour) { alert('End time must be after start time.'); return }

    setCreating(true)

    const eventId = generateId()
    const eventData = {
      id: eventId,
      name: eventName.trim(),
      dates: selectedDates,
      startHour,
      endHour,
      timezone,
      participants: [] as { name: string, slots: string[] }[],
      createdAt: new Date().toISOString(),
    }

    try {
      localStorage.setItem(`meettime_${eventId}`, JSON.stringify(eventData))
    } catch (e) {
      // localStorage not available
    }

    router.push(`/event/${eventId}`)
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'MeetTime',
    url: 'https://meettime-app.vercel.app',
    description: 'Free online meeting scheduler. Find the best time for everyone.',
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Find the Best Time to Meet
          </h1>
          <p className="text-gray-500 text-base sm:text-lg max-w-lg mx-auto">
            Create a free scheduling poll, share the link, and let everyone pick their available times. No signup required.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 mb-8">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Event Name</label>
            <input
              type="text"
              value={eventName}
              onChange={e => setEventName(e.target.value)}
              placeholder="e.g. Team Lunch, Study Group, Project Meeting"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-800 bg-white"
              maxLength={100}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Dates
              {selectedDates.length > 0 && (
                <span className="ml-2 text-indigo-600 font-normal">({selectedDates.length} selected)</span>
              )}
            </label>
            <CalendarPicker selectedDates={selectedDates} onToggleDate={toggleDate} />
            {selectedDates.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedDates.map(d => {
                  const [y,m,day] = d.split('-')
                  const dateObj = new Date(parseInt(y), parseInt(m)-1, parseInt(day))
                  return (
                    <span key={d} className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full">
                      {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}
                      <button onClick={() => toggleDate(d)} className="ml-1 text-indigo-400 hover:text-indigo-700">&times;</button>
                    </span>
                  )
                })}
              </div>
            )}
          </div>

          <div className="mb-6 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Earliest Time</label>
              <select value={startHour} onChange={e => setStartHour(parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-800">
                {hours.map(h => (
                  <option key={h} value={h} disabled={h >= endHour}>{formatHour(h)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Latest Time</label>
              <select value={endHour} onChange={e => setEndHour(parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-800">
                {hours.filter(h => h > 0).map(h => (
                  <option key={h} value={h} disabled={h <= startHour}>{formatHour(h)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Timezone</label>
            <select value={timezone} onChange={e => setTimezone(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-800">
              {timezones.map(tz => (
                <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>

          <button onClick={createEvent} disabled={creating}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 transition text-lg">
            {creating ? 'Creating...' : 'Create Event'}
          </button>
        </div>

        {/* How It Works */}
        <div className="mt-16 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">How It Works</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { n: '1', t: 'Create an Event', d: 'Set the event name, pick possible dates, and choose the time range.' },
              { n: '2', t: 'Share the Link', d: 'Send the unique link to all participants. No account needed.' },
              { n: '3', t: 'Find the Best Time', d: "See everyone's availability on a heatmap and pick the perfect slot." },
            ].map(({ n, t, d }) => (
              <div key={n} className="text-center p-4">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">{n}</div>
                <h3 className="font-semibold text-gray-800 mb-1">{t}</h3>
                <p className="text-sm text-gray-500">{d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-12 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {[
              { q: 'Is MeetTime free?', a: 'Yes, MeetTime is completely free. No signup, no credit card, no hidden fees.' },
              { q: 'Do participants need an account?', a: 'No. Anyone with the link can mark their availability instantly.' },
              { q: 'Does it support different timezones?', a: 'Yes! Each participant sees times in their own local timezone automatically.' },
              { q: 'How many people can join?', a: 'There is no limit. MeetTime works for groups of any size.' },
              { q: 'Can I use this on my phone?', a: 'Absolutely. MeetTime is fully optimized for mobile with touch-friendly controls.' },
              { q: 'How does the heatmap work?', a: 'Darker colors indicate more people available. Tap any slot to see who is free.' },
            ].map(({ q, a }) => (
              <details key={q} className="bg-white border border-gray-200 rounded-xl p-4 group">
                <summary className="font-medium text-gray-800 cursor-pointer list-none flex items-center justify-between">
                  {q}
                  <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                </summary>
                <p className="mt-3 text-gray-600 text-sm leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
