import { useState, useMemo } from 'react'
import {
  Warehouse as WarehouseIcon,
  Plus,
  Boxes,
  Thermometer,
  ShieldCheck,
  TrendingUp,
  MapPin,
  User,
  ChevronRight,
  Package,
  Layers,
  ArrowUpRight,
} from 'lucide-react'
import { Button } from '@/ui/design-system/components/Button'
import { EmptyState } from '@/ui/design-system/components/EmptyState'
import { StatusPill } from '@/ui/design-system/components/StatusPill'
import { Toast } from '@/ui/design-system/components/Toast'
import { WarehouseToolbar, type WarehouseFiltersState } from './components/WarehouseToolbar'
import { WarehouseDetailDrawer } from './components/WarehouseDetailDrawer'
import { WarehouseFormDrawer } from './components/WarehouseFormDrawer'
import {
  warehousesStore,
  addWarehouse,
  updateWarehouse,
  type Warehouse,
} from '@/data/mock/warehouses'
import { useStore } from '@/data/mock/store'
import { useT } from '@/lib/i18n'
import { formatCurrency } from '@/lib/format'

export interface WarehousesPageProps {
  role?: 'admin' | 'rep'
  currentUserName?: string
  onAction?: (msg: string) => void
}

const PRODUCT_PRICE_ESTIMATES: Record<string, number> = {
  Bevato: 285,
  'Naviro D3 50,000 IU': 190,
  'Naviro D3 10,000 IU': 130,
  'Naviro D3 Drops': 85,
  'Navigen Product 5': 110,
}

