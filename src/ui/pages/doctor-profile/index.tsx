import { useState, useRef } from 'react'
import { Plus, Building2, Stethoscope, Phone, Mail, MapPin, Calendar, Clock, UserCheck } from 'lucide-react'
import { Button } from '@/ui/design-system/components/Button'
import { Drawer } from '@/ui/design-system/components/Drawer'
import { Toast } from '@/ui/design-system/components/Toast'
import { StatusPill } from '@/ui/design-system/components/StatusPill'
import { DoctorHero } from './components/DoctorHero'
import { DoctorTimeline } from './components/DoctorTimeline'
import { EditCustomerDrawer } from '@/ui/pages/clients/components/EditCustomerDrawer'
import { customersStore, updateCustomer, type Customer } from '@/data/mock/customers'
import { useStore } from '@/data/mock/store'
import { visitsStore } from '@/data/mock/visits'
import { useT } from '@/lib/i18n'
import { formatDate } from '@/lib/format'

export interface DoctorProfilePageProps {
  customerId?: string | null
  onClose: () => void
  onNewVisit: () => void
  onSave?: () => void
  role?: 'admin' | 'rep'
  currentUserName?: string
}

export default function DoctorProfilePage({
  customerId,
  onClose,
  onNewVisit,
  onSave,
  role = 'admin',
  currentUserName = 'Alex Morgan',
}: DoctorProfilePageProps) {
  const { t, lang } = useT()
  const allCustomers = useStore(customersStore)
  const allVisits = useStore(visitsStore)
  const [isEditing, setIsEditing] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastUndo, setToastUndo] = useState<(() => void) | null>(null)
  const toastTimeoutRef = useRef<number | null>(null)

  // Quick Follow-up Note state
  const [newNote, setNewNote] = useState('')
  const [isAddingNote, setIsAddingNote] = useState(false)

  // Quick Relationship Linking state
  const [selectedHcoToLink, setSelectedHcoToLink] = useState('')
  const [selectedHcpToLink, setSelectedHcpToLink] = useState('')

  const showUndoToast = (msg: string, undoCb: () => void) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    setToastMessage(msg)
    setToastUndo(() => undoCb)
    toastTimeoutRef.current = window.setTimeout(() => {
      setToastMessage(null)
      setToastUndo(null)
    }, 8000)
  }

  // Find customer by id or fallback to first non-deleted
  const customer =
    (customerId ? allCustomers.find((c) => c.id === customerId) : null) ||
    allCustomers.find((c) => !c.deleted_at) ||
    allCustomers[0]

  if (!customer) {
    return (
      <Drawer title="Customer Profile" kicker={t('doctor.profileKicker')} onClose={onClose}>
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted-text)' }}>
          {t('doctor.notFound')}
        </div>
      </Drawer>
    )
  }

  const isHco = customer.clientCategory === 'hco' || customer.type === 'pharmacy'

  // Derive initials
  const cleanName = customer.name.replace(/^(Dr\.|Pharm\.|Doctor)\s*/i, '').trim()
  const initials = cleanName
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || (isHco ? 'HCO' : 'HCP')

  // Available HCOs (organizations) to link
  const availableHcos = allCustomers.filter(
    (c) =>
      !c.deleted_at &&
      (c.clientCategory === 'hco' || c.type === 'pharmacy') &&
      c.id !== customer.id &&
      !(customer.associatedHcoNames || []).includes(c.name)
  )

  // Available HCPs (professionals) to link
  const availableHcps = allCustomers.filter(
    (c) =>
      !c.deleted_at &&
      c.clientCategory !== 'hco' &&
      c.type !== 'pharmacy' &&
      c.id !== customer.id &&
      !(customer.associatedHcpNames || []).includes(c.name)
  )

  // Dynamic timeline combining visits
  const customerVisits = allVisits.filter(
    (v) => v.clientName === customer.name || v.doctorId === customer.id
  )
  const timelineEvents = customerVisits.length > 0
    ? customerVisits.slice(0, 5).map((v) => ({
        date: v.date.split(',')[0],
        detail: t('doctor.visitCompleted', { products: v.productsPresented.join(', ') }),
      }))
    : [
        { date: 'Oct 18', detail: t('doctor.visitCompleted', { products: 'Bevato discussed' }) },
        { date: 'Sep 26', detail: t('doctor.sampleDelivery', { units: 24 }) },
      ]

  const handleAddFollowUpNote = () => {
    if (!newNote.trim() || !customer.id) return
    const nowIso = new Date().toISOString().slice(0, 10)
    const updatedHistory = [
      { date: nowIso, note: newNote.trim(), repName: currentUserName },
      ...(customer.followUpHistory || []),
    ]
    updateCustomer(customer.id, { followUpHistory: updatedHistory }, currentUserName)
    setNewNote('')
    setIsAddingNote(false)
    showUndoToast(lang === 'ar' ? 'تمت إضافة ملاحظة المتابعة' : 'Follow-up note added', () => {})
  }

  const handleLinkHco = () => {
    if (!selectedHcoToLink || !customer.id) return
    const targetHco = allCustomers.find((c) => c.id === selectedHcoToLink)
    if (!targetHco) return

    const newHcoNames = Array.from(new Set([...(customer.associatedHcoNames || []), targetHco.name]))
    const newHcoIds = Array.from(new Set([...(customer.associatedHcoIds || []), targetHco.id || '']))
    updateCustomer(customer.id, { associatedHcoNames: newHcoNames, associatedHcoIds: newHcoIds }, currentUserName)

    // Two-way link to maintain consistency without duplicates
    if (targetHco.id) {
      const targetHcps = Array.from(new Set([...(targetHco.associatedHcpNames || []), customer.name]))
      const targetHcpIds = Array.from(new Set([...(targetHco.associatedHcpIds || []), customer.id]))
      updateCustomer(targetHco.id, { associatedHcpNames: targetHcps, associatedHcpIds: targetHcpIds }, currentUserName)
    }

    setSelectedHcoToLink('')
    showUndoToast(lang === 'ar' ? 'تم ربط المؤسسة بنجاح' : 'Organization linked successfully', () => {})
  }

  const handleLinkHcp = () => {
    if (!selectedHcpToLink || !customer.id) return
    const targetHcp = allCustomers.find((c) => c.id === selectedHcpToLink)
    if (!targetHcp) return

    const newHcpNames = Array.from(new Set([...(customer.associatedHcpNames || []), targetHcp.name]))
    const newHcpIds = Array.from(new Set([...(customer.associatedHcpIds || []), targetHcp.id || '']))
    updateCustomer(customer.id, { associatedHcpNames: newHcpNames, associatedHcpIds: newHcpIds }, currentUserName)

    // Two-way link
    if (targetHcp.id) {
      const targetHcos = Array.from(new Set([...(targetHcp.associatedHcoNames || []), customer.name]))
      const targetHcoIds = Array.from(new Set([...(targetHcp.associatedHcoIds || []), customer.id]))
      updateCustomer(targetHcp.id, { associatedHcoNames: targetHcos, associatedHcoIds: targetHcoIds }, currentUserName)
    }

    setSelectedHcpToLink('')
    showUndoToast(lang === 'ar' ? 'تم ربط الطبيب / الصيدلي بنجاح' : 'Healthcare professional linked', () => {})
  }

  const kickerText = isHco
    ? `HCO · ${(customer.hcoType || 'HOSPITAL').toUpperCase()} · ${(customer.region || 'REGION').toUpperCase()}`
    : `HCP · ${(customer.hcpType || 'DOCTOR').toUpperCase()} · ${(customer.specialty || 'GENERAL').toUpperCase()} · ${(customer.classification || 'CLASS A').toUpperCase()}`

  return (
    <>
      <Drawer
        title={customer.name}
        kicker={kickerText}
        onClose={onClose}
      >
        <DoctorHero
          initials={initials}
          region={customer.region || 'North region'}
          assignedRep={t('doctor.assignedRep', { name: customer.repName || 'Alex Morgan' })}
        />

        {/* Status & Relationship Badges */}
        <div style={{ padding: '0 24px 14px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <StatusPill status={customer.status} />
          {customer.relationshipStatus && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '6px',
                background: 'rgba(37, 99, 235, 0.1)',
                color: '#2563eb',
              }}
            >
              {customer.relationshipStatus}
            </span>
          )}
          {customer.active === false && (
            <span style={{ fontSize: '11px', color: 'var(--muted-text)', fontStyle: 'italic' }}>
              ({lang === 'ar' ? 'حساب غير نشط' : 'Inactive account'})
            </span>
          )}
        </div>

        {/* Contact & Territory Information */}
        <div style={{ padding: '0 24px 16px', borderBottom: '1px solid var(--border-soft)' }}>
          <div style={{ fontSize: '13px', color: 'var(--muted-text)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Phone size={14} /> <strong>{t('doctor.phone')}</strong> {customer.phone || '01012345678'}
          </div>
          {customer.email && (
            <div style={{ fontSize: '13px', color: 'var(--muted-text)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={14} /> <strong>{lang === 'ar' ? 'البريد الإلكتروني:' : 'Email:'}</strong> {customer.email}
            </div>
          )}
          <div style={{ fontSize: '13px', color: 'var(--muted-text)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={14} /> <strong>{t('doctor.address')}</strong> {customer.address || 'Cairo Medical Plaza'}
          </div>
          {customer.notes && (
            <div style={{ fontSize: '13px', color: 'var(--muted-text)', marginTop: '8px', fontStyle: 'italic' }}>
              &ldquo;{customer.notes}&rdquo;
            </div>
          )}
        </div>

        {/* Client Relationships: Linked HCOs for HCP, or Linked HCPs for HCO */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-soft)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <strong style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {isHco ? <Stethoscope size={15} /> : <Building2 size={15} />}
              {isHco
                ? (lang === 'ar' ? 'المهنيون الصحيون المرتبطون (HCPs)' : 'Associated Healthcare Professionals')
                : (lang === 'ar' ? 'المؤسسات الصحية المرتبطة (HCOs)' : 'Associated Healthcare Organizations')}
            </strong>
          </div>

          {/* List of Linked Organizations/Professionals */}
          {(!isHco && customer.associatedHcoNames && customer.associatedHcoNames.length > 0) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
              {customer.associatedHcoNames.map((hcoName, i) => (
                <div
                  key={i}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'var(--surface-raised)',
                    border: '1px solid var(--border-soft)',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Building2 size={14} style={{ color: '#2563eb' }} />
                  <strong>{hcoName}</strong>
                </div>
              ))}
            </div>
          )}

          {(isHco && customer.associatedHcpNames && customer.associatedHcpNames.length > 0) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
              {customer.associatedHcpNames.map((hcpName, i) => (
                <div
                  key={i}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'var(--surface-raised)',
                    border: '1px solid var(--border-soft)',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Stethoscope size={14} style={{ color: '#059669' }} />
                  <strong>{hcpName}</strong>
                </div>
              ))}
            </div>
          )}

          {/* If no affiliations */}
          {((!isHco && (!customer.associatedHcoNames || customer.associatedHcoNames.length === 0)) ||
            (isHco && (!customer.associatedHcpNames || customer.associatedHcpNames.length === 0))) && (
            <p style={{ fontSize: '12px', color: 'var(--muted-text)', margin: '4px 0 10px' }}>
              {lang === 'ar' ? 'لا توجد ارتباطات مسجلة حالياً.' : 'No affiliations recorded yet.'}
            </p>
          )}

          {/* Link new affiliation selector */}
          {!isHco && availableHcos.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <select
                value={selectedHcoToLink}
                onChange={(e) => setSelectedHcoToLink(e.target.value)}
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-soft)',
                  background: 'var(--surface-raised)',
                  fontSize: '12px',
                  color: 'var(--heading-text)',
                }}
              >
                <option value="">{lang === 'ar' ? '-- اختر مؤسسة للربط --' : '-- Link an organization --'}</option>
                {availableHcos.map((hco) => (
                  <option key={hco.id} value={hco.id}>{hco.name} ({hco.region})</option>
                ))}
              </select>
              <Button variant="secondary" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={handleLinkHco} disabled={!selectedHcoToLink}>
                {lang === 'ar' ? 'ربط' : 'Link'}
              </Button>
            </div>
          )}

          {isHco && availableHcps.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <select
                value={selectedHcpToLink}
                onChange={(e) => setSelectedHcpToLink(e.target.value)}
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-soft)',
                  background: 'var(--surface-raised)',
                  fontSize: '12px',
                  color: 'var(--heading-text)',
                }}
              >
                <option value="">{lang === 'ar' ? '-- اختر طبيباً / صيدلياً للربط --' : '-- Link a professional --'}</option>
                {availableHcps.map((hcp) => (
                  <option key={hcp.id} value={hcp.id}>{hcp.name} ({hcp.specialty})</option>
                ))}
              </select>
              <Button variant="secondary" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={handleLinkHcp} disabled={!selectedHcpToLink}>
                {lang === 'ar' ? 'ربط' : 'Link'}
              </Button>
            </div>
          )}
        </div>

        {/* Follow-up History */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-soft)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <strong style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={15} />
              {lang === 'ar' ? 'سجل المتابعة والأنشطة' : 'Follow-up History & Activity'}
            </strong>
            <button
              onClick={() => setIsAddingNote(!isAddingNote)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--accent-primary, #2563eb)',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              {isAddingNote ? (lang === 'ar' ? 'إلغاء' : 'Cancel') : `+ ${lang === 'ar' ? 'إضافة ملاحظة' : 'Add Note'}`}
            </button>
          </div>

          {isAddingNote && (
            <div style={{ marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder={lang === 'ar' ? 'أدخل تفاصيل المتابعة أو النتيجة...' : 'Enter follow-up details or next steps...'}
                rows={2}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-soft)',
                  background: 'var(--surface-raised)',
                  fontSize: '13px',
                  color: 'var(--heading-text)',
                  fontFamily: 'inherit',
                }}
                autoFocus
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <Button variant="primary" style={{ padding: '4px 12px', fontSize: '12px' }} onClick={handleAddFollowUpNote} disabled={!newNote.trim()}>
                  {lang === 'ar' ? 'حفظ الملاحظة' : 'Save Note'}
                </Button>
              </div>
            </div>
          )}

          {customer.followUpHistory && customer.followUpHistory.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {customer.followUpHistory.map((fu, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'var(--surface-raised)',
                    fontSize: '12px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted-text)', marginBottom: '2px' }}>
                    <span>{fu.repName || customer.repName}</span>
                    <span>{formatDate(fu.date, lang)}</span>
                  </div>
                  <div style={{ color: 'var(--heading-text)' }}>{fu.note}</div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '12px', color: 'var(--muted-text)', margin: 0 }}>
              {lang === 'ar' ? 'لا توجد ملاحظات متابعة سابقة.' : 'No follow-up notes recorded yet.'}
            </p>
          )}
        </div>

        {/* Visit History */}
        <DoctorTimeline events={timelineEvents} />

        <div className="sheet-actions">
          <Button variant="secondary" onClick={onNewVisit}>
            {t('doctor.newVisit')}
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setIsEditing(true)
              onSave?.()
            }}
          >
            {isHco ? (lang === 'ar' ? 'تعديل المؤسسة' : 'Edit Organization') : t('doctor.editDoctor')}
          </Button>
        </div>
      </Drawer>

      <EditCustomerDrawer
        customer={customer}
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        role={role}
        currentUserName={currentUserName}
        onSave={(updated, previous) => {
          showUndoToast(t('clients.savedChanges', { name: updated.name }), () => {
            if (previous.id) {
              updateCustomer(previous.id, previous)
            }
          })
        }}
        onDelete={(deleted) => {
          showUndoToast(t('clients.deleted', { name: deleted.name }), () => {
            if (deleted.id) {
              updateCustomer(deleted.id, { deleted_at: null })
            }
          })
          onClose()
        }}
      />

      {toastMessage && (
        <Toast message={toastMessage} onUndo={toastUndo ?? undefined} />
      )}
    </>
  )
}
