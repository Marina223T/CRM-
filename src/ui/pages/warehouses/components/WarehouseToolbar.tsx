import { useState, useRef, useEffect } from 'react'
import { Filter, LayoutGrid, List, Search, X } from 'lucide-react'
import { Button } from '@/ui/design-system/components/Button'
import { DropdownPortal } from '@/ui/design-system/components/DropdownPortal'
import { useT } from '@/lib/i18n'

export interface WarehouseFiltersState {
  area: string
  status: string
}

export interface WarehouseToolbarProps {
  searchQuery: string
  onSearchChange: (q: string) => void
  viewMode: 'list' | 'cards'
  onToggleView: () => void
  activeFilters: WarehouseFiltersState
  onApplyFilters: (f: WarehouseFiltersState) => void
  onClearFilters: () => void
  availableAreas: string[]
  availableStatuses: string[]
}

export function WarehouseToolbar({
  searchQuery,
  onSearchChange,
  viewMode,
  onToggleView,
  activeFilters,
  onApplyFilters,
  onClearFilters,
  availableAreas,
  availableStatuses,
}: WarehouseToolbarProps) {
  const { t, lang } = useT()
  const [isOpen, setIsOpen] = useState(false)
  const [draft, setDraft] = useState<WarehouseFiltersState>(activeFilters)
  const filterBtnRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setDraft(activeFilters)
  }, [activeFilters])

  const activeCount =
    (activeFilters.area !== 'All areas' ? 1 : 0) +
    (activeFilters.status !== 'All statuses' ? 1 : 0)

  const handleApply = () => {
    onApplyFilters(draft)
    setIsOpen(false)
  }

  const handleReset = () => {
    const resetState: WarehouseFiltersState = {
      area: 'All areas',
      status: 'All statuses',
    }
    setDraft(resetState)
    onApplyFilters(resetState)
    setIsOpen(false)
  }

  const selectStyle = {
    padding: '8px 10px',
    borderRadius: '8px',
    border: '1px solid var(--border-input)',
    background: 'var(--input-bg)',
    color: 'var(--input-text)',
    fontSize: '13px',
    width: '100%',
    boxSizing: 'border-box' as const,
  }

  const labelStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--muted-text)',
  }

  return (
    <div className="collection-toolbar" style={{ position: 'relative' }}>
      {/* Search Input */}
      <div className="search-inline">
        <Search />
        <input
          placeholder={t('warehouses.toolbar.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Filter Button & Popover */}
      <div ref={filterBtnRef} style={{ position: 'relative' }}>
        <Button
          variant={activeCount > 0 ? 'primary' : 'secondary'}
          onClick={() => setIsOpen(!isOpen)}
        >
          <Filter data-icon="inline-start" /> {t('warehouses.toolbar.filters')}
          {activeCount > 0 && ` (${activeCount})`}
        </Button>

        <DropdownPortal
          isOpen={isOpen}
          anchorEl={filterBtnRef.current}
          onClose={() => setIsOpen(false)}
          width={300}
          align="right"
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
            }}
          >
            <span className="eyebrow">{t('warehouses.toolbar.filtersEyebrow')}</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{
                background: 'transparent',
                border: 0,
                cursor: 'pointer',
                color: 'var(--muted-text)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X style={{ width: '16px', height: '16px' }} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Area Filter */}
            <label style={labelStyle}>
              {t('warehouses.toolbar.filterByArea')}
              <select
                value={draft.area}
                onChange={(e) => setDraft({ ...draft, area: e.target.value })}
                style={selectStyle}
              >
                <option value="All areas">{t('warehouses.toolbar.allAreas')}</option>
                {availableAreas.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </label>

            {/* Status Filter */}
            <label style={labelStyle}>
              {t('warehouses.toolbar.filterByStatus')}
              <select
                value={draft.status}
                onChange={(e) => setDraft({ ...draft, status: e.target.value })}
                style={selectStyle}
              >
                <option value="All statuses">{t('warehouses.toolbar.allStatuses')}</option>
                {availableStatuses.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </label>

            {/* Popover Action Buttons */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                marginTop: '6px',
                paddingTop: '10px',
                borderTop: '1px solid var(--border-soft)',
              }}
            >
              <Button variant="primary" onClick={handleApply} style={{ flex: 1 }}>
                {t('common.apply')}
              </Button>
              <Button variant="secondary" onClick={handleReset}>
                {t('common.reset')}
              </Button>
            </div>
          </div>
        </DropdownPortal>
      </div>

      {/* View Toggle (List vs Cards) */}
      <button
        type="button"
        className="icon-button"
        onClick={onToggleView}
        title={viewMode === 'list' ? 'Switch to Card view' : 'Switch to List view'}
        aria-label="Toggle view mode"
      >
        {viewMode === 'list' ? <LayoutGrid /> : <List />}
      </button>
    </div>
  )
}
