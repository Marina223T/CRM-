import { useState, useEffect } from 'react'
import { Drawer } from '@/ui/design-system/components/Drawer'
import { Button } from '@/ui/design-system/components/Button'
import { FieldError } from '@/ui/design-system/components/FieldError'
import { useT } from '@/lib/i18n'
import { ALL_MOCK_REPS } from '@/ui/design-system/components/RecordFormDrawer'
import { EGYPT_REGIONS, getLocalizedRegionName } from '@/data/regions'
import type { Warehouse } from '@/data/mock/warehouses'

export interface WarehouseFormDrawerProps {
  isOpen: boolean
  warehouse: Warehouse | null
  onClose: () => void
  onSave: (data: Omit<Warehouse, 'id' | 'currentStockUnits' | 'products' | 'lastAuditDate' | 'updated_at'> & { id?: string }) => void
}

const STORAGE_TYPES = [
  'Ambient (15-25°C)',
  'Cold Chain (2-8°C)',
  'Dual Zone',
] as const

const STATUS_OPTIONS = [
  'Active',
  'Near Capacity',
  'Maintenance',
  'Inactive',
] as const

export function WarehouseFormDrawer({
  isOpen,
  warehouse,
  onClose,
  onSave,
}: WarehouseFormDrawerProps) {
  const { t, lang } = useT()
  const isEditing = Boolean(warehouse)

  const [name, setName] = useState('')
  const [nameAr, setNameAr] = useState('')
  const [code, setCode] = useState('')
  const [area, setArea] = useState('Cairo')
  const [governorate, setGovernorate] = useState('Cairo Governorate')
  const [assignedRepId, setAssignedRepId] = useState(ALL_MOCK_REPS[0]?.id || '')
  const [temperatureType, setTemperatureType] = useState<'Ambient (15-25°C)' | 'Cold Chain (2-8°C)' | 'Dual Zone'>('Ambient (15-25°C)')
  const [capacityUnits, setCapacityUnits] = useState('10000')
  const [status, setStatus] = useState<'Active' | 'Near Capacity' | 'Maintenance' | 'Inactive'>('Active')
  const [address, setAddress] = useState('')
  const [addressAr, setAddressAr] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (warehouse) {
      setName(warehouse.name)
      setNameAr(warehouse.name_ar)
      setCode(warehouse.code)
      setArea(warehouse.area)
      setGovernorate(warehouse.governorate)
      setAssignedRepId(warehouse.assignedRepId || '')
      setTemperatureType(warehouse.temperatureType)
      setCapacityUnits(String(warehouse.capacityUnits))
      setStatus(warehouse.status)
      setAddress(warehouse.address)
      setAddressAr(warehouse.address_ar)
      setPhone(warehouse.phone)
      setEmail(warehouse.email)
    } else {
      setName('')
      setNameAr('')
      setCode(`WH-${Date.now().toString().slice(-4)}`)
      setArea('Cairo')
      setGovernorate('Cairo Governorate')
      setAssignedRepId(ALL_MOCK_REPS[0]?.id || '')
      setTemperatureType('Ambient (15-25°C)')
      setCapacityUnits('10000')
      setStatus('Active')
      setAddress('')
      setAddressAr('')
      setPhone('')
      setEmail('')
    }
    setErrors({})
  }, [warehouse, isOpen])

  const handleAreaChange = (selectedArea: string) => {
    setArea(selectedArea)
    const matched = EGYPT_REGIONS.find((r) => r.name_en === selectedArea || r.id === selectedArea)
    if (matched) {
      setGovernorate(matched.governorate_en)
    }
  }

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {}
    if (!name.trim()) nextErrors.name = t('warehouses.form.validationRequired')
    if (!code.trim()) nextErrors.code = t('warehouses.form.validationRequired')
    const cap = parseInt(capacityUnits, 10)
    if (isNaN(cap) || cap <= 0) nextErrors.capacity = t('warehouses.form.validationCapacity')
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const selectedRep = ALL_MOCK_REPS.find((r) => r.id === assignedRepId)
    const repName = selectedRep ? selectedRep.name : 'Unassigned'
    const matchedRegion = EGYPT_REGIONS.find((r) => r.name_en === area || r.id === area)

    onSave({
      id: warehouse?.id,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      name_ar: nameAr.trim() || name.trim(),
      area: matchedRegion?.name_en || area,
      area_ar: matchedRegion?.name_ar || area,
      governorate: matchedRegion?.governorate_en || governorate,
      governorate_ar: matchedRegion?.governorate_ar || governorate,
      assignedRepId,
      assignedRepName: repName,
      assignedRepName_ar: selectedRep ? selectedRep.name : undefined,
      status,
      capacityUnits: parseInt(capacityUnits, 10) || 10000,
      temperatureType,
      address: address.trim() || 'Logistics Zone, Egypt',
      address_ar: addressAr.trim() || address.trim() || 'المنطقة اللوجستية، مصر',
      phone: phone.trim() || '+20 2 2000 0000',
      email: email.trim() || `${code.toLowerCase().replace(/[^a-z0-9]/g, '')}@navigenpharma.net`,
    })
  }

  const inputStyle = {
    padding: '9px 12px',
    borderRadius: '8px',
    border: '1px solid var(--border-input)',
    background: 'var(--input-bg)',
    color: 'var(--input-text)',
    fontSize: '13.5px',
    width: '100%',
    boxSizing: 'border-box' as const,
  }

  const labelStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '5px',
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--muted-text)',
  }

  return (
    <Drawer
      title={isEditing ? t('warehouses.form.editTitle') : t('warehouses.form.addTitle')}
      kicker={t('warehouses.form.eyebrow')}
      isOpen={isOpen}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '0 4px' }}>
        {/* Warehouse Code & Status */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <label style={labelStyle}>
            {t('warehouses.form.code')} *
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. WH-CAI-02"
              style={inputStyle}
            />
            {errors.code && <FieldError message={errors.code} />}
          </label>

          <label style={labelStyle}>
            {t('warehouses.form.status')}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
              style={inputStyle}
            >
              {STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Name EN & Name AR */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <label style={labelStyle}>
            {t('warehouses.form.nameEn')} *
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Cairo Logistics Hub"
              style={inputStyle}
            />
            {errors.name && <FieldError message={errors.name} />}
          </label>

          <label style={labelStyle}>
            {t('warehouses.form.nameAr')}
            <input
              type="text"
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              placeholder="مثال: مستودع القاهرة اللوجستي"
              dir="rtl"
              style={inputStyle}
            />
          </label>
        </div>

        {/* Area & Governorate */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <label style={labelStyle}>
            {t('warehouses.form.area')}
            <select
              value={area}
              onChange={(e) => handleAreaChange(e.target.value)}
              style={inputStyle}
            >
              {EGYPT_REGIONS.map((reg) => (
                <option key={reg.id} value={reg.name_en}>
                  {lang === 'ar' ? reg.name_ar : reg.name_en}
                </option>
              ))}
            </select>
          </label>

          <label style={labelStyle}>
            {t('warehouses.table.area')}
            <input
              type="text"
              value={lang === 'ar' ? getLocalizedRegionName(area, 'ar') : governorate}
              readOnly
              style={{ ...inputStyle, background: 'var(--surface-raised)', opacity: 0.8 }}
            />
          </label>
        </div>

        {/* Assigned Representative & Storage Condition */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <label style={labelStyle}>
            {t('warehouses.form.assignedRep')}
            <select
              value={assignedRepId}
              onChange={(e) => setAssignedRepId(e.target.value)}
              style={inputStyle}
            >
              {ALL_MOCK_REPS.map((rep) => (
                <option key={rep.id} value={rep.id}>
                  {rep.name} ({rep.region})
                </option>
              ))}
            </select>
          </label>

          <label style={labelStyle}>
            {t('warehouses.form.storageType')}
            <select
              value={temperatureType}
              onChange={(e) => setTemperatureType(e.target.value as typeof temperatureType)}
              style={inputStyle}
            >
              {STORAGE_TYPES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Capacity (Units) */}
        <label style={labelStyle}>
          {t('warehouses.form.capacity')} *
          <input
            type="number"
            value={capacityUnits}
            onChange={(e) => setCapacityUnits(e.target.value)}
            min="100"
            step="100"
            style={inputStyle}
          />
          {errors.capacity && <FieldError message={errors.capacity} />}
        </label>

        {/* Physical Address */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <label style={labelStyle}>
            {t('warehouses.form.addressEn')}
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Zone 4, Badr Industrial City"
              style={inputStyle}
            />
          </label>

          <label style={labelStyle}>
            {t('warehouses.form.addressAr')}
            <input
              type="text"
              value={addressAr}
              onChange={(e) => setAddressAr(e.target.value)}
              placeholder="مثال: المنطقة الرابعة، مدينة بدر"
              dir="rtl"
              style={inputStyle}
            />
          </label>
        </div>

        {/* Phone & Email */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <label style={labelStyle}>
            {t('warehouses.form.phone')}
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+20 2 2849 5500"
              dir="ltr"
              style={inputStyle}
            />
          </label>

          <label style={labelStyle}>
            {t('warehouses.form.email')}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="wh@navigenpharma.net"
              dir="ltr"
              style={inputStyle}
            />
          </label>
        </div>

        {/* Actions Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            marginTop: '12px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-soft)',
          }}
        >
          <Button variant="secondary" onClick={onClose} type="button">
            {t('warehouses.form.cancel')}
          </Button>
          <Button variant="primary" type="submit">
            {t('warehouses.form.save')}
          </Button>
        </div>
      </form>
    </Drawer>
  )
}
