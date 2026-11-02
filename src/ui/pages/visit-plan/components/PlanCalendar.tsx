import { useState, useMemo } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  Stethoscope,
  Briefcase,
  AlertCircle,
  Eye,
} from 'lucide-react'
import { Button } from '@/ui/design-system/components/Button'
import { Modal } from '@/ui/design-system/components/Modal'
import { StatusPill } from '@/ui/design-system/components/StatusPill'
import { useT } from '@/lib/i18n'
import { formatDate } from '@/lib/format'
import { useStore } from '@/data/mock/store'
import { visitsStore, updateVisit, type StoredVisit } from '@/data/mock/visits'
import { vacationsStore, type VacationRequest } from '@/data/mock/vacations'
import { customersStore } from '@/data/mock/customers'
import { ALL_MOCK_REPS } from '@/ui/design-system/components/RecordFormDrawer'

export type CalendarView = 'month' | 'week' | 'day'

export interface CalendarEvent {
  id: string
  title: string
  date: string // YYYY-MM-DD
  time?: string
  type: 'visit_scheduled' | 'visit_completed' | 'follow_up' | 'vacation'
  repName: string
  clientName?: string
  status: string
  detail?: string
  notes?: string
  rawItem?: any
}

function parseToIso(dateStr: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr
  const d = new Date(dateStr)
  if (!isNaN(d.getTime())) {
    return d.toISOString().slice(0, 10)
  }
  return dateStr
}

