'use client'

import { useState, useMemo } from 'react'
import {
  BadgeDollarSign,
  Plus,
  Building,
  AlertCircle,
  FileText,
  Search,
  X,
} from 'lucide-react'
import { Button } from '@/ui/design-system/components/Button'
import { Toast } from '@/ui/design-system/components/Toast'
import { useT } from '@/lib/i18n'
import { formatCurrency } from '@/lib/format'
import { useStore } from '@/data/mock/store'
import {
  collectionsStore,
  collectionTargetStore,
  updateCollectionTarget,
  calculateCashInKpis,
  addCollectionPayment,
  toCollectionInvoice,
  getInvoicePaymentSummary,
  type PaymentRecord,
  type CollectionInvoice,
} from '@/data/mock/cash-in'
import { invoicesStore } from '@/data/mock/invoices'
import { Modal } from '@/ui/design-system/components/Modal'
import { RecordCollectionDrawer } from './components/RecordCollectionDrawer'
import { OutstandingInvoicesView } from './components/OutstandingInvoicesView'
import { CustomerStatementView } from './components/CustomerStatementView'
import { OverdueCollectionsView } from './components/OverdueCollectionsView'
import { ALL_MOCK_REPS } from '@/ui/design-system/components/RecordFormDrawer'

export interface CashInPageProps {
  role?: 'admin' | 'rep'
  currentUserName?: string
  onAction?: (msg: string) => void
}

