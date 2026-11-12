'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
  User,
  Clock,
  Layers,
  ArrowRight,
  Filter,
} from 'lucide-react'
import { EmptyState } from '@/ui/design-system/components/EmptyState'
import { Button } from '@/ui/design-system/components/Button'
import { StatusPill } from '@/ui/design-system/components/StatusPill'
import { useT } from '@/lib/i18n'
import { formatDate } from '@/lib/format'
import { useStore } from '@/data/mock/store'
import { auditStore } from '@/data/mock/audit'
import type { AuditRecord } from './mock-data'
import { AuditSummaryCards } from './components/AuditSummaryCards'
import { AuditToolbar, type AuditFiltersState } from './components/AuditToolbar'
import { AuditDetailDrawer } from './components/AuditDetailDrawer'

const ITEMS_PER_PAGE = 8

export default function AdminAuditLogPage() {
  const { t, lang } = useT()
  const logs = useStore(auditStore)

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState<AuditFiltersState>({
    module: 'All Modules',
    actionType: 'All Types',
    actor: 'All Users',
    status: 'All Results',
    dateRange: 'All Time',
  })

  // Pagination & Selected Record
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null)

  // Available unique actors
  const availableActors = useMemo(() => {
    return Array.from(new Set(logs.map((l) => l.actor)))
  }, [logs])

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((item) => {
      // 1. Module
      if (activeFilters.module !== 'All Modules' && item.module !== activeFilters.module) {
        return false
      }

      // 2. Action Type
      if (activeFilters.actionType !== 'All Types' && item.actionType !== activeFilters.actionType) {
        return false
      }

      // 3. Actor
      if (activeFilters.actor !== 'All Users' && item.actor !== activeFilters.actor) {
        return false
      }

      // 4. Status
      if (activeFilters.status !== 'All Results' && item.status !== activeFilters.status) {
        return false
      }

      // 5. Date Range
      if (activeFilters.dateRange !== 'All Time') {
        const itemDate = item.timestamp || ''
        const todayStr = new Date().toISOString().slice(0, 10)
        const currentMonthStr = todayStr.slice(0, 7)
        if (activeFilters.dateRange === 'Today' && !itemDate.startsWith('2026-10-26') && !itemDate.startsWith(todayStr)) {
          return false
        }
        if (activeFilters.dateRange === 'This Month' && !itemDate.startsWith('2026-10') && !itemDate.startsWith(currentMonthStr)) {
          return false
        }
      }

      // 6. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchAction = item.action?.toLowerCase().includes(q) || (item.action_ar && item.action_ar.includes(q))
        const matchActor = item.actor?.toLowerCase().includes(q)
        const matchRecord = item.affectedRecord?.toLowerCase().includes(q)
        const matchDetails = item.details?.toLowerCase().includes(q) || (item.details_ar && item.details_ar.includes(q))
        if (!matchAction && !matchActor && !matchRecord && !matchDetails) {
          return false
        }
      }

      return true
    })
  }, [logs, activeFilters, searchQuery])

  // Clamp currentPage when filtered results shrink
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / ITEMS_PER_PAGE))
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [filteredLogs.length, totalPages, currentPage])
  const currentLogs = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredLogs.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredLogs, currentPage])

  // Selected Log Object
  const selectedLog = useMemo(() => {
    return logs.find((l) => l.id === selectedLogId) || null
  }, [logs, selectedLogId])

  const getActionBadgeColor = (actionType: AuditRecord['actionType']) => {
    switch (actionType) {
      case 'create':
        return { bg: 'rgba(16, 185, 129, 0.1)', color: 'var(--emerald, #10b981)' }
      case 'delete_void':
        return { bg: 'rgba(225, 29, 72, 0.1)', color: 'var(--rose, #e11d48)' }
      case 'auth':
        return { bg: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }
      case 'permission':
        return { bg: 'rgba(245, 158, 11, 0.12)', color: 'var(--amber, #f59e0b)' }
      case 'update':
      default:
        return { bg: 'rgba(2, 132, 199, 0.1)', color: 'var(--sky, #0284c7)' }
    }
  }

  return (
    <section className="content" style={{ paddingBottom: '60px' }}>
      {/* Intro Header */}
      <div className="page-intro" style={{ marginBottom: '24px' }}>
        <div>
          <span className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <ClipboardCheck style={{ width: '14px', height: '14px' }} /> {t('admin.audit.eyebrow')}
          </span>
          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '6px 0 4px', color: 'var(--heading-text)' }}>
            {t('admin.audit.title')}
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted-text)', lineHeight: 1.45 }}>
            {t('admin.audit.story')}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <AuditSummaryCards logs={logs} />

      {/* Toolbar */}
      <AuditToolbar
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q)
          setCurrentPage(1)
        }}
        activeFilters={activeFilters}
        onApplyFilters={(f) => {
          setActiveFilters(f)
          setCurrentPage(1)
        }}
        onClearFilters={() => {
          setActiveFilters({
            module: 'All Modules',
            actionType: 'All Types',
            actor: 'All Users',
            status: 'All Results',
            dateRange: 'All Time',
          })
          setCurrentPage(1)
        }}
        availableActors={availableActors}
      />

      {/* Audit Log Table */}
      {filteredLogs.length === 0 ? (
        <EmptyState
          message={
            lang === 'ar'
              ? 'لا توجد سجلات تدقيق مطابقة لمعايير البحث والتصفية المحددة.'
              : 'No audit trail records found matching your filter criteria.'
          }
        />
      ) : (
        <div
          style={{
            borderRadius: '16px',
            border: '1px solid var(--border-card, #e2e8f0)',
            background: 'var(--card-bg, #ffffff)',
            overflow: 'hidden',
            boxShadow: 'var(--card-shadow)',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'start', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-card, #e2e8f0)', background: 'var(--surface-raised, #f8fafc)' }}>
                  <th style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--muted-text)' }}>
                    {lang === 'ar' ? 'الوقت والتاريخ' : 'Timestamp'}
                  </th>
                  <th style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--muted-text)' }}>
                    {lang === 'ar' ? 'المستخدم / المنفذ' : 'User / Actor'}
                  </th>
                  <th style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--muted-text)' }}>
                    {lang === 'ar' ? 'الإجراء والنوع' : 'Action'}
                  </th>
                  <th style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--muted-text)' }}>
                    {lang === 'ar' ? 'الوحدة' : 'Module'}
                  </th>
                  <th style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--muted-text)' }}>
                    {lang === 'ar' ? 'السجل المتأثر' : 'Affected Record'}
                  </th>
                  <th style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--muted-text)' }}>
                    {lang === 'ar' ? 'النتيجة' : 'Result'}
                  </th>
                  <th style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--muted-text)', textAlign: 'end' }}>
                    {lang === 'ar' ? 'التفاصيل' : 'Details'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentLogs.map((log) => {
                  const badgeStyle = getActionBadgeColor(log.actionType)
                  const displayAction = lang === 'ar' && log.action_ar ? log.action_ar : log.action

                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLogId(log.id)}
                      role="button"
                      tabIndex={0}
                      style={{
                        borderBottom: '1px solid var(--border-subtle, #f1f5f9)',
                        cursor: 'pointer',
                        transition: 'background 0.12s ease',
                      }}
                      className="audit-table-row"
                    >
                      {/* Timestamp */}
                      <td style={{ padding: '14px 18px', color: 'var(--heading-text)', whiteSpace: 'nowrap' }}>
                        <span style={{ fontWeight: 600, display: 'block' }}>{log.time}</span>
                        <span style={{ fontSize: '11px', color: 'var(--muted-text)' }}>
                          {formatDate(log.timestamp || log.time, lang)}
                        </span>
                      </td>

                      {/* Actor */}
                      <td style={{ padding: '14px 18px' }}>
                        <strong style={{ color: 'var(--heading-text)', display: 'block' }}>{log.actor}</strong>
                        <span style={{ fontSize: '11.5px', color: 'var(--muted-text)' }}>
                          {log.actorRole || 'Operator'}
                        </span>
                      </td>

                      {/* Action & Action Type Badge */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span
                            style={{
                              padding: '2px 7px',
                              borderRadius: '6px',
                              fontSize: '10.5px',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              background: badgeStyle.bg,
                              color: badgeStyle.color,
                            }}
                          >
                            {log.actionType}
                          </span>
                          <strong style={{ fontSize: '13px', color: 'var(--heading-text)' }}>
                            {displayAction}
                          </strong>
                        </div>
                      </td>

                      {/* Module */}
                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 8px',
                            borderRadius: '8px',
                            background: 'var(--surface-raised, #f8fafc)',
                            border: '1px solid var(--border-subtle, #e2e8f0)',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            color: 'var(--heading-text)',
                          }}
                        >
                          {log.module}
                        </span>
                      </td>

                      {/* Affected Record */}
                      <td style={{ padding: '14px 18px', color: 'var(--navy, #1B3554)', fontWeight: 600 }}>
                        {log.affectedRecord || '—'}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 18px' }}>
                        <StatusPill status={log.status} />
                      </td>

                      {/* View Action */}
                      <td style={{ padding: '14px 18px', textAlign: 'end' }}>
                        <Button
                          variant="secondary"
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedLogId(log.id)
                          }}
                          style={{ height: '32px', padding: '0 10px', fontSize: '11.5px' }}
                        >
                          {lang === 'ar' ? 'عرض الفحص' : 'Inspect'}
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div
            style={{
              padding: '12px 18px',
              borderTop: '1px solid var(--border-card, #e2e8f0)',
              background: 'var(--surface-raised, #f8fafc)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <span style={{ fontSize: '12px', color: 'var(--muted-text)' }}>
              {lang === 'ar'
                ? `عرض ${(currentPage - 1) * ITEMS_PER_PAGE + 1} - ${Math.min(currentPage * ITEMS_PER_PAGE, filteredLogs.length)} من أصل ${filteredLogs.length} سجل`
                : `Showing ${(currentPage - 1) * ITEMS_PER_PAGE + 1} to ${Math.min(currentPage * ITEMS_PER_PAGE, filteredLogs.length)} of ${filteredLogs.length} entries`}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Button
                variant="secondary"
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                style={{ height: '32px', padding: '0 10px', fontSize: '12px' }}
              >
                <ChevronLeft size={14} />
                <span>{lang === 'ar' ? 'السابق' : 'Prev'}</span>
              </Button>

              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--heading-text)', padding: '0 6px' }}>
                {currentPage} / {totalPages}
              </span>

              <Button
                variant="secondary"
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                style={{ height: '32px', padding: '0 10px', fontSize: '12px' }}
              >
                <span>{lang === 'ar' ? 'التالي' : 'Next'}</span>
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Activity Detail Drawer */}
      <AuditDetailDrawer
        log={selectedLog}
        isOpen={Boolean(selectedLogId)}
        onClose={() => setSelectedLogId(null)}
      />
    </section>
  )
}
