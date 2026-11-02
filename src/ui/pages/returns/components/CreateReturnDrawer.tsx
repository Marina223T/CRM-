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
import { salesOrdersStore } from '@/data/mock/sales-orders'
import { addReturn, getReturnedQtyForOrder } from '@/data/mock/returns'

interface CreateReturnDrawerProps {
  isOpen: boolean
  onClose: () => void
  onAction: (msg: string) => void
}

export function CreateReturnDrawer({ isOpen, onClose, onAction }: CreateReturnDrawerProps) {
  const { t } = useT()
  const { user } = useAuth()
  const products = useStore(productsStore)
  const customers = useStore(customersStore)
  const orders = useStore(salesOrdersStore)

  const [orderId, setOrderId] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [productName, setProductName] = useState('')
  const [batchNumber, setBatchNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [quantity, setQuantity] = useState('')
  const [returnDate, setReturnDate] = useState(new Date().toISOString().slice(0, 10))
  const [reason, setReason] = useState('')
  const [condition, setCondition] = useState<'sellable' | 'damaged' | 'expired'>('sellable')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const activeCustomers = customers.filter((c) => !c.deleted_at && c.active !== false)

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {}
    if (!customerId) errs.customer = t('returns.drawer.customer') + ' is required'
    if (!productName) errs.product = t('returns.drawer.product') + ' is required'
    if (!batchNumber.trim()) errs.batch = t('returns.drawer.batch') + ' is required'
    const qty = parseInt(quantity, 10)
    if (!quantity || isNaN(qty) || qty <= 0) {
      errs.quantity = t('sellOut.validationQty')
    } else if (orderId.trim()) {
      // Find the original order to check qty
      const order = orders.find((o) => o.id === orderId.trim())
      if (order) {
        const orderItem = order.items.find(
          (item) => item.productName.toLowerCase() === productName.toLowerCase(),
        )
        if (orderItem) {
          const alreadyReturned = getReturnedQtyForOrder(orderId.trim(), productName)
          const maxReturnQty = orderItem.quantity - alreadyReturned
          if (qty > maxReturnQty) {
            errs.quantity = t('returns.qtyExceeds')
          }
        }
      }
    }
    if (!returnDate) errs.date = t('returns.drawer.date') + ' is required'
    if (!reason.trim()) errs.reason = t('returns.drawer.reason') + ' is required'
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
      addReturn({
        order_id: orderId.trim() || undefined,
        customerId,
        customerName: customer?.name || customerId,
        repId: user?.id || '',
        repName: user?.name || '',
        productName,
        batchNumber: batchNumber.trim(),
        expiryDate: expiryDate.trim() || undefined,
        quantity: parseInt(quantity, 10),
        returnDate,
        reason: reason.trim(),
        condition,
      })
      onAction(t('returns.saveSuccess'))
      onClose()
      // Reset
      setOrderId('')
      setCustomerId('')
      setProductName('')
      setBatchNumber('')
      setQuantity('')
      setReturnDate(new Date().toISOString().slice(0, 10))
      setReason('')
      setCondition('sellable')
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
      title={t('returns.drawer.title')}
      kicker={t('returns.eyebrow')}
      isOpen={isOpen}
      onClose={onClose}
    >
      <div style={{ padding: '0 24px 24px' }}>
        {/* Sales Order ID (optional) */}
        <div style={fieldStyle}>
          <label style={labelStyle}>{t('returns.drawer.orderId')}</label>
          <input
            type="text"
            style={inputStyle}
            value={orderId}
            placeholder="e.g. SO-1234567890"
            onChange={(e) => setOrderId(e.target.value)}
          />
        </div>

        {/* Customer */}
        <div style={fieldStyle}>
          <label style={labelStyle}>{t('returns.drawer.customer')}</label>
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

        {/* Product */}
        <div style={fieldStyle}>
          <label style={labelStyle}>{t('returns.drawer.product')}</label>
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

        {/* Batch Number */}
        <div style={fieldStyle}>
          <label style={labelStyle}>{t('returns.drawer.batch')}</label>
          <input
            type="text"
            style={inputStyle}
            value={batchNumber}
            placeholder="e.g. BV-2401"
            onChange={(e) => { setBatchNumber(e.target.value); setErrors((p) => ({ ...p, batch: '' })) }}
          />
          <FieldError message={errors.batch} />
        </div>

        {/* Expiry Date */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Expiry Date</label>
          <input
            type="date"
            style={inputStyle}
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
          />
        </div>

        {/* Quantity */}
        <div style={fieldStyle}>
          <label style={labelStyle}>{t('returns.drawer.quantity')}</label>
          <input
            type="number"
            style={inputStyle}
            min={1}
            value={quantity}
            onChange={(e) => { setQuantity(e.target.value); setErrors((p) => ({ ...p, quantity: '' })) }}
          />
          <FieldError message={errors.quantity} />
        </div>

        {/* Return Date */}
        <div style={fieldStyle}>
          <label style={labelStyle}>{t('returns.drawer.date')}</label>
          <input
            type="date"
            style={inputStyle}
            value={returnDate}
            onChange={(e) => { setReturnDate(e.target.value); setErrors((p) => ({ ...p, date: '' })) }}
          />
          <FieldError message={errors.date} />
        </div>

        {/* Reason */}
        <div style={fieldStyle}>
          <label style={labelStyle}>{t('returns.drawer.reason')}</label>
          <textarea
            style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
            value={reason}
            onChange={(e) => { setReason(e.target.value); setErrors((p) => ({ ...p, reason: '' })) }}
          />
          <FieldError message={errors.reason} />
        </div>

        {/* Condition */}
        <div style={fieldStyle}>
          <label style={labelStyle}>{t('returns.drawer.condition')}</label>
          <select
            style={inputStyle}
            value={condition}
            onChange={(e) => setCondition(e.target.value as 'sellable' | 'damaged' | 'expired')}
          >
            <option value="sellable">{t('returns.drawer.sellable')}</option>
            <option value="damaged">{t('returns.drawer.damaged')}</option>
            <option value="expired">{t('returns.drawer.expired')}</option>
          </select>
        </div>

        {errors.submit && <FieldError message={errors.submit} />}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
          <Button variant="secondary" onClick={onClose} disabled={saving}>{t('common.cancel')}</Button>
          <Button variant="primary" onClick={handleSave} loading={saving}>{t('returns.drawer.save')}</Button>
        </div>
      </div>
    </Drawer>
  )
}
