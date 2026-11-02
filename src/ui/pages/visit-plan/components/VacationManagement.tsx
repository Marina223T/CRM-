import { useState } from 'react'
import { Plus, Check, X, AlertTriangle, Calendar, Clock, UserCheck } from 'lucide-react'
import { Button } from '@/ui/design-system/components/Button'
import { Modal } from '@/ui/design-system/components/Modal'
import { FieldError } from '@/ui/design-system/components/FieldError'
import { StatusPill } from '@/ui/design-system/components/StatusPill'
import { useT } from '@/lib/i18n'
import { formatDate } from '@/lib/format'
import { useStore } from '@/data/mock/store'
import { ALL_MOCK_REPS } from '@/ui/design-system/components/RecordFormDrawer'
import {
  vacationsStore,
  addVacationRequest,
  approveVacation,
  rejectVacation,
  rescheduleAffectedVisit,
  getAffectedVisitsForVacation,
  type VacationRequest,
  type VacationType,
} from '@/data/mock/vacations'
import type { StoredVisit } from '@/data/mock/visits'

export interface VacationManagementProps {
  role?: 'admin' | 'rep'
  currentUserName?: string
  onAction?: (msg: string) => void
}

export function VacationManagement({
  role = 'admin',
  currentUserName = 'Alex Morgan',
  onAction,
}: VacationManagementProps) {
  const { t, lang } = useT()
  const vacations = useStore(vacationsStore)
  const isManager = role === 'admin'

  // Request modal state
  const [requestOpen, setRequestOpen] = useState(false)
  const [employeeName, setEmployeeName] = useState(ALL_MOCK_REPS[0].name)
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10))
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10))
  const [vacationType, setVacationType] = useState<VacationType>('Annual')
  const [reason, setReason] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [formWarning, setFormWarning] = useState<string | null>(null)

  // Rejection modal state
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectError, setRejectError] = useState<string | null>(null)

  // Reschedule affected visits modal state
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false)
  const [affectedVisitsToReschedule, setAffectedVisitsToReschedule] = useState<StoredVisit[]>([])
  const [selectedVacationForVisits, setSelectedVacationForVisits] = useState<VacationRequest | null>(null)
  const [newVisitDates, setNewVisitDates] = useState<Record<string, string>>({})

  // Conflict warning banner state
  const [approvalWarning, setApprovalWarning] = useState<{ msg: string; vacation: VacationRequest; visits: StoredVisit[] } | null>(null)

  const handleCreateRequest = () => {
    setFormError(null)
    setFormWarning(null)

    if (!startDate || !endDate) {
      setFormError(lang === 'ar' ? 'التواريخ مطلوبة' : 'Dates are required')
      return
    }
    if (startDate > endDate) {
      setFormError(lang === 'ar' ? 'تاريخ البدء يجب أن يسبق تاريخ الانتهاء' : 'Start date must be before end date')
      return
    }
    if (!reason.trim()) {
      setFormError(lang === 'ar' ? 'سبب الإجازة مطلوب' : 'Vacation reason is required')
      return
    }

    try {
      const rep = ALL_MOCK_REPS.find((r) => r.name === employeeName)
      const res = addVacationRequest({
        employeeName,
        employeeId: rep?.id || 'rep-custom',
        startDate,
        endDate,
        vacationType,
        reason: reason.trim(),
      })

      if (res.warning) {
        setFormWarning(res.warning)
      }

      onAction?.(lang === 'ar' ? 'تم تقديم طلب الإجازة' : 'Vacation request submitted')
      setRequestOpen(false)
      setReason('')
    } catch (err) {
      setFormError((err as Error).message)
    }
  }

  const handleApprove = (vacation: VacationRequest) => {
    try {
      const result = approveVacation(vacation.id, currentUserName)
      if (result.warning) {
        setApprovalWarning({
          msg: result.warning,
          vacation,
          visits: result.affectedVisits,
        })
      }
      onAction?.(lang === 'ar' ? 'تمت الموافقة على الإجازة' : 'Vacation approved')
    } catch (err) {
      onAction?.((err as Error).message)
    }
  }

  const handleConfirmReject = () => {
    if (!rejectId) return
    if (!rejectReason.trim()) {
      setRejectError(lang === 'ar' ? 'سبب الرفض مطلوب' : 'Rejection reason is required')
      return
    }
    try {
      rejectVacation(rejectId, rejectReason.trim(), currentUserName)
      setRejectId(null)
      setRejectReason('')
      setRejectError(null)
      onAction?.(lang === 'ar' ? 'تم رفض طلب الإجازة' : 'Vacation request rejected')
    } catch (err) {
      setRejectError((err as Error).message)
    }
  }

  const handleOpenReschedule = (vac: VacationRequest) => {
    const visits = getAffectedVisitsForVacation(vac.employeeName, vac.startDate, vac.endDate)
    setAffectedVisitsToReschedule(visits)
    setSelectedVacationForVisits(vac)
    setRescheduleModalOpen(true)
  }

  const handleRescheduleVisitSingle = (visitId: string) => {
    const newDate = newVisitDates[visitId]
    if (!newDate) return
    try {
      rescheduleAffectedVisit(visitId, newDate, currentUserName)
      setAffectedVisitsToReschedule((prev) => prev.filter((v) => v.id !== visitId))
      onAction?.(lang === 'ar' ? 'تمت إعادة جدولة الزيارة' : 'Visit rescheduled')
    } catch (err) {
      onAction?.((err as Error).message)
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

  return (
    <div style={{ marginTop: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px' }}>
            {lang === 'ar' ? 'إدارة إجازات الموظفين والغياب' : 'Employee Vacation & Absence Management'}
          </h3>
          <span style={{ fontSize: '12px', color: 'var(--muted-text)' }}>
            {lang === 'ar'
              ? 'متابعة طلبات الإجازات وجدول التغطية الميدانية'
              : 'Review vacation requests and verify field representative coverage'}
          </span>
        </div>
        <Button variant="primary" onClick={() => setRequestOpen(true)}>
          <Plus data-icon="inline-start" /> {lang === 'ar' ? 'طلب إجازة جديد' : 'Request Vacation'}
        </Button>
      </div>

      {/* Conflict Warning Banner if scheduled visits clash with approved vacation */}
      {approvalWarning && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '10px',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle style={{ color: '#d97706', width: '20px', height: '20px', flexShrink: 0 }} />
            <div>
              <strong style={{ fontSize: '13px', color: '#b45309', display: 'block' }}>
                {lang === 'ar' ? 'تنبيه: تعارض زيارات مجدولة مع الإجازة' : 'Notice: Scheduled Visits Conflict With Vacation'}
              </strong>
              <span style={{ fontSize: '12px', color: 'var(--heading-text)' }}>
                {approvalWarning.msg}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              variant="secondary"
              style={{ fontSize: '12px', padding: '6px 12px' }}
              onClick={() => handleOpenReschedule(approvalWarning.vacation)}
            >
              {lang === 'ar' ? 'مراجعة وإعادة جدولة الزيارات' : 'Reschedule Affected Visits'}
            </Button>
            <Button
              variant="text"
              style={{ fontSize: '12px', padding: '6px' }}
              onClick={() => setApprovalWarning(null)}
            >
              <X size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* Vacations List */}
      <div className="collection-list">
        {vacations.length > 0 ? (
          vacations.map((vac) => {
            const affectedVisits = getAffectedVisitsForVacation(vac.employeeName, vac.startDate, vac.endDate)
            const hasConflict = vac.status === 'Approved' && affectedVisits.length > 0

            return (
              <div
                key={vac.id}
                className="collection-item"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderLeft: hasConflict ? '3px solid #d97706' : undefined,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <strong>{vac.employeeName}</strong>
                    <span
                      style={{
                        fontSize: '11px',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        background: 'var(--surface-raised)',
                        color: 'var(--muted-text)',
                        fontWeight: 600,
                      }}
                    >
                      {vac.vacationType}
                    </span>
                    {hasConflict && (
                      <span
                        style={{
                          fontSize: '11px',
                          color: '#b45309',
                          background: 'rgba(245, 158, 11, 0.12)',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <AlertTriangle size={12} /> {affectedVisits.length} {lang === 'ar' ? 'زيارات متعارضة' : 'visits affected'}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--muted-text)', display: 'block' }}>
                    📅 {formatDate(vac.startDate, lang)} &rarr; {formatDate(vac.endDate, lang)} · {vac.reason}
                  </span>
                  {vac.status === 'Rejected' && vac.rejectionReason && (
                    <span style={{ fontSize: '11px', color: 'var(--rose-text, #ef4444)', display: 'block', marginTop: '2px' }}>
                      {lang === 'ar' ? 'سبب الرفض: ' : 'Rejection Reason: '}{vac.rejectionReason}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <StatusPill status={vac.status} />

                  {/* Reschedule button if conflict exists */}
                  {hasConflict && (
                    <Button
                      variant="secondary"
                      style={{ fontSize: '11px', height: '28px', padding: '0 8px' }}
                      onClick={() => handleOpenReschedule(vac)}
                    >
                      {lang === 'ar' ? 'إعادة جدولة' : 'Reschedule'}
                    </Button>
                  )}

                  {/* Manager Approval/Rejection buttons for Pending requests */}
                  {isManager && vac.status === 'Pending' && (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <Button
                        variant="secondary"
                        style={{ height: '28px', padding: '0 8px', fontSize: '12px' }}
                        onClick={() => {
                          setRejectId(vac.id)
                          setRejectReason('')
                        }}
                      >
                        <X size={13} /> {lang === 'ar' ? 'رفض' : 'Reject'}
                      </Button>
                      <Button
                        variant="primary"
                        style={{ height: '28px', padding: '0 8px', fontSize: '12px' }}
                        onClick={() => handleApprove(vac)}
                      >
                        <Check size={13} /> {lang === 'ar' ? 'موافقة' : 'Approve'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        ) : (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted-text)' }}>
            {lang === 'ar' ? 'لا توجد طلبات إجازات حالياً' : 'No vacation requests recorded.'}
          </div>
        )}
      </div>

      {/* Request Vacation Modal */}
      <Modal isOpen={requestOpen} onClose={() => setRequestOpen(false)}>
        <div style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '16px' }}>
            {lang === 'ar' ? 'تقديم طلب إجازة جديد' : 'New Vacation Request'}
          </h3>

          {formError && <FieldError message={formError} />}
          {formWarning && (
            <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.1)', color: '#b45309', fontSize: '12px', marginBottom: '12px' }}>
              {formWarning}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
            {/* Employee Selection */}
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted-text)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {lang === 'ar' ? 'الموظف / المندوب' : 'Employee / Representative'}
              <select
                style={inputStyle}
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
              >
                {ALL_MOCK_REPS.map((r) => (
                  <option key={r.id} value={r.name}>{r.name} ({r.region})</option>
                ))}
              </select>
            </label>

            {/* Date Range */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted-text)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {lang === 'ar' ? 'تاريخ البدء' : 'Start Date'}
                <input
                  type="date"
                  style={inputStyle}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </label>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted-text)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {lang === 'ar' ? 'تاريخ الانتهاء' : 'End Date'}
                <input
                  type="date"
                  style={inputStyle}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </label>
            </div>

            {/* Vacation Type */}
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted-text)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {lang === 'ar' ? 'نوع الإجازة' : 'Vacation Type'}
              <select
                style={inputStyle}
                value={vacationType}
                onChange={(e) => setVacationType(e.target.value as VacationType)}
              >
                <option value="Annual">{lang === 'ar' ? 'سنوية اعتيادية' : 'Annual Leave'}</option>
                <option value="Sick">{lang === 'ar' ? 'مرضية' : 'Sick Leave'}</option>
                <option value="Emergency">{lang === 'ar' ? 'عارضة / طارئة' : 'Emergency Leave'}</option>
                <option value="Training">{lang === 'ar' ? 'تدريبية / علمية' : 'Training / Conference'}</option>
                <option value="Unpaid">{lang === 'ar' ? 'بدون راتب' : 'Unpaid Leave'}</option>
              </select>
            </label>

            {/* Reason */}
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted-text)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {lang === 'ar' ? 'السبب أو الملاحظات' : 'Reason / Notes'} *
              <textarea
                style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={lang === 'ar' ? 'يرجى كتابة سبب طلب الإجازة...' : 'State reason for leave...'}
              />
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
            <Button variant="secondary" onClick={() => setRequestOpen(false)}>
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button variant="primary" onClick={handleCreateRequest}>
              {lang === 'ar' ? 'إرسال الطلب' : 'Submit Request'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Reason Modal */}
      <Modal isOpen={Boolean(rejectId)} onClose={() => setRejectId(null)}>
        <div style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 10px', fontSize: '16px' }}>
            {lang === 'ar' ? 'رفض طلب الإجازة' : 'Reject Vacation Request'}
          </h3>
          {rejectError && <FieldError message={rejectError} />}
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted-text)', display: 'block', margin: '10px 0 6px' }}>
            {lang === 'ar' ? 'سبب الرفض' : 'Rejection Reason'} *
          </label>
          <textarea
            style={{ ...inputStyle, minHeight: '70px', resize: 'vertical' }}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder={lang === 'ar' ? 'اكتب سبب رفض طلب الإجازة...' : 'State the reason for rejecting this leave request...'}
            autoFocus
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
            <Button variant="secondary" onClick={() => setRejectId(null)}>
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button variant="primary" onClick={handleConfirmReject}>
              {lang === 'ar' ? 'تأكيد الرفض' : 'Confirm Reject'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reschedule Affected Visits Modal */}
      <Modal isOpen={rescheduleModalOpen} onClose={() => setRescheduleModalOpen(false)}>
        <div style={{ padding: '24px', maxWidth: '520px', width: '100%' }}>
          <h3 style={{ margin: '0 0 8px', fontSize: '16px' }}>
            {lang === 'ar' ? 'مراجعة وإعادة جدولة الزيارات المتأثرة بالإجازة' : 'Review & Reschedule Affected Visits'}
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--muted-text)', margin: '0 0 16px' }}>
            {lang === 'ar'
              ? `الزيارات التالية مجدولة لـ ${selectedVacationForVisits?.employeeName} خلال فترة الإجازة (${selectedVacationForVisits?.startDate} إلى ${selectedVacationForVisits?.endDate}). اختر تاريخاً بديلاً لإعادة جدولتها دون حذف السجل.`
              : `The following visits are scheduled for ${selectedVacationForVisits?.employeeName} during their leave (${selectedVacationForVisits?.startDate} to ${selectedVacationForVisits?.endDate}). Pick an alternative date to reschedule them safely.`}
          </p>

          {affectedVisitsToReschedule.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
              {affectedVisitsToReschedule.map((v) => (
                <div
                  key={v.id}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-soft)',
                    background: 'var(--surface-raised)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <strong>{v.clientName}</strong>
                    <span style={{ color: 'var(--muted-text)' }}>{v.date}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--muted-text)' }}>
                    {v.detail}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                    <input
                      type="date"
                      style={{ ...inputStyle, width: 'auto', flex: 1 }}
                      value={newVisitDates[v.id] || ''}
                      onChange={(e) =>
                        setNewVisitDates((prev) => ({ ...prev, [v.id]: e.target.value }))
                      }
                    />
                    <Button
                      variant="primary"
                      style={{ fontSize: '12px', height: '32px' }}
                      disabled={!newVisitDates[v.id]}
                      onClick={() => handleRescheduleVisitSingle(v.id)}
                    >
                      {lang === 'ar' ? 'تحديث الموعد' : 'Reschedule'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: '#059669', fontSize: '13px' }}>
              ✓ {lang === 'ar' ? 'تمت إعادة جدولة جميع الزيارات المتعارضة بنجاح.' : 'All conflicting visits have been rescheduled.'}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
            <Button variant="secondary" onClick={() => setRescheduleModalOpen(false)}>
              {lang === 'ar' ? 'إغلاق' : 'Close'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
