'use client'

import { useState } from 'react'
import {
  Settings2,
  User,
  SunMoon,
  Languages,
  Bell,
  ShieldCheck,
  Server,
} from 'lucide-react'
import { useT } from '@/lib/i18n'
import { AccountProfileSection } from './components/AccountProfileSection'
import { AppearanceSection } from './components/AppearanceSection'
import { LanguageRegionSection } from './components/LanguageRegionSection'
import { NotificationsPrefSection } from './components/NotificationsPrefSection'
import { SecurityAccessSection } from './components/SecurityAccessSection'
import { SystemInfoSection } from './components/SystemInfoSection'

export interface AdminSettingsPageProps {
  currentUserName?: string
  currentUserEmail?: string
  role?: 'admin' | 'rep'
  dark?: boolean
  onToggleDark?: () => void
  onAction?: (msg: string) => void
}

export default function AdminSettingsPage({
  currentUserName = 'Alex Morgan',
  currentUserEmail = 'alex.morgan@navigen.eg',
  role = 'admin',
  dark = false,
  onToggleDark,
  onAction,
}: AdminSettingsPageProps) {
  const { t, lang } = useT()
  const [activeSection, setActiveSection] = useState<
    'account' | 'appearance' | 'language' | 'notifications' | 'security' | 'system'
  >('account')

  const sections = [
    { id: 'account' as const, label: lang === 'ar' ? 'الحساب والملف الشخصي' : 'Account & Profile', icon: User },
    { id: 'appearance' as const, label: lang === 'ar' ? 'المظهر والسمة' : 'Appearance', icon: SunMoon },
    { id: 'language' as const, label: lang === 'ar' ? 'اللغة والمنطقة' : 'Language & Region', icon: Languages },
    { id: 'notifications' as const, label: lang === 'ar' ? 'تفضيلات الإشعارات' : 'Notifications', icon: Bell },
    { id: 'security' as const, label: lang === 'ar' ? 'الأمان والصلاحيات' : 'Security & Access', icon: ShieldCheck },
    { id: 'system' as const, label: lang === 'ar' ? 'معلومات النظام' : 'System Information', icon: Server },
  ]

  return (
    <section className="content" style={{ paddingBottom: '60px' }}>
      {/* Intro Header */}
      <div className="page-intro" style={{ marginBottom: '24px' }}>
        <div>
          <span className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Settings2 style={{ width: '14px', height: '14px' }} /> {t('admin.settings.eyebrow')}
          </span>
          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '6px 0 4px', color: 'var(--heading-text)' }}>
            {t('admin.settings.title')}
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted-text)', lineHeight: 1.45 }}>
            {t('admin.settings.story')}
          </p>
        </div>
      </div>

      {/* Main Settings Layout (Navigation Tabs + Section Content) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Section Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            borderBottom: '1px solid var(--border-card, #e2e8f0)',
            overflowX: 'auto',
            paddingBottom: '2px',
          }}
        >
          {sections.map((sec) => {
            const Icon = sec.icon
            const isActive = activeSection === sec.id

            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveSection(sec.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  border: 0,
                  borderBottom: isActive ? '2.5px solid var(--sky, #0284c7)' : '2.5px solid transparent',
                  background: 'transparent',
                  color: isActive ? 'var(--sky, #0284c7)' : 'var(--muted-text)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.15s ease',
                }}
              >
                <Icon size={16} />
                <span>{sec.label}</span>
              </button>
            )
          })}
        </div>

        {/* Active Section Content */}
        <div style={{ marginTop: '8px' }}>
          {activeSection === 'account' && (
            <AccountProfileSection
              currentUserName={currentUserName}
              currentUserEmail={currentUserEmail}
              role={role}
              onAction={onAction}
            />
          )}

          {activeSection === 'appearance' && (
            <AppearanceSection
              dark={dark}
              onToggleDark={onToggleDark}
              onAction={onAction}
            />
          )}

          {activeSection === 'language' && (
            <LanguageRegionSection
              onAction={onAction}
            />
          )}

          {activeSection === 'notifications' && (
            <NotificationsPrefSection
              onAction={onAction}
            />
          )}

          {activeSection === 'security' && (
            <SecurityAccessSection
              currentUserName={currentUserName}
              role={role}
              onAction={onAction}
            />
          )}

          {activeSection === 'system' && (
            <SystemInfoSection
              onAction={onAction}
            />
          )}
        </div>
      </div>
    </section>
  )
}
