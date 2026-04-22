'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'

interface Participant {
  name: string
  slots: string[]
}

interface EventData {
  id: string
  name: string
  dates: string[]
  startHour: number
  endHour: number
  timezone: string
  participants: Participant[]
  createdAt: string
}

function formatHour(h: number) {
  if (h === 0) return '12 AM'
  if (h < 12) return `${h} AM`
  if (h === 12) return '12 PM'
  return `${h - 12} PM`
}

function formatSlotTime(h: number) {
  const hour = Math.floor(h)
  const min = (h - hour) * 60
  const ampm = hour < 12 ? 'AM' : 'PM'
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  return `${displayHour}:${String(min).padStart(2, '0')} ${ampm}`
}

export default function EventPage() {
  const params = useParams()
  const eventId = params.id as string

  const [event, setEvent] = useState<EventData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [userName, setUserName] = useState('')
  const [joined, setJoined] = useState(false)
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set())
  const [isDragging, setIsDragging] = useState(false)
  const [dragMode, setDragMode] = useState<'add' | 'remove'>('add')
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [viewMode, setViewMode] = useState<'select' | 'results'>('select')

  const gridRef = useRef<HTMLDivElement>(null)

  // Load event from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`meettime_${eventId}`)
      if (raw) {
        setEvent(JSON.parse(raw))
      } else {
        // Try to load from URL hash (shared data)
        const hash = window.location.hash.slice(1)
        if (hash) {
          try {
            const decoded = JSON.parse(decodeURIComponent(atob(hash)))
            setEvent(decoded)
            localStorage.setItem(`meettime_${eventId}`, JSON.stringify(decoded))
          } catch {
            setNotFound(true)
          }
        } else {
          setNotFound(true)
        }
      }
    } catch {
      setNotFound(true)
    }
    setLoading(false)
  }, [eventId])

  // Generate time slots
  const getSlotKey = (date: string, hour: number, half: number) => {
    return `${date}_${hour}_${half}`
  }

  const timeSlots = event ? Array.from(
    { length: (event.endHour - event.startHour) * 2 },
    (_, i) => {
      const hour = event.startHour + Math.floor(i / 2)
      const half = i % 2
      return { hour, half, label: half === 0 ? formatHour(hour) : '' }
    }
  ) : []

  // Mouse/touch handlers for drag selection
  const handleCellStart = useCallback((slotKey: string) => {
    setIsDragging(true)
    const isSelected = selectedSlots.has(slotKey)
    setDragMode(isSelected ? 'remove' : 'add')
    setSelectedSlots(prev => {
      const next = new Set(prev)
      if (isSelected) next.delete(slotKey)
      else next.add(slotKey)
      return next
    })
  }, [selectedSlots])

  const handleCellEnter = useCallback((slotKey: string) => {
    if (!isDragging) return
    setSelectedSlots(prev => {
      const next = new Set(prev)
      if (dragMode === 'add') next.add(slotKey)
      else next.delete(slotKey)
      return next
    })
  }, [isDragging, dragMode])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('touchend', handleMouseUp)
    return () => {
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchend', handleMouseUp)
    }
  }, [handleMouseUp])

  // Join event
  const joinEvent = () => {
    if (!userName.trim()) { alert('Please enter your name.'); return }
    setJoined(true)
    setViewMode('select')
  }

  // Submit availability
  const submitAvailability = () => {
    if (!event) return
    const updated = { ...event }
    const existingIdx = updated.participants.findIndex(p => p.name === userName.trim())
    const participant = { name: userName.trim(), slots: Array.from(selectedSlots) }

    if (existingIdx >= 0) {
      updated.participants[existingIdx] = participant
    } else {
      updated.participants.push(participant)
    }

    setEvent(updated)
    localStorage.setItem(`meettime_${eventId}`, JSON.stringify(updated))
    setViewMode('results')
  }

  // Copy share link
  const copyLink = async () => {
    if (!event) return
    const encoded = btoa(encodeURIComponent(JSON.stringify(event)))
    const url = `${window.location.origin}/event/${eventId}#${encoded}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      const input = document.createElement('input')
      input.value = url
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Heatmap calculation
  const getSlotCount = (slotKey: string) => {
    if (!event) return 0
    return event.participants.filter(p => p.slots.includes(slotKey)).length
  }

  const getHeatClass = (count: number) => {
    if (!event || event.participants.length === 0) return 'heat-0'
    const max = event.participants.length
    const ratio = count / max
    if (ratio === 0) return 'heat-0'
    if (ratio <= 0.15) return 'heat-1'
    if (ratio <= 0.3) return 'heat-2'
    if (ratio <= 0.45) return 'heat-3'
    if (ratio <= 0.6) return 'heat-4'
    if (ratio <= 0.75) return 'heat-5'
    if (ratio <= 0.9) return 'heat-6'
    return 'heat-7'
  }

  const getSlotParticipants = (slotKey: string) => {
    if (!event) return []
    return event.participants.filter(p => p.slots.includes(slotKey)).map(p => p.name)
  }

  // Touch handler for grid
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || !gridRef.current) return
    const touch = e.touches[0]
    const target = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement
    if (target?.dataset?.slotkey) {
      handleCellEnter(target.dataset.slotkey)
    }
  }, [isDragging, handleCellEnter])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">?</div>
        <h1 className="text-2xl font-bold text-gray-100 mb-2">Event Not Found</h1>
        <p className="text-[#4E5968] mb-6">This event link may have expired or is invalid.</p>
        <a href="/" className="inline-block px-6 py-3 bg-indigo-600 text-[#191F28] rounded-xl hover:bg-indigo-700 transition">
          Create New Event
        </a>
      </div>
    )
  }

  if (!event) return null

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-')
    const date = new Date(parseInt(y), parseInt(m)-1, parseInt(d))
    return {
      weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
      monthDay: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }
  }

  // Find the best time slot
  const bestSlot = event.participants.length > 0 ? (() => {
    let maxCount = 0
    let bestKey = ''
    for (const date of event.dates) {
      for (const ts of timeSlots) {
        const key = getSlotKey(date, ts.hour, ts.half)
        const count = getSlotCount(key)
        if (count > maxCount) {
          maxCount = count
          bestKey = key
        }
      }
    }
    return { key: bestKey, count: maxCount }
  })() : null

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-10">
      {/* Event Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-100 mb-1">{event.name}</h1>
        <p className="text-sm text-[#4E5968]">
          {event.dates.length} date{event.dates.length > 1 ? 's' : ''} &middot; {formatHour(event.startHour)} - {formatHour(event.endHour)} &middot; {event.timezone.replace(/_/g, ' ')}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={copyLink}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100 transition">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            {copied ? 'Copied!' : 'Copy Share Link'}
          </button>
          <span className="text-sm text-[#8B95A1] flex items-center">
            {event.participants.length} participant{event.participants.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Join or Switch View */}
      {!joined ? (
        <div className="bg-white/[0.03] rounded-2xl border border-[#F2F4F6] p-6 mb-8 max-w-md">
          <h2 className="text-lg font-semibold text-gray-200 mb-4">Enter Your Name to Join</h2>
          <input
            type="text"
            value={userName}
            onChange={e => setUserName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && joinEvent()}
            placeholder="Your name"
            className="w-full px-4 py-3 border border-[#F2F4F6] rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-200 mb-4"
            maxLength={50}
          />
          <button onClick={joinEvent}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-[#191F28] font-semibold rounded-xl transition">
            Join Event
          </button>
          {event.participants.length > 0 && (
            <button onClick={() => setViewMode('results')}
              className="w-full py-3 mt-2 border border-[#F2F4F6] text-[#8B95A1] font-medium rounded-xl hover:bg-white/[0.02] transition">
              View Results Only
            </button>
          )}
        </div>
      ) : (
        <div className="flex gap-2 mb-6">
          <button onClick={() => setViewMode('select')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              viewMode === 'select' ? 'bg-indigo-600 text-[#191F28]' : 'bg-white text-[#8B95A1] hover:bg-[#F7F8FA]'
            }`}>
            Mark Availability
          </button>
          <button onClick={() => setViewMode('results')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              viewMode === 'results' ? 'bg-indigo-600 text-[#191F28]' : 'bg-white text-[#8B95A1] hover:bg-[#F7F8FA]'
            }`}>
            View Results
          </button>
        </div>
      )}

      {/* Availability Selection Grid */}
      {joined && viewMode === 'select' && (
        <div className="mb-8">
          <p className="text-sm text-[#4E5968] mb-4">
            Click and drag to select your available times. Green = available.
          </p>
          <div className="grid-container" ref={gridRef} onTouchMove={handleTouchMove}>
            <table className="w-full border-collapse min-w-[400px]">
              <thead>
                <tr>
                  <th className="w-16 sm:w-20" />
                  {event.dates.map(d => {
                    const { weekday, monthDay } = formatDate(d)
                    return (
                      <th key={d} className="text-center px-1 pb-2">
                        <div className="text-xs text-[#8B95A1]">{weekday}</div>
                        <div className="text-sm font-semibold text-[#8B95A1]">{monthDay}</div>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((ts, i) => (
                  <tr key={i}>
                    <td className="time-label text-right pr-2 text-xs text-[#8B95A1] align-top" style={{ paddingTop: ts.half === 0 ? 2 : 0 }}>
                      {ts.half === 0 ? formatHour(ts.hour) : ''}
                    </td>
                    {event.dates.map(d => {
                      const slotKey = getSlotKey(d, ts.hour, ts.half)
                      const isSelected = selectedSlots.has(slotKey)
                      return (
                        <td key={slotKey} className="p-0">
                          <div
                            data-slotkey={slotKey}
                            className={`availability-cell h-5 sm:h-6 border border-gray-100 cursor-pointer
                              ${isSelected ? 'bg-emerald-400' : 'bg-white/[0.02] hover:bg-white'}
                              ${ts.half === 0 ? 'border-t-gray-200' : ''}`}
                            onMouseDown={(e) => { e.preventDefault(); handleCellStart(slotKey) }}
                            onMouseEnter={() => handleCellEnter(slotKey)}
                            onTouchStart={(e) => { e.preventDefault(); handleCellStart(slotKey) }}
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
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-[#191F28] font-semibold rounded-xl transition">
              Save My Availability
            </button>
            <button onClick={() => setSelectedSlots(new Set())}
              className="px-4 py-3 border border-[#F2F4F6] text-[#8B95A1] rounded-xl hover:bg-white/[0.02] transition text-sm">
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Results Heatmap */}
      {(viewMode === 'results' || (!joined && event.participants.length > 0)) && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-200 mb-2">Group Availability</h2>

          {event.participants.length === 0 ? (
            <p className="text-[#4E5968] text-sm">No one has marked their availability yet. Share the link to get started!</p>
          ) : (
            <>
              {/* Best time indicator */}
              {bestSlot && bestSlot.count > 0 && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm">
                  <span className="font-semibold text-emerald-800">Best time: </span>
                  <span className="text-emerald-700">
                    {bestSlot.count}/{event.participants.length} available
                  </span>
                </div>
              )}

              {/* Legend */}
              <div className="flex items-center gap-2 mb-4 text-xs text-[#4E5968]">
                <span>Less</span>
                {['heat-0','heat-1','heat-2','heat-3','heat-4','heat-5','heat-6','heat-7'].map(c => (
                  <div key={c} className={`w-4 h-4 rounded ${c}`} />
                ))}
                <span>More</span>
              </div>

              <div className="grid-container">
                <table className="w-full border-collapse min-w-[400px]">
                  <thead>
                    <tr>
                      <th className="w-16 sm:w-20" />
                      {event.dates.map(d => {
                        const { weekday, monthDay } = formatDate(d)
                        return (
                          <th key={d} className="text-center px-1 pb-2">
                            <div className="text-xs text-[#8B95A1]">{weekday}</div>
                            <div className="text-sm font-semibold text-[#8B95A1]">{monthDay}</div>
                          </th>
                        )
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map((ts, i) => (
                      <tr key={i}>
                        <td className="time-label text-right pr-2 text-xs text-[#8B95A1] align-top" style={{ paddingTop: ts.half === 0 ? 2 : 0 }}>
                          {ts.half === 0 ? formatHour(ts.hour) : ''}
                        </td>
                        {event.dates.map(d => {
                          const slotKey = getSlotKey(d, ts.hour, ts.half)
                          const count = getSlotCount(slotKey)
                          const heatClass = getHeatClass(count)
                          const participants = getSlotParticipants(slotKey)
                          const isHovered = hoveredSlot === slotKey
                          return (
                            <td key={slotKey} className="p-0 relative">
                              <div
                                className={`availability-cell h-5 sm:h-6 border border-gray-100 cursor-pointer ${heatClass}
                                  ${ts.half === 0 ? 'border-t-gray-200' : ''}`}
                                onMouseEnter={() => setHoveredSlot(slotKey)}
                                onMouseLeave={() => setHoveredSlot(null)}
                                onClick={() => setHoveredSlot(isHovered ? null : slotKey)}
                              />
                              {isHovered && count > 0 && (
                                <div className="absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-1 bg-gray-900 text-[#191F28] text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg pointer-events-none">
                                  <div className="font-semibold mb-1">{count}/{event.participants.length} available</div>
                                  {participants.map(name => (
                                    <div key={name} className="text-[#8B95A1]">{name}</div>
                                  ))}
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

              {/* Participant list */}
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-[#8B95A1] mb-2">Participants ({event.participants.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {event.participants.map(p => (
                    <span key={p.name} className="px-3 py-1 bg-white text-[#8B95A1] text-sm rounded-full">
                      {p.name}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