export default function CashInPage({
  role = 'admin',
  currentUserName = 'Alex Morgan',
  onAction,
}: CashInPageProps) {
  const { t, lang } = useT()

  // Reactive Stores: shared invoices store as the single source of truth
  const storedInvoices = useStore(invoicesStore)
  const invoices = useMemo(() => {
    return storedInvoices
      .filter((inv) => inv.status !== 'Rejected')
      .map(toCollectionInvoice)
  }, [storedInvoices])
  const payments = useStore(collectionsStore)

  // Page Tabs: Outstanding Invoices, Customer Statement, Overdue Collections
  const [activeTab, setActiveTab] = useState<'outstanding' | 'statement' | 'overdue'>('outstanding')

  // Search State for invoices
  const [searchQuery, setSearchQuery] = useState('')

  // Drawer & Modal State
  const [isRecordDrawerOpen, setIsRecordDrawerOpen] = useState(false)
  const [preselectedCustomerId, setPreselectedCustomerId] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Target Management State
  const collectionTarget = useStore(collectionTargetStore)
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false)
  const [newTargetValue, setNewTargetValue] = useState(String(collectionTarget.monthlyTarget))

  const showToast = (msg: string) => {
    setToastMessage(msg)
    onAction?.(msg)
    window.setTimeout(() => setToastMessage(null), 4000)
  }

  // Derive available customer list
  const availableCustomers = useMemo(() => {
    const map = new Map<string, { id: string; name: string; name_ar?: string }>()
    invoices.forEach((inv) => {
      if (!map.has(inv.customerId)) {
        map.set(inv.customerId, {
          id: inv.customerId,
          name: inv.customerName,
          name_ar: inv.customerName_ar,
        })
      }
    })
    return Array.from(map.values())
  }, [invoices])

  // Count metrics for tab badges
  const outstandingCount = useMemo(() => {
    return invoices
      .map((inv) => getInvoicePaymentSummary(inv, payments))
      .filter((s) => s.remainingBalance > 0).length
  }, [invoices, payments])

  const overdueCount = useMemo(() => {
    return invoices
      .map((inv) => getInvoicePaymentSummary(inv, payments))
      .filter((s) => s.isOverdue).length
  }, [invoices, payments])

  // Dynamic KPIs derived from active stores and internal payment records
  const kpis = useMemo(() => {
    const scopedInvoices = role === 'rep'
      ? invoices.filter((i) => i.repName.toLowerCase() === currentUserName.toLowerCase())
      : invoices
    const scopedPayments = role === 'rep'
      ? payments.filter((p) => p.receivedBy.toLowerCase() === currentUserName.toLowerCase())
      : payments

    return calculateCashInKpis(scopedInvoices, scopedPayments)
  }, [invoices, payments, role, currentUserName])

  // Handlers
  const handleRecordPayment = (paymentData: Omit<PaymentRecord, 'id' | 'created_at' | 'status'>) => {
    const saved = addCollectionPayment(paymentData)
    showToast(
      lang === 'ar'
        ? `تم تسجيل التحصيل بنجاح (${saved.receiptNumber}) بمبلغ ${formatCurrency(saved.amount, 'EGP', lang)}`
        : `Payment receipt ${saved.receiptNumber} recorded successfully (${formatCurrency(saved.amount, 'EGP', lang)})`,
    )
  }

  const handleOpenCollectForCustomer = (customerId: string) => {
    setPreselectedCustomerId(customerId)
    setIsRecordDrawerOpen(true)
  }

  const handleOpenCollectForInvoice = (invoice: CollectionInvoice) => {
    setPreselectedCustomerId(invoice.customerId)
    setIsRecordDrawerOpen(true)
  }

  return (
    <section className="cash-in-page" style={{ paddingBottom: '60px' }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'rgba(2, 132, 199, 0.1)',
                color: 'var(--sky, #0284c7)',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <BadgeDollarSign size={22} />
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--heading-text)', margin: 0 }}>
              {t('cashIn.title')}
            </h1>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted-text)', margin: '6px 0 0 0' }}>
            {t('cashIn.subtitle')}
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => {
            setPreselectedCustomerId(null)
            setIsRecordDrawerOpen(true)
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            height: '42px',
            padding: '0 18px',
            borderRadius: '14px',
            fontWeight: 700,
          }}
        >
          <Plus size={17} />
          <span>{t('cashIn.actions.recordPayment')}</span>
        </Button>
      </div>

      {/* KPI Cards Strip (5 Cards) */}
      <div
        className="kpi-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '14px',
          marginBottom: '28px',
        }}
      >
        {/* KPI 1: Total Invoiced */}
        <div
          className="kpi-card"
          style={{
            padding: '18px 20px',
            borderRadius: '18px',
            background: 'var(--card-bg, #ffffff)',
            border: '1px solid var(--border-card, #e2e8f0)',
            boxShadow: 'var(--card-shadow)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted-text)' }}>
              {t('cashIn.kpi.totalInvoiced')}
            </span>
            <FileText size={16} style={{ color: 'var(--sky, #0284c7)' }} />
          </div>
          <strong style={{ fontSize: '22px', fontWeight: 800, color: 'var(--heading-text)', display: 'block' }}>
            {formatCurrency(kpis.totalInvoiced, 'EGP', lang)}
          </strong>
          <span style={{ fontSize: '11px', color: 'var(--muted-text)', marginTop: '4px', display: 'block' }}>
            {t('cashIn.kpi.totalInvoicedDesc')}
          </span>
        </div>

        {/* KPI 2: Total Collected */}
        <div
          className="kpi-card"
          style={{
            padding: '18px 20px',
            borderRadius: '18px',
            background: 'var(--card-bg, #ffffff)',
            border: '1px solid var(--border-card, #e2e8f0)',
            boxShadow: 'var(--card-shadow)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted-text)' }}>
              {t('cashIn.kpi.totalCollected')}
            </span>
            <BadgeDollarSign size={16} style={{ color: 'var(--emerald, #10b981)' }} />
          </div>
          <strong style={{ fontSize: '22px', fontWeight: 800, color: 'var(--emerald, #10b981)', display: 'block' }}>
            {formatCurrency(kpis.totalCollected, 'EGP', lang)}
          </strong>
          <span style={{ fontSize: '11px', color: 'var(--muted-text)', marginTop: '4px', display: 'block' }}>
            {t('cashIn.kpi.totalCollectedDesc')}
          </span>
        </div>

        {/* KPI 3: Outstanding Balance */}
        <div
          className="kpi-card"
          style={{
            padding: '18px 20px',
            borderRadius: '18px',
            background: 'var(--card-bg, #ffffff)',
            border: '1px solid var(--border-card, #e2e8f0)',
            boxShadow: 'var(--card-shadow)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted-text)' }}>
              {t('cashIn.kpi.outstandingBalance')}
            </span>
            <Building size={16} style={{ color: 'var(--navy, #1B3554)' }} />
          </div>
          <strong style={{ fontSize: '22px', fontWeight: 800, color: 'var(--navy, #1B3554)', display: 'block' }}>
            {formatCurrency(kpis.outstandingBalance, 'EGP', lang)}
          </strong>
          <span style={{ fontSize: '11px', color: 'var(--muted-text)', marginTop: '4px', display: 'block' }}>
            {t('cashIn.kpi.outstandingBalanceDesc')}
          </span>
        </div>

        {/* KPI 4: Overdue Amount */}
        <div
          className="kpi-card"
          style={{
            padding: '18px 20px',
            borderRadius: '18px',
            background: kpis.overdueAmount > 0 ? 'rgba(225, 29, 72, 0.03)' : 'var(--card-bg, #ffffff)',
            border: kpis.overdueAmount > 0 ? '1.5px solid rgba(225, 29, 72, 0.3)' : '1px solid var(--border-card, #e2e8f0)',
            boxShadow: 'var(--card-shadow)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted-text)' }}>
              {t('cashIn.kpi.overdueAmount')}
            </span>
            <AlertCircle size={16} style={{ color: 'var(--rose, #e11d48)' }} />
          </div>
          <strong style={{ fontSize: '22px', fontWeight: 800, color: 'var(--rose, #e11d48)', display: 'block' }}>
            {formatCurrency(kpis.overdueAmount, 'EGP', lang)}
          </strong>
          <span style={{ fontSize: '11px', color: 'var(--muted-text)', marginTop: '4px', display: 'block' }}>
            {t('cashIn.kpi.overdueAmountDesc')}
          </span>
        </div>

        {/* KPI 5: Collections This Month & Target */}
        <div
          className="kpi-card"
          style={{
            padding: '18px 20px',
            borderRadius: '18px',
            background: 'var(--card-bg, #ffffff)',
            border: '1px solid var(--border-card, #e2e8f0)',
            boxShadow: 'var(--card-shadow)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted-text)' }}>
              {t('cashIn.kpi.collectionsThisMonth')}
            </span>
            <button
              type="button"
              onClick={() => {
                setNewTargetValue(String(collectionTarget.monthlyTarget))
                setIsTargetModalOpen(true)
              }}
              title={lang === 'ar' ? 'تعديل الهدف الشهري' : 'Edit Monthly Target'}
              style={{
                border: 0,
                background: 'rgba(2, 132, 199, 0.08)',
                color: 'var(--sky, #0284c7)',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 600,
                padding: '3px 8px',
                borderRadius: '6px',
              }}
            >
              {lang === 'ar' ? 'تحديد الهدف' : 'Set Target'}
            </button>
          </div>
          <strong style={{ fontSize: '22px', fontWeight: 800, color: 'var(--sky, #0284c7)', display: 'block' }}>
            {formatCurrency(kpis.collectionsThisMonth, 'EGP', lang)}
          </strong>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px', fontSize: '11.5px' }}>
            <span style={{ color: 'var(--muted-text)' }}>
              {lang === 'ar' ? 'الهدف:' : 'Target:'} {formatCurrency(collectionTarget.monthlyTarget, 'EGP', lang)}
            </span>
            <span style={{ fontWeight: 700, color: kpis.collectionsThisMonth >= collectionTarget.monthlyTarget ? 'var(--emerald, #10b981)' : 'var(--sky, #0284c7)' }}>
              {Math.min(100, Math.round((kpis.collectionsThisMonth / (collectionTarget.monthlyTarget || 1)) * 100))}%
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation (Outstanding Invoices, Customer Statement, Overdue Collections) */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid var(--border-card, #e2e8f0)',
          marginBottom: '20px',
          overflowX: 'auto',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('outstanding')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            border: 0,
            borderBottom: activeTab === 'outstanding' ? '2.5px solid var(--sky, #0284c7)' : '2.5px solid transparent',
            background: 'transparent',
            color: activeTab === 'outstanding' ? 'var(--sky, #0284c7)' : 'var(--muted-text)',
            fontWeight: activeTab === 'outstanding' ? 700 : 500,
            fontSize: '13.5px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <FileText size={16} />
          <span>{t('cashIn.tabs.outstanding')}</span>
          <span
            style={{
              padding: '2px 7px',
              borderRadius: '99px',
              fontSize: '11px',
              background: activeTab === 'outstanding' ? 'rgba(2, 132, 199, 0.12)' : 'var(--mist, #f1f5f9)',
              color: activeTab === 'outstanding' ? 'var(--sky, #0284c7)' : 'var(--muted-text)',
            }}
          >
            {outstandingCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('statement')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            border: 0,
            borderBottom: activeTab === 'statement' ? '2.5px solid var(--sky, #0284c7)' : '2.5px solid transparent',
            background: 'transparent',
            color: activeTab === 'statement' ? 'var(--sky, #0284c7)' : 'var(--muted-text)',
            fontWeight: activeTab === 'statement' ? 700 : 500,
            fontSize: '13.5px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <Building size={16} />
          <span>{t('cashIn.tabs.statement')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('overdue')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            border: 0,
            borderBottom: activeTab === 'overdue' ? '2.5px solid var(--rose, #e11d48)' : '2.5px solid transparent',
            background: 'transparent',
            color: activeTab === 'overdue' ? 'var(--rose, #e11d48)' : 'var(--muted-text)',
            fontWeight: activeTab === 'overdue' ? 700 : 500,
            fontSize: '13.5px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <AlertCircle size={16} />
          <span>{t('cashIn.tabs.overdue')}</span>
          {overdueCount > 0 && (
            <span
              style={{
                padding: '2px 7px',
                borderRadius: '99px',
                fontSize: '11px',
                background: 'rgba(225, 29, 72, 0.12)',
                color: 'var(--rose, #e11d48)',
                fontWeight: 700,
              }}
            >
              {overdueCount}
            </span>
          )}
        </button>
      </div>

      {/* Invoice Search Bar for Outstanding & Overdue tabs */}
      {(activeTab === 'outstanding' || activeTab === 'overdue') && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: '420px' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                top: '50%',
                transform: 'translateY(-50%)',
                insetInlineStart: '14px',
                color: 'var(--muted-text)',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'ar' ? 'البحث برقم الفاتورة أو العميل أو المندوب...' : 'Search by invoice #, customer, or rep...'}
              style={{
                width: '100%',
                height: '40px',
                paddingInlineStart: '38px',
                paddingInlineEnd: searchQuery ? '36px' : '14px',
                borderRadius: '12px',
                border: '1px solid var(--border-input, #cbd5e1)',
                background: 'var(--card-bg, #ffffff)',
                color: 'var(--heading-text)',
                fontSize: '13.5px',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  insetInlineEnd: '10px',
                  border: 0,
                  background: 'transparent',
                  color: 'var(--muted-text)',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '6px',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tab 1: Outstanding Invoices */}
      {activeTab === 'outstanding' && (
        <OutstandingInvoicesView
          invoices={invoices}
          payments={payments}
          onCollectInvoice={handleOpenCollectForInvoice}
          searchQuery={searchQuery}
          role={role}
          currentUserName={currentUserName}
        />
      )}

      {/* Tab 2: Customer Statement */}
      {activeTab === 'statement' && (
        <CustomerStatementView
          invoices={invoices}
          payments={payments}
          availableCustomers={availableCustomers}
          initialCustomerId={preselectedCustomerId}
          onCollectPayment={handleOpenCollectForCustomer}
        />
      )}

      {/* Tab 3: Overdue Collections */}
      {activeTab === 'overdue' && (
        <OverdueCollectionsView
          invoices={invoices}
          payments={payments}
          onCollectInvoice={handleOpenCollectForInvoice}
          searchQuery={searchQuery}
          role={role}
          currentUserName={currentUserName}
        />
      )}

      {/* Record Collection Drawer */}
      <RecordCollectionDrawer
        isOpen={isRecordDrawerOpen}
        onClose={() => {
          setIsRecordDrawerOpen(false)
          setPreselectedCustomerId(null)
        }}
        onSave={handleRecordPayment}
        invoices={invoices}
        allPayments={payments}
        availableCustomers={availableCustomers}
        currentUserName={currentUserName}
        role={role}
        preselectedCustomerId={preselectedCustomerId}
      />

      {/* Set Monthly Collection Target Modal */}
      <Modal isOpen={isTargetModalOpen} onClose={() => setIsTargetModalOpen(false)}>
        <div style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 700 }}>
            {lang === 'ar' ? 'تحديد هدف التحصيل الشهري' : 'Set Monthly Collection Target'}
          </h3>
          <p style={{ margin: '0 0 16px', fontSize: '13px', color: 'var(--muted-text)' }}>
            {lang === 'ar'
              ? 'أدخل القيمة المستهدفة لتحصيلات هذا الشهر لمتابعة نسبة الإنجاز والتقارير المالية.'
              : 'Specify the monthly collection target to track team performance and financial velocity.'}
          </p>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>
              {lang === 'ar' ? 'قيمة الهدف (ج.م)' : 'Target Amount (EGP)'}
            </label>
            <input
              type="number"
              min="1000"
              step="1000"
              value={newTargetValue}
              onChange={(e) => setNewTargetValue(e.target.value)}
              style={{
                width: '100%',
                height: '42px',
                padding: '0 12px',
                borderRadius: '10px',
                border: '1.5px solid var(--sky, #0284c7)',
                fontSize: '14px',
                fontWeight: 700,
                color: 'var(--heading-text)',
                background: 'var(--surface-raised, #ffffff)',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setIsTargetModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                const val = parseFloat(newTargetValue)
                if (!isNaN(val) && val > 0) {
                  updateCollectionTarget(val, currentUserName)
                  showToast(lang === 'ar' ? 'تم تحديث هدف التحصيل بنجاح' : 'Monthly collection target updated')
                  setIsTargetModalOpen(false)
                }
              }}
            >
              {lang === 'ar' ? 'حفظ الهدف' : 'Save Target'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Toast Notification */}
      {toastMessage && <Toast message={toastMessage} />}
    </section>
  )
}
