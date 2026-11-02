'use client'

import { useState } from 'react'
import { Drawer } from '@/ui/design-system/components/Drawer'
import { Button } from '@/ui/design-system/components/Button'
import { FieldError } from '@/ui/design-system/components/FieldError'
import { useT } from '@/lib/i18n'
import { useAuth } from '@/lib/auth'
import { useStore } from '@/data/mock/store'
import { productsStore } from '@/data/mock/products'
import { customersStore } from '@/data/mock/customers'
import { addSellOutRecord } from '@/data/mock/sell-out'

interface RecordSellOutDrawerProps {
  isOpen: boolean
  onClose: () => void
  onAction: (msg: string) => void
}

export function RecordSellOutDrawer({ isOpen, onClose, onAction }: RecordSellOutDrawerProps) {
  const { t } = useT()
  const { user } = useAuth()
  const products = useStore(productsStore)
  const customers = useStore(customersStore)

  const [productName, setProductName] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [batchNumber, setBatchNumber] = useState('')
  const [quantity, setQuantity] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const activeCustomers = customers.filter((c) => !c.deleted_at && c.active !== false)

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!productName) errs.product = t('sellOut.drawer.product') + ' is required'
    if (!customerId) errs.customer = t('sellOut.drawer.customer') + ' is required'
    if (!batchNumber.trim()) errs.batch = t('sellOut.drawer.batch') + ' is required'
    const qty = parseInt(quantity, 10)
    if (!quantity || isNaN(qty) || qty <= 0) errs.quantity = t('sellOut.validationQty')
    if (!date) errs.date = t('sellOut.drawer.date') + ' is required'
    return errs
  }

  const handleSave = () => {
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setSaving(true)
    try {
      const customer = customers.find((c) => c.id === customerId)
      addSellOutRecord({
        productName,
        batchNumber: batchNumber.trim(),
        quantity: parseInt(quantity, 10),
        date,
        customerId,
        customerName: customer?.name || customerId,
        repId: user?.id || '',
        repName: user?.name || '',
        notes: notes.trim() || undefined,
      })
      onAction(t('sellOut.saveSuccess'))
      onClose()
      // Reset form
      setProductName('')
      setCustomerId('')
      setBatchNumber('')
      setQuantity('')
      setDate(new Date().toISOString().slice(0, 10))
      setNotes('')
      setErrors({})
    } catch (err) {
      setErrors({ submit: (err as Error).message })
    } finally {
      setSaving(false)
    }
  }

  const fieldStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
    marginBottom: '16px',
  }
  const labelStyle = { fontSize: '12px', color: 'var(--muted-text)', fontWeight: 600 }
  const inputStyle = {
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid var(--border-soft)',
    background: 'var(--surface-raised)',
    color: 'var(--heading-text)',
    fontSize: '14px',
    width: '100%',
    boxSizing: 'border-box' as const,
  }

  return (
    <Drawer
      title={t('sellOut.drawer.title')}
      kicker={t('sellOut.eyebrow')}
      isOpen={isOpen}
      onClose={onClose}
    >
      <div style={{ padding: '0 24px 24px' }}>
        {/* Product */}
        <div style={fieldStyle}>
          <label style={labelStyle}>{t('sellOut.drawer.product')}</label>
          <select
            style={inputStyle}
            value={productName}
            onChange={(e) => { setProductName(e.target.value); setErrors((p) => ({ ...p, product: '' })) }}
          >
            <option value="">{t('salesOrders.selectProduct')}</option>
            {products.map((p) => (
              <option key={p.code} value={p.name}>{p.name}</option>
            ))}
          </select>
          <FieldError message={errors.product} />
        </div>

        {/* Customer */}
        <div style={fieldStyle}>
          <label style={labelStyle}>{t('sellOut.drawer.customer')}</label>
          <select
            style={inputStyle}
            value={customerId}
            onChange={(e) => { setCustomerId(e.target.value); setErrors((p) => ({ ...p, customer: '' })) }}
          >
            <option value="">{t('salesOrders.selectCustomer')}</option>
            {activeCustomers.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <FieldError message={errors.customer} />
        </div>

        {/* Batch Number */}
        <div style={fieldStyle}>
          <label style={labelStyle}>{t('sellOut.drawer.batch')}</label>
          <input
            type="text"
            style={inputStyle}
            value={batchNumber}
            placeholder="e.g. BV-2401"
            onChange={(e) => { setBatchNumber(e.target.value); setErrors((p) => ({ ...p, batch: '' })) }}
          />
          <FieldError message={errors.batch} />
        </div>

        {/* Quantity */}
        <div style={fieldStyle}>
          <label style={labelStyle}>{t('sellOut.drawer.quantity')}</label>
          <input
            type="number"
            style={inputStyle}
            min={1}
            value={quantity}
            onChange={(e) => { setQuantity(e.target.value); setErrors((p) => ({ ...p, quantity: '' })) }}
          />
          <FieldError message={errors.quantity} />
        </div>

        {/* Date */}
        <div style={fieldStyle}>
          <label style={labelStyle}>{t('sellOut.drawer.date')}</label>
          <input
            type="date"
            style={inputStyle}
            value={date}
            onChange={(e) => { setDate(e.target.value); setErrors((p) => ({ ...p, date: '' })) }}
          />
          <FieldError message={errors.date} />
        </div>

        {/* Notes */}
        <div style={fieldStyle}>
          <label style={labelStyle}>{t('sellOut.drawer.notes')}</label>
          <textarea
            style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {errors.submit && <FieldError message={errors.submit} />}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
          <Button variant="secondary" onClick={onClose} disabled={saving}>{t('common.cancel')}</Button>
          <Button variant="primary" onClick={handleSave} loading={saving}>{t('sellOut.drawer.save')}</Button>
        </div>
      </div>
    </Drawer>
  )
}
