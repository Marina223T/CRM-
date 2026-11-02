import { useState } from 'react'
import { Drawer } from '@/ui/design-system/components/Drawer'
import { Button } from '@/ui/design-system/components/Button'
import { FieldError } from '@/ui/design-system/components/FieldError'
import { useT } from '@/lib/i18n'
import { ALL_MOCK_REPS } from '@/ui/design-system/components/RecordFormDrawer'
import { addBudget, type BudgetType, type BudgetPeriod, type Budget } from '@/data/mock/budgets'

export interface CreateBudgetDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSaved: (budget: Budget) => void
}

const TERRITORIES = ['North region', 'West region', 'Central region', 'East region', 'South region']
const DEPARTMENTS = ['Field Sales', 'Marketing & Promotion', 'Medical Affairs', 'Operations']

export function CreateBudgetDrawer({ isOpen, onClose, onSaved }: CreateBudgetDrawerProps) {
  const { lang } = useT()

  const [name, setName] = useState('')
  const [type, setType] = useState<BudgetType>('employee')
  const [targetEntity, setTargetEntity] = useState(ALL_MOCK_REPS[0].name)
  const [period, setPeriod] = useState<BudgetPeriod>('quarterly')
  const [allocatedAmount, setAllocatedAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  if (!isOpen) return null

  const handleTypeChange = (newType: BudgetType) => {
    setType(newType)
    if (newType === 'employee') setTargetEntity(ALL_MOCK_REPS[0].name)
    else if (newType === 'territory') setTargetEntity(TERRITORIES[0])
    else if (newType === 'department') setTargetEntity(DEPARTMENTS[0])
    else setTargetEntity('Approved promotional activities')
  }

  const handleSave = () => {
    setError(null)
    const amountNum = parseFloat(allocatedAmount)

    if (!name.trim()) {
      setError(lang === 'ar' ? 'اسم الميزانية مطلوب' : 'Budget name is required')
      return
    }
    if (isNaN(amountNum) || amountNum <= 0) {
      setError(lang === 'ar' ? 'المبلغ المخصص يجب أن يكون أكبر من صفر' : 'Allocated amount must be greater than zero')
      return
    }

    setSaving(true)
    try {
      const budget = addBudget({
        name: name.trim(),
        type,
        targetEntity,
        period,
        allocatedAmount: amountNum,
        notes: notes.trim() || undefined,
      })
      onSaved(budget)
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
      title={lang === 'ar' ? 'إنشاء ميزانية جديدة' : 'Create New Budget'}
      kicker="BUDGET ALLOCATION"
      onClose={onClose}
    >
      <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {error && <FieldError message={error} />}

        {/* Budget Name */}
        <label style={labelStyle}>
          {lang === 'ar' ? 'اسم الميزانية' : 'Budget Name'} *
          <input
            style={inputStyle}
            placeholder={lang === 'ar' ? 'مثال: ميزانية نفقات الربع الرابع' : 'e.g. Q4 Field Travel & Visits'}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        {/* Budget Type */}
        <label style={labelStyle}>
          {lang === 'ar' ? 'نوع تخصيص الميزانية' : 'Budget Target Type'}
          <select
            style={inputStyle}
            value={type}
            onChange={(e) => handleTypeChange(e.target.value as BudgetType)}
          >
            <option value="employee">{lang === 'ar' ? 'حسب الموظف / المندوب' : 'By Employee / Representative'}</option>
            <option value="territory">{lang === 'ar' ? 'حسب المنطقة / الإقليم' : 'By Territory / Region'}</option>
            <option value="department">{lang === 'ar' ? 'حسب القسم الإداري' : 'By Department'}</option>
            <option value="activity">{lang === 'ar' ? 'حسب النشاط أو الحملة الترويجية' : 'By Activity / Promotional Campaign'}</option>
          </select>
        </label>

        {/* Target Entity Selector */}
        <label style={labelStyle}>
          {lang === 'ar' ? 'الجهة المستهدفة' : 'Target Entity'}
          {type === 'employee' ? (
            <select
              style={inputStyle}
              value={targetEntity}
              onChange={(e) => setTargetEntity(e.target.value)}
            >
              {ALL_MOCK_REPS.map((r) => (
                <option key={r.id} value={r.name}>{r.name} ({r.region})</option>
              ))}
            </select>
          ) : type === 'territory' ? (
            <select
              style={inputStyle}
              value={targetEntity}
              onChange={(e) => setTargetEntity(e.target.value)}
            >
              {TERRITORIES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          ) : type === 'department' ? (
            <select
              style={inputStyle}
              value={targetEntity}
              onChange={(e) => setTargetEntity(e.target.value)}
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          ) : (
            <input
              style={inputStyle}
              value={targetEntity}
              onChange={(e) => setTargetEntity(e.target.value)}
              placeholder="e.g. Bevato Launch / Cardiology Symposium"
            />
          )}
        </label>

        {/* Period & Allocated Amount */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <label style={labelStyle}>
            {lang === 'ar' ? 'الفترة الزمنية' : 'Budget Period'}
            <select
              style={inputStyle}
              value={period}
              onChange={(e) => setPeriod(e.target.value as BudgetPeriod)}
            >
              <option value="monthly">{lang === 'ar' ? 'شهري' : 'Monthly'}</option>
              <option value="quarterly">{lang === 'ar' ? 'ربع سنوي' : 'Quarterly'}</option>
              <option value="yearly">{lang === 'ar' ? 'سنوي' : 'Yearly'}</option>
            </select>
          </label>

          <label style={labelStyle}>
            {lang === 'ar' ? 'المبلغ المخصص (ج.م)' : 'Allocated Amount (EGP)'} *
            <input
              type="number"
              min="0"
              style={inputStyle}
              placeholder="50000"
              value={allocatedAmount}
              onChange={(e) => setAllocatedAmount(e.target.value)}
            />
          </label>
        </div>

        {/* Notes */}
        <label style={labelStyle}>
          {lang === 'ar' ? 'ملاحظات وتوجيهات الميزانية' : 'Notes & Allocation Guidelines'}
          <textarea
            style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            {lang === 'ar' ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button variant="primary" onClick={handleSave} loading={saving}>
            {lang === 'ar' ? 'حفظ وتخصيص الميزانية' : 'Allocate Budget'}
          </Button>
        </div>
      </div>
    </Drawer>
  )
}
