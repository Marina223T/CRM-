import { useState, useEffect, useMemo } from 'react'
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Search,
  MapPin,
  Calendar,
  AlertCircle,
  Stethoscope,
  Plus,
  Minus,
  Sparkles,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/ui/design-system/components/Button'
import { Drawer } from '@/ui/design-system/components/Drawer'
import { Stepper } from '@/ui/design-system/components/Stepper'
import { customersStore, updateCustomer, type Customer } from '@/data/mock/customers'
import { productsStore } from '@/data/mock/products'
import {
  batchesStore,
  stockMovementsStore,
  addStockMovement,
  getRepAvailableSampleStock,
  allocateRepSampleFefo,
} from '@/data/mock/stockDerived'
import { visitsStore, addVisit, type StoredVisit } from '@/data/mock/visits'
import { useStore } from '@/data/mock/store'
import { useT } from '@/lib/i18n'

export interface NewVisitWizardProps {
  isOpen?: boolean
  initialClientId?: string | null
  onClose: () => void
  onSave?: () => void
  onViewVisit?: (visitId: string) => void
  role?: 'admin' | 'rep'
  currentUserName?: string
}

const REACTION_OPTIONS = [
  { id: 'interested', emoji: '😍', label: 'Interested' },
  { id: 'neutral', emoji: '😐', label: 'Neutral' },
  { id: 'not-interested', emoji: '👎', label: 'Not interested' },
] as const

