'use client'

import { useState } from 'react'
import { Activity } from 'lucide-react'
import { Button } from '@/ui/design-system/components/Button'
import { useT } from '@/lib/i18n'
import { SellOutMetrics } from './components/SellOutMetrics'
import { SellOutVelocity } from './components/SellOutVelocity'
import { SellOutTable } from './components/SellOutTable'
import { RecordSellOutDrawer } from './components/RecordSellOutDrawer'

export default function SellOutPage() {
  const { t } = useT()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [notice, setNotice] = useState('')

  const handleAction = (msg: string) => {
    setNotice(msg)
    window.setTimeout(() => setNotice(''), 2600)
  }

  return (
    <section className="content">
      <div className="page-intro">
        <div>
          <span className="eyebrow">
            <Activity /> {t('sellOut.eyebrow')}
          </span>
          <h1>{t('sellOut.title')}</h1>
          <p className="story">
            {t('sellOut.story')}
          </p>
        </div>
        <Button variant="primary" onClick={() => setDrawerOpen(true)}>
          {t('sellOut.recordNew')}
        </Button>
      </div>

      <div style={{ marginTop: '36px' }}>
        <SellOutMetrics />
        <SellOutVelocity />
      </div>

      <SellOutTable />

      <RecordSellOutDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
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
