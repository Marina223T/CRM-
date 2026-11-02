import { useState } from 'react'
import { Drawer } from '@/ui/design-system/components/Drawer'
import { Button } from '@/ui/design-system/components/Button'
import { FieldError } from '@/ui/design-system/components/FieldError'
import { useT } from '@/lib/i18n'
import { useStore } from '@/data/mock/store'
import { customersStore } from '@/data/mock/customers'
import { productsStore } from '@/data/mock/products'
import { ALL_MOCK_REPS } from '@/ui/design-system/components/RecordFormDrawer'
import {
  updateVisitPlan,
  type VisitPlan,
  type VisitPlanStatus,
  type VisitFrequency,
} from '@/data/mock/visit-plans'

export interface EditVisitPlanDrawerProps {
  plan: VisitPlan | null
  isOpen: boolean
  onClose: () => void
  onSaved: (plan: VisitPlan) => void
  currentUserName?: string
}

export function EditVisitPlanDrawer({
  plan,
  isOpen,
  onClose,
  onSaved,
  currentUserName = 'Alex Morgan',
}: EditVisitPlanDrawerProps) {
  const { t, lang } = useT()
  const customers = useStore(customersStore).filter((c) => !c.deleted_at)
  const products = useStore(productsStore)

  if (!isOpen || !plan) return null

  return (
    <EditVisitPlanDrawerInner
      plan={plan}
      onClose={onClose}
      onSaved={onSaved}
      customers={customers}
      products={products}
      currentUserName={currentUserName}
      lang={lang}
    />
  )
}

