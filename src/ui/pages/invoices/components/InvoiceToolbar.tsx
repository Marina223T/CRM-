import { useState, useRef, useEffect } from 'react'
import { Filter, LayoutGrid, List, Search, X } from 'lucide-react'
import { Button } from '@/ui/design-system/components/Button'
import { DropdownPortal } from '@/ui/design-system/components/DropdownPortal'
import { useT } from '@/lib/i18n'

export interface InvoiceFiltersState {
  status: string
  dateRange: string
  source: string
}

export interface InvoiceToolbarProps {
  searchQuery: string
  onSearchChange: (q: string) => void
  viewMode: 'list' | 'cards'
  onToggleView: () => void
  activeFilters: InvoiceFiltersState
  onApplyFilters: (f: InvoiceFiltersState) => void
  onClearFilters: () => void
}

const STATUSES = ['All statuses', 'Pending', 'Approved', 'Partially Paid', 'Paid', 'Rejected']
const DATE_RANGES = ['All time', 'Today', 'Last 7 days', 'This month', 'Last month']
const SOURCES = ['All sources', 'Telegram', 'Web upload', 'Sales order']

export const STATUS_KEYS: Record<string, string> = {
  'All statuses': 'invoices.toolbar.allStatuses',
  'Pending': 'invoices.toolbar.pending',
  'Approved': 'invoices.toolbar.approved',
  'Partially Paid': 'invoices.toolbar.partiallyPaid',
  'Paid': 'invoices.toolbar.paid',
  'Rejected': 'invoices.toolbar.rejected',
}

export const DATE_KEYS: Record<string, string> = {
  'All time': 'invoices.toolbar.allTime',
  'Today': 'invoices.toolbar.today',
  'Last 7 days': 'invoices.toolbar.last7Days',
  'This month': 'invoices.toolbar.thisMonth',
  'Last month': 'invoices.toolbar.lastMonth',
}

export const SOURCE_KEYS: Record<string, string> = {
  'All sources': 'invoices.toolbar.allSources',
  'Telegram': 'invoices.toolbar.telegram',
  'Web upload': 'invoices.toolbar.webUpload',
  'Sales order': 'invoices.toolbar.salesOrder',
}

export function InvoiceToolbar({
  searchQuery,
  onSearchChange,
  viewMode,
  onToggleView,
  activeFilters,
  onApplyFilters,
  onClearFilters,
}: InvoiceToolbarProps) {
  const { t } = useT()
  const [isOpen, setIsOpen] = useState(false)
  const [draft, setDraft] = useState<InvoiceFiltersState>(activeFilters)
  const filterBtnRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setDraft(activeFilters)
  }, [activeFilters])

  const handleApply = () => {
    onApplyFilters(draft)
    setIsOpen(false)
  }

  const handleClear = () => {
    const empty: InvoiceFiltersState = {
      status: 'All statuses',
      dateRange: 'All time',
      source: 'All sources',
    }
    setDraft(empty)
    onClearFilters()
    setIsOpen(false)
  }

  const activeCount =
    (activeFilters.status !== 'All statuses' ? 1 : 0) +
    (activeFilters.dateRange !== 'All time' ? 1 : 0) +
    (activeFilters.source !== 'All sources' ? 1 : 0)

  return (
    <div className="collection-toolbar" style={{ position: 'relative' }}>
      <div className="search-inline">
        <Search />
        <input
          placeholder={t('invoices.toolbar.search')}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div ref={filterBtnRef} style={{ position: 'relative' }}>
        <Button
          variant={activeCount > 0 ? 'primary' : 'secondary'}
          onClick={() => setIsOpen(!isOpen)}
        >
          <Filter data-icon="inline-start" /> {activeCount > 0 ? t('invoices.toolbar.filtersCount', { count: activeCount }) : t('invoices.toolbar.filters')}
        </Button>

        <DropdownPortal
          isOpen={isOpen}
          anchorEl={filterBtnRef.current}
          onClose={() => setIsOpen(false)}
          width={300}
          align="right"
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span className="eyebrow">{t('invoices.toolbar.filtersEyebrow')}</span>
              <button
                onClick={() => setIsOpen(false)}
                style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--muted-text)' }}
              >
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Status */}
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', fontWeight: 600, color: 'var(--muted-text)' }}>
                {t('invoices.toolbar.statusLabel')}
                <select
                  value={draft.status}
                  onChange={(e) => setDraft({ ...draft, status: e.target.value })}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-input)',
                    background: 'var(--input-bg)',
                    color: 'var(--input-text)',
                  }}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{STATUS_KEYS[s] ? t(STATUS_KEYS[s] as any) : s}</option>
                  ))}
                </select>
              </label>

              {/* Date range */}
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', fontWeight: 600, color: 'var(--muted-text)' }}>
                {t('invoices.toolbar.dateRangeLabel')}
                <select
                  value={draft.dateRange}
                  onChange={(e) => setDraft({ ...draft, dateRange: e.target.value })}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-input)',
                    background: 'var(--input-bg)',
                    color: 'var(--input-text)',
                  }}
                >
                  {DATE_RANGES.map((d) => (
                    <option key={d} value={d}>{DATE_KEYS[d] ? t(DATE_KEYS[d] as any) : d}</option>
                  ))}
                </select>
              </label>

              {/* Source */}
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', fontWeight: 600, color: 'var(--muted-text)' }}>
                {t('invoices.toolbar.sourceLabel')}
                <select
                  value={draft.source}
                  onChange={(e) => setDraft({ ...draft, source: e.target.value })}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-input)',
                    background: 'var(--input-bg)',
                    color: 'var(--input-text)',
                  }}
                >
                  {SOURCES.map((src) => (
                    <option key={src} value={src}>{SOURCE_KEYS[src] ? t(SOURCE_KEYS[src] as any) : src}</option>
                  ))}
                </select>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
              <Button variant="secondary" style={{ flex: 1, padding: '6px' }} onClick={handleClear}>
                {t('common.clear')}
              </Button>
              <Button variant="primary" style={{ flex: 1, padding: '6px' }} onClick={handleApply}>
                {t('common.apply')}
              </Button>
            </div>
        </DropdownPortal>
      </div>

      <Button
        variant="secondary"
        onClick={onToggleView}
        title={t('invoices.toolbar.switchTo', { view: viewMode === 'list' ? t('invoices.toolbar.cards') : t('invoices.toolbar.list') })}
      >
        {viewMode === 'list' ? (
          <>
            <LayoutGrid data-icon="inline-start" /> {t('invoices.toolbar.cards')}
          </>
        ) : (
          <>
            <List data-icon="inline-start" /> {t('invoices.toolbar.list')}
          </>
        )}
      </Button>
    </div>
  )
}
