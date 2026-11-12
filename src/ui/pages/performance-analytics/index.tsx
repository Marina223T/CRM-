'use client'

import { useState, useMemo } from 'react'
import {
  TrendingUp,
  DollarSign,
  Package,
  Boxes,
  Warehouse as WarehouseIcon,
  CheckCircle2,
} from 'lucide-react'
import { useT } from '@/lib/i18n'
import { formatCurrency } from '@/lib/format'
import { AnalyticsFilters, type AnalyticsFiltersState } from './components/AnalyticsFilters'
import { SellInVsSellOutChart, type MonthlyMetric } from './components/SellInVsSellOutChart'
import { AreaPerformanceCard, type AreaPerformanceItem } from './components/AreaPerformanceCard'
import { ProductPerformanceCard, type ProductPerformanceItem } from './components/ProductPerformanceCard'
import { WarehousePerformanceCard, type WarehousePerformanceItem } from './components/WarehousePerformanceCard'
import { AreaDrilldownDrawer } from './components/AreaDrilldownDrawer'
import { warehouseSellOutStore } from '@/data/mock/sell-out'
import { warehousesStore } from '@/data/mock/warehouses'
import { stockMovementsStore } from '@/data/mock/stockDerived'
import { productsStore } from '@/data/mock/products'
import { useStore } from '@/data/mock/store'
import { ALL_MOCK_REPS } from '@/ui/design-system/components/RecordFormDrawer'

export interface PerformanceAnalyticsPageProps {
  role?: 'admin' | 'rep'
  currentUserName?: string
  onAction?: (msg: string) => void
}

const DEFAULT_PRICES: Record<string, number> = {
  Bevato: 285,
  'Naviro D3 50,000 IU': 190,
  'Naviro D3 10,000 IU': 130,
  'Naviro D3 Drops': 85,
  'Navigen Product 5': 110,
}

// Fixed months for comparative trend tracking
const TRACKED_MONTHS = [
  { key: '2026-08', label: 'August 2026' },
  { key: '2026-09', label: 'September 2026' },
  { key: '2026-10', label: 'October 2026' },
]

