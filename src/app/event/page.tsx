'use client'

import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string'
import { detectLocale, t, LOCALE_NAMES, Locale } from '../i18n'

interface EventData {
  n: string       // name
  d: string[]     // dates
  s: number       // startHour
  e: number       // endHour
  tz: string      // timezone
  p: { n: string, b: string }[] // participants: name + bitmask
}

function formatHour(h: number) {
  if (h === 0) return '12 AM'
  if (h < 12) return `${h} AM`
  if (h === 12) return '12 PM'
  return `${h - 12} PM`
}

function EventContent() {
  const searchParams = useSearchParams()
  const [locale, setLocale] = useState<Locale>('en')
  const [event, setEvent] = useState<EventData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [userName, setUserName] = useState('')
  const [joined, setJoined] = useState(false)
  const [selectedSlots, setSelectedSlots] = useState<Set<number>>(new Set())
  const [isDragging, setIsDragging] = useState(false)
  const [dragMode, setDragMode] = useState<'add' | 'remove'>('add')
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const [viewMode, setViewMode] = useState<'select' | 'results'>('select')
  const gridRef = useRef<HTMLDivElement>(null)
  const isMobile = typeof navigator !== 'undefined' && /Mobi|Android/i.test(navigator.userAgent)

  useEffect(() => { setLocale(detectLocale()) }, [])

  // Parse event data from URL
  useEffect(() => {
    const dataParam = searchParams.get('data')
    if (!dataParam) { setNotFound(true); setLoading(false); return }
    try {
      const decompressed = decompressFromEncodedURIComponent(dataParam)
      if (!decompressed) { setNotFound(true); setLoading(false); return }
      const parsed = JSON.parse(decompressed) as EventData
      if (!parsed.n || !parsed.d || !parsed.s === undefined) { setNotFound(true); setLoading(false); return }
      if (!parsed.p) parsed.p = []
      setEvent(parsed)
      if (parsed.p.length > 0) setViewMode('results')
    } catch {
      setNotFound(true)
    }
    setLoading(false)
  }, [searchParams])

  // Calculate total slots
  const totalSlots = event ? event.d.length * (event.e - event.s) * 2 : 0

  // Time slots array
  const timeSlots = event ? Array.from(
    { length: (event.e - event.s) * 2 },
    (_, i) => ({ hour: event.s + Math.floor(i / 2), half: i % 2 })
  ) : []

  const slotsPerDay = timeSlots.length

  // Slot index: dateIndex * slotsPerDay + slotIndex
  const getSlotIndex = (dateIdx: number, slotIdx: number) => dateIdx * slotsPerDay + slotIdx

  // Drag handlers
  const handleCellStart = useCallback((idx: number) => {
    setIsDragging(true)
    const isSelected = selectedSlots.has(idx)
    setDragMode(isSelected ? 'remove' : 'add')
    setSelectedSlots(prev => {
      const next = new Set(prev)
      if (isSelected) next.delete(idx)
      else next.add(idx)
      return next
    })
  }, [selectedSlots])

  const handleCellEnter = useCallback((idx: number) => {
    if (!isDragging) return
    setSelectedSlots(prev => {
      const next = new Set(prev)
      if (dragMode === 'add') next.add(idx)
      else next.delete(idx)
      return next
    })
  }, [isDragging, dragMode])

  const handleMouseUp = useCallback(() => { setIsDragging(false) }, [])

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('touchend', handleMouseUp)
    return () => { window.removeEventListener('mouseup', handleMouseUp); window.removeEventListener('touchend', handleMouseUp) }
  }, [handleMouseUp])

  // Touch move for mobile drag
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || !gridRef.current) return
    const touch = e.touches[0]
    const el = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement
    if (el?.dataset?.idx) handleCellEnter(parseInt(el.dataset.idx))
  }, [isDragging, handleCellEnter])

  // Join
  const joinEvent = () => {
    if (!userName.trim()) { alert(t(locale, 'enterYourName')); return }
    setJoined(true)
    setViewMode('select')
    // Load existing selections if user already responded
    if (event) {
      const existing = event.p.find(p => p.n === userName.trim())
      if (existing && existing.b) {
        const slots = new Set<number>()
        for (let i = 0; i < existing.b.length; i++) {
          if (existing.b[i] === '1') slots.add(i)
        }
        setSelectedSlots(slots)
      }
    }
  }

  // Save and generate updated URL
  const submitAvailability = () => {
    if (!event) return
    const bitmask = Array.from({ length: totalSlots }, (_, i) => selectedSlots.has(i) ? '1' : '0').join('')
    const updated = { ...event, p: [...event.p] }
    const existingIdx = updated.p.findIndex(p => p.n === userName.trim())
    if (existingIdx >= 0) {
      updated.p[existingIdx] = { n: userName.trim(), b: bitmask }
    } else {
      updated.p.push({ n: userName.trim(), b: bitmask })
    }
    setEvent(updated)

    // Update URL without reload
    const compressed = compressToEncodedURIComponent(JSON.stringify(updated))
    window.history.replaceState(null, '', `/event?data=${compressed}`)

    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    setViewMode('results')
  }

  // Copy share link
  const copyLink = async () => {
    if (!event) return
    const compressed = compressToEncodedURIComponent(JSON.stringify(event))
    const url = `${window.location.origin}/event?data=${compressed}`
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = url
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Heatmap helpers
  const getSlotCount = (idx: number) => {
    if (!event) return 0
    return event.p.filter(p => p.b && p.b[idx] === '1').length
  }

  const getHeatClass = (count: number) => {
    if (!event || event.p.length === 0) return 'heat-0'
    const ratio = count / event.p.length
    if (ratio === 0) return 'heat-0'
    if (ratio <= 0.2) return 'heat-1'
    if (ratio <= 0.35) return 'heat-2'
    if (ratio <= 0.5) return 'heat-3'
    if (ratio <= 0.65) return 'heat-4'
    if (ratio <= 0.8) return 'heat-5'
    if (ratio <= 0.95) return 'heat-6'
    return 'heat-7'
  }

  const getSlotParticipants = (idx: number) => {
    if (!event) return []
    return event.p.filter(p => p.b && p.b[idx] === '1').map(p => p.n)
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full" /></div>
  }

  if (notFound || !event) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-100 mb-2">{t(locale, 'eventNotFound')}</h1>
        <p className="text-[var(--text-secondary)] mb-6">{t(locale, 'eventNotFoundDesc')}</p>
        <a href="/" className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition">{t(locale, 'createNewEvent')}</a>
      </div>
    )
  }

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-')
    const date = new Date(parseInt(y), parseInt(m)-1, parseInt(d))
    return {
      weekday: date.toLocaleDateString(locale === 'en' ? 'en-US' : locale, { weekday: 'short' }),
      monthDay: date.toLocaleDateString(locale === 'en' ? 'en-US' : locale, { month: 'short', day: 'numeric' }),
    }
  }

  // Find best slot
  const bestSlotInfo = event.p.length > 0 ? (() => {
    let maxCount = 0
    let bestIdx = -1
    for (let i = 0; i < totalSlots; i++) {
      const count = getSlotCount(i)
      if (count > maxCount) { maxCount = count; bestIdx = i }
    }
    if (bestIdx >= 0) {
      const dateIdx = Math.floor(bestIdx / slotsPerDay)
      const slotIdx = bestIdx % slotsPerDay
      const ts = timeSlots[slotIdx]
      return { count: maxCount, date: event.d[dateIdx], hour: ts.hour, half: ts.half }
    }
    return null
  })() : null

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-10">
      {/* Language */}
      <div className="flex justify-end mb-2">
        <select value={locale} onChange={e => setLocale(e.target.value as Locale)}
          className="text-sm border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-1.5 bg-white/[0.03] text-[var(--text-muted)] outline-none">
          {(Object.keys(LOCALE_NAMES) as Locale[]).map(l => <option key={l} value={l}>{LOCALE_NAMES[l]}</option>)}
        </select>
      </div>

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-100 mb-1">{event.n}</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          {event.d.length} {event.d.length > 1 ? t(locale, 'dates') : t(locale, 'date')} &middot; {formatHour(event.s)} - {formatHour(event.e)} &middot; {event.tz.replace(/_/g, ' ')}
        </p>
        <div className="mt-3 flex flex-wrap gap-2 items-center">
          <button onClick={copyLink}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100 transition">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            {copied ? t(locale, 'copied') : t(locale, 'copyLink')}
          </button>
          <span className="text-sm text-[var(--text-muted)]">
            {event.p.length} {event.p.length !== 1 ? t(locale, 'participants') : t(locale, 'participant')}
          </span>
        </div>
      </div>

      {/* Saved notification */}
      {saved && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800">
          {t(locale, 'saved')} {t(locale, 'shareUpdatedLink')}
        </div>
      )}

      {/* Join or Switch View */}
      {!joined ? (
        <div className="bg-white/[0.03] rounded-2xl border border-[rgba(255,255,255,0.06)] p-6 mb-8 max-w-md">
          <h2 className="text-lg font-semibold text-gray-200 mb-4">{t(locale, 'enterName')}</h2>
          <input type="text" value={userName} onChange={e => setUserName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && joinEvent()}
            placeholder={t(locale, 'yourName')}
            className="w-full px-4 py-3 border border-[rgba(255,255,255,0.06)] rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-200 mb-4" maxLength={50} />
          <button onClick={joinEvent}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition">
            {t(locale, 'joinEvent')}
          </button>
          {event.p.length > 0 && (
            <button onClick={() => { setViewMode('results'); setJoined(false) }}
              className="w-full py-3 mt-2 border border-[rgba(255,255,255,0.06)] text-[var(--text-muted)] font-medium rounded-xl hover:bg-white/[0.02] transition">
              {t(locale, 'viewResults')}
            </button>
          )}
        </div>
      ) : (
        <div className="flex gap-2 mb-6">
          <button onClick={() => setViewMode('select')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${viewMode === 'select' ? 'bg-indigo-600 text-white' : 'bg-[rgba(255,255,255,0.02)] text-[var(--text-muted)] hover:bg-[rgba(255,255,255,0.04)]'}`}>
            {t(locale, 'markAvailability')}
          </button>
          <button onClick={() => setViewMode('results')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${viewMode === 'results' ? 'bg-indigo-600 text-white' : 'bg-[rgba(255,255,255,0.02)] text-[var(--text-muted)] hover:bg-[rgba(255,255,255,0.04)]'}`}>
            {t(locale, 'viewResults')}
          </button>
        </div>
      )}

      {/* Selection Grid */}
      {joined && viewMode === 'select' && (
        <div className="mb-8">
          <p className="text-sm text-[var(--text-secondary)] mb-4">{isMobile ? t(locale, 'dragInstructionMobile') : t(locale, 'dragInstruction')}</p>
          <div className="grid-container" ref={gridRef} onTouchMove={handleTouchMove}>
            <table className="w-full border-collapse min-w-[320px]">
              <thead>
                <tr>
                  <th className="w-14 sm:w-20" />
                  {event.d.map(d => {
                    const { weekday, monthDay } = formatDate(d)
                    return <th key={d} className="text-center px-0.5 pb-2"><div className="text-xs text-[var(--text-muted)]">{weekday}</div><div className="text-xs sm:text-sm font-semibold text-[var(--text-muted)]">{monthDay}</div></th>
                  })}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((ts, slotIdx) => (
                  <tr key={slotIdx}>
                    <td className="time-label text-right pr-1 sm:pr-2 text-xs text-[var(--text-muted)] align-top" style={{ paddingTop: ts.half === 0 ? 2 : 0 }}>
                      {ts.half === 0 ? formatHour(ts.hour) : ''}
                    </td>
                    {event.d.map((d, dateIdx) => {
                      const idx = getSlotIndex(dateIdx, slotIdx)
                      const isSelected = selectedSlots.has(idx)
                      return (
                        <td key={`${dateIdx}-${slotIdx}`} className="p-0">
                          <div data-idx={idx}
                            className={`availability-cell h-6 sm:h-7 border border-gray-100 cursor-pointer
                              ${isSelected ? 'bg-emerald-400' : 'bg-white/[0.02] hover:bg-[rgba(255,255,255,0.02)]'}
                              ${ts.half === 0 ? 'border-t-gray-200' : ''}`}
                            onMouseDown={e => { e.preventDefault(); handleCellStart(idx) }}
                            onMouseEnter={() => handleCellEnter(idx)}
                            onTouchStart={e => { e.preventDefault(); handleCellStart(idx) }}
                          />
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex gap-3">
            <button onClick={submitAvailability}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition">
              {t(locale, 'saveAvailability')}
            </button>
            <button onClick={() => setSelectedSlots(new Set())}
              className="px-4 py-3 border border-[rgba(255,255,255,0.06)] text-[var(--text-muted)] rounded-xl hover:bg-white/[0.02] transition text-sm">
              {t(locale, 'clearAll')}
            </button>
          </div>
        </div>
      )}

      {/* Results Heatmap */}
      {(viewMode === 'results') && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-200 mb-2">{t(locale, 'groupAvailability')}</h2>

          {event.p.length === 0 ? (
            <p className="text-[var(--text-secondary)] text-sm">{t(locale, 'noParticipants')}</p>
          ) : (
            <>
              {bestSlotInfo && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm">
                  <span className="font-semibold text-emerald-800">{t(locale, 'bestTime')}: </span>
                  <span className="text-emerald-700">
                    {formatDate(bestSlotInfo.date).monthDay} {formatHour(bestSlotInfo.hour)}{bestSlotInfo.half === 1 ? ':30' : ':00'} &mdash; {bestSlotInfo.count}/{event.p.length} {t(locale, 'available')}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-1.5 mb-4 text-xs text-[var(--text-secondary)]">
                <span>{t(locale, 'less')}</span>
                {['heat-0','heat-1','heat-2','heat-3','heat-4','heat-5','heat-6','heat-7'].map(c => <div key={c} className={`w-4 h-4 rounded ${c}`} />)}
                <span>{t(locale, 'more')}</span>
              </div>

              <div className="grid-container">
                <table className="w-full border-collapse min-w-[320px]">
                  <thead>
                    <tr>
                      <th className="w-14 sm:w-20" />
                      {event.d.map(d => {
                        const { weekday, monthDay } = formatDate(d)
                        return <th key={d} className="text-center px-0.5 pb-2"><div className="text-xs text-[var(--text-muted)]">{weekday}</div><div className="text-xs sm:text-sm font-semibold text-[var(--text-muted)]">{monthDay}</div></th>
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map((ts, slotIdx) => (
                      <tr key={slotIdx}>
                        <td className="time-label text-right pr-1 sm:pr-2 text-xs text-[var(--text-muted)] align-top" style={{ paddingTop: ts.half === 0 ? 2 : 0 }}>
                          {ts.half === 0 ? formatHour(ts.hour) : ''}
                        </td>
                        {event.d.map((d, dateIdx) => {
                          const idx = getSlotIndex(dateIdx, slotIdx)
                          const count = getSlotCount(idx)
                          const heatClass = getHeatClass(count)
                          const pNames = getSlotParticipants(idx)
                          const isHovered = hoveredSlot === idx
                          return (
                            <td key={`${dateIdx}-${slotIdx}`} className="p-0 relative">
                              <div
                                className={`availability-cell h-6 sm:h-7 border border-gray-100 cursor-pointer ${heatClass} ${ts.half === 0 ? 'border-t-gray-200' : ''}`}
                                onMouseEnter={() => setHoveredSlot(idx)}
                                onMouseLeave={() => setHoveredSlot(null)}
                                onClick={() => setHoveredSlot(isHovered ? null : idx)}
                              />
                              {isHovered && count > 0 && (
                                <div className="absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-1 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg pointer-events-none">
                                  <div className="font-semibold mb-1">{count}/{event.p.length} {t(locale, 'available')}</div>
                                  {pNames.map(name => <div key={name} className="text-[var(--text-muted)]">{name}</div>)}
                                </div>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Participants */}
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-[var(--text-muted)] mb-2">{t(locale, 'participants')} ({event.p.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {event.p.map(p => <span key={p.n} className="px-3 py-1 bg-[rgba(255,255,255,0.02)] text-[var(--text-muted)] text-sm rounded-full">{p.n}</span>)}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default function EventPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full" /></div>}>
      <EventContent />
    </Suspense>
  )
}