function EditVisitPlanDrawerInner({
  plan,
  onClose,
  onSaved,
  customers,
  products,
  currentUserName,
  lang,
}: {
  plan: VisitPlan
  onClose: () => void
  onSaved: (p: VisitPlan) => void
  customers: any[]
  products: any[]
  currentUserName: string
  lang: 'en' | 'ar'
}) {
  const [name, setName] = useState(plan.name)
  const [repName, setRepName] = useState(plan.repName)
  const [startDate, setStartDate] = useState(plan.startDate)
  const [endDate, setEndDate] = useState(plan.endDate)
  const [frequency, setFrequency] = useState<VisitFrequency>(plan.frequency)
  const [status, setStatus] = useState<VisitPlanStatus>(plan.status)
  const [targetClients, setTargetClients] = useState<string[]>(plan.targetClients || [])
  const [plannedProducts, setPlannedProducts] = useState<string[]>(plan.plannedProducts || [])
  const [notes, setNotes] = useState(plan.notes || '')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const handleToggleClient = (clientName: string) => {
    setTargetClients((prev) =>
      prev.includes(clientName) ? prev.filter((c) => c !== clientName) : [...prev, clientName]
    )
  }

  const handleToggleProduct = (productName: string) => {
    setPlannedProducts((prev) =>
      prev.includes(productName) ? prev.filter((p) => p !== productName) : [...prev, productName]
    )
  }

  const handleSave = () => {
    if (!name.trim()) {
      setError(lang === 'ar' ? 'اسم الخطة مطلوب' : 'Plan name is required')
      return
    }
    if (!startDate || !endDate) {
      setError(lang === 'ar' ? 'التواريخ مطلوبة' : 'Start and end dates are required')
      return
    }
    if (startDate > endDate) {
      setError(lang === 'ar' ? 'تاريخ البدء يجب أن يسبق تاريخ الانتهاء' : 'Start date must be before end date')
      return
    }

    setSaving(true)
    try {
      const repObj = ALL_MOCK_REPS.find((r) => r.name === repName)
      const updated = updateVisitPlan(
        plan.id,
        {
          name: name.trim(),
          repName,
          repId: repObj?.id || plan.repId,
          startDate,
          endDate,
          frequency,
          status,
          targetClients,
          plannedProducts,
          notes: notes.trim(),
        },
        currentUserName
      )
      onSaved(updated)
      onClose()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid var(--border-soft)',
    background: 'var(--surface-raised)',
    color: 'var(--heading-text)',
    fontSize: '13px',
    width: '100%',
    boxSizing: 'border-box' as const,
  }

  const labelStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--muted-text)',
  }

  return (
    <Drawer
      title={lang === 'ar' ? 'تعديل خطة الزيارات' : 'Edit Visit Plan'}
      kicker={plan.id}
      onClose={onClose}
    >
      <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {error && <FieldError message={error} />}

        {/* Plan Name */}
        <label style={labelStyle}>
          {lang === 'ar' ? 'اسم الخطة' : 'Plan Name'} *
          <input
            style={inputStyle}
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setError(null)
            }}
          />
        </label>

        {/* Assigned Rep */}
        <label style={labelStyle}>
          {lang === 'ar' ? 'المندوب المعين' : 'Assigned Representative'}
          <select
            style={inputStyle}
            value={repName}
            onChange={(e) => setRepName(e.target.value)}
          >
            {ALL_MOCK_REPS.map((r) => (
              <option key={r.id} value={r.name}>{r.name} ({r.region})</option>
            ))}
          </select>
        </label>

        {/* Date Range */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <label style={labelStyle}>
            {lang === 'ar' ? 'تاريخ البدء' : 'Start Date'}
            <input
              type="date"
              style={inputStyle}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </label>
          <label style={labelStyle}>
            {lang === 'ar' ? 'تاريخ الانتهاء' : 'End Date'}
            <input
              type="date"
              style={inputStyle}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </label>
        </div>

        {/* Frequency & Status */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <label style={labelStyle}>
            {lang === 'ar' ? 'دورية الزيارات' : 'Visit Frequency'}
            <select
              style={inputStyle}
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as VisitFrequency)}
            >
              <option value="Daily">{lang === 'ar' ? 'يومي' : 'Daily'}</option>
              <option value="Weekly">{lang === 'ar' ? 'أسبوعي' : 'Weekly'}</option>
              <option value="Bi-weekly">{lang === 'ar' ? 'كل أسبوعين' : 'Bi-weekly'}</option>
              <option value="Monthly">{lang === 'ar' ? 'شهري' : 'Monthly'}</option>
            </select>
          </label>
          <label style={labelStyle}>
            {lang === 'ar' ? 'حالة الخطة' : 'Plan Status'}
            <select
              style={inputStyle}
              value={status}
              onChange={(e) => setStatus(e.target.value as VisitPlanStatus)}
            >
              <option value="Draft">{lang === 'ar' ? 'مسودة' : 'Draft'}</option>
              <option value="Active">{lang === 'ar' ? 'نشطة' : 'Active'}</option>
              <option value="Completed">{lang === 'ar' ? 'مكتملة' : 'Completed'}</option>
              <option value="Suspended">{lang === 'ar' ? 'معلقة' : 'Suspended'}</option>
            </select>
          </label>
        </div>

        {/* Target Doctors and Organizations */}
        <div>
          <span style={{ ...labelStyle, marginBottom: '6px' }}>
            {lang === 'ar' ? 'العملاء المستهدفون (أطباء ومؤسسات)' : 'Target Doctors & Organizations'} ({targetClients.length})
          </span>
          <div
            style={{
              maxHeight: '140px',
              overflowY: 'auto',
              border: '1px solid var(--border-soft)',
              borderRadius: '8px',
              padding: '6px 10px',
              background: 'var(--surface-raised)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            {customers.map((c) => {
              const isSelected = targetClients.includes(c.name)
              return (
                <label
                  key={c.id || c.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    color: isSelected ? 'var(--heading-text)' : 'var(--muted-text)',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleClient(c.name)}
                  />
                  <span>
                    {c.name} <span style={{ opacity: 0.6 }}>({c.specialty || c.region})</span>
                  </span>
                </label>
              )
            })}
          </div>
        </div>

        {/* Planned Products or Campaigns */}
        <div>
          <span style={{ ...labelStyle, marginBottom: '6px' }}>
            {lang === 'ar' ? 'المنتجات والحملات المخططة' : 'Planned Products / Campaigns'} ({plannedProducts.length})
          </span>
          <div
            style={{
              maxHeight: '120px',
              overflowY: 'auto',
              border: '1px solid var(--border-soft)',
              borderRadius: '8px',
              padding: '6px 10px',
              background: 'var(--surface-raised)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            {products.map((p) => {
              const isSelected = plannedProducts.includes(p.name)
              return (
                <label
                  key={p.code || p.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    color: isSelected ? 'var(--heading-text)' : 'var(--muted-text)',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleProduct(p.name)}
                  />
                  <span>{p.name}</span>
                </label>
              )
            })}
          </div>
        </div>

        {/* Notes */}
        <label style={labelStyle}>
          {lang === 'ar' ? 'ملاحظات وتوجيهات' : 'Plan Notes & Directives'}
          <textarea
            style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>

        {/* Sheet Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            {lang === 'ar' ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button variant="primary" onClick={handleSave} loading={saving}>
            {lang === 'ar' ? 'حفظ التعديلات' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </Drawer>
  )
}
