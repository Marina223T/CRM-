'use client'

import { useState, useMemo } from 'react'
import {
  Activity,
  Plus,
  Boxes,
  Warehouse as WarehouseIcon,
  Package,
  CheckCircle2,
  PieChart,
  Calendar,
  MapPin,
  User,
  ChevronRight,
  Edit3,
} from 'lucide-react'
import { Button } from '@/ui/design-system/components/Button'
import { EmptyState } from '@/ui/design-system/components/EmptyState'
import { Toast } from '@/ui/design-system/components/Toast'
import { SellOutToolbar, type SellOutFiltersState } from './components/SellOutToolbar'
import { RecordWarehouseSellOutDrawer } from './components/RecordWarehouseSellOutDrawer'
import { WarehouseSellOutDetailDrawer } from './components/WarehouseSellOutDetailDrawer'
import { AreaAggregationView } from './components/AreaAggregationView'
import {
  warehouseSellOutStore,
  addOrUpdateWarehouseSellOutReport,
  type WarehouseSellOutReport,
  type SellOutReportItem,
} from '@/data/mock/sell-out'
import { warehousesStore } from '@/data/mock/warehouses'
import { productsStore } from '@/data/mock/products'
import { useStore } from '@/data/mock/store'
import { useT } from '@/lib/i18n'
import { formatDate } from '@/lib/format'
import { ALL_MOCK_REPS } from '@/ui/design-system/components/RecordFormDrawer'

export interface SellOutPageProps {
  role?: 'admin' | 'rep'
  currentUserName?: string
  onAction?: (msg: string) => void
}

