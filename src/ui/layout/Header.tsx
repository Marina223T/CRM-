'use client'

import { ArrowLeft, Bell, Moon, Search, Sun } from 'lucide-react'
import { useGreeting } from '@/lib/useGreeting'
import { useT } from '@/lib/i18n'
import { LanguageSwitch } from '@/ui/design-system/components/LanguageSwitch'
import { notificationsStore } from '@/data/mock/notifications'
import { useStore } from '@/data/mock/store'

export interface HeaderProps {
  onOpenSearch: () => void
  onOpenNotifications: () => void
  onToggleDark: () => void
  dark: boolean
  role?: 'admin' | 'rep'
  onToggleRole?: () => void
  greetingName?: string
  nameAr?: string
  userInitials?: string
  user?: { name: string; name_ar?: string } | null
  onOpenProfile?: () => void
  activePage?: string
  onBack?: () => void
}

export function Header({
  onOpenSearch,
  onOpenNotifications,
  onToggleDark,
  dark,
  role = 'admin',
  greetingName = '',
  nameAr = '',
  userInitials,
  user,
  onOpenProfile,
  activePage = 'Home',
  onBack,
}: HeaderProps) {
  const { t, lang } = useT()
  const unreadCount = useStore(notificationsStore).filter((n) => n.unread).length
  const displayInitials = userInitials || (greetingName ? greetingName.slice(0, 2).toUpperCase() : 'U')
  const { greeting, dateLabel } = useGreeting(lang)

  const nowHour = new Date().getHours()
  const isMorning = nowHour >= 5 && nowHour < 12
  const firstNameAr = user?.name_ar ? user.name_ar.split(' ')[0] : (nameAr ? nameAr.split(' ')[0] : '')
  const firstNameEn = greetingName ? greetingName.split(' ')[0] : ''

  const headingText = lang === 'ar'
    ? (firstNameAr ? `${isMorning ? 'صباح الخير' : 'مساء الخير'}، ${firstNameAr}!` : `${isMorning ? 'صباح الخير' : 'مساء الخير'}!`)
    : (firstNameEn ? `${greeting}, ${firstNameEn}!` : `${greeting}!`)

  const showBack = activePage !== 'Home' && activePage !== 'Login' && activePage !== 'Dashboard'

  return (
    <header className="page-header">
      {/* Left / Start: Back button + Greeting */}
      <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {showBack && onBack && (
          <button
            onClick={onBack}
            aria-label={t('header.back')}
            title={t('header.back')}
            className="back-pill-btn header-back-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              height: '40px',
              padding: '0 14px',
              borderRadius: '999px',
              border: '1px solid var(--border-soft)',
              background: 'transparent',
              color: 'var(--body-text)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.15s, border-color 0.15s',
            }}
          >
            <ArrowLeft style={{ width: '16px', height: '16px' }} />
            <span>{t('header.back')}</span>
          </button>
        )}
        <div>
          <h2 className="header-greeting">{headingText}</h2>
          {dateLabel && (
            <span style={{ fontSize: '12px', color: 'var(--muted-text)', fontWeight: 500 }}>
              {dateLabel}
            </span>
          )}
        </div>
      </div>

      {/* Right / End: Controls */}
      <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Search */}
        <button
          className="header-search-pill"
          onClick={onOpenSearch}
          aria-label={t('header.search')}
        >
          <Search className="search-icon" />
          <span>{t('header.search')}</span>
          <kbd>⌘ K</kbd>
        </button>

        {/* Language switch */}
        <LanguageSwitch />

        {/* Light / Dark Toggle Switch */}
        <button
          className="theme-toggle-switch"
          onClick={onToggleDark}
          aria-label={dark ? t('header.lightMode') : t('header.darkMode')}
          title={dark ? t('header.lightMode') : t('header.darkMode')}
        >
          <span className={`switch-thumb ${dark ? 'dark' : 'light'}`}>
            {dark ? <Moon className="switch-icon" /> : <Sun className="switch-icon" />}
          </span>
        </button>

        {/* Notification Bell */}
        <button
          className="header-bell-btn"
          aria-label={t('header.notifications')}
          title={t('header.notifications')}
          onClick={onOpenNotifications}
        >
          <Bell />
          {unreadCount > 0 && <span className="bell-rose-dot" />}
        </button>

        {/* User Profile Avatar */}
        {onOpenProfile && (
          <button
            className="header-avatar-btn"
            onClick={onOpenProfile}
            aria-label={t('header.userMenu')}
            title={t('header.userMenu')}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--navy)',
              color: 'var(--text-on-dark)',
              border: '2px solid var(--border-subtle)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              marginInlineStart: '4px',
            }}
          >
            {displayInitials}
          </button>
        )}
      </div>
    </header>
  )
}
