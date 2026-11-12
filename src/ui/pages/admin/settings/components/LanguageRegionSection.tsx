'use client'

import { Languages, Calendar, Coins, Check, ArrowRightLeft } from 'lucide-react'
import { useT, type Language } from '@/lib/i18n'
import { useStore } from '@/data/mock/store'
import { settingsStore, updatePreferences } from '@/data/mock/settings'

export interface LanguageRegionSectionProps {
  onAction?: (msg: string) => void
}

export function LanguageRegionSection({ onAction }: LanguageRegionSectionProps) {
  const { t, lang, setLang } = useT()
  const prefs = useStore(settingsStore)

  const handleLanguageChange = (newLang: Language) => {
    if (newLang !== lang) {
      setLang(newLang)
      onAction?.(newLang === 'ar' ? 'تم تحويل لغة النظام إلى العربية' : 'System language switched to English')
    }
  }

  const handleCurrencyChange = (curr: string) => {
    updatePreferences({ currency: curr })
    onAction?.(lang === 'ar' ? 'تم تحديث العملة الأساسية' : 'Primary currency updated')
  }

  const handleDateFormatChange = (df: string) => {
    updatePreferences({ dateFormat: df })
    onAction?.(lang === 'ar' ? 'تم تحديث تنسيق التاريخ' : 'Date format preference updated')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Language Selection Card */}
      <div
        style={{
          padding: '22px',
          borderRadius: '16px',
          border: '1px solid var(--border-card, #e2e8f0)',
          background: 'var(--card-bg, #ffffff)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <strong style={{ fontSize: '15px', color: 'var(--heading-text)', display: 'block' }}>
              {lang === 'ar' ? 'لغة النظام واتجاه الصفحة' : 'System Language & Layout Direction'}
            </strong>
            <span style={{ fontSize: '12px', color: 'var(--muted-text)', marginTop: '2px', display: 'block' }}>
              {lang === 'ar' ? 'تغيير لغة العرض وتفعيل تخطيط RTL للغة العربية' : 'Select active interface language with automatic RTL alignment'}
            </span>
          </div>

          <span
            style={{
              padding: '3px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 700,
              background: 'rgba(16, 185, 129, 0.1)',
              color: 'var(--emerald, #10b981)',
            }}
          >
            {lang === 'ar' ? 'تفضيل حي فعال' : 'Live Preference'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          {/* English Option */}
          <button
            type="button"
            onClick={() => handleLanguageChange('en')}
            style={{
              padding: '16px',
              borderRadius: '14px',
              border: lang === 'en' ? '2px solid var(--sky, #0284c7)' : '1px solid var(--border-card, #e2e8f0)',
              background: lang === 'en' ? 'rgba(2, 132, 199, 0.05)' : 'var(--card-bg, #ffffff)',
              cursor: 'pointer',
              textAlign: 'start',
              position: 'relative',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '20px' }}>🇬🇧</span>
              {lang === 'en' && (
                <span
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: 'var(--sky, #0284c7)',
                    color: '#ffffff',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: '11px',
                  }}
                >
                  <Check size={13} />
                </span>
              )}
            </div>
            <strong style={{ fontSize: '14.5px', color: 'var(--heading-text)', display: 'block' }}>
              English (US)
            </strong>
            <span style={{ fontSize: '12px', color: 'var(--muted-text)', marginTop: '2px', display: 'block' }}>
              Left-to-Right (LTR) Layout
            </span>
          </button>

          {/* Arabic Option */}
          <button
            type="button"
            onClick={() => handleLanguageChange('ar')}
            style={{
              padding: '16px',
              borderRadius: '14px',
              border: lang === 'ar' ? '2px solid var(--sky, #0284c7)' : '1px solid var(--border-card, #e2e8f0)',
              background: lang === 'ar' ? 'rgba(2, 132, 199, 0.05)' : 'var(--card-bg, #ffffff)',
              cursor: 'pointer',
              textAlign: 'start',
              position: 'relative',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '20px' }}>🇪🇬</span>
              {lang === 'ar' && (
                <span
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: 'var(--sky, #0284c7)',
                    color: '#ffffff',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: '11px',
                  }}
                >
                  <Check size={13} />
                </span>
              )}
            </div>
            <strong style={{ fontSize: '14.5px', color: 'var(--heading-text)', display: 'block' }}>
              العربية (مصر)
            </strong>
            <span style={{ fontSize: '12px', color: 'var(--muted-text)', marginTop: '2px', display: 'block' }}>
              تخطيط من اليمين إلى اليسار (RTL)
            </span>
          </button>
        </div>
      </div>

      {/* Regional Currencies & Date Format */}
      <div
        style={{
          padding: '22px',
          borderRadius: '16px',
          border: '1px solid var(--border-card, #e2e8f0)',
          background: 'var(--card-bg, #ffffff)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '18px',
        }}
      >
        {/* Primary Currency */}
        <div>
          <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--muted-text)', marginBottom: '6px' }}>
            {lang === 'ar' ? 'العملة الأساسية للمعاملات' : 'Default Currency'}
          </label>
          <div style={{ position: 'relative' }}>
            <Coins size={15} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', insetInlineStart: '12px', color: 'var(--muted-text)' }} />
            <select
              value={prefs.currency}
              onChange={(e) => handleCurrencyChange(e.target.value)}
              style={{
                width: '100%',
                height: '42px',
                paddingInlineStart: '36px',
                paddingInlineEnd: '12px',
                borderRadius: '12px',
                border: '1px solid var(--border-input, #cbd5e1)',
                background: 'var(--card-bg, #ffffff)',
                color: 'var(--heading-text)',
                fontSize: '13.5px',
              }}
            >
              <option value="EGP">{lang === 'ar' ? 'جنيه مصري (EGP - ج.م)' : 'EGP - Egyptian Pound'}</option>
              <option value="USD">{lang === 'ar' ? 'دولار أمريكي (USD - $)' : 'USD - US Dollar'}</option>
              <option value="EUR">{lang === 'ar' ? 'يورو (EUR - €)' : 'EUR - Euro'}</option>
            </select>
          </div>
        </div>

        {/* Date Format */}
        <div>
          <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--muted-text)', marginBottom: '6px' }}>
            {lang === 'ar' ? 'تنسيق عرض التاريخ' : 'Date Format'}
          </label>
          <div style={{ position: 'relative' }}>
            <Calendar size={15} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', insetInlineStart: '12px', color: 'var(--muted-text)' }} />
            <select
              value={prefs.dateFormat}
              onChange={(e) => handleDateFormatChange(e.target.value)}
              style={{
                width: '100%',
                height: '42px',
                paddingInlineStart: '36px',
                paddingInlineEnd: '12px',
                borderRadius: '12px',
                border: '1px solid var(--border-input, #cbd5e1)',
                background: 'var(--card-bg, #ffffff)',
                color: 'var(--heading-text)',
                fontSize: '13.5px',
              }}
            >
              <option value="YYYY-MM-DD">YYYY-MM-DD (2026-10-26)</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY (26/10/2026)</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY (10/26/2026)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
