import { useState, useEffect } from 'react'
import { Plus, Trash2, Warehouse as WarehouseIcon, Package } from 'lucide-react'
import { Drawer } from '@/ui/design-system/components/Drawer'
import { Button } from '@/ui/design-system/components/Button'
import { FieldError } from '@/ui/design-system/components/FieldError'
import { useT } from '@/lib/i18n'
import { ALL_MOCK_REPS } from '@/ui/design-system/components/RecordFormDrawer'
import { warehousesStore } from '@/data/mock/warehouses'
import { productsStore } from '@/data/mock/products'
import { useStore } from '@/data/mock/store'
import type { WarehouseSellOutReport, SellOutReportItem } from '@/data/mock/sell-out'

export interface RecordWarehouseSellOutDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSave: (report: {
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
  }) => void
  existingReport?: WarehouseSellOutReport | null
  currentUserName?: string
  role?: 'admin' | 'rep'
}

interface ProductLineItem {
  productName: string
  quantity: string
}

export function RecordWarehouseSellOutDrawer({
  isOpen,
  onClose,
  onSave,
  existingReport,
  currentUserName = 'Alex Morgan',
  role = 'admin',
}: RecordWarehouseSellOutDrawerProps) {
  const { t, lang } = useT()
  const warehouses = useStore(warehousesStore)
  const catalogProducts = useStore(productsStore)

  const isEditing = Boolean(existingReport)

  const [reportingMonth, setReportingMonth] = useState('2026-10')
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id || '')
  const [repId, setRepId] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<ProductLineItem[]>([
    { productName: catalogProducts[0]?.name || 'Bevato', quantity: '' },
  ])
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Prefill or reset on open
  useEffect(() => {
    if (existingReport) {
      setReportingMonth(existingReport.reportingMonth)
      setWarehouseId(existingReport.warehouseId)
      setRepId(existingReport.repId)
      setNotes(existingReport.notes || '')
      setItems(
        existingReport.items.map((it) => ({
          productName: it.productName,
          quantity: String(it.quantity),
        }))
      )
    } else {
      const defaultWh = warehouses[0]
      setReportingMonth('2026-10')
      setWarehouseId(defaultWh?.id || '')
      const matchedRep = ALL_MOCK_REPS.find(
        (r) => r.name.toLowerCase() === currentUserName.toLowerCase()
      )
      setRepId(matchedRep?.id || defaultWh?.assignedRepId || ALL_MOCK_REPS[0]?.id || '')
      setNotes('')
      setItems([
        { productName: catalogProducts[0]?.name || 'Bevato', quantity: '' },
      ])
    }
    setErrors({})
  }, [existingReport, isOpen, warehouses, catalogProducts, currentUserName])

  // When warehouse changes, auto-suggest the assigned representative
  const handleWarehouseChange = (whId: string) => {
    setWarehouseId(whId)
    const targetWh = warehouses.find((w) => w.id === whId)
    if (targetWh && role === 'admin') {
      const rep = ALL_MOCK_REPS.find(
        (r) => r.id === targetWh.assignedRepId || r.name === targetWh.assignedRepName
      )
      if (rep) {
        setRepId(rep.id)
      }
    }
  }

  // Add a product line
  const handleAddLine = () => {
    // Find first unused product
    const used = new Set(items.map((i) => i.productName))
    const available = catalogProducts.find((p) => !used.has(p.name))
    setItems((prev) => [
      ...prev,
      { productName: available?.name || catalogProducts[0]?.name || 'Bevato', quantity: '' },
    ])
  }

  // Remove a product line
  const handleRemoveLine = (index: number) => {
    if (items.length <= 1) return
    setItems((prev) => prev.filter((_, idx) => idx !== index))
  }

  // Update item field
  const handleItemChange = (index: number, field: keyof ProductLineItem, value: string) => {
    setItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    )
  }

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {}
    if (!reportingMonth.trim()) nextErrors.month = t('sellOut.validation.monthRequired')
    if (!warehouseId) nextErrors.warehouse = t('sellOut.validation.warehouseRequired')
    if (!repId) nextErrors.rep = t('sellOut.validation.repRequired')

    if (items.length === 0) {
      nextErrors.items = t('sellOut.validation.atLeastOneProduct')
    } else {
      const selectedProducts = new Set<string>()
      for (let i = 0; i < items.length; i++) {
        const it = items[i]
        if (!it.productName.trim()) {
          nextErrors[`item_${i}`] = t('sellOut.validation.atLeastOneProduct')
        }
        if (selectedProducts.has(it.productName)) {
          nextErrors[`item_${i}`] = t('sellOut.validation.duplicateProduct')
        }
        selectedProducts.add(it.productName)

        const qty = parseInt(it.quantity, 10)
        if (isNaN(qty) || qty <= 0) {
          nextErrors[`qty_${i}`] = t('sellOut.validation.positiveQty')
        }
      }
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const selectedWh = warehouses.find((w) => w.id === warehouseId)
    const selectedRep = ALL_MOCK_REPS.find((r) => r.id === repId)

    const cleanItems: SellOutReportItem[] = items.map((it) => {
      const prod = catalogProducts.find((p) => p.name === it.productName)
      return {
        productName: it.productName,
        productName_ar: prod?.name_ar,
        quantity: parseInt(it.quantity, 10),
      }
    })

    onSave({
      id: existingReport?.id,
      reportingMonth,
      warehouseId,
      warehouseCode: selectedWh?.code || 'WH-01',
      warehouseName: selectedWh?.name || 'Warehouse',
      warehouseName_ar: selectedWh?.name_ar,
      area: selectedWh?.area || 'Area',
      area_ar: selectedWh?.area_ar,
      governorate: selectedWh?.governorate || selectedWh?.area || 'Governorate',
      governorate_ar: selectedWh?.governorate_ar || selectedWh?.area_ar,
      repId,
      repName: selectedRep?.name || currentUserName,
      repName_ar: selectedRep?.name,
      items: cleanItems,
      notes: notes.trim() || undefined,
    })
  }

  const inputStyle = {
    padding: '9px 12px',
    borderRadius: '8px',
    border: '1px solid var(--border-input)',
    background: 'var(--input-bg)',
    color: 'var(--input-text)',
    fontSize: '13.5px',
    width: '100%',
    boxSizing: 'border-box' as const,
  }

  const labelStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '5px',
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--muted-text)',
  }

  return (
    <Drawer
      title={isEditing ? t('sellOut.drawer.editTitle') : t('sellOut.drawer.addTitle')}
      kicker={t('sellOut.drawer.eyebrow')}
      isOpen={isOpen}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '0 4px' }}>
        {/* Reporting Month & Warehouse */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <label style={labelStyle}>
            {t('sellOut.drawer.monthSelect')} *
            <select
              value={reportingMonth}
              onChange={(e) => setReportingMonth(e.target.value)}
              style={inputStyle}
            >
              <option value="2026-10">October 2026 (2026-10)</option>
              <option value="2026-09">September 2026 (2026-09)</option>
              <option value="2026-08">August 2026 (2026-08)</option>
              <option value="2026-11">November 2026 (2026-11)</option>
            </select>
            {errors.month && <FieldError message={errors.month} />}
          </label>

          <label style={labelStyle}>
            {t('sellOut.drawer.warehouseSelect')} *
            <select
              value={warehouseId}
              onChange={(e) => handleWarehouseChange(e.target.value)}
              style={inputStyle}
            >
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.code} · {lang === 'ar' ? w.name_ar : w.name} ({lang === 'ar' ? w.area_ar : w.area})
                </option>
              ))}
            </select>
            {errors.warehouse && <FieldError message={errors.warehouse} />}
          </label>
        </div>

        {/* Sales Representative */}
        <label style={labelStyle}>
          {t('sellOut.drawer.repSelect')} *
          <select
            value={repId}
            onChange={(e) => setRepId(e.target.value)}
            disabled={role === 'rep'}
            style={{
              ...inputStyle,
              ...(role === 'rep' ? { opacity: 0.85, background: 'var(--surface-raised)', cursor: 'not-allowed' } : {}),
            }}
          >
            {ALL_MOCK_REPS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.region})
              </option>
            ))}
          </select>
          {errors.rep && <FieldError message={errors.rep} />}
        </label>

        {/* Multi-Product Entry Section */}
        <div
          style={{
            padding: '16px',
            borderRadius: '14px',
            background: 'var(--surface)',
            border: '1px solid var(--border-soft)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package size={17} style={{ color: 'var(--navy, #1B3554)' }} />
              <strong style={{ fontSize: '14px', color: 'var(--heading-text)' }}>
                {t('sellOut.drawer.productsSection')}
              </strong>
            </div>

            <Button
              variant="secondary"
              type="button"
              onClick={handleAddLine}
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              <Plus data-icon="inline-start" size={14} /> {t('sellOut.drawer.addProductRow')}
            </Button>
          </div>

          {errors.items && <FieldError message={errors.items} />}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {items.map((line, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '10px',
                  borderRadius: '10px',
                  background: 'var(--surface-raised)',
                  border: '1px solid var(--border-soft)',
                }}
              >
                {/* Product Select */}
                <div style={{ flex: 1.5 }}>
                  <select
                    value={line.productName}
                    onChange={(e) => handleItemChange(idx, 'productName', e.target.value)}
                    style={inputStyle}
                  >
                    {catalogProducts.map((p) => (
                      <option key={p.code} value={p.name}>
                        {lang === 'ar' ? (p.name_ar || p.name) : p.name}
                      </option>
                    ))}
                  </select>
                  {errors[`item_${idx}`] && <FieldError message={errors[`item_${idx}`]} />}
                </div>

                {/* Quantity Input */}
                <div style={{ flex: 1 }}>
                  <input
                    type="number"
                    min="1"
                    placeholder={t('sellOut.drawer.quantityPlaceholder')}
                    value={line.quantity}
                    onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                    style={inputStyle}
                  />
                  {errors[`qty_${idx}`] && <FieldError message={errors[`qty_${idx}`]} />}
                </div>

                {/* Remove Line */}
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveLine(idx)}
                    title={t('sellOut.drawer.removeProductRow')}
                    style={{
                      background: 'transparent',
                      border: 0,
                      cursor: 'pointer',
                      color: 'var(--rose, #e11d48)',
                      padding: '8px 4px',
                      marginTop: '2px',
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Visit Notes */}
        <label style={labelStyle}>
          {t('sellOut.drawer.notesLabel')}
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder={t('sellOut.drawer.notesPlaceholder')}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </label>

        {/* Footer Actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            marginTop: '12px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-soft)',
          }}
        >
          <Button variant="secondary" onClick={onClose} type="button">
            {t('sellOut.drawer.cancel')}
          </Button>
          <Button variant="primary" type="submit">
            {t('sellOut.drawer.submit')}
          </Button>
        </div>
      </form>
    </Drawer>
  )
}
