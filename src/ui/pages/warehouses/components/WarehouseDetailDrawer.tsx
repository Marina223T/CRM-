import { useState } from 'react'
import {
  Warehouse as WarehouseIcon,
  MapPin,
  User,
  Phone,
  Mail,
  Calendar,
  Thermometer,
  ShieldCheck,
  Edit3,
  Package,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Drawer } from '@/ui/design-system/components/Drawer'
import { StatusPill } from '@/ui/design-system/components/StatusPill'
import { Button } from '@/ui/design-system/components/Button'
import { useT } from '@/lib/i18n'
import { formatDate } from '@/lib/format'
import type { Warehouse, WarehouseProductStock } from '@/data/mock/warehouses'

export interface WarehouseDetailDrawerProps {
  warehouse: Warehouse | null
  isOpen: boolean
  onClose: () => void
  onEdit?: (warehouse: Warehouse) => void
  canEdit?: boolean
}

export function WarehouseDetailDrawer({
  warehouse,
  isOpen,
  onClose,
  onEdit,
  canEdit = true,
}: WarehouseDetailDrawerProps) {
  const { t, lang } = useT()
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null)

  if (!warehouse) return null

  const displayName = lang === 'ar' ? warehouse.name_ar : warehouse.name
  const displayArea = lang === 'ar' ? warehouse.area_ar : warehouse.area
  const displayGov = lang === 'ar' ? warehouse.governorate_ar : warehouse.governorate
  const displayAddress = lang === 'ar' ? warehouse.address_ar : warehouse.address
  const displayRep = lang === 'ar' && warehouse.assignedRepName_ar ? warehouse.assignedRepName_ar : warehouse.assignedRepName

  const utilizationPct = Math.min(
    100,
    Math.round((warehouse.currentStockUnits / Math.max(1, warehouse.capacityUnits)) * 100)
  )
  const availableUnits = Math.max(0, warehouse.capacityUnits - warehouse.currentStockUnits)

  const toggleProductExpand = (productName: string) => {
    setExpandedProduct(expandedProduct === productName ? null : productName)
  }

  return (
    <Drawer
      title={displayName}
      kicker={`${warehouse.code} · ${t('warehouses.detail.eyebrow')}`}
      isOpen={isOpen}
      onClose={onClose}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '0 4px' }}>
        {/* Top Header Card */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            borderRadius: '16px',
            background: 'var(--surface-raised)',
            border: '1px solid var(--border-soft)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'rgba(27, 53, 84, 0.12)',
                color: 'var(--navy, #1B3554)',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <WarehouseIcon size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <strong style={{ fontSize: '17px', color: 'var(--heading-text)' }}>
                  {displayName}
                </strong>
                <StatusPill status={warehouse.status} />
              </div>
              <span style={{ fontSize: '13px', color: 'var(--muted-text)', marginTop: '2px', display: 'block' }}>
                {warehouse.code} · {displayArea} ({displayGov})
              </span>
            </div>
          </div>

          {canEdit && onEdit && (
            <Button variant="secondary" onClick={() => onEdit(warehouse)}>
              <Edit3 data-icon="inline-start" size={15} /> {t('common.edit')}
            </Button>
          )}
        </div>

        {/* Capacity Utilization Progress Panel */}
        <div
          style={{
            padding: '16px',
            borderRadius: '16px',
            background: 'var(--surface)',
            border: '1px solid var(--border-soft)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px',
            }}
          >
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--heading-text)' }}>
              {t('warehouses.detail.capacityBreakdown')}
            </span>
            <span
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: utilizationPct > 90 ? 'var(--rose, #e11d48)' : 'var(--navy, #1B3554)',
              }}
            >
              {utilizationPct}% {t('warehouses.kpi.utilization')}
            </span>
          </div>

          {/* Progress Track */}
          <div
            style={{
              width: '100%',
              height: '10px',
              borderRadius: '99px',
              background: 'var(--border-soft)',
              overflow: 'hidden',
              marginBottom: '12px',
            }}
          >
            <div
              style={{
                width: `${utilizationPct}%`,
                height: '100%',
                borderRadius: '99px',
                background:
                  utilizationPct > 90
                    ? 'linear-gradient(90deg, #f59e0b, #e11d48)'
                    : 'linear-gradient(90deg, #059669, #1B3554)',
                transition: 'width 0.4s ease',
              }}
            />
          </div>

          {/* Metric Sub-values */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', textAlign: 'center' }}>
            <div style={{ padding: '8px', background: 'var(--surface-raised)', borderRadius: '10px' }}>
              <span style={{ fontSize: '11px', color: 'var(--muted-text)', display: 'block' }}>
                {t('warehouses.detail.occupied')}
              </span>
              <strong style={{ fontSize: '14px', color: 'var(--heading-text)' }}>
                {warehouse.currentStockUnits.toLocaleString()}
              </strong>
            </div>
            <div style={{ padding: '8px', background: 'var(--surface-raised)', borderRadius: '10px' }}>
              <span style={{ fontSize: '11px', color: 'var(--muted-text)', display: 'block' }}>
                {t('warehouses.detail.available')}
              </span>
              <strong style={{ fontSize: '14px', color: 'var(--heading-text)' }}>
                {availableUnits.toLocaleString()}
              </strong>
            </div>
            <div style={{ padding: '8px', background: 'var(--surface-raised)', borderRadius: '10px' }}>
              <span style={{ fontSize: '11px', color: 'var(--muted-text)', display: 'block' }}>
                {t('warehouses.form.capacity')}
              </span>
              <strong style={{ fontSize: '14px', color: 'var(--heading-text)' }}>
                {warehouse.capacityUnits.toLocaleString()}
              </strong>
            </div>
          </div>
        </div>

        {/* Facility Information & Compliance */}
        <div
          style={{
            padding: '16px',
            borderRadius: '16px',
            background: 'var(--surface)',
            border: '1px solid var(--border-soft)',
          }}
        >
          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--muted-text)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              display: 'block',
              marginBottom: '12px',
            }}
          >
            {t('warehouses.detail.overviewTitle')}
          </span>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
            {/* Storage Condition */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <Thermometer size={17} style={{ color: 'var(--sky, #0284c7)', marginTop: '2px' }} />
              <div>
                <span style={{ fontSize: '11px', color: 'var(--muted-text)', display: 'block' }}>
                  {t('warehouses.detail.storageCompliance')}
                </span>
                <strong style={{ fontSize: '13px', color: 'var(--heading-text)' }}>
                  {warehouse.temperatureType}
                </strong>
              </div>
            </div>

            {/* Assigned Rep */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <User size={17} style={{ color: 'var(--navy, #1B3554)', marginTop: '2px' }} />
              <div>
                <span style={{ fontSize: '11px', color: 'var(--muted-text)', display: 'block' }}>
                  {t('warehouses.detail.assignedRep')}
                </span>
                <strong style={{ fontSize: '13px', color: 'var(--heading-text)' }}>
                  {displayRep}
                </strong>
              </div>
            </div>

            {/* Physical Address */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <MapPin size={17} style={{ color: 'var(--steel, #64748b)', marginTop: '2px' }} />
              <div>
                <span style={{ fontSize: '11px', color: 'var(--muted-text)', display: 'block' }}>
                  {t('warehouses.detail.address')}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--heading-text)' }}>
                  {displayAddress}
                </span>
              </div>
            </div>

            {/* Telephone */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <Phone size={17} style={{ color: 'var(--steel, #64748b)', marginTop: '2px' }} />
              <div>
                <span style={{ fontSize: '11px', color: 'var(--muted-text)', display: 'block' }}>
                  {t('warehouses.detail.phone')}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--heading-text)', direction: 'ltr', display: 'inline-block' }}>
                  {warehouse.phone}
                </span>
              </div>
            </div>

            {/* Email */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <Mail size={17} style={{ color: 'var(--steel, #64748b)', marginTop: '2px' }} />
              <div>
                <span style={{ fontSize: '11px', color: 'var(--muted-text)', display: 'block' }}>
                  {t('warehouses.detail.email')}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--heading-text)', direction: 'ltr', display: 'inline-block' }}>
                  {warehouse.email}
                </span>
              </div>
            </div>

            {/* Last Audit */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <Calendar size={17} style={{ color: 'var(--steel, #64748b)', marginTop: '2px' }} />
              <div>
                <span style={{ fontSize: '11px', color: 'var(--muted-text)', display: 'block' }}>
                  {t('warehouses.detail.lastAudit')}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--heading-text)' }}>
                  {formatDate(warehouse.lastAuditDate, lang)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stored Products & Quantities Breakdown */}
        <div
          style={{
            padding: '16px',
            borderRadius: '16px',
            background: 'var(--surface)',
            border: '1px solid var(--border-soft)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package size={18} style={{ color: 'var(--navy, #1B3554)' }} />
              <strong style={{ fontSize: '15px', color: 'var(--heading-text)' }}>
                {t('warehouses.detail.productsTitle')}
              </strong>
            </div>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--muted-text)',
                padding: '2px 8px',
                borderRadius: '99px',
                background: 'var(--surface-raised)',
              }}
            >
              {warehouse.products.length} {t('warehouses.detail.batchesCount')}
            </span>
          </div>

          {warehouse.products.length === 0 ? (
            <p style={{ color: 'var(--muted-text)', fontSize: '13px', textAlign: 'center', padding: '16px' }}>
              {t('warehouses.detail.noProducts')}
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {warehouse.products.map((item: WarehouseProductStock) => {
                const isExpanded = expandedProduct === item.productName
                const prodName = lang === 'ar' && item.productName_ar ? item.productName_ar : item.productName

                return (
                  <div
                    key={item.productName}
                    style={{
                      borderRadius: '12px',
                      border: '1px solid var(--border-soft)',
                      background: 'var(--surface-raised)',
                      overflow: 'hidden',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {/* Product Summary Row */}
                    <div
                      onClick={() => toggleProductExpand(item.productName)}
                      role="button"
                      tabIndex={0}
                      style={{
                        padding: '12px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        userSelect: 'none',
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: '14px', color: 'var(--heading-text)', display: 'block' }}>
                          {prodName}
                        </strong>
                        <span style={{ fontSize: '11px', color: 'var(--muted-text)' }}>
                          {item.category} · {t('warehouses.detail.minThreshold')}: {item.minThreshold.toLocaleString()}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ textAlign: 'end' }}>
                          <strong style={{ fontSize: '14px', color: 'var(--heading-text)', display: 'block' }}>
                            {item.quantity.toLocaleString()}
                          </strong>
                          <span style={{ fontSize: '11px', color: 'var(--muted-text)' }}>
                            {item.batches.length} {t('warehouses.detail.batchesCount')}
                          </span>
                        </div>
                        <StatusPill status={item.status} />
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>

                    {/* Expandable Batch Level Details */}
                    {isExpanded && item.batches.length > 0 && (
                      <div
                        style={{
                          borderTop: '1px solid var(--border-soft)',
                          background: 'var(--surface)',
                          padding: '10px 14px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                        }}
                      >
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted-text)' }}>
                          {t('warehouses.detail.batchesCount')} ({item.batches.length}):
                        </span>
                        {item.batches.map((batch) => (
                          <div
                            key={batch.batchNumber}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              fontSize: '12px',
                              padding: '6px 8px',
                              borderRadius: '6px',
                              background: 'var(--surface-raised)',
                            }}
                          >
                            <span style={{ fontWeight: 600, color: 'var(--heading-text)' }}>
                              {batch.batchNumber}
                            </span>
                            <span style={{ color: 'var(--muted-text)' }}>
                              {t('warehouses.detail.expiry')}: {formatDate(batch.expiryDate, lang)}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <strong style={{ color: 'var(--heading-text)' }}>
                                {batch.quantity.toLocaleString()} {t('salesOrders.units')}
                              </strong>
                              <StatusPill status={batch.status} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </Drawer>
  )
}