export default function SellOutPage({
  role = 'admin',
  currentUserName = 'Alex Morgan',
  onAction,
}: SellOutPageProps) {
  const { t, lang } = useT()
  const reports = useStore(warehouseSellOutStore)
  const allWarehouses = useStore(warehousesStore)
  const allProducts = useStore(productsStore)

  const [activeTab, setActiveTab] = useState<'warehouse-view' | 'area-aggregation'>('warehouse-view')

  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState<SellOutFiltersState>({
    reportingMonth: '2026-10', // Default to current reporting month
    area: 'All Areas',
    warehouseId: 'All Warehouses',
    repId: 'All Representatives',
    productName: 'All Products',
  })

  // Drawers & Selected report
  const [isEntryDrawerOpen, setIsEntryDrawerOpen] = useState(false)
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
  const [editingReport, setEditingReport] = useState<WarehouseSellOutReport | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    onAction?.(msg)
    window.setTimeout(() => setToastMessage(null), 4000)
  }

  // Derive unique filter lists
  const availableMonths = useMemo(() => {
    const set = new Set<string>()
    reports.forEach((r) => set.add(r.reportingMonth))
    return Array.from(set).sort().reverse()
  }, [reports])

  const availableAreas = useMemo(() => {
    const map = new Map<string, string>()
    reports.forEach((r) => {
      const id = r.area || r.governorate
      const name = lang === 'ar' && r.area_ar ? r.area_ar : r.area
      map.set(id, name)
    })
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [reports, lang])

  const availableWarehouses = useMemo(() => {
    return allWarehouses.map((w) => ({
      id: w.id,
      name: lang === 'ar' ? w.name_ar : w.name,
      code: w.code,
    }))
  }, [allWarehouses, lang])

  const availableReps = useMemo(() => {
    return ALL_MOCK_REPS.map((r) => ({ id: r.id, name: r.name }))
  }, [])

  const availableProducts = useMemo(() => {
    return allProducts.map((p) => (lang === 'ar' && p.name_ar ? p.name_ar : p.name))
  }, [allProducts, lang])

  // Filtered reports matching user query & toolbar filters
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      // 1. Month filter
      if (activeFilters.reportingMonth !== 'All Months') {
        if (r.reportingMonth !== activeFilters.reportingMonth) return false
      }

      // 2. Area filter
      if (activeFilters.area !== 'All Areas') {
        const areaKey = r.area || r.governorate
        if (areaKey !== activeFilters.area && r.area !== activeFilters.area) return false
      }

      // 3. Warehouse filter
      if (activeFilters.warehouseId !== 'All Warehouses') {
        if (r.warehouseId !== activeFilters.warehouseId) return false
      }

      // 4. Representative filter
      if (activeFilters.repId !== 'All Representatives') {
        if (r.repId !== activeFilters.repId && r.repName !== activeFilters.repId) return false
      }

      // 5. Product filter
      if (activeFilters.productName !== 'All Products') {
        const hasProduct = r.items.some((it) => {
          const matchEn = it.productName.toLowerCase() === activeFilters.productName.toLowerCase()
          const matchAr = it.productName_ar && it.productName_ar === activeFilters.productName
          return matchEn || matchAr
        })
        if (!hasProduct) return false
      }

      // 6. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchWh = r.warehouseName.toLowerCase().includes(q) || (r.warehouseName_ar && r.warehouseName_ar.includes(q))
        const matchCode = r.warehouseCode.toLowerCase().includes(q)
        const matchArea = r.area.toLowerCase().includes(q) || (r.area_ar && r.area_ar.includes(q))
        const matchRep = r.repName.toLowerCase().includes(q) || (r.repName_ar && r.repName_ar.includes(q))
        const matchProd = r.items.some(
          (it) => it.productName.toLowerCase().includes(q) || (it.productName_ar && it.productName_ar.includes(q))
        )
        if (!matchWh && !matchCode && !matchArea && !matchRep && !matchProd) return false
      }

      return true
    })
  }, [reports, activeFilters, searchQuery])

  // Summary KPIs computation
  const kpis = useMemo(() => {
    let totalQuantity = 0
    const reportingWhSet = new Set<string>()
    const productsSoldSet = new Set<string>()

    filteredReports.forEach((r) => {
      reportingWhSet.add(r.warehouseId)
      r.items.forEach((it) => {
        totalQuantity += it.quantity
        if (it.quantity > 0) productsSoldSet.add(it.productName)
      })
    })

    const totalActiveHubs = allWarehouses.filter((w) => w.status !== 'Inactive').length
    const reportedHubsCount = reportingWhSet.size
    const completionPct =
      totalActiveHubs > 0 ? Math.round((reportedHubsCount / totalActiveHubs) * 100) : 100

    return {
      totalQuantity,
      reportingWarehouses: reportedHubsCount,
      totalActiveHubs,
      productsSold: productsSoldSet.size,
      completionPct,
    }
  }, [filteredReports, allWarehouses])

  // Selected report for detail drawer
  const selectedReport = useMemo(() => {
    return reports.find((r) => r.id === selectedReportId) || null
  }, [reports, selectedReportId])

  // Save report handler
  const handleSaveReport = (data: {
    id?: string
    reportingMonth: string
    warehouseId: string
    warehouseCode: string
    warehouseName: string
    warehouseName_ar?: string
    area: string
    area_ar?: string
    governorate: string
    governorate_ar?: string
    repId: string
    repName: string
    repName_ar?: string
    items: SellOutReportItem[]
    notes?: string
  }) => {
    if (role === 'rep' && editingReport) {
      if (editingReport.repName.toLowerCase() !== currentUserName.toLowerCase()) {
        showToast(t('common.notAuthorized'))
        return
      }
    }
    const isEdit = Boolean(data.id)
    addOrUpdateWarehouseSellOutReport(
      {
        ...data,
        repName: role === 'rep' ? currentUserName : data.repName,
      },
      currentUserName
    )
    showToast(isEdit ? t('sellOut.toast.updated') : t('sellOut.toast.saved'))
    setIsEntryDrawerOpen(false)
    setEditingReport(null)
  }

  const handleOpenEdit = (report: WarehouseSellOutReport) => {
    setSelectedReportId(null)
    setEditingReport(report)
    setIsEntryDrawerOpen(true)
  }

  // Flattened records for warehouse-level table view
  interface FlatRow {
    reportId: string
    warehouseCode: string
    warehouseName: string
    warehouseName_ar?: string
    area: string
    area_ar?: string
    governorate: string
    governorate_ar?: string
    repName: string
    repName_ar?: string
    productName: string
    productName_ar?: string
    quantity: number
    reportingMonth: string
    submissionDate: string
  }

  const flatRows: FlatRow[] = useMemo(() => {
    const rows: FlatRow[] = []
    filteredReports.forEach((r) => {
      // If product filter active, only include matching product row
      const targetItems =
        activeFilters.productName !== 'All Products'
          ? r.items.filter((it) => {
              const matchEn = it.productName.toLowerCase() === activeFilters.productName.toLowerCase()
              const matchAr = it.productName_ar && it.productName_ar === activeFilters.productName
              return matchEn || matchAr
            })
          : r.items

      targetItems.forEach((it) => {
        rows.push({
          reportId: r.id,
          warehouseCode: r.warehouseCode,
          warehouseName: r.warehouseName,
          warehouseName_ar: r.warehouseName_ar,
          area: r.area,
          area_ar: r.area_ar,
          governorate: r.governorate,
          governorate_ar: r.governorate_ar,
          repName: r.repName,
          repName_ar: r.repName_ar,
          productName: it.productName,
          productName_ar: it.productName_ar,
          quantity: it.quantity,
          reportingMonth: r.reportingMonth,
          submissionDate: r.submissionDate,
        })
      })
    })
    return rows
  }, [filteredReports, activeFilters.productName])

  return (
    <section className="content" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Page Header */}
      <div className="page-intro">
        <div>
          <span className="eyebrow">
            <Activity size={16} /> {t('sellOut.eyebrow')}
          </span>
          <h1>{t('sellOut.title')}</h1>
          <p className="story">{t('sellOut.story')}</p>
        </div>

        <div>
          <Button
            variant="primary"
            onClick={() => {
              setEditingReport(null)
              setIsEntryDrawerOpen(true)
            }}
          >
            <Plus data-icon="inline-start" /> {t('sellOut.recordNew')}
          </Button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
        }}
      >
        {/* KPI 1: Total Sell-out Quantity */}
        <div className="panel" style={{ padding: '20px' }}>
          <div className="panel-head" style={{ marginBottom: '8px' }}>
            <div>
              <span className="eyebrow" style={{ fontSize: '11px' }}>
                {t('sellOut.kpi.totalQuantity')}
              </span>
              <h3 style={{ fontSize: '24px', margin: '4px 0 0' }}>
                {kpis.totalQuantity.toLocaleString()}{' '}
                <small style={{ fontSize: '14px', color: 'var(--muted-text)', fontWeight: 600 }}>
                  {t('sellOut.kpi.boxes')}
                </small>
              </h3>
            </div>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(27, 53, 84, 0.10)',
                color: 'var(--navy, #1B3554)',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Boxes size={20} />
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted-text)' }}>
            {activeFilters.reportingMonth !== 'All Months'
              ? `${activeFilters.reportingMonth} period`
              : 'Across all reporting periods'}
          </p>
        </div>

        {/* KPI 2: Number of Reporting Warehouses */}
        <div className="panel" style={{ padding: '20px' }}>
          <div className="panel-head" style={{ marginBottom: '8px' }}>
            <div>
              <span className="eyebrow" style={{ fontSize: '11px' }}>
                {t('sellOut.kpi.reportingWarehouses')}
              </span>
              <h3 style={{ fontSize: '24px', margin: '4px 0 0' }}>
                {kpis.reportingWarehouses}
              </h3>
            </div>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(5, 150, 105, 0.12)',
                color: '#059669',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <WarehouseIcon size={20} />
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted-text)' }}>
            of {kpis.totalActiveHubs} active regional hubs
          </p>
        </div>

        {/* KPI 3: Products Sold */}
        <div className="panel" style={{ padding: '20px' }}>
          <div className="panel-head" style={{ marginBottom: '8px' }}>
            <div>
              <span className="eyebrow" style={{ fontSize: '11px' }}>
                {t('sellOut.kpi.productsSold')}
              </span>
              <h3 style={{ fontSize: '24px', margin: '4px 0 0' }}>
                {kpis.productsSold}
              </h3>
            </div>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(37, 99, 235, 0.12)',
                color: '#2563eb',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Package size={20} />
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted-text)' }}>
            Active SKUs in field distribution
          </p>
        </div>

        {/* KPI 4: Reporting Completion Status */}
        <div className="panel" style={{ padding: '20px' }}>
          <div className="panel-head" style={{ marginBottom: '8px' }}>
            <div>
              <span className="eyebrow" style={{ fontSize: '11px' }}>
                {t('sellOut.kpi.completionStatus')}
              </span>
              <h3 style={{ fontSize: '24px', margin: '4px 0 0' }}>
                {kpis.completionPct}%
              </h3>
            </div>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background:
                  kpis.completionPct >= 100
                    ? 'rgba(5, 150, 105, 0.12)'
                    : 'rgba(245, 158, 11, 0.12)',
                color: kpis.completionPct >= 100 ? '#059669' : '#d97706',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div
            style={{
              width: '100%',
              height: '6px',
              borderRadius: '99px',
              background: 'var(--border-soft)',
              overflow: 'hidden',
              marginTop: '8px',
            }}
          >
            <div
              style={{
                width: `${Math.min(100, kpis.completionPct)}%`,
                height: '100%',
                borderRadius: '99px',
                background:
                  kpis.completionPct >= 100
                    ? '#059669'
                    : 'linear-gradient(90deg, #f59e0b, #059669)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Internal Navigation Tabs (Warehouse-Level vs Area Aggregation) */}
      <div
        role="tablist"
        aria-label={t('sellOut.title')}
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
          aria-selected={activeTab === 'warehouse-view'}
          onClick={() => setActiveTab('warehouse-view')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            borderRadius: '99px',
            fontSize: '13.5px',
            fontWeight: activeTab === 'warehouse-view' ? 700 : 500,
            cursor: 'pointer',
            transition: 'all 0.18s ease',
            border:
              activeTab === 'warehouse-view'
                ? '1px solid var(--navy, #1B3554)'
                : '1px solid var(--border-soft)',
            background:
              activeTab === 'warehouse-view'
                ? 'rgba(27, 53, 84, 0.10)'
                : 'var(--surface)',
            color:
              activeTab === 'warehouse-view'
                ? 'var(--navy, #1B3554)'
                : 'var(--muted-text)',
          }}
        >
          <WarehouseIcon size={16} />
          <span>{t('sellOut.tabs.warehouseView')}</span>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '1px 7px',
              borderRadius: '99px',
              background: 'var(--surface-raised)',
              color: 'var(--heading-text)',
            }}
          >
            {flatRows.length}
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'area-aggregation'}
          onClick={() => setActiveTab('area-aggregation')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            borderRadius: '99px',
            fontSize: '13.5px',
            fontWeight: activeTab === 'area-aggregation' ? 700 : 500,
            cursor: 'pointer',
            transition: 'all 0.18s ease',
            border:
              activeTab === 'area-aggregation'
                ? '1px solid var(--navy, #1B3554)'
                : '1px solid var(--border-soft)',
            background:
              activeTab === 'area-aggregation'
                ? 'rgba(27, 53, 84, 0.10)'
                : 'var(--surface)',
            color:
              activeTab === 'area-aggregation'
                ? 'var(--navy, #1B3554)'
                : 'var(--muted-text)',
          }}
        >
          <PieChart size={16} />
          <span>{t('sellOut.tabs.areaAggregation')}</span>
        </button>
      </div>

      {/* Toolbar & Filters (Shared across both tabs) */}
      <SellOutToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilters={activeFilters}
        onApplyFilters={setActiveFilters}
        onClearFilters={() =>
          setActiveFilters({
            reportingMonth: 'All Months',
            area: 'All Areas',
            warehouseId: 'All Warehouses',
            repId: 'All Representatives',
            productName: 'All Products',
          })
        }
        availableMonths={availableMonths}
        availableAreas={availableAreas}
        availableWarehouses={availableWarehouses}
        availableReps={availableReps}
        availableProducts={availableProducts}
      />

      {/* Tab 1: Warehouse-Level Records */}
      {activeTab === 'warehouse-view' ? (
        flatRows.length === 0 ? (
          <div style={{ marginTop: '20px' }}>
            <EmptyState message={t('sellOut.empty')} />
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
              <Button
                variant="secondary"
                onClick={() => {
                  setSearchQuery('')
                  setActiveFilters({
                    reportingMonth: 'All Months',
                    area: 'All Areas',
                    warehouseId: 'All Warehouses',
                    repId: 'All Representatives',
                    productName: 'All Products',
                  })
                }}
              >
                {t('sellOut.toolbar.clearFilters')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="collection-list">
            {flatRows.map((row, idx) => {
              const displayWh =
                lang === 'ar' && row.warehouseName_ar ? row.warehouseName_ar : row.warehouseName
              const displayArea =
                lang === 'ar' && row.area_ar ? row.area_ar : row.area
              const displayRep =
                lang === 'ar' && row.repName_ar ? row.repName_ar : row.repName
              const displayProd =
                lang === 'ar' && row.productName_ar ? row.productName_ar : row.productName

              return (
                <div
                  key={`${row.reportId}-${row.productName}-${idx}`}
                  className="collection-item"
                  onClick={() => setSelectedReportId(row.reportId)}
                  role="button"
                  tabIndex={0}
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    borderRadius: '16px',
                    transition: 'transform 0.15s ease',
                  }}
                >
                  {/* Warehouse & Code */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1.4 }}>
                    <div
                      className="item-icon"
                      style={{ background: 'rgba(27, 53, 84, 0.08)' }}
                    >
                      <WarehouseIcon size={18} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '14.5px', color: 'var(--heading-text)' }}>
                        {displayWh}
                      </strong>
                      <span style={{ fontSize: '12px', color: 'var(--muted-text)', marginTop: '2px' }}>
                        {row.warehouseCode} · {row.reportingMonth}
                      </span>
                    </div>
                  </div>

                  {/* Area / Governorate */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={13} style={{ color: 'var(--muted-text)' }} />
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--heading-text)' }}>
                        {displayArea}
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--muted-text)' }}>
                      {lang === 'ar' ? row.governorate_ar : row.governorate}
                    </span>
                  </div>

                  {/* Sales Representative */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <User size={13} style={{ color: 'var(--muted-text)' }} />
                      <span style={{ fontSize: '13px', color: 'var(--heading-text)' }}>
                        {displayRep}
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--muted-text)' }}>
                      {t('sellOut.table.rep')}
                    </span>
                  </div>

                  {/* Product & Quantity */}
                  <div style={{ flex: 1.2, textAlign: 'end', marginInlineEnd: '14px' }}>
                    <strong style={{ fontSize: '14px', color: 'var(--heading-text)', display: 'block' }}>
                      {displayProd}
                    </strong>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--navy, #1B3554)' }}>
                      {row.quantity.toLocaleString()} {t('sellOut.kpi.boxes')}
                    </span>
                  </div>

                  {/* Submission Date & Chevron */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '11.5px', color: 'var(--muted-text)' }}>
                      {formatDate(row.submissionDate, lang)}
                    </span>
                    <ChevronRight size={18} style={{ color: 'var(--sky, #0284c7)' }} />
                  </div>
                </div>
              )
            })}
          </div>
        )
      ) : (
        /* Tab 2: Area-Level Aggregation (Derived dynamically from warehouse records) */
        <AreaAggregationView
          reports={filteredReports}
          reportingMonth={activeFilters.reportingMonth}
        />
      )}

      {/* Warehouse Sell-out Detail Drawer */}
      <WarehouseSellOutDetailDrawer
        report={selectedReport}
        isOpen={Boolean(selectedReportId)}
        onClose={() => setSelectedReportId(null)}
        onEdit={handleOpenEdit}
        canEdit={role === 'admin' || selectedReport?.repName.toLowerCase() === currentUserName.toLowerCase()}
      />

      {/* Add / Edit Warehouse Sell-out Drawer */}
      <RecordWarehouseSellOutDrawer
        isOpen={isEntryDrawerOpen}
        onClose={() => {
          setIsEntryDrawerOpen(false)
          setEditingReport(null)
        }}
        onSave={handleSaveReport}
        existingReport={editingReport}
        currentUserName={currentUserName}
        role={role}
      />

      {/* Toast Feedback */}
      {toastMessage && <Toast message={toastMessage} />}
    </section>
  )
}
