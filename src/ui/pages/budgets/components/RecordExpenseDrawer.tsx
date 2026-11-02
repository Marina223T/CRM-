import { useState } from 'react'
import { Drawer } from '@/ui/design-system/components/Drawer'
import { Button } from '@/ui/design-system/components/Button'
import { FieldError } from '@/ui/design-system/components/FieldError'
import { useT } from '@/lib/i18n'
import { useStore } from '@/data/mock/store'
import { visitsStore } from '@/data/mock/visits'
import { ALL_MOCK_REPS } from '@/ui/design-system/components/RecordFormDrawer'
import {
  addExpenseRecord,
  type ExpenseCategory,
  type ExpenseRecord,
} from '@/data/mock/budgets'

export interface RecordExpenseDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSaved: (expense: ExpenseRecord) => void
  currentUserName?: string
}

export function RecordExpenseDrawer({
  isOpen,
  onClose,
  onSaved,
  currentUserName = 'Alex Morgan',
}: RecordExpenseDrawerProps) {
  const { lang } = useT()
  const visits = useStore(visitsStore)

  const [employeeName, setEmployeeName] = useState(currentUserName)
  const [category, setCategory] = useState<ExpenseCategory>('Transportation')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [territory, setTerritory] = useState('North region')
  const [description, setDescription] = useState('')
  const [relatedVisitId, setRelatedVisitId] = useState('')
  const [attachmentName, setAttachmentName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  if (!isOpen) return null

  const handleSave = () => {
    setError(null)
    const amountNum = parseFloat(amount)

    if (isNaN(amountNum) || amountNum <= 0) {
      setError(lang === 'ar' ? 'المبلغ يجب أن يكون أكبر من صفر' : 'Amount must be greater than zero')
      return
    }
    if (!description.trim()) {
      setError(lang === 'ar' ? 'وصف النفقة مطلوب' : 'Expense description is required')
      return
    }

    setSaving(true)
    try {
      const repObj = ALL_MOCK_REPS.find((r) => r.name === employeeName)
      const selectedVisit = visits.find((v) => v.id === relatedVisitId)

      const expense = addExpenseRecord({
        employeeName,
        employeeId: repObj?.id || 'rep-custom',
        territory: repObj?.region || territory,
        category,
        amount: amountNum,
        date,
        description: description.trim(),
        relatedVisitId: relatedVisitId || undefined,
        relatedVisitClient: selectedVisit?.clientName || undefined,
        attachmentName: attachmentName.trim() || undefined,
      })

      onSaved(expense)
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
      title={lang === 'ar' ? 'تسجيل مطالبة نفقة جديدة' : 'Record Business Expense'}
      kicker="EXPENSE REIMBURSEMENT"
      onClose={onClose}
    >
      <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {error && <FieldError message={error} />}

        {/* Employee */}
        <label style={labelStyle}>
          {lang === 'ar' ? 'الموظف / المندوب' : 'Employee / Representative'}
          <select
            style={inputStyle}
            value={employeeName}
            onChange={(e) => {
              setEmployeeName(e.target.value)
              const rep = ALL_MOCK_REPS.find((r) => r.name === e.target.value)
              if (rep?.region) setTerritory(rep.region)
            }}
          >
            {ALL_MOCK_REPS.map((r) => (
              <option key={r.id} value={r.name}>{r.name} ({r.region})</option>
            ))}
          </select>
        </label>

        {/* Category & Amount */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <label style={labelStyle}>
            {lang === 'ar' ? 'بند النفقة' : 'Expense Category'} *
            <select
              style={inputStyle}
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
            >
              <option value="Transportation">{lang === 'ar' ? 'انتقالات وسفر' : 'Transportation'}</option>
              <option value="Business visits">{lang === 'ar' ? 'زيارات عمل وضيافة' : 'Business visits'}</option>
              <option value="Approved promotional activities">{lang === 'ar' ? 'أنشطة ترويجية معتمدة' : 'Promotional activities'}</option>
              <option value="Operational expenses">{lang === 'ar' ? 'نفقات تشغيلية أخرى' : 'Operational expenses'}</option>
            </select>
          </label>

          <label style={labelStyle}>
            {lang === 'ar' ? 'المبلغ (ج.م)' : 'Amount (EGP)'} *
            <input
              type="number"
              min="1"
              style={inputStyle}
              placeholder="1500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </label>
        </div>

        {/* Date & Territory */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <label style={labelStyle}>
            {lang === 'ar' ? 'تاريخ النفقة' : 'Expense Date'} *
            <input
              type="date"
              style={inputStyle}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>

          <label style={labelStyle}>
            {lang === 'ar' ? 'المنطقة' : 'Territory'}
            <select
              style={inputStyle}
              value={territory}
              onChange={(e) => setTerritory(e.target.value)}
            >
              <option value="North region">North region</option>
              <option value="West region">West region</option>
              <option value="Central region">Central region</option>
              <option value="East region">East region</option>
              <option value="South region">South region</option>
            </select>
          </label>
        </div>

        {/* Description */}
        <label style={labelStyle}>
          {lang === 'ar' ? 'الوصف وتفاصيل النشاط' : 'Description & Activity Purpose'} *
          <textarea
            style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }}
            placeholder={lang === 'ar' ? 'أدخل الغرض وتفاصيل الفاتورة أو الانتقال...' : 'Provide travel purpose, attendees, or clinic meeting details...'}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        {/* Related Visit or Activity */}
        <label style={labelStyle}>
          {lang === 'ar' ? 'ربط بزيارة ميدانية (اختياري)' : 'Link to Scheduled Visit (Optional)'}
          <select
            style={inputStyle}
            value={relatedVisitId}
            onChange={(e) => setRelatedVisitId(e.target.value)}
          >
            <option value="">{lang === 'ar' ? '-- بدون ربط --' : '-- No linked visit --'}</option>
            {visits.map((v) => (
              <option key={v.id} value={v.id}>
                {v.id} · {v.clientName} ({v.date})
              </option>
            ))}
          </select>
        </label>

        {/* Supporting Attachment */}
        <label style={labelStyle}>
          {lang === 'ar' ? 'المستند الداعم أو الإيصال المرفق' : 'Supporting Attachment / Receipt'}
          <input
            style={inputStyle}
            placeholder={lang === 'ar' ? 'مثال: invoice_1044.pdf أو إيصال وقود' : 'e.g. travel_receipt_oct26.pdf'}
            value={attachmentName}
            onChange={(e) => setAttachmentName(e.target.value)}
          />
        </label>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            {lang === 'ar' ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button variant="primary" onClick={handleSave} loading={saving}>
            {lang === 'ar' ? 'تقديم المطالبة' : 'Submit Expense'}
          </Button>
        </div>
      </div>
    </Drawer>
  )
}
