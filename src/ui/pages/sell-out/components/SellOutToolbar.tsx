import { useState, useRef, useEffect } from 'react'
import { Filter, Search, X, Calendar } from 'lucide-react'
import { Button } from '@/ui/design-system/components/Button'
import { DropdownPortal } from '@/ui/design-system/components/DropdownPortal'
import { useT } from '@/lib/i18n'

export interface SellOutFiltersState {
  reportingMonth: string
  area: string
  warehouseId: string
  repId: string
  productName: string
}

export interface SellOutToolbarProps {
  searchQuery: string
  onSearchChange: (q: string) => void
  activeFilters: SellOutFiltersState
  onApplyFilters: (f: SellOutFiltersState) => void
  onClearFilters: () => void
  availableMonths: string[]
  availableAreas: { id: string; name: string }[]
  availableWarehouses: { id: string; name: string; code: string }[]
  availableReps: { id: string; name: string }[]
  availableProducts: string[]
}

export function SellOutToolbar({
  searchQuery,
  onSearchChange,
  activeFilters,
  onApplyFilters,
  onClearFilters,
  availableMonths,
  availableAreas,
  availableWarehouses,
  availableReps,
  availableProducts,
}: SellOutToolbarProps) {
  const { t, lang } = useT()
  const [isOpen, setIsOpen] = useState(false)
  const [draft, setDraft] = useState<SellOutFiltersState>(activeFilters)
  const filterBtnRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setDraft(activeFilters)
  }, [activeFilters])

  const activeCount =
    (activeFilters.reportingMonth !== 'All Months' ? 1 : 0) +
    (activeFilters.area !== 'All Areas' ? 1 : 0) +
    (activeFilters.warehouseId !== 'All Warehouses' ? 1 : 0) +
    (activeFilters.repId !== 'All Representatives' ? 1 : 0) +
    (activeFilters.productName !== 'All Products' ? 1 : 0)

  const handleApply = () => {
    onApplyFilters(draft)
    setIsOpen(false)
  }

  const handleReset = () => {
    const resetState: SellOutFiltersState = {
      reportingMonth: 'All Months',
      area: 'All Areas',
      warehouseId: 'All Warehouses',
      repId: 'All Representatives',
      productName: 'All Products',
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
          placeholder={t('sellOut.toolbar.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Quick Month Selector (Inline for fast monthly reviews) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Calendar size={16} style={{ color: 'var(--muted-text)' }} />
        <select
          value={activeFilters.reportingMonth}
          onChange={(e) => {
            const next = { ...activeFilters, reportingMonth: e.target.value }
            onApplyFilters(next)
          }}
          style={{
            padding: '7px 12px',
            borderRadius: '99px',
            border: '1px solid var(--border-soft)',
            background: 'var(--surface-raised)',
            color: 'var(--heading-text)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <option value="All Months">{t('sellOut.toolbar.allMonths')}</option>
          {availableMonths.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* Filter Button & Multi-Filter Popover */}
      <div ref={filterBtnRef} style={{ position: 'relative' }}>
        <Button
          variant={activeCount > 0 ? 'primary' : 'secondary'}
          onClick={() => setIsOpen(!isOpen)}
        >
          <Filter data-icon="inline-start" /> {t('sellOut.toolbar.filters')}
          {activeCount > 0 && ` (${activeCount})`}
        </Button>

        <DropdownPortal
          isOpen={isOpen}
          anchorEl={filterBtnRef.current}
          onClose={() => setIsOpen(false)}
          width={320}
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
            <span className="eyebrow">{t('sellOut.toolbar.filters')}</span>
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto' }}>
            {/* Reporting Month */}
            <label style={labelStyle}>
              {t('sellOut.toolbar.filterByMonth')}
              <select
                value={draft.reportingMonth}
                onChange={(e) => setDraft({ ...draft, reportingMonth: e.target.value })}
                style={selectStyle}
              >
                <option value="All Months">{t('sellOut.toolbar.allMonths')}</option>
                {availableMonths.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>

            {/* Area / Governorate */}
            <label style={labelStyle}>
              {t('sellOut.toolbar.filterByArea')}
              <select
                value={draft.area}
                onChange={(e) => setDraft({ ...draft, area: e.target.value })}
                style={selectStyle}
              >
                <option value="All Areas">{t('sellOut.toolbar.allAreas')}</option>
                {availableAreas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </label>

            {/* Warehouse */}
            <label style={labelStyle}>
              {t('sellOut.toolbar.filterByWarehouse')}
              <select
                value={draft.warehouseId}
                onChange={(e) => setDraft({ ...draft, warehouseId: e.target.value })}
                style={selectStyle}
              >
                <option value="All Warehouses">{t('sellOut.toolbar.allWarehouses')}</option>
                {availableWarehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.code} · {w.name}
                  </option>
                ))}
              </select>
            </label>

            {/* Sales Representative */}
            <label style={labelStyle}>
              {t('sellOut.toolbar.filterByRep')}
              <select
                value={draft.repId}
                onChange={(e) => setDraft({ ...draft, repId: e.target.value })}
                style={selectStyle}
              >
                <option value="All Representatives">{t('sellOut.toolbar.allReps')}</option>
                {availableReps.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </label>

            {/* Product */}
            <label style={labelStyle}>
              {t('sellOut.toolbar.filterByProduct')}
              <select
                value={draft.productName}
                onChange={(e) => setDraft({ ...draft, productName: e.target.value })}
                style={selectStyle}
              >
                <option value="All Products">{t('sellOut.toolbar.allProducts')}</option>
                {availableProducts.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>

            {/* Actions */}
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
    </div>
  )
}