export default function WarehousesPage({
  role = 'admin',
  currentUserName = 'Alex Morgan',
  onAction,
}: WarehousesPageProps) {
  const { t, lang } = useT()
  const warehouses = useStore(warehousesStore)

  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('list')
  const [activeFilters, setActiveFilters] = useState<WarehouseFiltersState>({
    area: 'All areas',
    status: 'All statuses',
  })

  // Drawers
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    onAction?.(msg)
    window.setTimeout(() => setToastMessage(null), 4000)
  }

  // Derive available filter options
  const availableAreas = useMemo(() => {
    const set = new Set<string>()
    warehouses.forEach((w) => {
      set.add(lang === 'ar' ? w.area_ar : w.area)
    })
    return Array.from(set).sort()
  }, [warehouses, lang])

  const availableStatuses = useMemo(() => {
    const set = new Set<string>()
    warehouses.forEach((w) => set.add(w.status))
    return Array.from(set)
  }, [warehouses])

  // Filtered warehouses
  const filteredWarehouses = useMemo(() => {
    return warehouses.filter((wh) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchName = wh.name.toLowerCase().includes(q) || wh.name_ar.includes(q)
        const matchCode = wh.code.toLowerCase().includes(q)
        const matchArea = wh.area.toLowerCase().includes(q) || wh.area_ar.includes(q)
        const matchRep =
          wh.assignedRepName.toLowerCase().includes(q) ||
          (wh.assignedRepName_ar && wh.assignedRepName_ar.includes(q))
        if (!matchName && !matchCode && !matchArea && !matchRep) return false
      }

      // 2. Area Filter
      if (activeFilters.area !== 'All areas') {
        const currentAreaLabel = lang === 'ar' ? wh.area_ar : wh.area
        if (currentAreaLabel !== activeFilters.area && wh.area !== activeFilters.area) {
          return false
        }
      }

      // 3. Status Filter
      if (activeFilters.status !== 'All statuses') {
        if (wh.status !== activeFilters.status) {
          return false
        }
      }

      return true
    })
  }, [warehouses, searchQuery, activeFilters, lang])

  // Summary KPI computations
  const kpis = useMemo(() => {
    const totalHubs = warehouses.length
    const activeHubs = warehouses.filter((w) => w.status === 'Active').length
    const nearCapacityHubs = warehouses.filter((w) => w.status === 'Near Capacity').length
    const totalCapacity = warehouses.reduce((sum, w) => sum + w.capacityUnits, 0)
    const totalStoredUnits = warehouses.reduce((sum, w) => sum + w.currentStockUnits, 0)
    const utilizationRate = totalCapacity > 0 ? Math.round((totalStoredUnits / totalCapacity) * 100) : 0
    const coldChainCount = warehouses.filter((w) => w.temperatureType !== 'Ambient (15-25°C)').length

    let estimatedTotalValue = 0
    warehouses.forEach((w) => {
      w.products.forEach((p) => {
        const price = PRODUCT_PRICE_ESTIMATES[p.productName] || 150
        estimatedTotalValue += p.quantity * price
      })
    })

    return {
      totalHubs,
      activeHubs,
      nearCapacityHubs,
      totalCapacity,
      totalStoredUnits,
      utilizationRate,
      coldChainCount,
      estimatedTotalValue,
    }
  }, [warehouses])

  const selectedWarehouse = useMemo(() => {
    return warehouses.find((w) => w.id === selectedWarehouseId) || null
  }, [warehouses, selectedWarehouseId])

  const handleOpenAdd = () => {
    setEditingWarehouse(null)
    setIsFormOpen(true)
  }

  const handleOpenEdit = (wh: Warehouse) => {
    setSelectedWarehouseId(null)
    setEditingWarehouse(wh)
    setIsFormOpen(true)
  }

  const handleSaveWarehouse = (
    data: Omit<Warehouse, 'id' | 'currentStockUnits' | 'products' | 'lastAuditDate' | 'updated_at'> & {
      id?: string
    }
  ) => {
    if (!canManage) {
      showToast(t('common.notAuthorized'))
      return
    }
    if (data.id) {
      updateWarehouse(data.id, data, currentUserName)
      showToast(t('warehouses.toast.updated'))
    } else {
      addWarehouse(
        {
          ...data,
          currentStockUnits: 0,
          products: [],
          lastAuditDate: new Date().toISOString().split('T')[0],
        },
        currentUserName
      )
      showToast(t('warehouses.toast.added'))
    }
    setIsFormOpen(false)
    setEditingWarehouse(null)
  }

  const canManage = role === 'admin'

  return (
    <section className="content" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Introduction */}
      <div className="page-intro">
        <div>
          <span className="eyebrow">
            <WarehouseIcon size={16} /> {t('warehouses.eyebrow')}
          </span>
          <h1>{t('warehouses.title')}</h1>
          <p className="story">{t('warehouses.story')}</p>
        </div>

        <div>
          {canManage && (
            <Button variant="primary" onClick={handleOpenAdd}>
              <Plus data-icon="inline-start" /> {t('warehouses.addNew')}
            </Button>
          )}
        </div>
      </div>

      {/* KPI Summary Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '16px',
        }}
      >
        {/* KPI 1: Total Fulfillment Hubs */}
        <div className="panel" style={{ padding: '20px' }}>
          <div className="panel-head" style={{ marginBottom: '8px' }}>
            <div>
              <span className="eyebrow" style={{ fontSize: '11px' }}>
                {t('warehouses.kpi.totalHubs')}
              </span>
              <h3 style={{ fontSize: '24px', margin: '4px 0 0' }}>{kpis.totalHubs}</h3>
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
              <WarehouseIcon size={20} />
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted-text)' }}>
            <strong>{kpis.activeHubs}</strong> {t('warehouses.kpi.activeHubs').toLowerCase()}
            {kpis.nearCapacityHubs > 0 && ` · ${kpis.nearCapacityHubs} near capacity`}
          </p>
        </div>

        {/* KPI 2: Total Stored Units */}
        <div className="panel" style={{ padding: '20px' }}>
          <div className="panel-head" style={{ marginBottom: '8px' }}>
            <div>
              <span className="eyebrow" style={{ fontSize: '11px' }}>
                {t('warehouses.kpi.totalUnits')}
              </span>
              <h3 style={{ fontSize: '24px', margin: '4px 0 0' }}>
                {kpis.totalStoredUnits.toLocaleString()}
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
              <Boxes size={20} />
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted-text)' }}>
            {t('warehouses.form.capacity')}: {kpis.totalCapacity.toLocaleString()}{' '}
            {t('salesOrders.units')}
          </p>
        </div>

        {/* KPI 3: Capacity Utilization */}
        <div className="panel" style={{ padding: '20px' }}>
          <div className="panel-head" style={{ marginBottom: '8px' }}>
            <div>
              <span className="eyebrow" style={{ fontSize: '11px' }}>
                {t('warehouses.kpi.utilization')}
              </span>
              <h3 style={{ fontSize: '24px', margin: '4px 0 0' }}>{kpis.utilizationRate}%</h3>
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
              <TrendingUp size={20} />
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
                width: `${kpis.utilizationRate}%`,
                height: '100%',
                borderRadius: '99px',
                background: 'linear-gradient(90deg, #059669, #2563eb)',
              }}
            />
          </div>
        </div>

        {/* KPI 4: Stock Valuation */}
        <div className="panel" style={{ padding: '20px' }}>
          <div className="panel-head" style={{ marginBottom: '8px' }}>
            <div>
              <span className="eyebrow" style={{ fontSize: '11px' }}>
                {t('warehouses.kpi.stockValue')}
              </span>
              <h3 style={{ fontSize: '20px', margin: '4px 0 0', whiteSpace: 'nowrap' }}>
                {formatCurrency(kpis.estimatedTotalValue, 'EGP', lang)}
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
              <Thermometer size={20} />
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted-text)' }}>
            {kpis.coldChainCount} {t('warehouses.kpi.coldChain').toLowerCase()}
          </p>
        </div>
      </div>

      {/* Toolbar & Filter Bar */}
      <WarehouseToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onToggleView={() => setViewMode(viewMode === 'list' ? 'cards' : 'list')}
        activeFilters={activeFilters}
        onApplyFilters={setActiveFilters}
        onClearFilters={() => setActiveFilters({ area: 'All areas', status: 'All statuses' })}
        availableAreas={availableAreas}
        availableStatuses={availableStatuses}
      />

      {/* Warehouse View (List / Table or Cards) */}
      {filteredWarehouses.length === 0 ? (
        <div style={{ marginTop: '20px' }}>
          <EmptyState message={t('warehouses.empty')} />
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
            <Button
              variant="secondary"
              onClick={() => {
                setSearchQuery('')
                setActiveFilters({ area: 'All areas', status: 'All statuses' })
              }}
            >
              {t('warehouses.resetFilters')}
            </Button>
          </div>
        </div>
      ) : viewMode === 'list' ? (
        /* List / Table Mode */
        <div className="collection-list">
          {filteredWarehouses.map((wh) => {
            const displayName = lang === 'ar' ? wh.name_ar : wh.name
            const displayArea = lang === 'ar' ? wh.area_ar : wh.area
            const displayRep =
              lang === 'ar' && wh.assignedRepName_ar ? wh.assignedRepName_ar : wh.assignedRepName
            const utilization = Math.min(
              100,
              Math.round((wh.currentStockUnits / Math.max(1, wh.capacityUnits)) * 100)
            )

            return (
              <div
                key={wh.id}
                className="collection-item"
                onClick={() => setSelectedWarehouseId(wh.id)}
                role="button"
                tabIndex={0}
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderRadius: '16px',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
              >
                {/* Icon & Name / Code */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1.4 }}>
                  <div className="item-icon" style={{ background: 'rgba(27, 53, 84, 0.08)' }}>
                    <WarehouseIcon size={20} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '15px', color: 'var(--heading-text)' }}>
                      {displayName}
                    </strong>
                    <span style={{ fontSize: '12px', color: 'var(--muted-text)', marginTop: '2px' }}>
                      {wh.code} · {wh.temperatureType}
                    </span>
                  </div>
                </div>

                {/* Area & Governorate */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={14} style={{ color: 'var(--muted-text)' }} />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--heading-text)' }}>
                      {displayArea}
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--muted-text)' }}>
                    {lang === 'ar' ? wh.governorate_ar : wh.governorate}
                  </span>
                </div>

                {/* Assigned Representative */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={14} style={{ color: 'var(--muted-text)' }} />
                    <span style={{ fontSize: '13px', color: 'var(--heading-text)' }}>
                      {displayRep}
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--muted-text)' }}>
                    {t('warehouses.table.rep')}
                  </span>
                </div>

                {/* Stock & Utilization */}
                <div style={{ flex: 1, minWidth: '130px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <strong style={{ color: 'var(--heading-text)' }}>
                      {wh.currentStockUnits.toLocaleString()}
                    </strong>
                    <span style={{ color: 'var(--muted-text)' }}>
                      / {wh.capacityUnits.toLocaleString()}
                    </span>
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: '6px',
                      borderRadius: '99px',
                      background: 'var(--border-soft)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${utilization}%`,
                        height: '100%',
                        borderRadius: '99px',
                        background:
                          utilization > 90
                            ? 'var(--rose, #e11d48)'
                            : 'var(--navy, #1B3554)',
                      }}
                    />
                  </div>
                </div>

                {/* Status & Action */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginInlineStart: '16px' }}>
                  <StatusPill status={wh.status} />
                  <ChevronRight size={18} style={{ color: 'var(--sky, #0284c7)' }} />
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* Cards Mode */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '16px',
          }}
        >
          {filteredWarehouses.map((wh) => {
            const displayName = lang === 'ar' ? wh.name_ar : wh.name
            const displayArea = lang === 'ar' ? wh.area_ar : wh.area
            const displayRep =
              lang === 'ar' && wh.assignedRepName_ar ? wh.assignedRepName_ar : wh.assignedRepName
            const utilization = Math.min(
              100,
              Math.round((wh.currentStockUnits / Math.max(1, wh.capacityUnits)) * 100)
            )

            return (
              <div
                key={wh.id}
                className="panel"
                onClick={() => setSelectedWarehouseId(wh.id)}
                role="button"
                tabIndex={0}
                style={{
                  cursor: 'pointer',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: '18px',
                  border: '1px solid var(--border-soft)',
                  background: 'var(--surface)',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          background: 'rgba(27, 53, 84, 0.10)',
                          color: 'var(--navy, #1B3554)',
                          display: 'grid',
                          placeItems: 'center',
                        }}
                      >
                        <WarehouseIcon size={20} />
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--muted-text)', fontWeight: 700 }}>
                          {wh.code}
                        </span>
                        <h4 style={{ margin: '2px 0 0', fontSize: '15px', color: 'var(--heading-text)' }}>
                          {displayName}
                        </h4>
                      </div>
                    </div>
                    <StatusPill status={wh.status} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '14px 0', fontSize: '12.5px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--muted-text)' }}>
                      <MapPin size={14} />
                      <span>{displayArea} ({lang === 'ar' ? wh.governorate_ar : wh.governorate})</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--muted-text)' }}>
                      <User size={14} />
                      <span>{displayRep}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--muted-text)' }}>
                      <Thermometer size={14} />
                      <span>{wh.temperatureType}</span>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-soft)', paddingTop: '14px', marginTop: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--muted-text)' }}>{t('warehouses.kpi.utilization')}</span>
                    <strong style={{ color: 'var(--heading-text)' }}>
                      {wh.currentStockUnits.toLocaleString()} / {wh.capacityUnits.toLocaleString()} ({utilization}%)
                    </strong>
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: '6px',
                      borderRadius: '99px',
                      background: 'var(--border-soft)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${utilization}%`,
                        height: '100%',
                        borderRadius: '99px',
                        background:
                          utilization > 90
                            ? 'var(--rose, #e11d48)'
                            : 'var(--navy, #1B3554)',
                      }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Warehouse Detail Drawer */}
      <WarehouseDetailDrawer
        warehouse={selectedWarehouse}
        isOpen={Boolean(selectedWarehouseId)}
        onClose={() => setSelectedWarehouseId(null)}
        onEdit={handleOpenEdit}
        canEdit={canManage}
      />

      {/* Add / Edit Warehouse Form Drawer */}
      <WarehouseFormDrawer
        isOpen={isFormOpen}
        warehouse={editingWarehouse}
        onClose={() => {
          setIsFormOpen(false)
          setEditingWarehouse(null)
        }}
        onSave={handleSaveWarehouse}
      />

      {/* Toast Feedback */}
      {toastMessage && <Toast message={toastMessage} />}
    </section>
  )
}
