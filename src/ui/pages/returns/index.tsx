'use client'

import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/ui/design-system/components/Button'
import { useT } from '@/lib/i18n'
import { ReturnsList } from './components/ReturnsList'
import { CreateReturnDrawer } from './components/CreateReturnDrawer'
import { ReturnDetailDrawer } from './components/ReturnDetailDrawer'

export interface ReturnsPageProps {
  onAction?: (msg: string) => void
}

export default function ReturnsPage({ onAction }: ReturnsPageProps) {
  const { t } = useT()
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [notice, setNotice] = useState('')

  const handleAction = (msg: string) => {
    setNotice(msg)
    if (onAction) onAction(msg)
    window.setTimeout(() => setNotice(''), 2600)
  }

  return (
    <section className="content">
      <div className="page-intro">
        <div>
          <span className="eyebrow">
            <RotateCcw /> {t('returns.eyebrow')}
          </span>
          <h1>{t('returns.title')}</h1>
          <p className="story">{t('returns.story')}</p>
        </div>
        <Button variant="primary" onClick={() => setCreateOpen(true)}>
          {t('returns.newRequest')}
        </Button>
      </div>

      <div style={{ marginTop: '36px' }}>
        <ReturnsList onSelect={(id) => setSelectedId(id)} />
      </div>

      <CreateReturnDrawer
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onAction={handleAction}
      />

      <ReturnDetailDrawer
        returnId={selectedId}
        onClose={() => setSelectedId(null)}
        onAction={handleAction}
      />

      {notice && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--surface-raised)',
            padding: '10px 20px',
            borderRadius: '12px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
            fontSize: '14px',
            fontWeight: 600,
            zIndex: 9999,
          }}
        >
          {notice}
        </div>
      )}
    </section>
  )
}
