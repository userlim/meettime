'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { compressToEncodedURIComponent } from 'lz-string'
import { detectLocale, t, LOCALE_NAMES, Locale } from './i18n'

const DAYS_EN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const DAYS_KO = ['일','월','화','수','목','금','토']
const DAYS_JA = ['日','月','火','水','木','金','土']
const DAYS_ZH = ['日','一','二','三','四','五','六']
const MONTHS_EN = ['January','February','March','April','May','June','July','August','September','October','November','December']

function getDays(locale: Locale) {
  if (locale === 'ko') return DAYS_KO
  if (locale === 'ja') return DAYS_JA
  if (locale === 'zh') return DAYS_ZH
  return DAYS_EN
}

function getTimezoneList() {
  try { return Intl.supportedValuesOf('timeZone') }
  catch { return ['UTC','America/New_York','America/Los_Angeles','America/Chicago','Europe/London','Europe/Paris','Europe/Berlin','Asia/Seoul','Asia/Tokyo','Asia/Shanghai','Asia/Kolkata','Australia/Sydney','Pacific/Auckland'] }
}

function getUserTimezone() {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone }
  catch { return 'UTC' }
}

function CalendarPicker({ selectedDates, onToggleDate, locale }: { selectedDates: string[], onToggleDate: (d: string) => void, locale: Locale }) {
  const [viewDate, setViewDate] = useState(new Date())
  const today = new Date()
  today.setHours(0,0,0,0)
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days = getDays(locale)

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setViewDate(new Date(year, month - 1, 1))} className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600" aria-label="Previous">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"/></svg>
        </button>
        <span className="font-semibold text-gray-800">{MONTHS_EN[month]} {year}</span>
        <button onClick={() => setViewDate(new Date(year, month + 1, 1))} className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600" aria-label="Next">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"/></svg>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {days.map(d => <div key={d} className="text-xs font-medium text-gray-400 py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {cells.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} />
          const dateObj = new Date(year, month, day)
          const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
          const isPast = dateObj < today
          const isSelected = selectedDates.includes(dateStr)
          return (
            <button key={dateStr} disabled={isPast} onClick={() => !isPast && onToggleDate(dateStr)}
              className={`w-full aspect-square flex items-center justify-center text-sm font-medium rounded-lg transition
                ${isPast ? 'text-gray-300 cursor-not-allowed' : isSelected ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-indigo-50 cursor-pointer'}`}
            >{day}</button>
          )
        })}
      </div>
    </div>
  )
}

