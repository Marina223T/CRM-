import { useState, useRef, useEffect } from 'react'
import { Filter, LayoutGrid, List, Search, X } from 'lucide-react'
import { Button } from '@/ui/design-system/components/Button'
import { DropdownPortal } from '@/ui/design-system/components/DropdownPortal'
import { useT } from '@/lib/i18n'
import { SPECIALTY_AR, CLASSIFICATION_AR, CLIENT_REGION_AR } from '../mock-data'
import { ALL_MOCK_REPS } from '@/ui/design-system/components/RecordFormDrawer'

export interface ClientFiltersState {
  entityType: string
  specialty: string
  classification: string
  region: string
  assignedRep: string
  status: string
  overdueOnly: boolean
}

export interface ClientToolbarProps {
  searchQuery: string
  onSearchChange: (q: string) => void
  viewMode: 'list' | 'cards'
  onToggleView: () => void
  activeFilters: ClientFiltersState
  onApplyFilters: (f: ClientFiltersState) => void
  onClearFilters: () => void
  repsList?: string[]
}

const ENTITY_TYPES = [
  'All types',
  'All HCPs',
  'All HCOs',
  'Doctor (HCP)',
  'Pharmacist (HCP)',
  'Other Specialist (HCP)',
  'Hospital (HCO)',
  'Clinic (HCO)',
  'Medical Center (HCO)',
  'Pharmacy (HCO)',
]

const STATUSES = ['All statuses', 'Active', 'Inactive', 'Pending', 'Overdue']

const SPECIALTIES = ['All specialties', 'Cardiology', 'Pharmacy', 'Pediatrics', 'General Medicine']
const CLASSIFICATIONS = ['All classes', 'Class A', 'Class B', 'Class C']
const REGIONS = [
  'All regions',
  'North region',
  'West region',
  'Central region',
  'East region',
  'South region',
  'Tanta',
  'El Mahalla El Kubra',
  'Assiut',
  'Cairo',
  'Giza',
  'Alexandria',
  'Mansoura (Dakahlia)',
  'Zagazig (Sharqia)',
  'Suez',
  'Port Said',
  'Ismailia',
  'Aswan',
]

export const ENTITY_TYPE_AR: Record<string, string> = {
  'All types': 'جميع الأنواع',
  'All HCPs': 'جميع المهنيين (HCP)',
  'All HCOs': 'جميع المؤسسات (HCO)',
  'Doctor (HCP)': 'طبيب (HCP)',
  'Pharmacist (HCP)': 'صيدلي (HCP)',
  'Other Specialist (HCP)': 'أخصائي آخر (HCP)',
  'Hospital (HCO)': 'مستشفى (HCO)',
  'Clinic (HCO)': 'عيادة (HCO)',
  'Medical Center (HCO)': 'مركز طبي (HCO)',
  'Pharmacy (HCO)': 'صيدلية (HCO)',
}

export const STATUS_AR: Record<string, string> = {
  'All statuses': 'جميع الحالات',
  'Active': 'نشط',
  'Inactive': 'غير نشط',
  'Pending': 'قيد الانتظار',
  'Overdue': 'متأخر',
}

