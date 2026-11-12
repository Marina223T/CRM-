'use client'

import { useRef } from 'react'
import type { ElementType } from 'react'
import {
  Activity, ArrowUpRight, BarChart2, Boxes, CalendarDays, ChevronLeft, ChevronRight,
  ClipboardCheck, FileText, LayoutGrid, MapPin, Package,
  Power, RotateCcw, Settings2, Shield, Stethoscope, Target, TrendingUp, User, Users,
  Warehouse, Wallet, BadgeDollarSign,
} from 'lucide-react'
import { canAccessPage, type User as AuthUser } from '@/lib/auth'
import { storedUsersStore } from '@/lib/auth/mock-users'
import { invoicesStore } from '@/data/mock/invoices'
import { useStore } from '@/data/mock/store'
import { useT, type TranslationKey } from '@/lib/i18n'
import { Logo } from './Logo'

const NAV_LABEL_MAP: Record<string, TranslationKey> = {
  'Dashboard': 'nav.dashboard',
  'Clients': 'nav.clients',
  'Invoices': 'nav.invoices',
  'Stock': 'nav.stock',
  'Sell-in': 'nav.sellIn',
  'Sell-out': 'nav.sellOut',
  'Distribution Management': 'nav.distributionManagement',
  'Distribution Overview': 'nav.distributionOverview',
  'Invoices & Sell-in': 'nav.invoicesSellIn',
  'Warehouses': 'nav.warehouses',
  'Performance Analytics': 'nav.performanceAnalytics',
  'Cash In': 'nav.cashIn',
  'Returns': 'nav.returns',
  'Targets': 'nav.targets',
  'Visits': 'nav.visits',
  'Visit plan': 'nav.visitPlan',
  'Budgets': 'nav.budgets',
  'Reports': 'nav.reports',
  'Admin': 'nav.admin',
  'Users': 'nav.users',
  'Products & Batches': 'nav.catalog',
  'Territories': 'nav.territories',
  'Audit log': 'nav.audit',
  'Settings': 'nav.settings',
  'My scorecard': 'nav.scorecard',
  'My profile': 'nav.profile',
}

export interface SidebarProps {
  active: string
  onSelect: (label: string) => void
  role?: 'admin' | 'rep'
  collapsed?: boolean
  onToggleCollapse?: () => void
  onOpenLogout: () => void
  userName?: string
  userEmail?: string
  user?: AuthUser | null
}

