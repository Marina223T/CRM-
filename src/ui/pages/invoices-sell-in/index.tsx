import { useState, useEffect } from 'react'
import { FileText, ArrowUpRight, Plus, Receipt } from 'lucide-react'
import { Button } from '@/ui/design-system/components/Button'
import { Chip } from '@/ui/design-system/components/Chip'
import { EmptyState } from '@/ui/design-system/components/EmptyState'
import { Toast } from '@/ui/design-system/components/Toast'
import { InvoiceToolbar, type InvoiceFiltersState, STATUS_KEYS, DATE_KEYS, SOURCE_KEYS } from '@/ui/pages/invoices/components/InvoiceToolbar'
import { InvoiceListItem } from '@/ui/pages/invoices/components/InvoiceListItem'
import { invoicesStore, type StoredInvoice } from '@/data/mock/invoices'
import { useStore } from '@/data/mock/store'
import { useT } from '@/lib/i18n'

import { SellInMetrics } from '@/ui/pages/sell-in/components/SellInMetrics'
import { SellInTable } from '@/ui/pages/sell-in/components/SellInTable'
import { CreateSalesOrderDrawer } from '@/ui/pages/sell-in/components/CreateSalesOrderDrawer'
import { SalesOrderDetailDrawer } from '@/ui/pages/sell-in/components/SalesOrderDetailDrawer'

export interface InvoicesSellInPageProps {
  initialTab?: 'invoices' | 'sell-in'
  onAddInvoice?: () => void
  onItemInvoice?: (invoice: StoredInvoice) => void
  invoiceFilter?: string | null
  onClearInvoiceFilter?: () => void
  role?: 'admin' | 'rep'
  currentUserName?: string
  onAction?: (message: string) => void
}