export function ClientToolbar({
  searchQuery,
  onSearchChange,
  viewMode,
  onToggleView,
  activeFilters,
  onApplyFilters,
  onClearFilters,
  repsList,
}: ClientToolbarProps) {
  const { t, lang } = useT()
  const [isOpen, setIsOpen] = useState(false)
  const [draft, setDraft] = useState<ClientFiltersState>(activeFilters)
  const filterBtnRef = useRef<HTMLDivElement>(null)

  const reps = repsList && repsList.length > 0 ? repsList : ALL_MOCK_REPS.map((r) => r.name)
  const allReps = ['All representatives', ...Array.from(new Set(reps))]

  useEffect(() => {
    setDraft(activeFilters)
  }, [activeFilters])

  const handleApply = () => {
    onApplyFilters(draft)
    setIsOpen(false)
  }

  const handleClear = () => {
    const empty: ClientFiltersState = {
      entityType: 'All types',
      specialty: 'All specialties',
      classification: 'All classes',
      region: 'All regions',
      assignedRep: 'All representatives',
      status: 'All statuses',
      overdueOnly: false,
    }
    setDraft(empty)
    onClearFilters()
    setIsOpen(false)
  }

  const activeCount =
    (activeFilters.entityType && activeFilters.entityType !== 'All types' ? 1 : 0) +
    (activeFilters.specialty !== 'All specialties' ? 1 : 0) +
    (activeFilters.classification !== 'All classes' ? 1 : 0) +
    (activeFilters.region !== 'All regions' ? 1 : 0) +
    (activeFilters.assignedRep && activeFilters.assignedRep !== 'All representatives' ? 1 : 0) +
    (activeFilters.status && activeFilters.status !== 'All statuses' ? 1 : 0) +
    (activeFilters.overdueOnly ? 1 : 0)

  const selectStyle = {
    padding: '8px',
    borderRadius: '8px',
    border: '1px solid var(--border-input)',
    background: 'var(--input-bg)',
    color: 'var(--input-text)',
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
    <div className="collection-toolbar" style={{ position: 'relative' }}>
      <div className="search-inline">
        <Search />
        <input
          placeholder={t('clients.toolbar.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div ref={filterBtnRef} style={{ position: 'relative' }}>
        <Button
          variant={activeCount > 0 ? 'primary' : 'secondary'}
          onClick={() => setIsOpen(!isOpen)}
        >
          <Filter data-icon="inline-start" /> {t('clients.toolbar.filters')}
          {activeCount > 0 && ` (${activeCount})`}
        </Button>

        <DropdownPortal
          isOpen={isOpen}
          anchorEl={filterBtnRef.current}
          onClose={() => setIsOpen(false)}
          width={320}
          align="right"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span className="eyebrow">{t('clients.toolbar.filtersEyebrow')}</span>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--muted-text)' }}
            >
              <X style={{ width: '16px', height: '16px' }} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto' }}>
            {/* Entity Type: HCP / HCO */}
            <label style={labelStyle}>
              {lang === 'ar' ? 'نوع العميل (HCP / HCO)' : 'Client Type (HCP / HCO)'}
              <select
                value={draft.entityType}
                onChange={(e) => setDraft({ ...draft, entityType: e.target.value })}
                style={selectStyle}
              >
                {ENTITY_TYPES.map((et) => (
                  <option key={et} value={et}>{lang === 'ar' ? (ENTITY_TYPE_AR[et] || et) : et}</option>
                ))}
              </select>
            </label>

            {/* Status */}
            <label style={labelStyle}>
              {lang === 'ar' ? 'الحالة' : 'Status'}
              <select
                value={draft.status}
                onChange={(e) => setDraft({ ...draft, status: e.target.value })}
                style={selectStyle}
              >
                {STATUSES.map((st) => (
                  <option key={st} value={st}>{lang === 'ar' ? (STATUS_AR[st] || st) : st}</option>
                ))}
              </select>
            </label>

            {/* Specialty */}
            <label style={labelStyle}>
              {t('clients.toolbar.specialty')}
              <select
                value={draft.specialty}
                onChange={(e) => setDraft({ ...draft, specialty: e.target.value })}
                style={selectStyle}
              >
                {SPECIALTIES.map((s) => (
                  <option key={s} value={s}>{lang === 'ar' ? (SPECIALTY_AR[s] || s) : s}</option>
                ))}
              </select>
            </label>

            {/* Territory / Region */}
            <label style={labelStyle}>
              {t('clients.toolbar.region')}
              <select
                value={draft.region}
                onChange={(e) => setDraft({ ...draft, region: e.target.value })}
                style={selectStyle}
              >
                {REGIONS.map((r) => (
                  <option key={r} value={r}>{lang === 'ar' ? (CLIENT_REGION_AR[r] || r) : r}</option>
                ))}
              </select>
            </label>

            {/* Assigned Representative */}
            <label style={labelStyle}>
              {lang === 'ar' ? 'المندوب المعين' : 'Assigned Representative'}
              <select
                value={draft.assignedRep}
                onChange={(e) => setDraft({ ...draft, assignedRep: e.target.value })}
                style={selectStyle}
              >
                {allReps.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </label>

            {/* Classification */}
            <label style={labelStyle}>
              {t('clients.toolbar.classification')}
              <select
                value={draft.classification}
                onChange={(e) => setDraft({ ...draft, classification: e.target.value })}
                style={selectStyle}
              >
                {CLASSIFICATIONS.map((c) => (
                  <option key={c} value={c}>{lang === 'ar' ? (CLASSIFICATION_AR[c] || c) : c}</option>
                ))}
              </select>
            </label>

            {/* Overdue Only checkbox */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', color: 'var(--card-text)', marginTop: '4px' }}>
              <input
                type="checkbox"
                checked={draft.overdueOnly || draft.status === 'Overdue'}
                onChange={(e) => setDraft({ ...draft, overdueOnly: e.target.checked })}
                style={{ cursor: 'pointer' }}
              />
              <span>{t('clients.toolbar.overdueForVisit')}</span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
            <Button variant="secondary" style={{ flex: 1, padding: '6px' }} onClick={handleClear}>
              {t('common.clear')}
            </Button>
            <Button variant="primary" style={{ flex: 1, padding: '6px' }} onClick={handleApply}>
              {t('common.apply')}
            </Button>
          </div>
        </DropdownPortal>
      </div>

      <Button variant="secondary" onClick={onToggleView} title={viewMode === 'list' ? t('clients.toolbar.switchToCards') : t('clients.toolbar.switchToList')}>
        {viewMode === 'list' ? (
          <>
            <LayoutGrid data-icon="inline-start" /> {t('clients.toolbar.cards')}
          </>
        ) : (
          <>
            <List data-icon="inline-start" /> {t('clients.toolbar.list')}
          </>
        )}
      </Button>
    </div>
  )
}
