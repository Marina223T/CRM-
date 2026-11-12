import { useMemo } from 'react'
import { MapPin, Warehouse as WarehouseIcon, Package, Boxes, PieChart } from 'lucide-react'
import { EmptyState } from '@/ui/design-system/components/EmptyState'
import { useT } from '@/lib/i18n'
import type { WarehouseSellOutReport } from '@/data/mock/sell-out'

export interface AreaAggregationViewProps {
  reports: WarehouseSellOutReport[]
  reportingMonth?: string
}

interface ProductAgg {
  productName: string
  productName_ar?: string
  quantity: number
}

interface AreaAgg {
  areaKey: string
  areaName: string
  areaName_ar?: string
  governorate: string
  governorate_ar?: string
  totalQuantity: number
  products: ProductAgg[]
  warehouses: { id: string; code: string; name: string; name_ar?: string }[]
}

export function AreaAggregationView({
  reports,
  reportingMonth,
}: AreaAggregationViewProps) {
  const { t, lang } = useT()

  // Dynamic aggregation derived strictly from the warehouse reports in memory
  const areaAggregates: AreaAgg[] = useMemo(() => {
    const areaMap = new Map<string, {
      areaName: string
      areaName_ar?: string
      governorate: string
      governorate_ar?: string
      totalQuantity: number
      productMap: Map<string, { productName: string; productName_ar?: string; quantity: number }>
      warehouseMap: Map<string, { id: string; code: string; name: string; name_ar?: string }>
    }>()

    reports.forEach((report) => {
      const key = report.area || report.governorate || 'Other'
      if (!areaMap.has(key)) {
        areaMap.set(key, {
          areaName: report.area,
          areaName_ar: report.area_ar,
          governorate: report.governorate,
          governorate_ar: report.governorate_ar,
          totalQuantity: 0,
          productMap: new Map(),
          warehouseMap: new Map(),
        })
      }

      const agg = areaMap.get(key)!

      // Add warehouse
      if (!agg.warehouseMap.has(report.warehouseId)) {
        agg.warehouseMap.set(report.warehouseId, {
          id: report.warehouseId,
          code: report.warehouseCode,
          name: report.warehouseName,
          name_ar: report.warehouseName_ar,
        })
      }

      // Aggregate items
      report.items.forEach((item) => {
        agg.totalQuantity += item.quantity

        if (!agg.productMap.has(item.productName)) {
          agg.productMap.set(item.productName, {
            productName: item.productName,
            productName_ar: item.productName_ar,
            quantity: 0,
          })
        }
        agg.productMap.get(item.productName)!.quantity += item.quantity
      })
    })

    const results: AreaAgg[] = []
    areaMap.forEach((val, key) => {
      const products = Array.from(val.productMap.values()).sort(
        (a, b) => b.quantity - a.quantity
      )
      const warehouses = Array.from(val.warehouseMap.values())
      results.push({
        areaKey: key,
        areaName: val.areaName,
        areaName_ar: val.areaName_ar,
        governorate: val.governorate,
        governorate_ar: val.governorate_ar,
        totalQuantity: val.totalQuantity,
        products,
        warehouses,
      })
    })

    return results.sort((a, b) => b.totalQuantity - a.totalQuantity)
  }, [reports])

  const totalAggregatedQuantity = useMemo(() => {
    return areaAggregates.reduce((sum, a) => sum + a.totalQuantity, 0)
  }, [areaAggregates])

  if (areaAggregates.length === 0) {
    return <EmptyState message={t('sellOut.emptyArea')} />
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Intro Header Card */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderRadius: '16px',
          background: 'var(--surface-raised)',
          border: '1px solid var(--border-soft)',
        }}
      >
        <div>
          <span className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <PieChart size={14} /> {t('sellOut.area.title')}
          </span>
          <h3 style={{ margin: '4px 0 0', fontSize: '18px', color: 'var(--heading-text)' }}>
            {reportingMonth && reportingMonth !== 'All Months'
              ? `${reportingMonth} · ${areaAggregates.length} Areas Consolidated`
              : `${areaAggregates.length} Areas Consolidated Across Egypt`}
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: 'var(--muted-text)' }}>
            {t('sellOut.area.description')}
          </p>
        </div>

        <div style={{ textAlign: 'end' }}>
          <span style={{ fontSize: '11px', color: 'var(--muted-text)', display: 'block' }}>
            {t('sellOut.kpi.totalQuantity')}
          </span>
          <strong style={{ fontSize: '22px', color: 'var(--navy, #1B3554)' }}>
            {totalAggregatedQuantity.toLocaleString()}{' '}
            <small style={{ fontSize: '13px', fontWeight: 600 }}>{t('sellOut.kpi.boxes')}</small>
          </strong>
        </div>
      </div>

      {/* Area Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '16px',
        }}
      >
        {areaAggregates.map((area) => {
          const displayArea = lang === 'ar' && area.areaName_ar ? area.areaName_ar : area.areaName
          const displayGov =
            lang === 'ar' && area.governorate_ar ? area.governorate_ar : area.governorate

          return (
            <div
              key={area.areaKey}
              className="panel"
              style={{
                padding: '20px',
                borderRadius: '18px',
                border: '1px solid var(--border-soft)',
                background: 'var(--surface)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
              }}
            >
              {/* Card Top: Area Name & Total */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    marginBottom: '10px',
                  }}
                >
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
                      <MapPin size={20} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '16px', color: 'var(--heading-text)' }}>
                        {displayArea}
                      </h4>
                      <span style={{ fontSize: '12px', color: 'var(--muted-text)' }}>
                        {displayGov}
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'end' }}>
                    <span style={{ fontSize: '10px', color: 'var(--muted-text)', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>
                      {t('sellOut.area.totalArea')}
                    </span>
                    <strong style={{ fontSize: '18px', color: 'var(--navy, #1B3554)' }}>
                      {area.totalQuantity.toLocaleString()} {t('sellOut.kpi.boxes')}
                    </strong>
                  </div>
                </div>

                {/* Contributing Warehouses Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                  {area.warehouses.map((wh) => (
                    <span
                      key={wh.id}
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: 'var(--surface-raised)',
                        color: 'var(--muted-text)',
                        border: '1px solid var(--border-soft)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <WarehouseIcon size={11} /> {wh.code}
                    </span>
                  ))}
                </div>

                {/* Product Breakdown List */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    borderTop: '1px solid var(--border-soft)',
                    paddingTop: '12px',
                  }}
                >
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted-text)', textTransform: 'uppercase' }}>
                    {t('sellOut.area.productBreakdown')}:
                  </span>

                  {area.products.map((prod) => {
                    const prodName =
                      lang === 'ar' && prod.productName_ar ? prod.productName_ar : prod.productName
                    const share =
                      area.totalQuantity > 0
                        ? Math.round((prod.quantity / area.totalQuantity) * 100)
                        : 0

                    return (
                      <div
                        key={prod.productName}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                          padding: '6px 8px',
                          borderRadius: '8px',
                          background: 'var(--surface-raised)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--heading-text)' }}>
                            {prodName}
                          </span>
                          <strong style={{ fontSize: '13px', color: 'var(--heading-text)' }}>
                            {prod.quantity.toLocaleString()} {t('sellOut.kpi.boxes')}
                          </strong>
                        </div>

                        {/* Progress Bar */}
                        <div
                          style={{
                            width: '100%',
                            height: '5px',
                            borderRadius: '99px',
                            background: 'var(--border-soft)',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${share}%`,
                              height: '100%',
                              borderRadius: '99px',
                              background: 'var(--navy, #1B3554)',
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Area Card Footer: Total summary */}
              <div
                style={{
                  borderTop: '1px dashed var(--border-soft)',
                  paddingTop: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '12px',
                }}
              >
                <span style={{ color: 'var(--muted-text)', fontWeight: 600 }}>
                  Total ({displayArea}):
                </span>
                <strong style={{ color: 'var(--heading-text)', fontSize: '13px' }}>
                  {area.totalQuantity.toLocaleString()} {t('sellOut.kpi.boxes')}
                </strong>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
