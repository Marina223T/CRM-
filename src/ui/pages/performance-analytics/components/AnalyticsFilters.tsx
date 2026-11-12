import { Calendar, MapPin, User, RotateCcw } from 'lucide-react'
import { Button } from '@/ui/design-system/components/Button'
import { useT } from '@/lib/i18n'

export interface AnalyticsFiltersState {
  period: string
  area: string
  rep: string
}

export interface AnalyticsFiltersProps {
  filters: AnalyticsFiltersState
  onFilterChange: (filters: AnalyticsFiltersState) => void
  onReset: () => void
  availablePeriods: string[]
  availableAreas: { id: string; name: string }[]
  availableReps: { id: string; name: string }[]
}

export function AnalyticsFilters({
  filters,
  onFilterChange,
  onReset,
  availablePeriods,
  availableAreas,
  availableReps,
}: AnalyticsFiltersProps) {
  const { t, lang } = useT()

  const isFiltered =
    filters.period !== 'All Periods' ||
    filters.area !== 'All Areas' ||
    filters.rep !== 'All Representatives'

  const selectStyle = {
    padding: '7px 12px',
    borderRadius: '10px',
    border: '1px solid var(--border-soft)',
    background: 'var(--surface)',
    color: 'var(--heading-text)',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    outline: 'none',
  }

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        padding: '12px 18px',
        borderRadius: '16px',
        background: 'var(--surface-raised)',
        border: '1px solid var(--border-soft)',
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
        {/* Period Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar size={15} style={{ color: 'var(--muted-text)' }} />
          <select
            value={filters.period}
            onChange={(e) => onFilterChange({ ...filters, period: e.target.value })}
            style={selectStyle}
            aria-label={t('performanceAnalytics.filters.period')}
          >
            <option value="All Periods">{t('performanceAnalytics.filters.allPeriods')}</option>
            {availablePeriods.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Area / Governorate Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <MapPin size={15} style={{ color: 'var(--muted-text)' }} />
          <select
            value={filters.area}
            onChange={(e) => onFilterChange({ ...filters, area: e.target.value })}
            style={selectStyle}
            aria-label={t('performanceAnalytics.filters.area')}
          >
            <option value="All Areas">{t('performanceAnalytics.filters.allAreas')}</option>
            {availableAreas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sales Representative Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <User size={15} style={{ color: 'var(--muted-text)' }} />
          <select
            value={filters.rep}
            onChange={(e) => onFilterChange({ ...filters, rep: e.target.value })}
            style={selectStyle}
            aria-label={t('performanceAnalytics.filters.rep')}
          >
            <option value="All Representatives">{t('performanceAnalytics.filters.allReps')}</option>
            {availableReps.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Reset Action */}
      {isFiltered && (
        <Button
          variant="secondary"
          onClick={onReset}
          style={{ padding: '6px 12px', fontSize: '12px' }}
        >
          <RotateCcw data-icon="inline-start" size={13} />
          {t('performanceAnalytics.filters.reset')}
        </Button>
      )}
    </div>
  )
}
