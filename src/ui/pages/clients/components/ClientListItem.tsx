import { ChevronRight, Users, Edit3, Building2, Stethoscope, Pill } from 'lucide-react'
import { StatusPill } from '@/ui/design-system/components/StatusPill'
import { Button } from '@/ui/design-system/components/Button'
import { useT } from '@/lib/i18n'
import type { ClientRecord } from '../mock-data'
import { SPECIALTY_AR, CLASSIFICATION_AR, CLIENT_REGION_AR } from '../mock-data'

export interface ClientListItemProps {
  item: ClientRecord
  onClick: () => void
  onEdit?: (item: ClientRecord) => void
  canEdit?: boolean
}

function getEntityLabel(item: ClientRecord, lang: 'en' | 'ar'): string {
  const isAr = lang === 'ar'
  if (item.clientCategory === 'hco' || item.type === 'pharmacy') {
    if (item.hcoType === 'hospital') return isAr ? 'مؤسسة · مستشفى' : 'HCO · Hospital'
    if (item.hcoType === 'clinic') return isAr ? 'مؤسسة · عيادة' : 'HCO · Clinic'
    if (item.hcoType === 'medical_center') return isAr ? 'مؤسسة · مركز طبي' : 'HCO · Medical Center'
    if (item.hcoType === 'pharmacy' || item.type === 'pharmacy') return isAr ? 'مؤسسة · صيدلية' : 'HCO · Pharmacy'
    return isAr ? 'مؤسسة صحية' : 'HCO · Institution'
  }
  if (item.hcpType === 'pharmacist') return isAr ? 'مهني · صيدلي' : 'HCP · Pharmacist'
  if (item.hcpType === 'other') return isAr ? 'مهني · أخصائي' : 'HCP · Specialist'
  return isAr ? 'مهني · طبيب' : 'HCP · Doctor'
}

export function ClientListItem({ item, onClick, onEdit, canEdit = true }: ClientListItemProps) {
  const { t, lang } = useT()

  const displayName = lang === 'ar' ? (item.name_ar || item.name) : item.name
  let displayMeta = item.meta
  if (lang === 'ar') {
    const spec = (item.specialty && SPECIALTY_AR[item.specialty]) || item.specialty
    const reg = (item.region && CLIENT_REGION_AR[item.region]) || item.region
    const cls = (item.classification && CLASSIFICATION_AR[item.classification]) || item.classification
    displayMeta = [spec, reg, cls].filter(Boolean).join(' · ')
  }

  const isHco = item.clientCategory === 'hco' || item.type === 'pharmacy'
  const isPharmacy = item.hcoType === 'pharmacy' || item.hcpType === 'pharmacist' || item.type === 'pharmacy'

  return (
    <div
      className="collection-item"
      onClick={onClick}
      role="button"
      tabIndex={0}
      style={{ cursor: 'pointer', textAlign: 'start' }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
    >
      <div className="item-icon">
        {isHco ? <Building2 /> : isPharmacy ? <Pill /> : <Stethoscope />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '2px' }}>
          <span
            style={{
              display: 'inline-block',
              fontSize: '10px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              padding: '2px 6px',
              borderRadius: '4px',
              background: isHco ? 'rgba(59, 130, 246, 0.12)' : 'rgba(16, 185, 129, 0.12)',
              color: isHco ? '#2563eb' : '#059669',
            }}
          >
            {getEntityLabel(item, lang)}
          </span>
          <strong>{displayName}</strong>
        </div>
        <span>{displayMeta}</span>
        {item.associatedHcoNames && item.associatedHcoNames.length > 0 && (
          <span style={{ fontSize: '11px', color: 'var(--muted-text)', display: 'block', marginTop: '2px' }}>
            🏢 {lang === 'ar' ? 'المؤسسات المرتبطة: ' : 'Affiliated: '}{item.associatedHcoNames.join(', ')}
          </span>
        )}
        {item.associatedHcpNames && item.associatedHcpNames.length > 0 && (
          <span style={{ fontSize: '11px', color: 'var(--muted-text)', display: 'block', marginTop: '2px' }}>
            👨‍⚕️ {lang === 'ar' ? 'الأطباء المرتبطون: ' : 'Affiliated HCPs: '}{item.associatedHcpNames.join(', ')}
          </span>
        )}
      </div>
      <StatusPill status={item.status} />
      {canEdit && onEdit && (
        <Button
          variant="secondary"
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onEdit(item)
          }}
          style={{
            height: '30px',
            padding: '0 10px',
            fontSize: '12px',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Edit3 size={13} />
          {t('common.edit')}
        </Button>
      )}
      <ChevronRight />
    </div>
  )
}
