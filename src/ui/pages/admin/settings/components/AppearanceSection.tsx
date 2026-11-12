'use client'

import { Sun, Moon, Layout, Eye, Check } from 'lucide-react'
import { useT } from '@/lib/i18n'
import { useStore } from '@/data/mock/store'
import { settingsStore, updatePreferences } from '@/data/mock/settings'

export interface AppearanceSectionProps {
  dark?: boolean
  onToggleDark?: () => void
  onAction?: (msg: string) => void
}

export function AppearanceSection({
  dark = false,
  onToggleDark,
  onAction,
}: AppearanceSectionProps) {
  const { t, lang } = useT()
  const prefs = useStore(settingsStore)

  const handleDensityChange = (density: 'comfortable' | 'compact') => {
    updatePreferences({ tableDensity: density })
    onAction?.(lang === 'ar' ? 'تم تحديث كثافة العرض' : 'Display density updated')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Theme Card */}
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
              {lang === 'ar' ? 'سمة الواجهة ونمط الألوان' : 'Interface Theme & Color Scheme'}
            </strong>
            <span style={{ fontSize: '12px', color: 'var(--muted-text)', marginTop: '2px', display: 'block' }}>
              {lang === 'ar' ? 'التبديل بين النمط الفاتح والداكن للنظام' : 'Switch between light and dark visual themes'}
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
          {/* Light Theme Card */}
          <button
            type="button"
            onClick={() => {
              if (dark && onToggleDark) onToggleDark()
            }}
            style={{
              padding: '16px',
              borderRadius: '14px',
              border: !dark ? '2px solid var(--sky, #0284c7)' : '1px solid var(--border-card, #e2e8f0)',
              background: !dark ? 'rgba(2, 132, 199, 0.04)' : 'var(--card-bg, #ffffff)',
              cursor: 'pointer',
              textAlign: 'start',
              position: 'relative',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  color: '#f59e0b',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Sun size={18} />
              </div>
              {!dark && (
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
            <strong style={{ fontSize: '14px', color: 'var(--heading-text)', display: 'block' }}>
              {lang === 'ar' ? 'النمط الفاتح (Light Mode)' : 'Light Theme'}
            </strong>
            <span style={{ fontSize: '11.5px', color: 'var(--muted-text)', marginTop: '3px', display: 'block' }}>
              {lang === 'ar' ? 'المظهر الافتراضي المريح للعين في النهار' : 'Crisp high-contrast day mode palette'}
            </span>
          </button>

          {/* Dark Theme Card */}
          <button
            type="button"
            onClick={() => {
              if (!dark && onToggleDark) onToggleDark()
            }}
            style={{
              padding: '16px',
              borderRadius: '14px',
              border: dark ? '2px solid var(--sky, #0284c7)' : '1px solid var(--border-card, #e2e8f0)',
              background: dark ? 'rgba(2, 132, 199, 0.08)' : 'var(--card-bg, #ffffff)',
              cursor: 'pointer',
              textAlign: 'start',
              position: 'relative',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: '#0f172a',
                  border: '1px solid #334155',
                  color: '#38bdf8',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Moon size={18} />
              </div>
              {dark && (
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
            <strong style={{ fontSize: '14px', color: 'var(--heading-text)', display: 'block' }}>
              {lang === 'ar' ? 'النمط الداكن (Dark Mode)' : 'Dark Theme'}
            </strong>
            <span style={{ fontSize: '11.5px', color: 'var(--muted-text)', marginTop: '3px', display: 'block' }}>
              {lang === 'ar' ? 'مظهر مهدئ ومريح للإضاءة المنخفضة' : 'Low-glare palette for night & low-light'}
            </span>
          </button>
        </div>
      </div>

      {/* Table & Display Density */}
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
        <div>
          <strong style={{ fontSize: '15px', color: 'var(--heading-text)', display: 'block' }}>
            {lang === 'ar' ? 'كثافة عرض الجداول والقوائم' : 'Table & Collection Density'}
          </strong>
          <span style={{ fontSize: '12px', color: 'var(--muted-text)', marginTop: '2px', display: 'block' }}>
            {lang === 'ar' ? 'التحكم في التباعد الرأسي وارتفاع صفوف الجداول' : 'Adjust row spacing and compact data density'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => handleDensityChange('comfortable')}
            style={{
              flex: '1 1 200px',
              padding: '14px 16px',
              borderRadius: '12px',
              border: prefs.tableDensity === 'comfortable' ? '2px solid var(--sky, #0284c7)' : '1px solid var(--border-input, #cbd5e1)',
              background: prefs.tableDensity === 'comfortable' ? 'rgba(2, 132, 199, 0.05)' : 'var(--card-bg, #ffffff)',
              color: 'var(--heading-text)',
              cursor: 'pointer',
              textAlign: 'start',
            }}
          >
            <strong style={{ fontSize: '13.5px', display: 'block' }}>
              {lang === 'ar' ? 'مريح (Comfortable)' : 'Comfortable Density'}
            </strong>
            <span style={{ fontSize: '11.5px', color: 'var(--muted-text)', marginTop: '2px', display: 'block' }}>
              {lang === 'ar' ? 'تباعد متسع ومريح للقراءة السريعة' : 'Standard padding and row height'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleDensityChange('compact')}
            style={{
              flex: '1 1 200px',
              padding: '14px 16px',
              borderRadius: '12px',
              border: prefs.tableDensity === 'compact' ? '2px solid var(--sky, #0284c7)' : '1px solid var(--border-input, #cbd5e1)',
              background: prefs.tableDensity === 'compact' ? 'rgba(2, 132, 199, 0.05)' : 'var(--card-bg, #ffffff)',
              color: 'var(--heading-text)',
              cursor: 'pointer',
              textAlign: 'start',
            }}
          >
            <strong style={{ fontSize: '13.5px', display: 'block' }}>
              {lang === 'ar' ? 'مضغوط (Compact)' : 'Compact Density'}
            </strong>
            <span style={{ fontSize: '11.5px', color: 'var(--muted-text)', marginTop: '2px', display: 'block' }}>
              {lang === 'ar' ? 'عرض مكثف لمزيد من الصفوف في الشاشة' : 'Dense layout displaying more rows simultaneously'}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
