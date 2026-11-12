import type { ElementType } from 'react'
import { FileText, Home, MoreHorizontal, Package, Users } from 'lucide-react'
import { canAccessPage, type User, type UserRole } from '@/lib/auth'
import { useT } from '@/lib/i18n'

export interface DockItem {
  label: string
  pageKey: string
  icon: ElementType
}

export interface BottomDockProps {
  active: string
  onSelect: (label: string) => void
  user?: User | null
  role?: UserRole
}

export function BottomDock({ active, onSelect, user, role = 'rep' }: BottomDockProps) {
  const { t } = useT()

  const allNav: DockItem[] = [
    { label: t('nav.dashboard'), pageKey: 'Home', icon: Home },
    { label: t('nav.clients'), pageKey: 'Clients', icon: Users },
    { label: t('nav.invoices'), pageKey: 'Invoices', icon: FileText },
    { label: t('nav.stock'), pageKey: 'Stock', icon: Package },
    { label: t('nav.more'), pageKey: 'More', icon: MoreHorizontal },
  ]

  const nav = allNav.filter((item) => {
    if (item.pageKey === 'Home' || item.pageKey === 'More') return true
    return canAccessPage(item.pageKey, role, user)
  })

  return (
    <nav className="bottom-dock" aria-label="Primary navigation">
      {nav.map(({ label, pageKey, icon: Icon }) => (
        <button
          key={pageKey}
          className={
            active === pageKey ||
            (pageKey === 'Invoices' && (active === 'Invoices & Sell-in' || active === 'Sell-in'))
              ? 'active'
              : ''
          }
          onClick={() => onSelect(pageKey === 'Invoices' ? 'Invoices & Sell-in' : pageKey)}
        >
          <Icon />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}