export function Sidebar({
  active,
  onSelect,
  role = 'admin',
  collapsed = false,
  onToggleCollapse,
  onOpenLogout,
  userName = 'User',
  userEmail = '',
  user,
}: SidebarProps) {
  const { t, lang } = useT()
  const scrollRef = useRef<HTMLDivElement>(null)
  const pendingCount = useStore(storedUsersStore).filter((u) => u.status === 'pending').length
  const pendingInvoiceCount = useStore(invoicesStore).filter((i) => i.status === 'Pending').length

  const displayName = lang === 'ar' ? (user?.name_ar || userName) : userName

  interface NavItem {
    label: string
    activeKey: string
    icon: ElementType
    badge?: string
    badgeTone?: 'amber'
  }

  interface NavSection {
    id: string
    title?: string
    items: NavItem[]
  }

  // Standard items visible to both Admin and Rep
  const generalNav: NavItem[] = [
    { label: 'Dashboard', activeKey: 'Home', icon: LayoutGrid },
    { label: 'Clients', activeKey: 'Clients', icon: Users },
    { label: 'Stock', activeKey: 'Stock', icon: Package },
    { label: 'Returns', activeKey: 'Returns', icon: RotateCcw },
    { label: 'Targets', activeKey: 'Targets', icon: Target },
    { label: 'Visits', activeKey: 'Visits', icon: Stethoscope },
    { label: 'Visit plan', activeKey: 'Visit plan', icon: CalendarDays },
    { label: 'Budgets', activeKey: 'Budgets', icon: Wallet },
  ]

  // Distribution Management items
  const distributionNav: NavItem[] = [
    { label: 'Distribution Overview', activeKey: 'Distribution Overview', icon: Boxes },
    { label: 'Invoices & Sell-in', activeKey: 'Invoices & Sell-in', icon: FileText, badge: pendingInvoiceCount > 0 ? String(pendingInvoiceCount) : undefined },
    { label: 'Warehouses', activeKey: 'Warehouses', icon: Warehouse },
    { label: 'Sell-out', activeKey: 'Sell-out', icon: Activity },
    { label: 'Performance Analytics', activeKey: 'Performance Analytics', icon: TrendingUp },
    { label: 'Cash In', activeKey: 'Cash In', icon: BadgeDollarSign },
  ]

  // Admin-only items
  const adminNav: NavItem[] = [
    { label: 'Reports', activeKey: 'Reports', icon: BarChart2 },
    { label: 'Admin', activeKey: 'Admin', icon: Shield },
    {
      label: 'Users',
      activeKey: 'Users',
      icon: Users,
      badge: pendingCount > 0 ? String(pendingCount) : undefined,
      badgeTone: 'amber',
    },
    { label: 'Products & Batches', activeKey: 'Products & Batches', icon: Package },
    { label: 'Territories', activeKey: 'Territories', icon: MapPin },
    { label: 'Audit log', activeKey: 'Audit log', icon: ClipboardCheck },
    { label: 'Settings', activeKey: 'Settings', icon: Settings2 },
  ]

  // Rep-only items
  const repNav: NavItem[] = [
    { label: 'My scorecard', activeKey: 'Reports', icon: BarChart2 },
    { label: 'My profile', activeKey: 'Profile', icon: User },
  ]

  const sections: NavSection[] = [
    {
      id: 'general',
      items: generalNav.filter((item) => canAccessPage(item.activeKey, role, user)),
    },
    {
      id: 'distribution',
      title: 'Distribution Management',
      items: distributionNav.filter((item) => canAccessPage(item.activeKey, role, user)),
    },
    {
      id: 'admin-or-rep',
      title: canAccessPage('Admin', role, user) ? 'Admin' : undefined,
      items: (canAccessPage('Admin', role, user) ? adminNav : repNav).filter((item) =>
        item.activeKey === 'Profile' || canAccessPage(item.activeKey, role, user)
      ),
    },
  ]

  return (
    <aside
      className={`app-sidebar ${collapsed ? 'is-collapsed' : ''}`}
      aria-label="Main Navigation"
    >
      {/* Brand Logo & Name */}
      <div
        style={{
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
          overflow: 'visible',
        }}
      >
        <Logo showText={!collapsed} textColor="#FFFFFF" />
      </div>

      {/* Top Profile Zone (Fixed) */}
      <div className="sidebar-top">
        <div className="sidebar-avatar-wrap">
          <div className="sidebar-avatar" aria-hidden="true">
            {displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
        </div>

        {!collapsed && (
          <div className="sidebar-profile-info">
            <span className="sidebar-user-name">{displayName}</span>
            <span className="sidebar-user-email">{userEmail}</span>
          </div>
        )}

        {onToggleCollapse && (
          <button
            className="sidebar-collapse-btn"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight /> : <ChevronLeft />}
          </button>
        )}
      </div>

      {/* Middle Nav Items Zone (Scrollable with thin scrollbar & edge mask) */}
      <div ref={scrollRef} className="sidebar-scroll-zone">
        <nav className="sidebar-nav-list" aria-label="Sidebar Links">
          {sections.map((section) => {
            if (section.items.length === 0) return null
            return (
              <div key={section.id} className="sidebar-group-wrapper">
                {section.title && (
                  collapsed ? (
                    <div className="sidebar-group-divider" aria-hidden="true" />
                  ) : (
                    <div className="sidebar-group-title">
                      {NAV_LABEL_MAP[section.title] ? t(NAV_LABEL_MAP[section.title]) : section.title}
                    </div>
                  )
                )}
                {section.items.map((item) => {
                  const Icon = item.icon
                  const isItemActive =
                    active === item.activeKey ||
                    (item.activeKey === 'Home' && active === 'Dashboard') ||
                    (item.activeKey === 'Invoices & Sell-in' && (active === 'Invoices' || active === 'Sell-in'))
                  const translatedLabel = NAV_LABEL_MAP[item.label] ? t(NAV_LABEL_MAP[item.label]) : item.label

                  return (
                    <button
                      key={item.label}
                      className={`sidebar-nav-item ${isItemActive ? 'active' : ''}`}
                      onClick={() => onSelect(item.activeKey)}
                      title={translatedLabel}
                      aria-label={translatedLabel}
                    >
                      <div className="sidebar-item-icon">
                        <Icon />
                      </div>
                      {!collapsed && (
                        <span className="sidebar-item-label">{translatedLabel}</span>
                      )}
                      {!collapsed && item.badge && (
                        <span
                          className="sidebar-item-badge"
                          style={{
                            background: item.badgeTone === 'amber' ? 'var(--amber, #f59e0b)' : undefined,
                            color: item.badgeTone === 'amber' ? '#fff' : undefined,
                            fontWeight: 700,
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                      {collapsed && item.badge && (
                        <span
                          style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: item.badgeTone === 'amber' ? 'var(--amber, #f59e0b)' : 'var(--ocean)',
                          }}
                        />
                      )}
                    </button>
                  )
                })}
              </div>
            )
          })}
        </nav>
      </div>

      {/* Bottom Log out Zone (Fixed) */}
      <div className="sidebar-bottom">
        <button
          className="sidebar-logout-btn"
          onClick={onOpenLogout}
          title={t('nav.logout')}
          aria-label={t('nav.logout')}
        >
          <div className="sidebar-item-icon">
            <Power />
          </div>
          {!collapsed && <span>{t('nav.logout')}</span>}
        </button>
      </div>
    </aside>
  )
}
