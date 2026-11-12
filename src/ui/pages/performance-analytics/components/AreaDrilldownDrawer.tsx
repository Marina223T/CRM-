import { MapPin, Warehouse as WarehouseIcon, User, Package, DollarSign } from 'lucide-react'
import { Drawer } from '@/ui/design-system/components/Drawer'
import { useT } from '@/lib/i18n'
import { formatCurrency } from '@/lib/format'
import type { AreaPerformanceItem } from './AreaPerformanceCard'
import type { WarehousePerformanceItem } from './WarehousePerformanceCard'

export interface AreaDrilldownDrawerProps {
  area: AreaPerformanceItem | null
  warehouses: WarehousePerformanceItem[]
  isOpen: boolean
  onClose: () => void
}

export function AreaDrilldownDrawer({
  area,
  warehouses,
  isOpen,
  onClose,
}: AreaDrilldownDrawerProps) {
  const { t, lang } = useT()

  if (!area) return null

  const displayName = lang === 'ar' && area.areaName_ar ? area.areaName_ar : area.areaName
  const displayGov = lang === 'ar' && area.governorate_ar ? area.governorate_ar : area.governorate

  const areaWarehouses = warehouses.filter(
    (w) => w.area === area.areaId || w.governorate === area.areaId || w.area === area.areaName
  )

  return (
    <Drawer
      title={displayName}
      kicker={`${displayGov} · ${t('performanceAnalytics.area.drilldown')}`}
      isOpen={isOpen}
      onClose={onClose}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '0 4px' }}>
        {/* Area Summary Overview */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            padding: '16px',
            borderRadius: '16px',
            background: 'var(--surface-raised)',
            border: '1px solid var(--border-soft)',
          }}
        >
          <div>
            <span style={{ fontSize: '11px', color: 'var(--muted-text)', display: 'block' }}>
              {t('performanceAnalytics.area.revenue')}
            </span>
            <strong style={{ fontSize: '18px', color: '#1B3554' }}>
              {formatCurrency(area.sellInRevenue, 'EGP', lang)}
            </strong>
          </div>

          <div>
            <span style={{ fontSize: '11px', color: 'var(--muted-text)', display: 'block' }}>
              {t('performanceAnalytics.area.volume')}
            </span>
            <strong style={{ fontSize: '18px', color: '#059669' }}>
              {area.sellOutQuantity.toLocaleString()} {t('performanceAnalytics.kpi.boxes')}
            </strong>
          </div>
        </div>

        {/* Warehouses in this Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--muted-text)', textTransform: 'uppercase' }}>
            {t('performanceAnalytics.area.hubs')} ({areaWarehouses.length}):
          </span>

          {areaWarehouses.map((wh) => {
            const whName = lang === 'ar' && wh.warehouseName_ar ? wh.warehouseName_ar : wh.warehouseName
            const whRep = lang === 'ar' && wh.assignedRepName_ar ? wh.assignedRepName_ar : wh.assignedRepName

            return (
              <div
                key={wh.warehouseId}
                style={{
                  padding: '16px',
                  borderRadius: '14px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border-soft)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                      <WarehouseIcon size={18} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '15px', color: 'var(--heading-text)', display: 'block' }}>
                        {whName}
                      </strong>
                      <span style={{ fontSize: '12px', color: 'var(--muted-text)' }}>
                        {wh.warehouseCode} · {wh.temperatureType}
                      </span>
                    </div>
                  </div>

                  <strong style={{ fontSize: '15px', color: '#059669' }}>
                    {wh.sellOutVolume.toLocaleString()} {t('performanceAnalytics.kpi.boxes')}
                  </strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--muted-text)', borderTop: '1px solid var(--border-soft)', paddingTop: '8px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <User size={12} /> {whRep}
                  </span>
                  <span>
                    Stock: {wh.currentStockUnits.toLocaleString()} / {wh.capacityUnits.toLocaleString()} units
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Drawer>
  )
}