export default function InvoicesSellInPage({
  initialTab = 'invoices',
  onAddInvoice,
  onItemInvoice,
  invoiceFilter,
  onClearInvoiceFilter,
  role = 'admin',
  currentUserName = 'Alex Morgan',
  onAction,
}: InvoicesSellInPageProps) {
  const { t, lang } = useT()
  const [activeTab, setActiveTab] = useState<'invoices' | 'sell-in'>(initialTab)

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab)
    }
  }, [initialTab])

  // --- Invoices Tab State ---
  const invoicesMockData = useStore(invoicesStore)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('list')
  const [activeFilters, setActiveFilters] = useState<InvoiceFiltersState>({
    status: invoiceFilter || 'All statuses',
    dateRange: 'All time',
    source: 'All sources',
  })

  // Role scoping: Reps only see their assigned invoices
  const roleScopedInvoices = role === 'rep'
    ? invoicesMockData.filter((inv) => inv.repName.toLowerCase() === currentUserName.toLowerCase())
    : invoicesMockData

  const displayedInvoices = roleScopedInvoices.filter((invoice) => {
    if (searchQuery) {
      const matchName = invoice.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchMeta = invoice.meta.toLowerCase().includes(searchQuery.toLowerCase())
      if (!matchName && !matchMeta) return false
    }

    const effectiveStatus = invoiceFilter || activeFilters.status
    if (effectiveStatus !== 'All statuses' && invoice.status.toLowerCase() !== effectiveStatus.toLowerCase()) {
      return false
    }

    if (activeFilters.dateRange !== 'All time' && invoice.dateRange !== activeFilters.dateRange) {
      return false
    }

    if (activeFilters.source !== 'All sources' && invoice.source !== activeFilters.source) {
      return false
    }

    return true
  })

  const [sortField, setSortField] = useState<'id' | 'status'>('id')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const toggleSort = (field: 'id' | 'status') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const sortedInvoices = [...displayedInvoices].sort((a, b) => {
    if (sortField === 'id') {
      const cmp = a.name.localeCompare(b.name)
      return sortOrder === 'desc' ? -cmp : cmp
    } else {
      const cmp = a.status.localeCompare(b.status)
      return sortOrder === 'desc' ? -cmp : cmp
    }
  })

  const removeStatus = () => {
    setActiveFilters((prev) => ({ ...prev, status: 'All statuses' }))
    if (onClearInvoiceFilter) onClearInvoiceFilter()
  }

  const removeDateRange = () => setActiveFilters((prev) => ({ ...prev, dateRange: 'All time' }))
  const removeSource = () => setActiveFilters((prev) => ({ ...prev, source: 'All sources' }))

  const effectiveStatus = invoiceFilter || activeFilters.status
  const hasAnyFilter =
    effectiveStatus !== 'All statuses' ||
    activeFilters.dateRange !== 'All time' ||
    activeFilters.source !== 'All sources'

  // --- Sell-in Tab State ---
  const [createOrderOpen, setCreateOrderOpen] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [notice, setNotice] = useState('')

  const notify = (message: string) => {
    onAction?.(message)
    setNotice(message)
    window.setTimeout(() => setNotice(''), 2600)
  }

  const pendingInvoicesCount = roleScopedInvoices.filter((inv) => inv.status === 'Pending').length

  return (
    <section className="content" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Page Introduction Header */}
      <div className="page-intro">
        <div>
          <span className="eyebrow">
            {activeTab === 'invoices' ? <FileText /> : <ArrowUpRight />} {t('invoicesSellIn.eyebrow')}
          </span>
          <h1>{t('invoicesSellIn.title')}</h1>
          <p className="story">{t('invoicesSellIn.story')}</p>
        </div>

        <div>
          {activeTab === 'invoices' ? (
            <Button variant="primary" onClick={onAddInvoice}>
              <Plus data-icon="inline-start" /> {t('invoices.addNew')}
            </Button>
          ) : (
            <Button variant="primary" onClick={() => setCreateOrderOpen(true)}>
              <Plus data-icon="inline-start" /> {t('salesOrders.createTitle')}
            </Button>
          )}
        </div>
      </div>

      {/* Internal Navigation Tabs */}
      <div
        role="tablist"
        aria-label={t('invoicesSellIn.title')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          paddingBottom: '12px',
          borderBottom: '1px solid var(--border-soft)',
        }}
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'invoices'}
          onClick={() => setActiveTab('invoices')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            borderRadius: '99px',
            fontSize: '13.5px',
            fontWeight: activeTab === 'invoices' ? 700 : 500,
            cursor: 'pointer',
            transition: 'all 0.18s ease',
            border: activeTab === 'invoices'
              ? '1px solid var(--navy, #1B3554)'
              : '1px solid var(--border-soft)',
            background: activeTab === 'invoices'
              ? 'rgba(27, 53, 84, 0.10)'
              : 'var(--surface)',
            color: activeTab === 'invoices'
              ? 'var(--navy, #1B3554)'
              : 'var(--muted-text)',
          }}
        >
          <FileText size={16} />
          <span>{t('invoicesSellIn.tabInvoices')}</span>
          {pendingInvoicesCount > 0 && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '1px 7px',
                borderRadius: '99px',
                background: 'var(--amber, #f59e0b)',
                color: '#000F22',
                lineHeight: 1.2,
              }}
            >
              {pendingInvoicesCount}
            </span>
          )}
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'sell-in'}
          onClick={() => setActiveTab('sell-in')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            borderRadius: '99px',
            fontSize: '13.5px',
            fontWeight: activeTab === 'sell-in' ? 700 : 500,
            cursor: 'pointer',
            transition: 'all 0.18s ease',
            border: activeTab === 'sell-in'
              ? '1px solid var(--navy, #1B3554)'
              : '1px solid var(--border-soft)',
            background: activeTab === 'sell-in'
              ? 'rgba(27, 53, 84, 0.10)'
              : 'var(--surface)',
            color: activeTab === 'sell-in'
              ? 'var(--navy, #1B3554)'
              : 'var(--muted-text)',
          }}
        >
          <ArrowUpRight size={16} />
          <span>{t('invoicesSellIn.tabSellIn')}</span>
        </button>
      </div>

      {/* TAB 1: INVOICES CONTENT */}
      {activeTab === 'invoices' && (
        <div role="tabpanel" aria-label={t('invoicesSellIn.tabInvoices')}>
          <InvoiceToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            viewMode={viewMode}
            onToggleView={() => setViewMode(viewMode === 'list' ? 'cards' : 'list')}
            activeFilters={activeFilters}
            onApplyFilters={(f) => {
              setActiveFilters(f)
              if (invoiceFilter && f.status !== invoiceFilter && onClearInvoiceFilter) {
                onClearInvoiceFilter()
              }
            }}
            onClearFilters={() => {
              setActiveFilters({
                status: 'All statuses',
                dateRange: 'All time',
                source: 'All sources',
              })
              if (onClearInvoiceFilter) onClearInvoiceFilter()
            }}
          />

          {/* Applied Removable Filter Chips */}
          {hasAnyFilter && (
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', margin: '0 0 16px' }}>
              <span style={{ fontSize: '12px', color: 'var(--muted-text)' }}>{t('invoices.activeFilters')}</span>
              {effectiveStatus !== 'All statuses' && (
                <Chip active onClick={removeStatus} title={t('invoices.clearStatusFilter')}>
                  {STATUS_KEYS[effectiveStatus] ? t(STATUS_KEYS[effectiveStatus] as any) : effectiveStatus} &times;
                </Chip>
              )}
              {activeFilters.dateRange !== 'All time' && (
                <Chip active onClick={removeDateRange} title={t('invoices.clearDateRangeFilter')}>
                  {DATE_KEYS[activeFilters.dateRange] ? t(DATE_KEYS[activeFilters.dateRange] as any) : activeFilters.dateRange} &times;
                </Chip>
              )}
              {activeFilters.source !== 'All sources' && (
                <Chip active onClick={removeSource} title={t('invoices.clearSourceFilter')}>
                  {SOURCE_KEYS[activeFilters.source] ? t(SOURCE_KEYS[activeFilters.source] as any) : activeFilters.source} &times;
                </Chip>
              )}
            </div>
          )}

          {/* Sortable Column Headers */}
          {viewMode === 'list' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 16px', fontSize: '11px', color: 'var(--muted-text)', fontWeight: 600 }}>
              <button
                onClick={() => toggleSort('id')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 600, padding: 0 }}
              >
                {t('invoices.table.invoice')} {sortField === 'id' ? (sortOrder === 'desc' ? '▼' : '▲') : ''}
              </button>
              <button
                onClick={() => toggleSort('status')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 600, padding: 0 }}
              >
                {t('invoices.table.status')} {sortField === 'status' ? (sortOrder === 'desc' ? '▼' : '▲') : ''}
              </button>
            </div>
          )}

          {/* Collection items in List or Cards layout */}
          <div
            className="collection-list"
            style={
              viewMode === 'cards'
                ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }
                : undefined
            }
          >
            {sortedInvoices.length > 0 ? (
              sortedInvoices.map((invoice) => (
                <InvoiceListItem
                  key={invoice.name}
                  item={invoice}
                  onClick={() => onItemInvoice?.(invoice)}
                />
              ))
            ) : (
              <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--muted-text)' }}>
                {t('invoices.noMatches')}
              </div>
            )}
          </div>

          <EmptyState />
        </div>
      )}

      {/* TAB 2: SELL-IN CONTENT */}
      {activeTab === 'sell-in' && (
        <div role="tabpanel" aria-label={t('invoicesSellIn.tabSellIn')}>
          <SellInMetrics />
          <div style={{ marginTop: '24px' }}>
            <SellInTable
              onSelect={setSelectedOrderId}
              onCreate={() => setCreateOrderOpen(true)}
            />
          </div>
        </div>
      )}

      {/* Sell-in Modals / Drawers */}
      {createOrderOpen && (
        <CreateSalesOrderDrawer
          onClose={() => setCreateOrderOpen(false)}
          onSaved={() => {
            setCreateOrderOpen(false)
            notify(t('salesOrders.createSuccess'))
          }}
        />
      )}

      {selectedOrderId && (
        <SalesOrderDetailDrawer
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
          onAction={notify}
        />
      )}

      {notice && !onAction && <Toast message={notice} />}
    </section>
  )
}
