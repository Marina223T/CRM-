'use client'

import { useState, useEffect } from 'react'
import { Target, User, Calendar, DollarSign, X } from 'lucide-react'
import { Modal } from '@/ui/design-system/components/Modal'
import { Button } from '@/ui/design-system/components/Button'
import { useT } from '@/lib/i18n'
import { formatCurrency } from '@/lib/format'
import { useStore } from '@/data/mock/store'
import { usersStore } from '@/data/mock/users'
import type { SalesTarget, TargetPeriod } from '@/data/mock/targets'

export interface TargetFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: Omit<SalesTarget, 'id' | 'createdAt'>) => void
  targetToEdit?: SalesTarget | null
}

export function TargetFormModal({
  isOpen,
  onClose,
  onSave,
  targetToEdit,
}: TargetFormModalProps) {
  const { t, lang } = useT()

  // Get available reps from usersStore
  const allUsers = useStore(usersStore)
  const availableReps = allUsers.filter(
    (u) => u.roleType === 'rep' || u.role.toLowerCase().includes('representative'),
  )

  const isEditing = Boolean(targetToEdit)

  const [name, setName] = useState('')
  const [repId, setRepId] = useState('')
  const [period, setPeriod] = useState<TargetPeriod>('Monthly')
  const [startDate, setStartDate] = useState('2026-10-01')
  const [endDate, setEndDate] = useState('2026-10-31')
  const [targetValue, setTargetValue] = useState('100000')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (targetToEdit) {
      setName(targetToEdit.name)
      setRepId(targetToEdit.repId)
      setPeriod(targetToEdit.period)
      setStartDate(targetToEdit.startDate)
      setEndDate(targetToEdit.endDate)
      setTargetValue(String(targetToEdit.targetValue))
      setError(null)
    } else {
      setName('')
      setRepId(availableReps[0]?.id || 'u-rep-olivia')
      setPeriod('Monthly')
      setStartDate('2026-10-01')
      setEndDate('2026-10-31')
      setTargetValue('80000')
      setError(null)
    }
  }, [targetToEdit, isOpen, availableReps.length])

  // Quick period preset helpers
  const setMonthlyPreset = (month: 'current' | 'next') => {
    setPeriod('Monthly')
    if (month === 'current') {
      setStartDate('2026-10-01')
      setEndDate('2026-10-31')
    } else {
      setStartDate('2026-11-01')
      setEndDate('2026-11-30')
    }
  }

  const setQuarterlyPreset = () => {
    setPeriod('Quarterly')
    setStartDate('2026-10-01')
    setEndDate('2026-12-31')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError(lang === 'ar' ? 'يرجى إدخال اسم المستهدف' : 'Please enter a target name')
      return
    }

    const val = parseFloat(targetValue)
    if (isNaN(val) || val <= 0) {
      setError(lang === 'ar' ? 'يرجى إدخال قيمة مستهدف صالحة' : 'Please enter a valid target amount greater than zero')
      return
    }

    if (new Date(endDate).getTime() < new Date(startDate).getTime()) {
      setError(lang === 'ar' ? 'تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء' : 'End date must be on or after start date')
      return
    }

    const selectedRep = availableReps.find((r) => r.id === repId) || availableReps[0]
    const repName = selectedRep?.name || 'Olivia Martin'
    const repName_ar = selectedRep?.name_ar || selectedRep?.name

    onSave({
      name: name.trim(),
      repId: selectedRep?.id || repId,
      repName,
      repName_ar,
      period,
      startDate,
      endDate,
      targetValue: val,
    })

    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div style={{ padding: '24px', maxWidth: '520px', width: '100%' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--heading-text)' }}>
              {isEditing
                ? (lang === 'ar' ? 'تعديل مستهدف المبيعات' : 'Edit Sales Target')
                : (lang === 'ar' ? 'إنشاء مستهدف مبيعات جديد' : 'Create New Sales Target')}
            </h2>
            <p style={{ fontSize: '12.5px', color: 'var(--muted-text)', margin: '4px 0 0 0' }}>
              {lang === 'ar'
                ? 'حدد قيمة الحصة المستهدفة والمندوب المسؤول وفترة التقييم'
                : 'Define representative revenue quota, assignment, and timeframe'}
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
            }}
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'rgba(225, 29, 72, 0.1)',
              border: '1px solid rgba(225, 29, 72, 0.25)',
              color: 'var(--rose, #e11d48)',
              fontSize: '12.5px',
              marginBottom: '16px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Target Name */}
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--heading-text)', marginBottom: '6px' }}>
              {lang === 'ar' ? 'اسم المستهدف' : 'Target Name'} <span style={{ color: 'var(--rose)' }}>*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={lang === 'ar' ? 'مثال: مستهدف الربع الرابع لأدوية السكر' : 'e.g. Q4 Cardiology Target'}
              style={{
                width: '100%',
                height: '40px',
                padding: '0 12px',
                borderRadius: '10px',
                border: '1px solid var(--border-input, #cbd5e1)',
                background: 'var(--card-bg, #ffffff)',
                color: 'var(--heading-text)',
                fontSize: '13.5px',
              }}
            />
          </div>

          {/* Assigned Sales Representative */}
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--heading-text)', marginBottom: '6px' }}>
              {lang === 'ar' ? 'المندوب المسؤول' : 'Assigned Sales Representative'} <span style={{ color: 'var(--rose)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <User size={15} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', insetInlineStart: '12px', color: 'var(--muted-text)' }} />
              <select
                value={repId}
                onChange={(e) => setRepId(e.target.value)}
                required
                style={{
                  width: '100%',
                  height: '40px',
                  paddingInlineStart: '36px',
                  paddingInlineEnd: '12px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-input, #cbd5e1)',
                  background: 'var(--card-bg, #ffffff)',
                  color: 'var(--heading-text)',
                  fontSize: '13.5px',
                }}
              >
                {availableReps.map((rep) => (
                  <option key={rep.id} value={rep.id}>
                    {lang === 'ar' && rep.name_ar ? rep.name_ar : rep.name} ({rep.region})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Target Period & Preset Shortcuts */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--heading-text)' }}>
                {lang === 'ar' ? 'نوع الفترة' : 'Target Period'}
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setMonthlyPreset('current')}
                  style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-soft)',
                    background: 'var(--surface-raised, #f1f5f9)',
                    cursor: 'pointer',
                    color: 'var(--muted-text)',
                  }}
                >
                  {lang === 'ar' ? 'أكتوبر' : 'Oct (Current)'}
                </button>
                <button
                  type="button"
                  onClick={setQuarterlyPreset}
                  style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-soft)',
                    background: 'var(--surface-raised, #f1f5f9)',
                    cursor: 'pointer',
                    color: 'var(--muted-text)',
                  }}
                >
                  {lang === 'ar' ? 'الربع 4' : 'Q4 2026'}
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <label
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  border: period === 'Monthly' ? '1.5px solid var(--sky, #0284c7)' : '1px solid var(--border-card, #e2e8f0)',
                  background: period === 'Monthly' ? 'rgba(2, 132, 199, 0.06)' : 'var(--card-bg, #ffffff)',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: period === 'Monthly' ? 700 : 500,
                  color: period === 'Monthly' ? 'var(--sky, #0284c7)' : 'var(--heading-text)',
                }}
              >
                <input
                  type="radio"
                  name="period"
                  checked={period === 'Monthly'}
                  onChange={() => setPeriod('Monthly')}
                  style={{ display: 'none' }}
                />
                <span>{lang === 'ar' ? 'شهري (Monthly)' : 'Monthly'}</span>
              </label>
              <label
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  border: period === 'Quarterly' ? '1.5px solid var(--sky, #0284c7)' : '1px solid var(--border-card, #e2e8f0)',
                  background: period === 'Quarterly' ? 'rgba(2, 132, 199, 0.06)' : 'var(--card-bg, #ffffff)',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: period === 'Quarterly' ? 700 : 500,
                  color: period === 'Quarterly' ? 'var(--sky, #0284c7)' : 'var(--heading-text)',
                }}
              >
                <input
                  type="radio"
                  name="period"
                  checked={period === 'Quarterly'}
                  onChange={() => setPeriod('Quarterly')}
                  style={{ display: 'none' }}
                />
                <span>{lang === 'ar' ? 'ربع سنوي (Quarterly)' : 'Quarterly'}</span>
              </label>
            </div>
          </div>

          {/* Dates: Start and End */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--heading-text)', marginBottom: '6px' }}>
                {lang === 'ar' ? 'تاريخ البدء' : 'Start Date'} <span style={{ color: 'var(--rose)' }}>*</span>
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  width: '100%',
                  height: '40px',
                  padding: '0 10px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-input, #cbd5e1)',
                  background: 'var(--card-bg, #ffffff)',
                  color: 'var(--heading-text)',
                  fontSize: '13px',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--heading-text)', marginBottom: '6px' }}>
                {lang === 'ar' ? 'تاريخ الانتهاء' : 'End Date'} <span style={{ color: 'var(--rose)' }}>*</span>
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{
                  width: '100%',
                  height: '40px',
                  padding: '0 10px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-input, #cbd5e1)',
                  background: 'var(--card-bg, #ffffff)',
                  color: 'var(--heading-text)',
                  fontSize: '13px',
                }}
              />
            </div>
          </div>

          {/* Target Value (EGP) */}
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--heading-text)', marginBottom: '6px' }}>
              {lang === 'ar' ? 'قيمة المستهدف (ج.م)' : 'Target Value (EGP)'} <span style={{ color: 'var(--rose)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                min="1000"
                step="500"
                required
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                style={{
                  width: '100%',
                  height: '42px',
                  paddingInlineStart: '12px',
                  paddingInlineEnd: '50px',
                  borderRadius: '10px',
                  border: '1.5px solid var(--sky, #0284c7)',
                  background: 'var(--card-bg, #ffffff)',
                  color: 'var(--heading-text)',
                  fontSize: '14px',
                  fontWeight: 700,
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  insetInlineEnd: '12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--muted-text)',
                }}
              >
                EGP
              </span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
            <Button variant="secondary" type="button" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" type="submit">
              {isEditing
                ? (lang === 'ar' ? 'حفظ التعديلات' : 'Save Changes')
                : (lang === 'ar' ? 'إنشاء المستهدف' : 'Create Target')}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