function addDaysToDate(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

function formatDisplayDate(dateStr: string): string {
  try {
    const parts = dateStr.split('-')
    if (parts.length === 3) {
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return dateStr
  }
}

export function NewVisitWizard({
  isOpen = true,
  initialClientId = null,
  onClose,
  onSave,
  onViewVisit,
  role = 'admin',
  currentUserName = 'Alex Morgan',
}: NewVisitWizardProps) {
  const { t } = useT()
  const allCustomers = useStore(customersStore)
  const catalogProducts = useStore(productsStore)
  const stockMovements = useStore(stockMovementsStore)

  const reactionOptions = [
    { id: 'interested', emoji: '😍', label: t('visits.new.interested') },
    { id: 'neutral', emoji: '😐', label: t('visits.new.neutral') },
    { id: 'not-interested', emoji: '👎', label: t('visits.new.notInterested') },
  ] as const

  const [currentStep, setCurrentStep] = useState(1)
  const [selectedClientId, setSelectedClientId] = useState<string | null>(initialClientId)
  const [clientSearch, setClientSearch] = useState('')

  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [reactions, setReactions] = useState<Record<string, string>>({})
  const [samples, setSamples] = useState<Record<string, number>>({})

  const [notes, setNotes] = useState('')
  const [nextVisitDate, setNextVisitDate] = useState('')
  const [gpsVerified, setGpsVerified] = useState(false)
  const [gpsStatus, setGpsStatus] = useState<'unverified' | 'verified' | 'permission_denied' | 'unavailable'>('unverified')
  const [gpsVerifying, setGpsVerifying] = useState(false)
  const [gpsLocationText, setGpsLocationText] = useState<string | null>(null)

  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [savedVisitId, setSavedVisitId] = useState<string | null>(null)

  // Sync initial client ID if passed
  useEffect(() => {
    if (initialClientId) {
      setSelectedClientId(initialClientId)
    }
  }, [initialClientId])

  // Filter active customers
  const activeCustomers = useMemo(() => {
    const list = allCustomers.filter((c) => !c.deleted_at && c.active !== false && c.status !== 'Inactive')
    if (role === 'rep') {
      return list.filter(
        (c) =>
          (c.repName && c.repName.toLowerCase() === currentUserName.toLowerCase()) ||
          (c.rep_id && currentUserName && c.rep_id.toLowerCase().includes(currentUserName.toLowerCase().split(' ')[0]))
      )
    }
    return list
  }, [allCustomers, role, currentUserName])

  const filteredCustomers = useMemo(() => {
    if (!clientSearch.trim()) return activeCustomers
    const q = clientSearch.toLowerCase()
    return activeCustomers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.name_ar && c.name_ar.includes(q)) ||
        c.specialty.toLowerCase().includes(q) ||
        c.region.toLowerCase().includes(q)
    )
  }, [activeCustomers, clientSearch])

  // Selected client object
  const selectedClient = useMemo(() => {
    return allCustomers.find((c) => c.id === selectedClientId) || null
  }, [allCustomers, selectedClientId])

  // Set default next visit date according to classification
  useEffect(() => {
    if (selectedClient && !nextVisitDate) {
      const cls = selectedClient.classification || 'Class A'
      let days = 14
      if (cls.includes('B')) days = 30
      else if (cls.includes('C')) days = 60
      setNextVisitDate(addDaysToDate(days))
    }
  }, [selectedClient, nextVisitDate])

  // Available products
  const productOptions = useMemo(() => {
    const names = catalogProducts.map((p) => p.name)
    if (names.length > 0) return names
    return [
      'Bevato',
      'Naviro D3 50,000 IU',
      'Naviro D3 10,000 IU',
      'Naviro D3 Drops',
      'Navigen Product 5',
    ]
  }, [catalogProducts])

  // Representative consistency: ensure visit records are consistent with selected doctor and rep
  const effectiveRepName = role === 'rep' ? currentUserName : (selectedClient?.repName || currentUserName)

  // Sample stock available per product for this specific representative from their buffer
  const getAvailableSampleStock = (productName: string) => {
    return getRepAvailableSampleStock(
      effectiveRepName,
      productName,
      batchesStore.get(),
      stockMovementsStore.get()
    )
  }

  const handleVerifyGps = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGpsStatus('unavailable')
      setGpsVerified(false)
      setErrorMsg('Geolocation service is unavailable.')
      return
    }
    setGpsVerifying(true)
    setErrorMsg(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsVerifying(false)
        setGpsVerified(true)
        setGpsStatus('verified')
        const lat = pos.coords.latitude.toFixed(4)
        const lng = pos.coords.longitude.toFixed(4)
        // Record device coordinates without falsely asserting doctor proximity distance check
        setGpsLocationText(`GPS (${lat}°, ${lng}°)`)
      },
      (err) => {
        setGpsVerifying(false)
        setGpsVerified(false)
        if (err.code === 1) { // PERMISSION_DENIED
          setGpsStatus('permission_denied')
          setErrorMsg('Location permission denied by user.')
        } else {
          setGpsStatus('unavailable')
          setErrorMsg('Location unavailable or timed out.')
        }
      },
      { timeout: 8000, enableHighAccuracy: true }
    )
  }

  const steps = [
    { number: 1, label: t('visits.new.stepClient') },
    { number: 2, label: t('visits.new.stepProducts') },
    { number: 3, label: t('visits.new.stepSamples') },
    { number: 4, label: t('visits.new.stepNotes') },
    { number: 5, label: t('visits.new.stepSaved') },
  ]

  const handleStepClick = (step: number) => {
    if (step < currentStep && currentStep < 5) {
      setErrorMsg(null)
      setCurrentStep(step)
    }
  }

  const handleNext = () => {
    setErrorMsg(null)
    if (currentStep === 1) {
      if (!selectedClientId) {
        setErrorMsg(t('visits.new.selectClient'))
        return
      }
      setCurrentStep(2)
    } else if (currentStep === 2) {
      if (selectedProducts.length === 0) {
        setErrorMsg(t('visits.new.selectProduct'))
        return
      }
      setCurrentStep(3)
    } else if (currentStep === 3) {
      setCurrentStep(4)
    } else if (currentStep === 4) {
      executeSave()
    }
  }

  const handleBack = () => {
    setErrorMsg(null)
    if (currentStep > 1 && currentStep < 5) {
      setCurrentStep(currentStep - 1)
    }
  }

  const executeSave = () => {
    if (!selectedClient) {
      setErrorMsg(t('visits.new.noClientSelected'))
      return
    }

    setIsSaving(true)
    setErrorMsg(null)

    try {
      const now = new Date()
      const totalSamples = Object.values(samples).reduce((a, b) => a + b, 0)
      const today = now.toISOString().split('T')[0]

      // Primary reaction
      const firstProduct = selectedProducts[0] || ''
      const firstReactionKey = reactions[firstProduct] || 'interested'
      const matchedReaction = reactionOptions.find((r) => r.id === firstReactionKey) || reactionOptions[0]

      // 1. Verify sample availability per representative: prevent distributing more
      // samples than available in the representative's transferred stock buffer.
      for (const p of selectedProducts) {
        const qty = samples[p] || 0
        if (qty > 0) {
          const avail = getAvailableSampleStock(p)
          if (qty > avail) {
            setErrorMsg(
              `Cannot distribute ${qty} units of ${p}. Only ${avail} units available in representative buffer.`
            )
            setIsSaving(false)
            return
          }
        }
      }

      // 2. Allocate every sample quantity from the representative's buffer
      // FEFO-sorted batches. If any allocation fails, nothing is persisted.
      const sampleAllocations = selectedProducts.flatMap((p) => {
        const qty = samples[p] || 0
        if (qty <= 0) return []
        return allocateRepSampleFefo(
          effectiveRepName,
          p,
          qty,
          batchesStore.get(),
          stockMovementsStore.get()
        )
      })

      // 3. Add visit to visitsStore with consistent representative and actual GPS verification
      const newVisit: StoredVisit = addVisit({
        clientName: selectedClient.name,
        clientName_ar: selectedClient.name_ar,
        repName: effectiveRepName,
        date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        detail: t('visits.new.presentation', { products: selectedProducts.slice(0, 2).join(' & ') }),
        status: 'Completed',
        productsPresented: selectedProducts,
        samplesQuantity: totalSamples,
        reactionEmoji: matchedReaction.emoji,
        reactionLabel: matchedReaction.label,
        notes: notes.trim() || t('visits.new.defaultNote'),
        nextVisitDate: formatDisplayDate(nextVisitDate || addDaysToDate(14)),
        gpsVerified: gpsVerified,
      })

      // 4. Record the pre-allocated sample movements against the representative's custody
      sampleAllocations.forEach((allocation) => {
        addStockMovement({
          productName: allocation.productName,
          batch_id: allocation.batchId,
          batchNumber: allocation.batchNumber,
          quantity: allocation.quantity,
          type: 'sample',
          date: today,
          customer_id: selectedClient.id ?? undefined,
          customerName: selectedClient.name,
          repName: effectiveRepName,
        })
      })

      // 4. Update client's last visit date and status
      updateCustomer(selectedClient.id!, {
        last_visit_date: now.toISOString().split('T')[0],
        status: 'Active',
      })

      setSavedVisitId(newVisit.id)
      setCurrentStep(5)
      onSave?.()
    } catch {
      setErrorMsg(t('visits.new.saveFailed'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetForAnother = () => {
    setCurrentStep(1)
    setSelectedClientId(null)
    setSelectedProducts([])
    setReactions({})
    setSamples({})
    setNotes('')
    setNextVisitDate('')
    setGpsVerified(false)
    setGpsStatus('unverified')
    setGpsLocationText(null)
    setSavedVisitId(null)
    setErrorMsg(null)
  }

  if (!isOpen) return null

  return (
    <Drawer
      title={t('visits.new.title')}
      kicker={currentStep === 5 ? t('visits.new.completed') : t('visits.new.stepOf', { step: currentStep })}
      onClose={onClose}
    >
      <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Stepper
          steps={steps}
          currentStep={currentStep}
          onStepClick={handleStepClick}
        />

        {errorMsg && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              margin: '12px 0',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.1)',
              color: 'var(--rose-text, #ef4444)',
              fontSize: '13px',
            }}
          >
            <AlertCircle size={16} />
            <span style={{ flex: 1 }}>{errorMsg}</span>
            {currentStep === 4 && (
              <Button
                variant="secondary"
                type="button"
                onClick={executeSave}
                style={{ height: '26px', padding: '0 8px', fontSize: '12px' }}
              >
                <RefreshCw size={12} style={{ marginRight: '4px' }} /> {t('visits.new.retry')}
              </Button>
            )}
          </div>
        )}

        {/* Step 1: Client */}
        {currentStep === 1 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              <Search
                size={16}
                style={{ position: 'absolute', insetInlineStart: '12px', top: '12px', color: 'var(--muted-text)' }}
              />
              <input
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                placeholder={t('visits.new.searchPlaceholder')}
                style={{ width: '100%', paddingInlineStart: '38px', height: '40px' }}
              />
            </div>

            <div style={{ flex: 1, overflowY: 'auto', maxHeight: '55vh', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((c) => {
                  const isSelected = selectedClientId === c.id
                  return (
                    <div
                      key={c.id || c.name}
                      onClick={() => setSelectedClientId(c.id || null)}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: isSelected ? '2px solid var(--ocean)' : '1px solid var(--border-soft)',
                        background: isSelected ? 'var(--ocean-light, rgba(2, 132, 199, 0.08))' : 'var(--surface)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            background: 'var(--surface-raised, rgba(0,0,0,0.04))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--ocean)',
                          }}
                        >
                          <Stethoscope size={18} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '14px' }}>
                            {c.name}{' '}
                            {c.name_ar && (
                              <span style={{ fontSize: '12px', color: 'var(--muted-text)', fontWeight: 400 }}>
                                ({c.name_ar})
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--muted-text)' }}>
                            {c.specialty} · {c.region} · {c.classification}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--muted-text)', marginTop: '2px' }}>
                            {c.last_visit_date ? t('visits.new.lastVisit', { date: formatDisplayDate(c.last_visit_date) }) : t('visits.new.noRecentVisits')}
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          border: isSelected ? '6px solid var(--ocean)' : '2px solid var(--border-soft)',
                          background: 'var(--surface)',
                        }}
                      />
                    </div>
                  )
                })
              ) : (
                <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--muted-text)', fontSize: '13px' }}>
                  {t('visits.new.noActiveMatch')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Products & Reactions */}
        {currentStep === 2 && (
          <div style={{ flex: 1, overflowY: 'auto', maxHeight: '60vh', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                {t('visits.new.selectProductsLabel')}
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {productOptions.map((p) => {
                  const isSelected = selectedProducts.includes(p)
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setSelectedProducts(selectedProducts.filter((item) => item !== p))
                        } else {
                          setSelectedProducts([...selectedProducts, p])
                          if (!reactions[p]) {
                            setReactions((prev) => ({ ...prev, [p]: 'interested' }))
                          }
                        }
                      }}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '20px',
                        border: isSelected ? '1px solid var(--ocean)' : '1px solid var(--border-soft)',
                        background: isSelected ? 'var(--ocean)' : 'var(--surface-raised, transparent)',
                        color: isSelected ? '#ffffff' : 'inherit',
                        fontWeight: 600,
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      {isSelected && <Check size={14} />}
                      {p}
                    </button>
                  )
                })}
              </div>
            </div>

            {selectedProducts.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                  {t('visits.new.reactionLabel')}
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {selectedProducts.map((p) => {
                    const currentReaction = reactions[p] || 'interested'
                    return (
                      <div
                        key={p}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-soft)',
                          background: 'var(--surface-raised, rgba(0,0,0,0.02))',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px',
                        }}
                      >
                        <strong style={{ fontSize: '13px' }}>{p}</strong>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {reactionOptions.map((opt) => {
                            const isChosen = currentReaction === opt.id
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => setReactions((prev) => ({ ...prev, [p]: opt.id }))}
                                title={opt.label}
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  border: isChosen ? '1px solid var(--ocean)' : '1px solid var(--border-soft)',
                                  background: isChosen ? 'var(--ocean-light, rgba(2, 132, 199, 0.15))' : 'var(--surface)',
                                  fontSize: '15px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <span>{opt.emoji}</span>
                                <span style={{ fontSize: '11px', fontWeight: isChosen ? 700 : 400 }}>
                                  {opt.label}
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Samples Stepper */}
        {currentStep === 3 && (
          <div style={{ flex: 1, overflowY: 'auto', maxHeight: '60vh', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <span style={{ fontSize: '13px', color: 'var(--muted-text)' }}>
              {t('visits.new.samplesHint')}
            </span>

            {selectedProducts.map((p) => {
              const currentQty = samples[p] || 0
              const availableStock = getAvailableSampleStock(p)
              return (
                <div
                  key={p}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-soft)',
                    background: 'var(--surface-raised, rgba(0,0,0,0.02))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '14px', display: 'block' }}>{p}</strong>
                    <span style={{ fontSize: '12px', color: availableStock <= 5 ? 'var(--rose-text)' : 'var(--muted-text)' }}>
                      {t('visits.new.leftWithYou', { count: availableStock })}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      type="button"
                      disabled={currentQty <= 0}
                      onClick={() => setSamples((prev) => ({ ...prev, [p]: Math.max(0, currentQty - 1) }))}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-soft)',
                        background: 'var(--surface)',
                        cursor: currentQty <= 0 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: currentQty <= 0 ? 0.4 : 1,
                      }}
                    >
                      <Minus size={14} />
                    </button>
                    <span style={{ minWidth: '32px', textAlign: 'center', fontWeight: 700, fontSize: '15px' }}>
                      {currentQty}
                    </span>
                    <button
                      type="button"
                      disabled={currentQty >= availableStock}
                      onClick={() => setSamples((prev) => ({ ...prev, [p]: currentQty + 1 }))}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-soft)',
                        background: 'var(--surface)',
                        cursor: currentQty >= availableStock ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: currentQty >= availableStock ? 0.4 : 1,
                      }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Step 4: Notes & Scheduling */}
        {currentStep === 4 && (
          <div style={{ flex: 1, overflowY: 'auto', maxHeight: '60vh', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* GPS Location Verification */}
            {gpsStatus === 'verified' ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'rgba(22, 163, 74, 0.1)',
                  color: 'var(--green-text, #16a34a)',
                  border: '1px solid rgba(22, 163, 74, 0.25)',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                <MapPin size={16} />
                <span>{gpsLocationText ? `Coordinates Logged • ${gpsLocationText}` : t('visits.new.gpsVerified')}</span>
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'var(--surface-raised, rgba(0,0,0,0.03))',
                  border: '1px solid var(--border-soft)',
                  fontSize: '13px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted-text)' }}>
                  <MapPin size={16} />
                  <span>
                    {gpsStatus === 'permission_denied'
                      ? 'GPS Permission Denied'
                      : gpsStatus === 'unavailable'
                      ? 'GPS Unavailable'
                      : t('visits.detail.standardLog')}
                  </span>
                </div>
                <Button
                  variant="secondary"
                  type="button"
                  onClick={handleVerifyGps}
                  disabled={gpsVerifying}
                  style={{ height: '30px', padding: '0 12px', fontSize: '12px' }}
                >
                  {gpsVerifying ? 'Verifying...' : 'Capture GPS'}
                </Button>
              </div>
            )}

            {/* Next visit date */}
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                {t('visits.new.nextVisitDate')}
              </label>
              <div style={{ position: 'relative' }}>
                <Calendar
                  size={16}
                  style={{ position: 'absolute', insetInlineStart: '12px', top: '12px', color: 'var(--muted-text)' }}
                />
                <input
                  type="date"
                  value={nextVisitDate}
                  onChange={(e) => setNextVisitDate(e.target.value)}
                  style={{ width: '100%', paddingInlineStart: '38px', height: '40px' }}
                />
              </div>
              <span style={{ fontSize: '11px', color: 'var(--muted-text)', marginTop: '4px', display: 'block' }}>
                {t('visits.new.defaultedCycle', { classification: selectedClient?.classification || 'Class A' })}
              </span>
            </div>

            {/* Notes */}
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                {t('visits.new.notesLabel')}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('visits.new.notesPlaceholder')}
                rows={4}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        )}

        {/* Step 5: Saved Summary */}
        {currentStep === 5 && (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px 0',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(22, 163, 74, 0.12)',
                color: 'var(--green-text, #16a34a)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <Sparkles size={28} />
            </div>

            <h3 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 700 }}>
              {t('visits.new.successTitle')}
            </h3>
            <p style={{ margin: '0 0 20px', color: 'var(--muted-text)', fontSize: '14px' }}>
              {t('visits.new.successMessage')}
            </p>

            <div
              style={{
                width: '100%',
                textAlign: 'start',
                padding: '16px',
                borderRadius: '10px',
                background: 'var(--surface-raised, rgba(0,0,0,0.02))',
                border: '1px solid var(--border-soft)',
                marginBottom: '24px',
                fontSize: '13px',
                lineHeight: 1.8,
              }}
            >
              <div>
                <strong>{t('visits.new.summaryClient')}</strong> {selectedClient?.name} ({selectedClient?.specialty})
              </div>
              <div>
                <strong>{t('visits.new.summaryProducts')}</strong> {selectedProducts.join(', ')}
              </div>
              <div>
                <strong>{t('visits.new.summarySamples')}</strong>{' '}
                {t('visits.new.summaryUnitsTotal', { count: Object.values(samples).reduce((a, b) => a + b, 0) })}
              </div>
              <div>
                <strong>{t('visits.new.summaryNextVisit')}</strong> {formatDisplayDate(nextVisitDate)}
              </div>
              <div>
                <strong>{t('visits.new.summaryGps')}</strong>{' '}
                {gpsStatus === 'verified'
                  ? t('visits.new.verified')
                  : gpsStatus === 'permission_denied'
                  ? 'Permission Denied'
                  : gpsStatus === 'unavailable'
                  ? 'Location Unavailable'
                  : t('visits.detail.standardLog')}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
              <Button
                variant="secondary"
                onClick={handleResetForAnother}
                style={{ flex: 1, height: '42px' }}
              >
                {t('visits.new.addAnother')}
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  onClose()
                  if (savedVisitId) onViewVisit?.(savedVisitId)
                }}
                style={{ flex: 1, height: '42px' }}
              >
                {t('visits.new.viewVisit')}
              </Button>
            </div>
          </div>
        )}

        {/* Bottom Actions for steps 1 - 4 */}
        {currentStep < 5 && (
          <div
            className="sheet-actions"
            style={{
              position: 'sticky',
              bottom: 0,
              background: 'var(--surface, #ffffff)',
              padding: '16px 0',
              borderTop: '1px solid var(--border-soft)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 'auto',
            }}
          >
            {currentStep > 1 ? (
              <Button variant="secondary" type="button" onClick={handleBack}>
                <ChevronLeft size={16} style={{ marginRight: '4px' }} /> {t('common.back')}
              </Button>
            ) : (
              <Button variant="secondary" type="button" onClick={onClose}>
                {t('common.cancel')}
              </Button>
            )}

            <Button
              variant="primary"
              type="button"
              onClick={handleNext}
              loading={isSaving}
            >
              {currentStep === 4 ? (
                <>
                  <Check size={16} style={{ marginRight: '6px' }} /> {t('visits.new.saveVisit')}
                </>
              ) : (
                <>
                  {t('visits.new.continue')} <ChevronRight size={16} style={{ marginInlineStart: '4px' }} />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </Drawer>
  )
}
