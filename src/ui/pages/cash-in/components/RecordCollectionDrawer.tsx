'use client'

import { useState, useEffect, useMemo } from 'react'
import { X, CheckCircle2, AlertTriangle, Calculator, FileText, Calendar, Building, CreditCard, User, Hash } from 'lucide-react'
import { Button } from '@/ui/design-system/components/Button'
import { StatusPill } from '@/ui/design-system/components/StatusPill'
import { useT } from '@/lib/i18n'
import { formatCurrency } from '@/lib/format'
import {
  type CollectionInvoice,
  type PaymentRecord,
  type PaymentMethod,
  type InvoiceAllocation,
  getInvoicePaymentSummary,
  SYSTEM_CURRENT_DATE,
} from '@/data/mock/cash-in'

export interface RecordCollectionDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSave: (paymentData: Omit<PaymentRecord, 'id' | 'created_at' | 'status'>) => void
  invoices: CollectionInvoice[]
  allPayments: PaymentRecord[]
  availableCustomers: { id: string; name: string; name_ar?: string }[]
  currentUserName?: string
  role?: 'admin' | 'rep'
  preselectedCustomerId?: string | null
}

export function RecordCollectionDrawer({
  isOpen,
  onClose,
  onSave,
  invoices,
  allPayments,
  availableCustomers,
  currentUserName = 'Alex Morgan',
  role = 'admin',
  preselectedCustomerId = null,
}: RecordCollectionDrawerProps) {
  const { t, lang } = useT()

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('')
  const [paymentDate, setPaymentDate] = useState<string>(SYSTEM_CURRENT_DATE)
  const [amountReceived, setAmountReceived] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash')
  const [referenceNumber, setReferenceNumber] = useState<string>('')
  const [receivedBy, setReceivedBy] = useState<string>(currentUserName)
  const [notes, setNotes] = useState<string>('')

  // Map of invoiceId -> allocated amount string
  const [allocations, setAllocations] = useState<Record<string, string>>({})
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Initialize or reset when drawer opens
  useEffect(() => {
    if (isOpen) {
      const initialCust = preselectedCustomerId || availableCustomers[0]?.id || ''
      setSelectedCustomerId(initialCust)
      setPaymentDate(SYSTEM_CURRENT_DATE)
      setAmountReceived('')
      setPaymentMethod('Cash')
      setReferenceNumber('')
      setReceivedBy(currentUserName)
      setNotes('')
      setAllocations({})
      setErrorMessage(null)
    }
  }, [isOpen, preselectedCustomerId, availableCustomers, currentUserName])

  // Get customer object
  const currentCustomer = useMemo(() => {
    return availableCustomers.find((c) => c.id === selectedCustomerId)
  }, [availableCustomers, selectedCustomerId])

  // Get outstanding invoices for the selected customer
  const customerInvoices = useMemo(() => {
    if (!selectedCustomerId) return []
    return invoices
      .filter((inv) => inv.customerId === selectedCustomerId || inv.warehouseId === selectedCustomerId)
      .map((inv) => getInvoicePaymentSummary(inv, allPayments))
      .filter((summary) => summary.remainingBalance > 0)
  }, [invoices, allPayments, selectedCustomerId])

  // Total allocated numeric sum
  const totalAllocated = useMemo(() => {
    let sum = 0
    Object.values(allocations).forEach((val) => {
      const n = parseFloat(val)
      if (!isNaN(n) && n > 0) {
        sum += n
      }
    })
    return Math.round(sum * 100) / 100
  }, [allocations])

  const targetAmount = parseFloat(amountReceived) || 0
  const unallocatedDifference = Math.round((targetAmount - totalAllocated) * 100) / 100
  const isBalanced = targetAmount > 0 && Math.abs(unallocatedDifference) < 0.01

  // Handle allocation change for an individual invoice
  const handleAllocationChange = (invId: string, maxBalance: number, val: string) => {
    setErrorMessage(null)
    if (val === '') {
      const copy = { ...allocations }
      delete copy[invId]
      setAllocations(copy)
      return
    }

    const num = parseFloat(val)
    if (isNaN(num)) return

    if (num < 0) {
      setErrorMessage(lang === 'ar' ? 'لا يمكن إدخال مبالغ سالبة' : 'Negative allocations are not permitted')
      return
    }

    // Prevent allocation from exceeding the invoice's remaining balance
    if (num > maxBalance) {
      setErrorMessage(
        lang === 'ar'
          ? `لا يمكن أن يتجاوز المبلغ المخصص رصيد الفاتورة المتبقي (${formatCurrency(maxBalance, 'EGP', lang)})`
          : `Allocation cannot exceed remaining invoice balance (${formatCurrency(maxBalance, 'EGP', lang)})`,
      )
      setAllocations({
        ...allocations,
        [invId]: String(targetAmount > 0 ? Math.min(maxBalance, targetAmount) : maxBalance),
      })
      return
    }

    // Prevent allocation from exceeding the total received amount
    if (targetAmount > 0 && num > targetAmount) {
      setErrorMessage(
        lang === 'ar'
          ? `لا يمكن أن يتجاوز المبلغ المخصص إجمالي المبلغ المستلم (${formatCurrency(targetAmount, 'EGP', lang)})`
          : `Allocation cannot exceed total received payment (${formatCurrency(targetAmount, 'EGP', lang)})`,
      )
      setAllocations({
        ...allocations,
        [invId]: String(Math.min(maxBalance, targetAmount)),
      })
      return
    }

    setAllocations({
      ...allocations,
      [invId]: val,
    })
  }

  // Quick auto-allocate button ("Pay Full Balance" shortcut)
  // Requirement 9: Must never allocate more than the unallocated received amount.
  // Allocates the smaller of the invoice's remaining balance and the available payment amount.
  const handleAutoAllocate = (invId: string, remainingBalance: number) => {
    setErrorMessage(null)

    if (targetAmount <= 0) {
      setErrorMessage(
        lang === 'ar'
          ? 'يرجى إدخال المبلغ المستلم أولاً لتخصيص الدفعات.'
          : 'Please enter the received payment amount first before allocating.',
      )
      return
    }

    const currentAlloc = parseFloat(allocations[invId]) || 0
    const currentTotalWithoutThis = totalAllocated - currentAlloc
    const availableFromTarget = Math.max(0, Math.round((targetAmount - currentTotalWithoutThis) * 100) / 100)

    if (availableFromTarget <= 0) {
      setErrorMessage(
        lang === 'ar'
          ? 'تم استنفاد كامل المبلغ المستلم بالفعل. قم بزيادة المبلغ المستلم لتخصيص دفعات إضافية.'
          : 'Total received payment is already fully allocated. Increase the received amount to allocate more.',
      )
      return
    }

    // Allocate the smaller of invoice balance and available payment funds
    const toAllocate = Math.min(remainingBalance, availableFromTarget)

    setAllocations({
      ...allocations,
      [invId]: String(toAllocate),
    })
  }

  // Auto-fill reference placeholder for Cash
  useEffect(() => {
    if (!referenceNumber) {
      setReferenceNumber(`CSH-${Math.floor(1000 + Math.random() * 9000)}`)
    }
  }, [referenceNumber])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!selectedCustomerId) {
      setErrorMessage(lang === 'ar' ? 'يرجى اختيار العميل أو المستودع' : 'Please select a customer or warehouse')
      return
    }

    if (targetAmount <= 0) {
      setErrorMessage(lang === 'ar' ? 'يرجى إدخال مبلغ دفع صالح' : 'Please enter a valid payment amount')
      return
    }

    if (!isBalanced) {
      setErrorMessage(
        lang === 'ar'
          ? `إجمالي المبالغ المخصصة (${formatCurrency(totalAllocated, 'EGP', lang)}) يجب أن يتطابق تماماً مع المبلغ المستلم (${formatCurrency(targetAmount, 'EGP', lang)})`
          : `Total allocated (${formatCurrency(totalAllocated, 'EGP', lang)}) must exactly equal received amount (${formatCurrency(targetAmount, 'EGP', lang)})`,
      )
      return
    }

    const allocationItems: InvoiceAllocation[] = []
    Object.entries(allocations).forEach(([invId, amtStr]) => {
      const amt = parseFloat(amtStr)
      if (!isNaN(amt) && amt > 0) {
        const invSummary = customerInvoices.find((s) => s.invoice.id === invId)
        if (invSummary) {
          allocationItems.push({
            invoiceId: invId,
            invoiceNumber: invSummary.invoice.invoiceNumber,
            allocatedAmount: amt,
            invoiceOriginalAmount: invSummary.invoice.originalAmount,
          })
        }
      }
    })

    if (allocationItems.length === 0) {
      setErrorMessage(lang === 'ar' ? 'يرجى تخصيص دفعة لفاتورة واحدة على الأقل' : 'Please allocate payment to at least one invoice')
      return
    }

    onSave({
      receiptNumber: '', // store auto-generates
      customerId: selectedCustomerId,
      customerName: currentCustomer?.name || 'Customer',
      customerName_ar: currentCustomer?.name_ar,
      paymentDate,
      amount: targetAmount,
      paymentMethod,
      referenceNumber: referenceNumber.trim() || `REF-${Date.now()}`,
      receivedBy: role === 'rep' ? currentUserName : receivedBy,
      notes: notes.trim(),
      allocations: allocationItems,
    })

    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      <div
        className="drawer-panel"
        style={{
          width: '100%',
          maxWidth: '680px',
          height: '100%',
          background: 'var(--card-bg, #ffffff)',
          boxShadow: 'var(--shadow-raised, -8px 0 32px rgba(0,0,0,0.18))',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideInRight 0.22s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-card, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--surface-raised, #f8fafc)',
          }}
        >
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--heading-text)', margin: 0 }}>
              {t('cashIn.drawer.recordTitle')}
            </h2>
            <p style={{ fontSize: '12.5px', color: 'var(--muted-text)', margin: '4px 0 0 0' }}>
              {t('cashIn.drawer.recordSubtitle')}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: 0,
              background: 'transparent',
              color: 'var(--muted-text)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '22px',
          }}
        >
          {errorMessage && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                borderRadius: '12px',
                background: 'rgba(225, 29, 72, 0.1)',
                border: '1px solid rgba(225, 29, 72, 0.25)',
                color: 'var(--rose, #e11d48)',
                fontSize: '13px',
              }}
            >
              <AlertTriangle size={18} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Payment Details */}
          <div
            style={{
              padding: '18px',
              borderRadius: '16px',
              border: '1px solid var(--border-card, #e2e8f0)',
              background: 'var(--card-bg, #ffffff)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <strong style={{ fontSize: '14.5px', color: 'var(--heading-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={17} style={{ color: 'var(--sky, #0284c7)' }} />
              <span>{lang === 'ar' ? 'بيانات التحصيل والدفع' : 'Payment Information'}</span>
            </strong>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '14px' }}>
              {/* Customer Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--muted-text)', marginBottom: '6px' }}>
                  {t('cashIn.drawer.customerSelect')} <span style={{ color: 'var(--rose)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Building size={15} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', insetInlineStart: '12px', color: 'var(--muted-text)' }} />
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => {
                      setSelectedCustomerId(e.target.value)
                      setAllocations({})
                      setErrorMessage(null)
                    }}
                    required
                    style={{
                      width: '100%',
                      height: '42px',
                      paddingInlineStart: '36px',
                      paddingInlineEnd: '12px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-input, #cbd5e1)',
                      background: 'var(--card-bg, #ffffff)',
                      color: 'var(--heading-text)',
                      fontSize: '13.5px',
                    }}
                  >
                    {availableCustomers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {lang === 'ar' && c.name_ar ? c.name_ar : c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Payment Date */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--muted-text)', marginBottom: '6px' }}>
                  {t('cashIn.drawer.paymentDate')} <span style={{ color: 'var(--rose)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={15} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', insetInlineStart: '12px', color: 'var(--muted-text)' }} />
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      height: '42px',
                      paddingInlineStart: '36px',
                      paddingInlineEnd: '12px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-input, #cbd5e1)',
                      background: 'var(--card-bg, #ffffff)',
                      color: 'var(--heading-text)',
                      fontSize: '13.5px',
                    }}
                  />
                </div>
              </div>

              {/* Total Amount Received */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--muted-text)', marginBottom: '6px' }}>
                  {t('cashIn.drawer.amountReceived')} <span style={{ color: 'var(--rose)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Calculator size={15} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', insetInlineStart: '12px', color: 'var(--sky, #0284c7)' }} />
                  <input
                    type="number"
                    min="1"
                    step="any"
                    placeholder="e.g. 15000"
                    value={amountReceived}
                    onChange={(e) => {
                      setAmountReceived(e.target.value)
                      setErrorMessage(null)
                    }}
                    required
                    style={{
                      width: '100%',
                      height: '42px',
                      paddingInlineStart: '36px',
                      paddingInlineEnd: '12px',
                      borderRadius: '12px',
                      border: '1.5px solid var(--sky, #0284c7)',
                      background: 'var(--card-bg, #ffffff)',
                      color: 'var(--heading-text)',
                      fontSize: '14.5px',
                      fontWeight: 700,
                    }}
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--muted-text)', marginBottom: '6px' }}>
                  {t('cashIn.drawer.paymentMethod')}
                </label>
                <div
                  style={{
                    height: '42px',
                    borderRadius: '12px',
                    border: '1.5px solid var(--sky, #0284c7)',
                    background: 'rgba(2, 132, 199, 0.08)',
                    color: 'var(--sky, #0284c7)',
                    fontSize: '13px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <CreditCard size={15} />
                  <span>{lang === 'ar' ? 'نقداً (Cash)' : 'Cash Only'}</span>
                </div>
              </div>

              {/* Reference Number */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--muted-text)', marginBottom: '6px' }}>
                  {t('cashIn.drawer.referenceNumber')}
                </label>
                <div style={{ position: 'relative' }}>
                  <Hash size={15} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', insetInlineStart: '12px', color: 'var(--muted-text)' }} />
                  <input
                    type="text"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="e.g. CSH-2401, CIB-TRX-8821..."
                    style={{
                      width: '100%',
                      height: '42px',
                      paddingInlineStart: '36px',
                      paddingInlineEnd: '12px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-input, #cbd5e1)',
                      background: 'var(--card-bg, #ffffff)',
                      color: 'var(--heading-text)',
                      fontSize: '13px',
                    }}
                  />
                </div>
              </div>

              {/* Received By */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--muted-text)', marginBottom: '6px' }}>
                  {t('cashIn.drawer.receivedBy')}
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={15} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', insetInlineStart: '12px', color: 'var(--muted-text)' }} />
                  <input
                    type="text"
                    value={role === 'rep' ? currentUserName : receivedBy}
                    onChange={(e) => setReceivedBy(e.target.value)}
                    disabled={role === 'rep'}
                    style={{
                      width: '100%',
                      height: '42px',
                      paddingInlineStart: '36px',
                      paddingInlineEnd: '12px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-input, #cbd5e1)',
                      background: role === 'rep' ? 'rgba(0,0,0,0.03)' : 'var(--card-bg, #ffffff)',
                      color: 'var(--heading-text)',
                      fontSize: '13px',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--muted-text)', marginBottom: '6px' }}>
                {t('cashIn.drawer.notes')}
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={lang === 'ar' ? 'ملاحظات إضافية حول الإيداع أو إشعار التحصيل...' : 'Additional notes, branch slip, or deposit remarks...'}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-input, #cbd5e1)',
                  background: 'var(--card-bg, #ffffff)',
                  color: 'var(--heading-text)',
                  fontSize: '13px',
                  resize: 'vertical',
                }}
              />
            </div>
          </div>

          {/* Section 2: Invoice Allocation Table */}
          <div
            style={{
              padding: '18px',
              borderRadius: '16px',
              border: '1px solid var(--border-card, #e2e8f0)',
              background: 'var(--card-bg, #ffffff)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <strong style={{ fontSize: '14.5px', color: 'var(--heading-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={17} style={{ color: 'var(--sky, #0284c7)' }} />
                  <span>{t('cashIn.drawer.allocationTitle')}</span>
                </strong>
                <span style={{ fontSize: '12px', color: 'var(--muted-text)', marginTop: '2px', display: 'block' }}>
                  {t('cashIn.drawer.allocationSubtitle')}
                </span>
              </div>
            </div>

            {customerInvoices.length === 0 ? (
              <div
                style={{
                  padding: '30px',
                  textAlign: 'center',
                  background: 'var(--surface-raised, #f8fafc)',
                  borderRadius: '12px',
                  color: 'var(--muted-text)',
                  fontSize: '13.5px',
                }}
              >
                <CheckCircle2 size={32} style={{ color: 'var(--emerald, #10b981)', margin: '0 auto 10px auto' }} />
                <span>{t('cashIn.drawer.noInvoices')}</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {customerInvoices.map((summary) => {
                  const inv = summary.invoice
                  const currentAllocVal = allocations[inv.id] || ''
                  const isAllocated = parseFloat(currentAllocVal) > 0

                  return (
                    <div
                      key={inv.id}
                      style={{
                        padding: '14px 16px',
                        borderRadius: '14px',
                        border: isAllocated
                          ? '1.5px solid var(--sky, #0284c7)'
                          : '1px solid var(--border-card, #e2e8f0)',
                        background: isAllocated ? 'rgba(2, 132, 199, 0.03)' : 'var(--card-bg, #ffffff)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <strong style={{ fontSize: '14px', color: 'var(--heading-text)' }}>
                            {inv.invoiceNumber}
                          </strong>
                          <span style={{ fontSize: '12px', color: 'var(--muted-text)', marginInlineStart: '10px' }}>
                            {lang === 'ar' ? 'تاريخ الاستحقاق:' : 'Due:'} {inv.dueDate}
                          </span>
                        </div>
                        <StatusPill status={summary.paymentStatus} />
                      </div>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(3, 1fr) auto',
                          gap: '10px',
                          alignItems: 'center',
                          fontSize: '12.5px',
                        }}
                      >
                        <div>
                          <span style={{ color: 'var(--muted-text)', display: 'block', fontSize: '11px' }}>
                            {t('cashIn.drawer.originalAmount')}
                          </span>
                          <strong style={{ color: 'var(--heading-text)' }}>
                            {formatCurrency(inv.originalAmount, 'EGP', lang)}
                          </strong>
                        </div>

                        <div>
                          <span style={{ color: 'var(--muted-text)', display: 'block', fontSize: '11px' }}>
                            {t('cashIn.drawer.paidToDate')}
                          </span>
                          <span style={{ color: 'var(--muted-text)' }}>
                            {formatCurrency(summary.paidAmount, 'EGP', lang)}
                          </span>
                        </div>

                        <div>
                          <span style={{ color: 'var(--muted-text)', display: 'block', fontSize: '11px' }}>
                            {t('cashIn.drawer.remainingBalance')}
                          </span>
                          <strong style={{ color: summary.isOverdue ? 'var(--rose, #e11d48)' : 'var(--navy, #1B3554)' }}>
                            {formatCurrency(summary.remainingBalance, 'EGP', lang)}
                          </strong>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input
                            type="number"
                            min="0"
                            max={summary.remainingBalance}
                            step="any"
                            placeholder="0"
                            value={currentAllocVal}
                            onChange={(e) => handleAllocationChange(inv.id, summary.remainingBalance, e.target.value)}
                            style={{
                              width: '120px',
                              height: '36px',
                              padding: '0 10px',
                              borderRadius: '10px',
                              border: isAllocated ? '1.5px solid var(--sky, #0284c7)' : '1px solid var(--border-input, #cbd5e1)',
                              fontSize: '13px',
                              fontWeight: 700,
                              textAlign: 'end',
                              color: 'var(--heading-text)',
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleAutoAllocate(inv.id, summary.remainingBalance)}
                            title={t('cashIn.drawer.autoAllocate')}
                            style={{
                              height: '36px',
                              padding: '0 10px',
                              borderRadius: '10px',
                              border: '1px solid rgba(2, 132, 199, 0.3)',
                              background: 'rgba(2, 132, 199, 0.08)',
                              color: 'var(--sky, #0284c7)',
                              fontSize: '11.5px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {t('cashIn.drawer.autoAllocate')}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Allocation Balance Footer Bar */}
          <div
            style={{
              padding: '16px 20px',
              borderRadius: '16px',
              border: isBalanced ? '1.5px solid var(--emerald, #10b981)' : '1.5px solid var(--amber, #f59e0b)',
              background: isBalanced ? 'rgba(16, 185, 129, 0.07)' : 'rgba(245, 158, 11, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '14px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isBalanced ? (
                  <CheckCircle2 size={18} style={{ color: 'var(--emerald, #10b981)' }} />
                ) : (
                  <AlertTriangle size={18} style={{ color: 'var(--amber, #f59e0b)' }} />
                )}
                <strong style={{ fontSize: '13.5px', color: isBalanced ? 'var(--emerald, #10b981)' : 'var(--amber, #f59e0b)' }}>
                  {isBalanced ? t('cashIn.drawer.balanced') : t('cashIn.drawer.mismatch')}
                </strong>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--muted-text)', marginTop: '2px', display: 'block' }}>
                {lang === 'ar' ? 'المستلم:' : 'Received:'} {formatCurrency(targetAmount, 'EGP', lang)} ·{' '}
                {t('cashIn.drawer.totalAllocated')}: {formatCurrency(totalAllocated, 'EGP', lang)}
              </span>
            </div>

            <div style={{ textAlign: 'end' }}>
              <span style={{ fontSize: '11.5px', color: 'var(--muted-text)', display: 'block' }}>
                {t('cashIn.drawer.unallocatedBalance')}
              </span>
              <strong
                style={{
                  fontSize: '15px',
                  fontWeight: 800,
                  color: isBalanced ? 'var(--emerald, #10b981)' : unallocatedDifference > 0 ? 'var(--amber, #f59e0b)' : 'var(--rose, #e11d48)',
                }}
              >
                {formatCurrency(unallocatedDifference, 'EGP', lang)}
              </strong>
            </div>
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
              paddingTop: '10px',
            }}
          >
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              {t('cashIn.drawer.cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={!isBalanced || customerInvoices.length === 0}
            >
              {t('cashIn.drawer.save')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
