'use client'

import { useState, useRef, useEffect } from 'react'
import { Filter, Search, X } from 'lucide-react'
import { Button } from '@/ui/design-system/components/Button'
import { DropdownPortal } from '@/ui/design-system/components/DropdownPortal'
import { useT } from '@/lib/i18n'

export interface AuditFiltersState {
  module: string
  actionType: string
  actor: string
  status: string
  dateRange: string
}

export interface AuditToolbarProps {
  searchQuery: string
  onSearchChange: (q: string) => void
  activeFilters: AuditFiltersState
  onApplyFilters: (f: AuditFiltersState) => void
  onClearFilters: () => void
  availableActors: string[]
}

export function AuditToolbar({
  searchQuery,
  onSearchChange,
  activeFilters,
  onApplyFilters,
  onClearFilters,
  availableActors,
}: AuditToolbarProps) {
  const { t, lang } = useT()
  const [isOpen, setIsOpen] = useState(false)
  const [draft, setDraft] = useState<AuditFiltersState>(activeFilters)
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setDraft(activeFilters)
  }, [activeFilters])

  const activeCount =
    (activeFilters.module !== 'All Modules' ? 1 : 0) +
    (activeFilters.actionType !== 'All Types' ? 1 : 0) +
    (activeFilters.actor !== 'All Users' ? 1 : 0) +
    (activeFilters.status !== 'All Results' ? 1 : 0) +
    (activeFilters.dateRange !== 'All Time' ? 1 : 0)

  const handleApply = () => {
    onApplyFilters(draft)
    setIsOpen(false)
  }

  const handleReset = () => {
    const reset: AuditFiltersState = {
      module: 'All Modules',
      actionType: 'All Types',
      actor: 'All Users',
      status: 'All Results',
      dateRange: 'All Time',
    }
    setDraft(reset)
    onApplyFilters(reset)
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
      {/* Search Input */}
      <div style={{ position: 'relative', flex: '1 1 260px', minWidth: '220px' }}>
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
              ? 'بحث بالمستخدم، نوع الإجراء، السجل المتأثر...'
              : 'Search by user, action, affected record...'
          }
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
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filter Button */}
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={(e) => {
            setFilterAnchorEl(e.currentTarget)
            setIsOpen(!isOpen)
          }}
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
          }}
        >
          <Filter size={16} />
          <span>{lang === 'ar' ? 'تصفية السجل' : 'Filter Log'}</span>
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
                {lang === 'ar' ? 'تصفية سجل التدقيق' : 'Filter Audit Trail'}
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

            {/* Module Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted-text)', marginBottom: '5px' }}>
                {lang === 'ar' ? 'الوحدة / النظام' : 'System Module'}
              </label>
              <select
                value={draft.module}
                onChange={(e) => setDraft({ ...draft, module: e.target.value })}
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
                <option value="All Modules">{lang === 'ar' ? 'جميع الوحدات' : 'All Modules'}</option>
                <option value="Invoices">{lang === 'ar' ? 'الفواتير' : 'Invoices'}</option>
                <option value="Collections">{lang === 'ar' ? 'التحصيلات' : 'Collections'}</option>
                <option value="Warehouses">{lang === 'ar' ? 'المستودعات' : 'Warehouses'}</option>
                <option value="Sell-out">{lang === 'ar' ? 'مبيعات الصيدليات' : 'Sell-out'}</option>
                <option value="Visits">{lang === 'ar' ? 'الزيارات والعملاء' : 'Visits'}</option>
                <option value="Users">{lang === 'ar' ? 'إدارة المستخدمين' : 'Users'}</option>
                <option value="System">{lang === 'ar' ? 'أمان النظام' : 'System'}</option>
              </select>
            </div>

            {/* Action Type Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted-text)', marginBottom: '5px' }}>
                {lang === 'ar' ? 'نوع الإجراء' : 'Action Type'}
              </label>
              <select
                value={draft.actionType}
                onChange={(e) => setDraft({ ...draft, actionType: e.target.value })}
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
                <option value="All Types">{lang === 'ar' ? 'جميع الأنواع' : 'All Action Types'}</option>
                <option value="create">{lang === 'ar' ? 'إنشاء جديد (Create)' : 'Create'}</option>
                <option value="update">{lang === 'ar' ? 'تعديل وتحديث (Update)' : 'Update'}</option>
                <option value="delete_void">{lang === 'ar' ? 'إلغاء وحذف (Void / Delete)' : 'Void / Delete'}</option>
                <option value="auth">{lang === 'ar' ? 'تسجيل دخول وأمان (Auth)' : 'Auth & Login'}</option>
                <option value="permission">{lang === 'ar' ? 'تعديل صلاحيات (Permission)' : 'Permissions'}</option>
              </select>
            </div>

            {/* Actor Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted-text)', marginBottom: '5px' }}>
                {lang === 'ar' ? 'المستخدم / المنفذ' : 'Actor / User'}
              </label>
              <select
                value={draft.actor}
                onChange={(e) => setDraft({ ...draft, actor: e.target.value })}
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
                <option value="All Users">{lang === 'ar' ? 'جميع المستخدمين' : 'All Users'}</option>
                {availableActors.map((actor) => (
                  <option key={actor} value={actor}>
                    {actor}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted-text)', marginBottom: '5px' }}>
                {lang === 'ar' ? 'نتيجة الإجراء' : 'Result Status'}
              </label>
              <select
                value={draft.status}
                onChange={(e) => setDraft({ ...draft, status: e.target.value })}
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
                <option value="All Results">{lang === 'ar' ? 'جميع النتائج' : 'All Results'}</option>
                <option value="Success">{lang === 'ar' ? 'ناجح (Success)' : 'Success'}</option>
                <option value="Warning">{lang === 'ar' ? 'تحذير (Warning)' : 'Warning'}</option>
                <option value="Failed">{lang === 'ar' ? 'فشل (Failed)' : 'Failed'}</option>
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted-text)', marginBottom: '5px' }}>
                {lang === 'ar' ? 'النطاق الزمني' : 'Time Range'}
              </label>
              <select
                value={draft.dateRange}
                onChange={(e) => setDraft({ ...draft, dateRange: e.target.value })}
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
                <option value="All Time">{lang === 'ar' ? 'كل الأوقات' : 'All Time'}</option>
                <option value="Today">{lang === 'ar' ? 'اليوم' : 'Today'}</option>
                <option value="Last 7 Days">{lang === 'ar' ? 'آخر 7 أيام' : 'Last 7 Days'}</option>
                <option value="This Month">{lang === 'ar' ? 'هذا الشهر (أكتوبر)' : 'This Month'}</option>
              </select>
            </div>

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

      {/* Clear pill */}
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
