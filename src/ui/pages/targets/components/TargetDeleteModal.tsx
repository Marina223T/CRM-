'use client'

import { AlertTriangle, Trash2 } from 'lucide-react'
import { Modal } from '@/ui/design-system/components/Modal'
import { Button } from '@/ui/design-system/components/Button'
import { useT } from '@/lib/i18n'
import { formatCurrency } from '@/lib/format'
import type { SalesTarget } from '@/data/mock/targets'

export interface TargetDeleteModalProps {
  isOpen: boolean
  target: SalesTarget | null
  onClose: () => void
  onConfirm: (id: string) => void
}

export function TargetDeleteModal({
  isOpen,
  target,
  onClose,
  onConfirm,
}: TargetDeleteModalProps) {
  const { t, lang } = useT()

  if (!target) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div style={{ padding: '24px', maxWidth: '440px', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(225, 29, 72, 0.1)',
              color: 'var(--rose, #e11d48)',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={22} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: 'var(--heading-text)' }}>
              {lang === 'ar' ? 'تأكيد حذف المستهدف' : 'Confirm Target Deletion'}
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: 'var(--muted-text)' }}>
              {lang === 'ar'
                ? 'هل أنت متأكد من رغبتك في حذف هذا المستهدف بشكل دائم؟'
                : 'Are you sure you want to permanently delete this sales target?'}
            </p>
          </div>
        </div>

        {/* Target Details Box */}
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '12px',
            background: 'var(--surface-raised, #f8fafc)',
            border: '1px solid var(--border-card, #e2e8f0)',
            marginBottom: '20px',
            fontSize: '13px',
          }}
        >
          <div style={{ fontWeight: 700, color: 'var(--heading-text)', marginBottom: '4px' }}>
            {lang === 'ar' && target.name_ar ? target.name_ar : target.name}
          </div>
          <div style={{ color: 'var(--muted-text)', fontSize: '12px' }}>
            {lang === 'ar' ? 'المندوب:' : 'Rep:'} {lang === 'ar' && target.repName_ar ? target.repName_ar : target.repName} · {formatCurrency(target.targetValue, 'EGP', lang)}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              onConfirm(target.id)
              onClose()
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--rose, #e11d48)',
              borderColor: 'var(--rose, #e11d48)',
              color: '#ffffff',
            }}
          >
            <Trash2 size={15} />
            <span>{lang === 'ar' ? 'حذف المستهدف' : 'Delete Target'}</span>
          </Button>
        </div>
      </div>
    </Modal>
  )
}