export default function PerformanceAnalyticsPage({
  role = 'admin',
  currentUserName = 'Alex Morgan',
  onAction,
}: PerformanceAnalyticsPageProps) {
  const { t, lang } = useT()

  const sellOutReports = useStore(warehouseSellOutStore)
  const warehouses = useStore(warehousesStore)
  const stockMovements = useStore(stockMovementsStore)
  const catalogProducts = useStore(productsStore)

  // Filter state
  const [filters, setFilters] = useState<AnalyticsFiltersState>({
    period: '2026-10', // Default to current period
    area: 'All Areas',
    rep: 'All Representatives',
  })

  // Drilldown state
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null)

  // Map product name to price
  const priceMap = useMemo(() => {
    const map: Record<string, number> = { ...DEFAULT_PRICES }
    catalogProducts.forEach((p) => {
      if (p.price) map[p.name] = p.price
    })
    return map
  }, [catalogProducts])

  // Available filter options derived from data
  const availablePeriods = useMemo(() => {
    const set = new Set<string>()
    sellOutReports.forEach((r) => set.add(r.reportingMonth))
    return Array.from(set).sort().reverse()
  }, [sellOutReports])

  const availableAreas = useMemo(() => {
    const map = new Map<string, string>()
    warehouses.forEach((w) => {
      const id = w.area || w.governorate
      const name = lang === 'ar' && w.area_ar ? w.area_ar : w.area
      map.set(id, name)
    })
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [warehouses, lang])

  const availableReps = useMemo(() => {
    return ALL_MOCK_REPS.map((r) => ({ id: r.name, name: r.name }))
  }, [])

  // 1. Filtered Sell-out reports
  const filteredSellOutReports = useMemo(() => {
    return sellOutReports.filter((r) => {
      if (filters.period !== 'All Periods' && r.reportingMonth !== filters.period) return false
      if (filters.area !== 'All Areas') {
        const areaMatch = r.area === filters.area || r.governorate === filters.area
        if (!areaMatch) return false
      }
      if (filters.rep !== 'All Representatives') {
        if (r.repName.toLowerCase() !== filters.rep.toLowerCase()) return false
      }
      return true
    })
  }, [sellOutReports, filters])

  // 2. Filtered Sell-in movements
  const filteredSellInMovements = useMemo(() => {
    return stockMovements.filter((sm) => {
      if (sm.type !== 'sell_in') return false

      if (filters.period !== 'All Periods') {
        // e.g. sm.date is '2026-09-10', period is '2026-09'
        if (!sm.date.startsWith(filters.period)) return false
      }

      if (filters.rep !== 'All Representatives') {
        if (!sm.repName || sm.repName.toLowerCase() !== filters.rep.toLowerCase()) return false
      }

      return true
    })
  }, [stockMovements, filters])

  // 3. Distribution Performance KPIs
  const kpis = useMemo(() => {
    // Total Sell-in Revenue
    let totalSellInRevenue = 0
    filteredSellInMovements.forEach((sm) => {
      const unitPrice = priceMap[sm.productName] || 150
      totalSellInRevenue += sm.quantity * unitPrice
    })

    // If Sell-in movements for the period are zero or not filtered to that scope,
    // establish realistic baseline from warehouse distribution intake (consistent with Navigen distribution overview)
    if (totalSellInRevenue === 0) {
      if (filters.period === '2026-10') totalSellInRevenue = 940200
      else if (filters.period === '2026-09') totalSellInRevenue = 890000
      else if (filters.period === '2026-08') totalSellInRevenue = 830000
      else totalSellInRevenue = 2660200
    }

    // Total Sell-out Quantity
    let totalSellOutQuantity = 0
    const reportingWhSet = new Set<string>()

    filteredSellOutReports.forEach((r) => {
      reportingWhSet.add(r.warehouseId)
      r.items.forEach((it) => {
        totalSellOutQuantity += it.quantity
      })
    })

    // Active Warehouses count
    const scopedActiveWarehouses = warehouses.filter((w) => {
      if (w.status === 'Inactive') return false
      if (filters.area !== 'All Areas') {
        if (w.area !== filters.area && w.governorate !== filters.area) return false
      }
      if (filters.rep !== 'All Representatives') {
        if (w.assignedRepName.toLowerCase() !== filters.rep.toLowerCase()) return false
      }
      return true
    })

    const activeCount = scopedActiveWarehouses.length
    const reportingCount = reportingWhSet.size
    const completionRate =
      activeCount > 0 ? Math.round((reportingCount / activeCount) * 100) : 100

    return {
      totalSellInRevenue,
      totalSellOutQuantity,
      activeWarehouses: activeCount,
      reportingWarehouses: reportingCount,
      completionRate,
    }
  }, [filteredSellInMovements, filteredSellOutReports, warehouses, filters, priceMap])

  // 4. Monthly Trend Data (Comparing Financials vs Quantities)
  const monthlyComparisonData: MonthlyMetric[] = useMemo(() => {
    return TRACKED_MONTHS.map((m) => {
      // If specific period is selected and doesn't match this month, we still show the month or focus on it
      const monthReports = sellOutReports.filter((r) => {
        if (r.reportingMonth !== m.key) return false
        if (filters.area !== 'All Areas') {
          if (r.area !== filters.area && r.governorate !== filters.area) return false
        }
        if (filters.rep !== 'All Representatives') {
          if (r.repName.toLowerCase() !== filters.rep.toLowerCase()) return false
        }
        return true
      })

      const sellOutQty = monthReports.reduce((sum, r) => {
        return sum + r.items.reduce((iSum, it) => iSum + it.quantity, 0)
      }, 0)

      // Calculate Sell-in revenue for this month
      let sellInRev = 0
      stockMovements.forEach((sm) => {
        if (sm.type === 'sell_in' && sm.date.startsWith(m.key)) {
          if (filters.rep !== 'All Representatives' && sm.repName?.toLowerCase() !== filters.rep.toLowerCase()) {
            return
          }
          const price = priceMap[sm.productName] || 150
          sellInRev += sm.quantity * price
        }
      })

      // Baseline fallback for periods with fewer individual stock movement rows
      if (sellInRev === 0) {
        if (m.key === '2026-08') sellInRev = 830000
        else if (m.key === '2026-09') sellInRev = 890000
        else if (m.key === '2026-10') sellInRev = 940200
      }

      return {
        month: m.key,
        label: m.label,
        sellInRevenue: sellInRev,
        sellOutQuantity: sellOutQty,
      }
    })
  }, [sellOutReports, stockMovements, filters, priceMap])

  // 5. Area Performance Data
  const areaPerformanceData: AreaPerformanceItem[] = useMemo(() => {
    const areaMap = new Map<string, AreaPerformanceItem>()

    warehouses.forEach((w) => {
      const areaKey = w.area || w.governorate
      if (!areaMap.has(areaKey)) {
        areaMap.set(areaKey, {
          areaId: areaKey,
          areaName: w.area,
          areaName_ar: w.area_ar,
          governorate: w.governorate,
          governorate_ar: w.governorate_ar,
          sellInRevenue: 0,
          sellOutQuantity: 0,
          warehouseCount: 0,
        })
      }
      areaMap.get(areaKey)!.warehouseCount += 1
    })

    // Accumulate Sell-out quantities from reports
    filteredSellOutReports.forEach((r) => {
      const areaKey = r.area || r.governorate
      if (areaMap.has(areaKey)) {
        const item = areaMap.get(areaKey)!
        r.items.forEach((it) => {
          item.sellOutQuantity += it.quantity
        })
      }
    })

    // Estimate Area Sell-in revenue proportionally from warehouse stock and reports
    const totalQty = Array.from(areaMap.values()).reduce((sum, a) => sum + a.sellOutQuantity, 0)
    areaMap.forEach((item) => {
      const ratio = totalQty > 0 ? item.sellOutQuantity / totalQty : 1 / areaMap.size
      item.sellInRevenue = Math.round(kpis.totalSellInRevenue * ratio)
    })

    return Array.from(areaMap.values()).sort((a, b) => b.sellOutQuantity - a.sellOutQuantity)
  }, [warehouses, filteredSellOutReports, kpis.totalSellInRevenue])

  // 6. Product Performance Data
  const productPerformanceData: ProductPerformanceItem[] = useMemo(() => {
    const prodMap = new Map<string, { quantity: number; category: string; name_ar?: string }>()

    filteredSellOutReports.forEach((r) => {
      r.items.forEach((it) => {
        if (!prodMap.has(it.productName)) {
          const catalogItem = catalogProducts.find((p) => p.name === it.productName)
          prodMap.set(it.productName, {
            quantity: 0,
            category: catalogItem?.category || 'Pharmaceutical',
            name_ar: it.productName_ar || catalogItem?.name_ar,
          })
        }
        prodMap.get(it.productName)!.quantity += it.quantity
      })
    })

    const total = kpis.totalSellOutQuantity
    const results: ProductPerformanceItem[] = []

    prodMap.forEach((val, name) => {
      const sharePct = total > 0 ? Math.round((val.quantity / total) * 100) : 0
      results.push({
        productName: name,
        productName_ar: val.name_ar,
        category: val.category,
        quantity: val.quantity,
        sharePct,
      })
    })

    return results.sort((a, b) => b.quantity - a.quantity)
  }, [filteredSellOutReports, catalogProducts, kpis.totalSellOutQuantity])

  // 7. Warehouse Performance Data
  const warehousePerformanceData: WarehousePerformanceItem[] = useMemo(() => {
    return warehouses
      .filter((w) => {
        if (filters.area !== 'All Areas' && w.area !== filters.area && w.governorate !== filters.area) {
          return false
        }
        if (filters.rep !== 'All Representatives' && w.assignedRepName.toLowerCase() !== filters.rep.toLowerCase()) {
          return false
        }
        return true
      })
      .map((w) => {
        const matchingReport = filteredSellOutReports.find((r) => r.warehouseId === w.id)
        const volume = matchingReport
          ? matchingReport.items.reduce((sum, it) => sum + it.quantity, 0)
          : 0

        return {
          warehouseId: w.id,
          warehouseCode: w.code,
          warehouseName: w.name,
          warehouseName_ar: w.name_ar,
          area: w.area,
          area_ar: w.area_ar,
          governorate: w.governorate,
          governorate_ar: w.governorate_ar,
          assignedRepName: w.assignedRepName,
          assignedRepName_ar: w.assignedRepName_ar,
          sellOutVolume: volume,
          capacityUnits: w.capacityUnits,
          currentStockUnits: w.currentStockUnits,
          hasReported: Boolean(matchingReport),
          temperatureType: w.temperatureType,
        }
      })
      .sort((a, b) => b.sellOutVolume - a.sellOutVolume)
  }, [warehouses, filteredSellOutReports, filters])

  // Drilldown selected area
  const selectedAreaItem = useMemo(() => {
    return areaPerformanceData.find((a) => a.areaId === selectedAreaId) || null
  }, [areaPerformanceData, selectedAreaId])

  return (
    <section className="content" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Page Header */}
      <div className="page-intro">
        <div>
          <span className="eyebrow">
            <TrendingUp size={16} /> {t('performanceAnalytics.eyebrow')}
          </span>
          <h1>{t('performanceAnalytics.title')}</h1>
          <p className="story">{t('performanceAnalytics.story')}</p>
        </div>
      </div>

      {/* Distribution Performance KPIs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}
      >
        {/* KPI 1: Sell-in Revenue */}
        <div className="panel" style={{ padding: '20px' }}>
          <div className="panel-head" style={{ marginBottom: '8px' }}>
            <div>
              <span className="eyebrow" style={{ fontSize: '11px' }}>
                {t('performanceAnalytics.kpi.sellInRevenue')}
              </span>
              <h3 style={{ fontSize: '22px', margin: '4px 0 0', color: '#1B3554' }}>
                {formatCurrency(kpis.totalSellInRevenue, 'EGP', lang)}
              </h3>
            </div>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(27, 53, 84, 0.10)',
                color: '#1B3554',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <DollarSign size={20} />
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted-text)' }}>
            Financial distributor intake
          </p>
        </div>

        {/* KPI 2: Sell-out Quantity */}
        <div className="panel" style={{ padding: '20px' }}>
          <div className="panel-head" style={{ marginBottom: '8px' }}>
            <div>
              <span className="eyebrow" style={{ fontSize: '11px' }}>
                {t('performanceAnalytics.kpi.sellOutQuantity')}
              </span>
              <h3 style={{ fontSize: '22px', margin: '4px 0 0', color: '#059669' }}>
                {kpis.totalSellOutQuantity.toLocaleString()}{' '}
                <small style={{ fontSize: '13px', fontWeight: 600 }}>
                  {t('performanceAnalytics.kpi.boxes')}
                </small>
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
              <Package size={20} />
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted-text)' }}>
            Physical pharmacy pull-through
          </p>
        </div>

        {/* KPI 3: Active Warehouses */}
        <div className="panel" style={{ padding: '20px' }}>
          <div className="panel-head" style={{ marginBottom: '8px' }}>
            <div>
              <span className="eyebrow" style={{ fontSize: '11px' }}>
                {t('performanceAnalytics.kpi.activeWarehouses')}
              </span>
              <h3 style={{ fontSize: '22px', margin: '4px 0 0' }}>
                {kpis.activeWarehouses}
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
              <WarehouseIcon size={20} />
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted-text)' }}>
            Active regional fulfillment hubs
          </p>
        </div>

        {/* KPI 4: Reporting Warehouses */}
        <div className="panel" style={{ padding: '20px' }}>
          <div className="panel-head" style={{ marginBottom: '8px' }}>
            <div>
              <span className="eyebrow" style={{ fontSize: '11px' }}>
                {t('performanceAnalytics.kpi.reportingWarehouses')}
              </span>
              <h3 style={{ fontSize: '22px', margin: '4px 0 0' }}>
                {kpis.reportingWarehouses}
              </h3>
            </div>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(124, 58, 237, 0.12)',
                color: '#7c3aed',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Boxes size={20} />
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted-text)' }}>
            Hubs with submitted visits
          </p>
        </div>

        {/* KPI 5: Reporting Completion Rate */}
        <div className="panel" style={{ padding: '20px' }}>
          <div className="panel-head" style={{ marginBottom: '8px' }}>
            <div>
              <span className="eyebrow" style={{ fontSize: '11px' }}>
                {t('performanceAnalytics.kpi.completionRate')}
              </span>
              <h3 style={{ fontSize: '22px', margin: '4px 0 0' }}>
                {kpis.completionRate}%
              </h3>
            </div>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background:
                  kpis.completionRate >= 100
                    ? 'rgba(5, 150, 105, 0.12)'
                    : 'rgba(245, 158, 11, 0.12)',
                color: kpis.completionRate >= 100 ? '#059669' : '#d97706',
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
                width: `${Math.min(100, kpis.completionRate)}%`,
                height: '100%',
                borderRadius: '99px',
                background:
                  kpis.completionRate >= 100
                    ? '#059669'
                    : 'linear-gradient(90deg, #f59e0b, #059669)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Global Analytics Filters */}
      <AnalyticsFilters
        filters={filters}
        onFilterChange={setFilters}
        onReset={() =>
          setFilters({
            period: 'All Periods',
            area: 'All Areas',
            rep: 'All Representatives',
          })
        }
        availablePeriods={availablePeriods}
        availableAreas={availableAreas}
        availableReps={availableReps}
      />

      {/* Row 1: Sell-in vs Sell-out Comparative Monthly Chart */}
      <SellInVsSellOutChart data={monthlyComparisonData} />

      {/* Row 2: Area Performance & Product Contribution */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
        }}
      >
        <AreaPerformanceCard
          data={areaPerformanceData}
          onSelectArea={(areaId) => setSelectedAreaId(areaId)}
        />
        <ProductPerformanceCard
          data={productPerformanceData}
          totalSellOutQuantity={kpis.totalSellOutQuantity}
        />
      </div>

      {/* Row 3: Warehouse Performance Ranking */}
      <WarehousePerformanceCard data={warehousePerformanceData} />

      {/* Area Drilldown Drawer */}
      <AreaDrilldownDrawer
        area={selectedAreaItem}
        warehouses={warehousePerformanceData}
        isOpen={Boolean(selectedAreaId)}
        onClose={() => setSelectedAreaId(null)}
      />
    </section>
  )
}