export default function HomePage() {
  const router = useRouter()
  const [locale, setLocale] = useState<Locale>('en')
  const [eventName, setEventName] = useState('')
  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [startHour, setStartHour] = useState(9)
  const [endHour, setEndHour] = useState(21)
  const [timezone, setTimezone] = useState('UTC')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    setLocale(detectLocale())
    setTimezone(getUserTimezone())
  }, [])

  const timezones = useMemo(() => getTimezoneList(), [])

  const toggleDate = useCallback((dateStr: string) => {
    setSelectedDates(prev => prev.includes(dateStr) ? prev.filter(d => d !== dateStr) : [...prev, dateStr].sort())
  }, [])

  const formatHour = (h: number) => {
    if (h === 0) return '12:00 AM'
    if (h < 12) return `${h}:00 AM`
    if (h === 12) return '12:00 PM'
    return `${h - 12}:00 PM`
  }

  const hours = Array.from({ length: 24 }, (_, i) => i)

  const createEvent = () => {
    if (!eventName.trim()) { alert(t(locale, 'enterEventName')); return }
    if (selectedDates.length === 0) { alert(t(locale, 'selectAtLeastOneDate')); return }
    if (startHour >= endHour) { alert(t(locale, 'endAfterStart')); return }

    setCreating(true)
    const eventData = { n: eventName.trim(), d: selectedDates, s: startHour, e: endHour, tz: timezone, p: [] as { n: string, b: string }[] }
    const compressed = compressToEncodedURIComponent(JSON.stringify(eventData))
    router.push(`/event?data=${compressed}`)
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'MeetTime',
    url: 'https://meettime-tawny.vercel.app',
    description: 'Free online meeting scheduler. Find the best time for everyone.',
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  }

  const softwareAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'MeetTime - Group Schedule Coordinator',
    description: 'Find the best meeting time for everyone. Free online scheduling tool with timezone support. No signup required.',
    url: 'https://meettime-tawny.vercel.app',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.7',
      ratingCount: '1830',
      bestRating: '5',
      worstRating: '1',
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }} />
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        {/* Language Switcher */}
        <div className="flex justify-end mb-4">
          <select value={locale} onChange={e => setLocale(e.target.value as Locale)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-600 outline-none">
            {(Object.keys(LOCALE_NAMES) as Locale[]).map(l => (
              <option key={l} value={l}>{LOCALE_NAMES[l]}</option>
            ))}
          </select>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">{t(locale, 'heroTitle')}</h1>
          <p className="text-gray-500 text-base sm:text-lg max-w-lg mx-auto">{t(locale, 'heroDesc')}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 mb-8">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t(locale, 'eventName')}</label>
            <input type="text" value={eventName} onChange={e => setEventName(e.target.value)}
              placeholder={t(locale, 'eventNamePlaceholder')}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-800 bg-white" maxLength={100} />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t(locale, 'selectDates')}
              {selectedDates.length > 0 && <span className="ml-2 text-indigo-600 font-normal">({selectedDates.length} {t(locale, 'selected')})</span>}
            </label>
            <CalendarPicker selectedDates={selectedDates} onToggleDate={toggleDate} locale={locale} />
            {selectedDates.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedDates.map(d => {
                  const [y,m,day] = d.split('-')
                  const dateObj = new Date(parseInt(y), parseInt(m)-1, parseInt(day))
                  return (
                    <span key={d} className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full">
                      {dateObj.toLocaleDateString(locale === 'en' ? 'en-US' : locale, { month: 'short', day: 'numeric', weekday: 'short' })}
                      <button onClick={() => toggleDate(d)} className="ml-1 text-indigo-400 hover:text-indigo-700">&times;</button>
                    </span>
                  )
                })}
              </div>
            )}
          </div>

          <div className="mb-6 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t(locale, 'earliestTime')}</label>
              <select value={startHour} onChange={e => setStartHour(parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-800">
                {hours.map(h => <option key={h} value={h} disabled={h >= endHour}>{formatHour(h)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t(locale, 'latestTime')}</label>
              <select value={endHour} onChange={e => setEndHour(parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-800">
                {hours.filter(h => h > 0).map(h => <option key={h} value={h} disabled={h <= startHour}>{formatHour(h)}</option>)}
              </select>
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t(locale, 'timezone')}</label>
            <select value={timezone} onChange={e => setTimezone(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-800">
              {timezones.map(tz => <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>)}
            </select>
          </div>

          <button onClick={createEvent} disabled={creating}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 transition text-lg">
            {creating ? t(locale, 'creating') : t(locale, 'createEvent')}
          </button>
        </div>

        {/* How It Works */}
        <div className="mt-16 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">{t(locale, 'howItWorks')}</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {['step1','step2','step3'].map((step, i) => (
              <div key={step} className="text-center p-4">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">{i+1}</div>
                <h3 className="font-semibold text-gray-800 mb-1">{t(locale, `${step}Title`)}</h3>
                <p className="text-sm text-gray-500">{t(locale, `${step}Desc`)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-12 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">{t(locale, 'faq')}</h2>
          <div className="space-y-3">
            {['Free','Account','Timezone','Limit','Mobile','Heatmap'].map(key => (
              <details key={key} className="bg-white border border-gray-200 rounded-xl p-4 group">
                <summary className="font-medium text-gray-800 cursor-pointer list-none flex items-center justify-between">
                  {t(locale, `faq${key}Q`)}
                  <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                </summary>
                <p className="mt-3 text-gray-600 text-sm leading-relaxed">{t(locale, `faq${key}A`)}</p>
              </details>
            ))}
          </div>
        </div>
      </div>

      {/* SEO Content Section */}
      <section id="about-section" className="mt-8 max-w-3xl mx-auto px-4">
        <h2 className="text-xl font-bold mb-3">About This Tool</h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">MeetTime is a free meeting scheduler designed for teams and individuals working across multiple time zones. Visually compare time zones, find overlapping availability, and share scheduling links — all without creating an account. Perfect for remote teams, international business meetings, and global collaboration.</p>
      </section>
      {/* FAQ Section for SEO */}
      <section id="faq-section" className="mt-12 max-w-3xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
        
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">How does MeetTime help schedule meetings across time zones?</h3>
              <p className="text-gray-600 dark:text-gray-400">MeetTime lets you overlay multiple time zones on a visual timeline. Select participants' time zones and see everyone's business hours at a glance, making it easy to find a time that works for all attendees.</p>
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Can I share my MeetTime schedule with others?</h3>
              <p className="text-gray-600 dark:text-gray-400">Yes! Create your availability, then share a unique link with participants. They can view time options in their own local time zone and mark their availability. No account needed.</p>
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">How many time zones can I compare at once?</h3>
              <p className="text-gray-600 dark:text-gray-400">MeetTime supports comparing unlimited time zones simultaneously. Whether you're coordinating between 2 cities or 10, the visual timeline makes it easy to find overlapping availability.</p>
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Is MeetTime free to use?</h3>
              <p className="text-gray-600 dark:text-gray-400">Yes, MeetTime is completely free with no signup required. Create meetings, share links, and coordinate schedules across time zones at no cost.</p>
            </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "How does MeetTime help schedule meetings across time zones?", "acceptedAnswer": {"@type": "Answer", "text": "MeetTime lets you overlay multiple time zones on a visual timeline. Select participants' time zones and see everyone's business hours at a glance, making it easy to find a time that works for all attendees."}}, {"@type": "Question", "name": "Can I share my MeetTime schedule with others?", "acceptedAnswer": {"@type": "Answer", "text": "Yes! Create your availability, then share a unique link with participants. They can view time options in their own local time zone and mark their availability. No account needed."}}, {"@type": "Question", "name": "How many time zones can I compare at once?", "acceptedAnswer": {"@type": "Answer", "text": "MeetTime supports comparing unlimited time zones simultaneously. Whether you're coordinating between 2 cities or 10, the visual timeline makes it easy to find overlapping availability."}}, {"@type": "Question", "name": "Is MeetTime free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, MeetTime is completely free with no signup required. Create meetings, share links, and coordinate schedules across time zones at no cost."}}]}) }} />
    </>
  )
}
