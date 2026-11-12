'use client'

import { useState, useRef, useEffect } from 'react'
import { Filter, Search, X } from 'lucide-react'
import { Button } from '@/ui/design-system/components/Button'
import { DropdownPortal } from '@/ui/design-system/components/DropdownPortal'
import { useT } from '@/lib/i18n'

export interface CashInFiltersState {
  period: string
  customerId: string
  repName: string
  method: string
  status: string
}

export interface CashInToolbarProps {
  searchQuery: string
  onSearchChange: (q: string) => void
  activeFilters: CashInFiltersState
  onApplyFilters: (f: CashInFiltersState) => void
  onClearFilters: () => void
  availableCustomers: { id: string; name: string }[]
  availableReps: string[]
  isRep?: boolean
}

export function CashInToolbar({
  searchQuery,
  onSearchChange,
  activeFilters,
  onApplyFilters,
  onClearFilters,
  availableCustomers,
  availableReps,
  isRep = false,
}: CashInToolbarProps) {
  const { t, lang } = useT()
  const [isOpen, setIsOpen] = useState(false)
  const [draft, setDraft] = useState<CashInFiltersState>(activeFilters)
  const filterBtnRef = useRef<HTMLDivElement>(null)
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setDraft(activeFilters)
  }, [activeFilters])

  const activeCount =
    (activeFilters.period !== 'All Periods' ? 1 : 0) +
    (activeFilters.customerId !== 'All Customers' ? 1 : 0) +
    (!isRep && activeFilters.repName !== 'All Representatives' ? 1 : 0) +
    (activeFilters.method !== 'All Methods' ? 1 : 0) +
    (activeFilters.status !== 'All Statuses' ? 1 : 0)

  const handleApply = () => {
    onApplyFilters(draft)
    setIsOpen(false)
  }

  const handleReset = () => {
    const resetState: CashInFiltersState = {
      period: 'All Periods',
      customerId: 'All Customers',
      repName: 'All Representatives',
      method: 'All Methods',
      status: 'All Statuses',
    }
    setDraft(resetState)
    onApplyFilters(resetState)
    setIsOpen(false)
  }

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px',
      }}
    >
      {/* Search Bar */}
      <div
        style={{
          position: 'relative',
          flex: '1 1 260px',
          minWidth: '220px',
        }}
      >
        <Search
          size={16}
          style={{
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            insetInlineStart: '14px',
            color: 'var(--muted-text)',
            pointerEvents: 'none',
          }}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={
            lang === 'ar'
              ? 'بحث برقم الإيصال، العميل، المرجع أو المندوب...'
              : 'Search by receipt #, customer, reference, or rep...'
          }
          className="search-input"
          style={{
            width: '100%',
            height: '42px',
            paddingInlineStart: '40px',
            paddingInlineEnd: searchQuery ? '36px' : '14px',
            borderRadius: '14px',
            border: '1px solid var(--border-input, #cbd5e1)',
            background: 'var(--card-bg, #ffffff)',
            color: 'var(--heading-text, #0f172a)',
            fontSize: '13.5px',
            outline: 'none',
          }}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            style={{
              position: 'absolute',
              top: '50%',
              transform: 'translateY(-50%)',
              insetInlineEnd: '10px',
              border: 0,
              background: 'transparent',
              color: 'var(--muted-text)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filter Button */}
      <div ref={filterBtnRef} style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={(e) => {
            setFilterAnchorEl(e.currentTarget)
            setIsOpen(!isOpen)
          }}
          className="filter-btn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            height: '42px',
            padding: '0 16px',
            borderRadius: '14px',
            border: activeCount > 0 ? '1.5px solid var(--sky, #0284c7)' : '1px solid var(--border-input, #cbd5e1)',
            background: activeCount > 0 ? 'rgba(2, 132, 199, 0.08)' : 'var(--card-bg, #ffffff)',
            color: activeCount > 0 ? 'var(--sky, #0284c7)' : 'var(--heading-text, #0f172a)',
            fontSize: '13.5px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <Filter size={16} />
          <span>{lang === 'ar' ? 'تصفية' : 'Filter'}</span>
          {activeCount > 0 && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: 'var(--sky, #0284c7)',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 700,
              }}
            >
              {activeCount}
            </span>
          )}
        </button>

        <DropdownPortal
          isOpen={isOpen}
          anchorEl={filterAnchorEl}
          onClose={() => setIsOpen(false)}
        >
          <div
            style={{
              width: '320px',
              padding: '18px',
              background: 'var(--card-bg, #ffffff)',
              borderRadius: '18px',
              boxShadow: 'var(--shadow-raised, 0 10px 30px rgba(0,0,0,0.14))',
              border: '1px solid var(--border-card, #e2e8f0)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <strong style={{ fontSize: '14px', color: 'var(--heading-text)' }}>
                {lang === 'ar' ? 'تصفية التحصيلات' : 'Filter Collections'}
              </strong>
              {activeCount > 0 && (
                <button
                  type="button"
                  onClick={handleReset}
                  style={{
                    border: 0,
                    background: 'transparent',
                    color: 'var(--rose, #e11d48)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {lang === 'ar' ? 'إعادة ضبط' : 'Reset'}
                </button>
              )}
            </div>

            {/* Reporting Period Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted-text)', marginBottom: '5px' }}>
                {lang === 'ar' ? 'الفترة الزمنية' : 'Reporting Period'}
              </label>
              <select
                value={draft.period}
                onChange={(e) => setDraft({ ...draft, period: e.target.value })}
                className="filter-select"
                style={{
                  width: '100%',
                  height: '38px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-input, #cbd5e1)',
                  background: 'var(--card-bg, #ffffff)',
                  color: 'var(--heading-text)',
                  fontSize: '13px',
                  padding: '0 10px',
                }}
              >
                <option value="All Periods">{lang === 'ar' ? 'جميع الفترات' : 'All Periods'}</option>
                <option value="2026-10">{lang === 'ar' ? 'أكتوبر 2026 (الشهر الحالي)' : 'October 2026 (Current)'}</option>
                <option value="2026-09">{lang === 'ar' ? 'سبتمبر 2026' : 'September 2026'}</option>
                <option value="2026-08">{lang === 'ar' ? 'أغسطس 2026' : 'August 2026'}</option>
              </select>
            </div>

            {/* Customer Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted-text)', marginBottom: '5px' }}>
                {lang === 'ar' ? 'العميل / المستودع' : 'Customer / Warehouse'}
              </label>
              <select
                value={draft.customerId}
                onChange={(e) => setDraft({ ...draft, customerId: e.target.value })}
                className="filter-select"
                style={{
                  width: '100%',
                  height: '38px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-input, #cbd5e1)',
                  background: 'var(--card-bg, #ffffff)',
                  color: 'var(--heading-text)',
                  fontSize: '13px',
                  padding: '0 10px',
                }}
              >
                <option value="All Customers">{lang === 'ar' ? 'جميع العملاء والمستودعات' : 'All Customers & Hubs'}</option>
                {availableCustomers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Representative Filter (Admin only) */}
            {!isRep && (
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted-text)', marginBottom: '5px' }}>
                  {lang === 'ar' ? 'المندوب / المحصل' : 'Representative'}
                </label>
                <select
                  value={draft.repName}
                  onChange={(e) => setDraft({ ...draft, repName: e.target.value })}
                  className="filter-select"
                  style={{
                    width: '100%',
                    height: '38px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-input, #cbd5e1)',
                    background: 'var(--card-bg, #ffffff)',
                    color: 'var(--heading-text)',
                    fontSize: '13px',
                    padding: '0 10px',
                  }}
                >
                  <option value="All Representatives">{lang === 'ar' ? 'جميع المندوبين' : 'All Representatives'}</option>
                  {availableReps.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Payment Method */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted-text)', marginBottom: '5px' }}>
                {lang === 'ar' ? 'طريقة الدفع' : 'Payment Method'}
              </label>
              <select
                value={draft.method}
                onChange={(e) => setDraft({ ...draft, method: e.target.value })}
                className="filter-select"
                style={{
                  width: '100%',
                  height: '38px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-input, #cbd5e1)',
                  background: 'var(--card-bg, #ffffff)',
                  color: 'var(--heading-text)',
                  fontSize: '13px',
                  padding: '0 10px',
                }}
              >
                <option value="All Methods">{lang === 'ar' ? 'جميع طرق الدفع' : 'All Methods'}</option>
                <option value="Cash">{lang === 'ar' ? 'نقداً (Cash)' : 'Cash'}</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted-text)', marginBottom: '5px' }}>
                {lang === 'ar' ? 'حالة الإيصال' : 'Payment Status'}
              </label>
              <select
                value={draft.status}
                onChange={(e) => setDraft({ ...draft, status: e.target.value })}
                className="filter-select"
                style={{
                  width: '100%',
                  height: '38px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-input, #cbd5e1)',
                  background: 'var(--card-bg, #ffffff)',
                  color: 'var(--heading-text)',
                  fontSize: '13px',
                  padding: '0 10px',
                }}
              >
                <option value="All Statuses">{lang === 'ar' ? 'جميع الحالات' : 'All Statuses'}</option>
                <option value="Completed">{lang === 'ar' ? 'مكتمل (Completed)' : 'Completed'}</option>
                <option value="Voided">{lang === 'ar' ? 'ملغي (Voided)' : 'Voided'}</option>
              </select>
            </div>

            {/* Apply Action */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <Button
                variant="secondary"
                onClick={() => setIsOpen(false)}
                className="w-full"
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button
                variant="primary"
                onClick={handleApply}
                className="w-full"
              >
                {lang === 'ar' ? 'تطبيق' : 'Apply'}
              </Button>
            </div>
          </div>
        </DropdownPortal>
      </div>

      {/* Active Filter Clear Pill */}
      {activeCount > 0 && (
        <button
          type="button"
          onClick={onClearFilters}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '99px',
            background: 'rgba(225, 29, 72, 0.08)',
            color: 'var(--rose, #e11d48)',
            border: '1px solid rgba(225, 29, 72, 0.2)',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <X size={13} />
          <span>{lang === 'ar' ? 'مسح الفلاتر' : 'Clear Filters'}</span>
        </button>
      )}
    </div>
  )
}
