import { useState, useEffect } from 'react'
import { ArrowLeft, Settings2 } from 'lucide-react'
import { Button } from '@/ui/design-system/components/Button'
import { useT } from '@/lib/i18n'
import { AdminNavCards } from './components/AdminNavCards'
import AdminUsersPage from './users'
import AdminProductsPage from './products'
import AdminTerritoriesPage from './territories'
import AdminAuditLogPage from './audit-log'
import AdminSettingsPage from './settings'

export interface AdminPageProps {
  initialSubpage?: string
  filter?: string | null
  currentUserName?: string
  currentUserEmail?: string
  role?: 'admin' | 'rep'
  dark?: boolean
  onToggleDark?: () => void
  onAction?: (msg: string) => void
}

export default function AdminPage({
  initialSubpage,
  filter,
  currentUserName = 'Alex Morgan',
  currentUserEmail = 'alex.morgan@navigen.eg',
  role = 'admin',
  dark = false,
  onToggleDark,
  onAction,
}: AdminPageProps) {
  const { t } = useT()
  const [selected, setSelected] = useState<string | null>(initialSubpage || null)

  useEffect(() => {
    if (initialSubpage) setSelected(initialSubpage)
  }, [initialSubpage])

  if (selected === 'users') {
    return (
      <div>
        <div style={{ padding: '24px 32px 0' }}>
          <Button variant="text" onClick={() => setSelected(null)}>
            <ArrowLeft /> {t('admin.backToAdmin')}
          </Button>
        </div>
        <AdminUsersPage initialTab={filter === 'pending' ? 'pending' : 'all'} />
      </div>
    )
  }

  if (selected === 'products') {
    return (
      <div>
        <div style={{ padding: '24px 32px 0' }}>
          <Button variant="text" onClick={() => setSelected(null)}>
            <ArrowLeft /> {t('admin.backToAdmin')}
          </Button>
        </div>
        <AdminProductsPage />
      </div>
    )
  }

  if (selected === 'territories') {
    return (
      <div>
        <div style={{ padding: '24px 32px 0' }}>
          <Button variant="text" onClick={() => setSelected(null)}>
            <ArrowLeft /> {t('admin.backToAdmin')}
          </Button>
        </div>
        <AdminTerritoriesPage />
      </div>
    )
  }

  if (selected === 'audit-log') {
    return (
      <div>
        <div style={{ padding: '24px 32px 0' }}>
          <Button variant="text" onClick={() => setSelected(null)}>
            <ArrowLeft /> {t('admin.backToAdmin')}
          </Button>
        </div>
        <AdminAuditLogPage />
      </div>
    )
  }

  if (selected === 'settings') {
    return (
      <div>
        <div style={{ padding: '24px 32px 0' }}>
          <Button variant="text" onClick={() => setSelected(null)}>
            <ArrowLeft /> {t('admin.backToAdmin')}
          </Button>
        </div>
        <AdminSettingsPage
          currentUserName={currentUserName}
          currentUserEmail={currentUserEmail}
          role={role}
          dark={dark}
          onToggleDark={onToggleDark}
          onAction={onAction}
        />
      </div>
    )
  }

  return (
    <section className="content">
      <div className="page-intro" style={{ marginBottom: '20px' }}>
        <div>
          <span className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Settings2 style={{ width: '13px', height: '13px' }} /> {t('admin.eyebrow')}
          </span>
          <h1 style={{ fontSize: '36px', margin: '6px 0 4px', lineHeight: 1.1 }}>{t('admin.title')}</h1>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted-text)', lineHeight: 1.4 }}>
            {t('admin.story')}
          </p>
        </div>
      </div>

      <AdminNavCards onSelect={setSelected} />
    </section>
  )
}