export function PlanCalendar() {
  const { t, lang } = useT()
  const visits = useStore(visitsStore)
  const vacations = useStore(vacationsStore)
  const customers = useStore(customersStore)

  // Current calendar navigation date (defaults to Nov 2026 to match data)
  const [currentDate, setCurrentDate] = useState(new Date('2026-11-04'))
  const [view, setView] = useState<CalendarView>('month')
  const [selectedRep, setSelectedRep] = useState<string>('All')
  const [selectedType, setSelectedType] = useState<string>('All')
  const [activeEvent, setActiveEvent] = useState<CalendarEvent | null>(null)
  const [rescheduleDate, setRescheduleDate] = useState('')

  // Aggregate all events into unified structure
  const allEvents = useMemo(() => {
    const list: CalendarEvent[] = []

    // 1. Visits from visitsStore
    for (const v of visits) {
      const iso = parseToIso(v.date)
      const isCompleted = v.status === 'Completed'
      list.push({
        id: `v-${v.id}`,
        title: `${v.clientName} · ${v.detail}`,
        date: iso,
        time: v.time,
        type: isCompleted ? 'visit_completed' : 'visit_scheduled',
        repName: v.repName,
        clientName: v.clientName,
        status: v.status,
        detail: v.detail,
        notes: v.notes,
        rawItem: v,
      })
    }

    // 2. Customer Follow-up Activities
    for (const c of customers) {
      if (c.followUpHistory) {
        for (const [idx, fu] of c.followUpHistory.entries()) {
          list.push({
            id: `fu-${c.id}-${idx}`,
            title: `${c.name} · ${fu.note}`,
            date: parseToIso(fu.date),
            type: 'follow_up',
            repName: fu.repName || c.repName || 'Alex Morgan',
            clientName: c.name,
            status: 'Active',
            detail: fu.note,
          })
        }
      }
    }

    // 3. Employee Vacations
    for (const vac of vacations) {
      list.push({
        id: `vac-${vac.id}`,
        title: `${vac.employeeName} (${vac.vacationType} Leave)`,
        date: vac.startDate,
        type: 'vacation',
        repName: vac.employeeName,
        status: vac.status,
        detail: `${vac.vacationType} Leave (${vac.startDate} to ${vac.endDate}): ${vac.reason}`,
        notes: vac.reason,
        rawItem: vac,
      })
    }

    return list
  }, [visits, vacations, customers])

  // Filter events
  const filteredEvents = useMemo(() => {
    return allEvents.filter((ev) => {
      if (selectedRep !== 'All' && ev.repName !== selectedRep) {
        return false
      }
      if (selectedType !== 'All') {
        if (selectedType === 'visit_scheduled' && ev.type !== 'visit_scheduled') return false
        if (selectedType === 'visit_completed' && ev.type !== 'visit_completed') return false
        if (selectedType === 'follow_up' && ev.type !== 'follow_up') return false
        if (selectedType === 'vacation' && ev.type !== 'vacation') return false
      }
      return true
    })
  }, [allEvents, selectedRep, selectedType])

  // Navigation handlers
  const handlePrev = () => {
    const next = new Date(currentDate)
    if (view === 'month') next.setMonth(next.getMonth() - 1)
    else if (view === 'week') next.setDate(next.getDate() - 7)
    else next.setDate(next.getDate() - 1)
    setCurrentDate(next)
  }

  const handleNext = () => {
    const next = new Date(currentDate)
    if (view === 'month') next.setMonth(next.getMonth() + 1)
    else if (view === 'week') next.setDate(next.getDate() + 7)
    else next.setDate(next.getDate() + 1)
    setCurrentDate(next)
  }

  const handleToday = () => {
    setCurrentDate(new Date('2026-11-04'))
  }

  // Format header title
  const headerTitle = useMemo(() => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ]
    const month = monthNames[currentDate.getMonth()]
    const year = currentDate.getFullYear()
    if (view === 'month') return `${month} ${year}`
    if (view === 'week') {
      const start = new Date(currentDate)
      start.setDate(currentDate.getDate() - currentDate.getDay())
      const end = new Date(start)
      end.setDate(start.getDate() + 6)
      return `${month} ${start.getDate()} – ${end.getDate()}, ${year}`
    }
    return `${month} ${currentDate.getDate()}, ${year}`
  }, [currentDate, view])

  // Month Grid Calculation
  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay() // 0 = Sun

    const days: Array<{ dayNumber: number; dateStr: string; isCurrentMonth: boolean }> = []

    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i
      const prevDate = new Date(year, month - 1, d).toISOString().slice(0, 10)
      days.push({ dayNumber: d, dateStr: prevDate, isCurrentMonth: false })
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      days.push({ dayNumber: d, dateStr, isCurrentMonth: true })
    }

    // Next month padding to fill 35 or 42 cells
    const remaining = 35 - days.length > 0 ? 35 - days.length : (42 - days.length > 0 ? 42 - days.length : 0)
    for (let d = 1; d <= remaining; d++) {
      const nextDate = new Date(year, month + 1, d).toISOString().slice(0, 10)
      days.push({ dayNumber: d, dateStr: nextDate, isCurrentMonth: false })
    }

    return days
  }, [currentDate])

  const getEventBadgeStyle = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'visit_completed':
        return { background: 'rgba(16, 185, 129, 0.15)', color: '#059669', border: '1px solid rgba(16, 185, 129, 0.3)' }
      case 'visit_scheduled':
        return { background: 'rgba(37, 99, 235, 0.15)', color: '#2563eb', border: '1px solid rgba(37, 99, 235, 0.3)' }
      case 'follow_up':
        return { background: 'rgba(147, 51, 234, 0.15)', color: '#7c3aed', border: '1px solid rgba(147, 51, 234, 0.3)' }
      case 'vacation':
        return { background: 'rgba(245, 158, 11, 0.15)', color: '#d97706', border: '1px solid rgba(245, 158, 11, 0.3)' }
    }
  }

  const handleRescheduleConfirm = () => {
    if (!activeEvent || !rescheduleDate) return
    if (activeEvent.rawItem && activeEvent.rawItem.id) {
      updateVisit(activeEvent.rawItem.id, { date: rescheduleDate })
      setActiveEvent(null)
      setRescheduleDate('')
    }
  }

  return (
    <div className="panel" style={{ marginTop: '24px', padding: '20px' }}>
      {/* Calendar Header Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CalendarIcon style={{ width: '24px', height: '24px', color: 'var(--ocean)' }} />
          <h2 style={{ margin: 0, fontSize: '18px' }}>{headerTitle}</h2>
          <div style={{ display: 'flex', gap: '4px', marginInlineStart: '10px' }}>
            <Button variant="secondary" style={{ padding: '4px 8px' }} onClick={handlePrev}>
              <ChevronLeft size={16} />
            </Button>
            <Button variant="secondary" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={handleToday}>
              {lang === 'ar' ? 'اليوم' : 'Today'}
            </Button>
            <Button variant="secondary" style={{ padding: '4px 8px' }} onClick={handleNext}>
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div style={{ display: 'flex', gap: '4px', background: 'var(--surface-raised)', padding: '4px', borderRadius: '8px' }}>
          {(['month', 'week', 'day'] as CalendarView[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              style={{
                border: 'none',
                background: view === v ? 'var(--surface)' : 'transparent',
                color: view === v ? 'var(--heading-text)' : 'var(--muted-text)',
                fontWeight: view === v ? 700 : 500,
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
                boxShadow: view === v ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              {v === 'month' ? (lang === 'ar' ? 'شهر' : 'Month') : v === 'week' ? (lang === 'ar' ? 'أسبوع' : 'Week') : (lang === 'ar' ? 'يوم' : 'Day')}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Filters: Rep and Event Type */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '16px', padding: '10px 14px', background: 'var(--surface-raised)', borderRadius: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={14} style={{ color: 'var(--muted-text)' }} />
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted-text)' }}>
            {lang === 'ar' ? 'المندوب:' : 'Representative:'}
          </span>
          <select
            value={selectedRep}
            onChange={(e) => setSelectedRep(e.target.value)}
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              border: '1px solid var(--border-soft)',
              background: 'var(--surface)',
              fontSize: '12px',
              color: 'var(--heading-text)',
            }}
          >
            <option value="All">{lang === 'ar' ? 'جميع المندوبين' : 'All Representatives'}</option>
            {ALL_MOCK_REPS.map((r) => (
              <option key={r.id} value={r.name}>{r.name}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Briefcase size={14} style={{ color: 'var(--muted-text)' }} />
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted-text)' }}>
            {lang === 'ar' ? 'نوع النشاط:' : 'Event Type:'}
          </span>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              border: '1px solid var(--border-soft)',
              background: 'var(--surface)',
              fontSize: '12px',
              color: 'var(--heading-text)',
            }}
          >
            <option value="All">{lang === 'ar' ? 'جميع الأنشطة' : 'All Event Types'}</option>
            <option value="visit_scheduled">{lang === 'ar' ? 'زيارات مجدولة' : 'Scheduled Visits'}</option>
            <option value="visit_completed">{lang === 'ar' ? 'زيارات مكتملة' : 'Completed Visits'}</option>
            <option value="follow_up">{lang === 'ar' ? 'أنشطة متابعة' : 'Follow-up Activities'}</option>
            <option value="vacation">{lang === 'ar' ? 'إجازات الموظفين' : 'Employee Vacations'}</option>
          </select>
        </div>

        {/* Legend */}
        <div style={{ marginInlineStart: 'auto', display: 'flex', gap: '10px', fontSize: '11px', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563eb' }} />
            {lang === 'ar' ? 'مجدولة' : 'Scheduled'}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#059669' }} />
            {lang === 'ar' ? 'مكتملة' : 'Completed'}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#7c3aed' }} />
            {lang === 'ar' ? 'متابعة' : 'Follow-up'}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#d97706' }} />
            {lang === 'ar' ? 'إجازة' : 'Vacation'}
          </span>
        </div>
      </div>

      {/* MONTH VIEW */}
      {view === 'month' && (
        <div style={{ border: '1px solid var(--border-soft)', borderRadius: '10px', overflow: 'hidden' }}>
          {/* Day Headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: 'var(--surface-raised)', borderBottom: '1px solid var(--border-soft)', textAlign: 'center', padding: '8px 0', fontSize: '12px', fontWeight: 600, color: 'var(--muted-text)' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* Day Cells Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {monthDays.map((cell, idx) => {
              const dayEvents = filteredEvents.filter((ev) => ev.date === cell.dateStr)
              const isToday = cell.dateStr === '2026-11-04'

              return (
                <div
                  key={idx}
                  style={{
                    minHeight: '88px',
                    borderRight: (idx + 1) % 7 === 0 ? 'none' : '1px solid var(--border-soft)',
                    borderBottom: '1px solid var(--border-soft)',
                    padding: '6px',
                    background: cell.isCurrentMonth
                      ? (isToday ? 'rgba(37, 99, 235, 0.04)' : 'var(--surface)')
                      : 'var(--surface-raised)',
                    opacity: cell.isCurrentMonth ? 1 : 0.5,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: isToday ? 800 : 500,
                        color: isToday ? 'var(--ocean)' : 'var(--heading-text)',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: isToday ? 'rgba(37, 99, 235, 0.15)' : 'transparent',
                      }}
                    >
                      {cell.dayNumber}
                    </span>
                    {dayEvents.length > 0 && (
                      <span style={{ fontSize: '10px', color: 'var(--muted-text)' }}>
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Compact Event Pills */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {dayEvents.slice(0, 3).map((ev) => {
                      const badgeStyle = getEventBadgeStyle(ev.type)
                      return (
                        <button
                          key={ev.id}
                          type="button"
                          onClick={() => setActiveEvent(ev)}
                          style={{
                            ...badgeStyle,
                            border: 'none',
                            borderRadius: '4px',
                            padding: '2px 4px',
                            fontSize: '10px',
                            fontWeight: 600,
                            textAlign: 'start',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            cursor: 'pointer',
                            display: 'block',
                            width: '100%',
                          }}
                          title={`${ev.time ? ev.time + ' · ' : ''}${ev.title}`}
                        >
                          {ev.time ? `${ev.time} ` : ''}{ev.clientName || ev.title}
                        </button>
                      )
                    })}
                    {dayEvents.length > 3 && (
                      <span style={{ fontSize: '9px', color: 'var(--muted-text)', paddingInlineStart: '2px' }}>
                        +{dayEvents.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* WEEK & DAY VIEW */}
      {(view === 'week' || view === 'day') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredEvents.length > 0 ? (
            filteredEvents.map((ev) => {
              const badgeStyle = getEventBadgeStyle(ev.type)
              return (
                <div
                  key={ev.id}
                  onClick={() => setActiveEvent(ev)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-soft)',
                    background: 'var(--surface)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        ...badgeStyle,
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {ev.type === 'vacation' ? <Briefcase size={18} /> : <Stethoscope size={18} />}
                    </div>
                    <div>
                      <strong style={{ fontSize: '14px', display: 'block' }}>{ev.title}</strong>
                      <span style={{ fontSize: '12px', color: 'var(--muted-text)' }}>
                        📅 {formatDate(ev.date, lang)} {ev.time ? `· ⏰ ${ev.time}` : ''} · 👤 {ev.repName}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <StatusPill status={ev.status} />
                    <Eye size={16} style={{ color: 'var(--muted-text)' }} />
                  </div>
                </div>
              )
            })
          ) : (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--muted-text)' }}>
              {lang === 'ar' ? 'لا توجد أنشطة مجدولة لهذه الفترة.' : 'No scheduled activities for this date range.'}
            </div>
          )}
        </div>
      )}

      {/* Event Detail Modal */}
      <Modal isOpen={Boolean(activeEvent)} onClose={() => setActiveEvent(null)}>
        {activeEvent && (
          <div style={{ padding: '24px', maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    ...getEventBadgeStyle(activeEvent.type),
                  }}
                >
                  {activeEvent.type.replace('_', ' ').toUpperCase()}
                </span>
                <h3 style={{ margin: '8px 0 2px', fontSize: '16px' }}>{activeEvent.title}</h3>
              </div>
              <StatusPill status={activeEvent.status} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', margin: '14px 0', borderTop: '1px solid var(--border-soft)', borderBottom: '1px solid var(--border-soft)', padding: '12px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarIcon size={14} style={{ color: 'var(--muted-text)' }} />
                <span><strong>Date:</strong> {formatDate(activeEvent.date, lang)}</span>
              </div>
              {activeEvent.time && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={14} style={{ color: 'var(--muted-text)' }} />
                  <span><strong>Time:</strong> {activeEvent.time}</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={14} style={{ color: 'var(--muted-text)' }} />
                <span><strong>Representative:</strong> {activeEvent.repName}</span>
              </div>
              {activeEvent.detail && (
                <div style={{ marginTop: '4px', color: 'var(--muted-text)' }}>
                  <strong>Details:</strong> {activeEvent.detail}
                </div>
              )}
              {activeEvent.notes && (
                <div style={{ fontStyle: 'italic', color: 'var(--muted-text)' }}>
                  &ldquo;{activeEvent.notes}&rdquo;
                </div>
              )}
            </div>

            {/* Reschedule Visit if active event is a visit */}
            {activeEvent.rawItem && activeEvent.rawItem.id && activeEvent.type === 'visit_scheduled' && (
              <div style={{ marginTop: '12px', padding: '10px 12px', borderRadius: '8px', background: 'var(--surface-raised)' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  {lang === 'ar' ? 'إعادة جدولة هذا الموعد:' : 'Reschedule this visit:'}
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-soft)',
                      background: 'var(--surface)',
                      fontSize: '12px',
                      flex: 1,
                    }}
                  />
                  <Button
                    variant="primary"
                    style={{ fontSize: '12px', padding: '4px 10px' }}
                    disabled={!rescheduleDate}
                    onClick={handleRescheduleConfirm}
                  >
                    {lang === 'ar' ? 'تأكيد الموعد' : 'Update'}
                  </Button>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <Button variant="secondary" onClick={() => setActiveEvent(null)}>
                {lang === 'ar' ? 'إغلاق' : 'Close'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
