'use client'

import { Info, Database, RotateCcw, Cloud, Server, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { Button } from '@/ui/design-system/components/Button'
import { useT } from '@/lib/i18n'
import { resetDemoData } from '@/data/mock/store'

export interface SystemInfoSectionProps {
  onAction?: (msg: string) => void
}

export function SystemInfoSection({ onAction }: SystemInfoSectionProps) {
  const { t, lang } = useT()

  const handleReset = () => {
    if (
      window.confirm(
        lang === 'ar'
          ? 'هل أنت متأكد من رغبتك في إعادة ضبط بيانات المحاكاة؟ سيتم استعادة كافة السجلات الافتراضية للفواتير والمستودعات والتحصيلات.'
          : 'Are you sure you want to reset all mock demo data? All invoices, warehouses, and collection payments will revert to seed defaults.',
      )
    ) {
      resetDemoData()
      onAction?.(lang === 'ar' ? 'تمت إعادة ضبط البيانات الافتراضية بنجاح' : 'Demo data restored to defaults')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* System Overview Card */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Server size={18} style={{ color: 'var(--sky, #0284c7)' }} />
          <strong style={{ fontSize: '15px', color: 'var(--heading-text)' }}>
            {lang === 'ar' ? 'معلومات بيئة النظام والإصدار' : 'System Environment & Build Information'}
          </strong>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '14px',
          }}
        >
          <div style={{ padding: '12px 14px', borderRadius: '12px', background: 'var(--surface-raised, #f8fafc)', border: '1px solid var(--border-subtle, #f1f5f9)' }}>
            <span style={{ fontSize: '11px', color: 'var(--muted-text)', display: 'block' }}>
              {lang === 'ar' ? 'اسم المنظومة' : 'Application Name'}
            </span>
            <strong style={{ fontSize: '14px', color: 'var(--heading-text)', display: 'block', marginTop: '2px' }}>
              Navigen Distribution Suite
            </strong>
          </div>

          <div style={{ padding: '12px 14px', borderRadius: '12px', background: 'var(--surface-raised, #f8fafc)', border: '1px solid var(--border-subtle, #f1f5f9)' }}>
            <span style={{ fontSize: '11px', color: 'var(--muted-text)', display: 'block' }}>
              {lang === 'ar' ? 'رقم الإصدار' : 'Version'}
            </span>
            <strong style={{ fontSize: '14px', color: 'var(--sky, #0284c7)', display: 'block', marginTop: '2px' }}>
              v2.4.0 (Enterprise Suite)
            </strong>
          </div>

          <div style={{ padding: '12px 14px', borderRadius: '12px', background: 'var(--surface-raised, #f8fafc)', border: '1px solid var(--border-subtle, #f1f5f9)' }}>
            <span style={{ fontSize: '11px', color: 'var(--muted-text)', display: 'block' }}>
              {lang === 'ar' ? 'محرك التخزين النشط' : 'Storage Engine'}
            </span>
            <strong style={{ fontSize: '14px', color: 'var(--emerald, #10b981)', display: 'block', marginTop: '2px' }}>
              Reactive Store (localStorage)
            </strong>
          </div>

          <div style={{ padding: '12px 14px', borderRadius: '12px', background: 'var(--surface-raised, #f8fafc)', border: '1px solid var(--border-subtle, #f1f5f9)' }}>
            <span style={{ fontSize: '11px', color: 'var(--muted-text)', display: 'block' }}>
              {lang === 'ar' ? 'الفترة المرجعية للنظام' : 'System Reference Period'}
            </span>
            <strong style={{ fontSize: '14px', color: 'var(--heading-text)', display: 'block', marginTop: '2px' }}>
              October 2026 (Q4 Cycle)
            </strong>
          </div>
        </div>
      </div>

      {/* Feature Capability Matrix: Live vs Future Backend */}
      <div
        style={{
          padding: '22px',
          borderRadius: '16px',
          border: '1px solid var(--border-card, #e2e8f0)',
          background: 'var(--card-bg, #ffffff)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        <div>
          <strong style={{ fontSize: '15px', color: 'var(--heading-text)', display: 'block' }}>
            {lang === 'ar' ? 'مصفوفة تكامل الإعدادات والقدرات' : 'Settings Capabilities Matrix'}
          </strong>
          <span style={{ fontSize: '12px', color: 'var(--muted-text)', marginTop: '2px', display: 'block' }}>
            {lang === 'ar'
              ? 'توضيح شفاف للتفضيلات الفعالة محلياً مقارنة بالإعدادات التي تتطلب خدمات سحابية خلفية'
              : 'Clear architectural boundary between live client-side preferences and future backend endpoints'}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            {
              title: lang === 'ar' ? 'لغة الواجهة وتخطيط RTL' : 'Language & RTL Layout',
              type: 'live',
              desc: lang === 'ar' ? 'يعمل بالكامل فورياً ويحفظ تفضيل المتصفح' : 'Fully functional in real-time; persists to client storage',
            },
            {
              title: lang === 'ar' ? 'السمة الداكنة والفاتحة' : 'Dark & Light Mode Themes',
              type: 'live',
              desc: lang === 'ar' ? 'يعمل بالكامل فورياً ويغير متغيرات CSS' : 'Fully functional in real-time; updates CSS tokens',
            },
            {
              title: lang === 'ar' ? 'تفضيلات فئات الإشعارات والكثافة' : 'Notification Categories & Density',
              type: 'live',
              desc: lang === 'ar' ? 'يعمل محلياً ويتحكم في فلاتر وتدفق الإشعارات' : 'Active in mock stores across active sessions',
            },
            {
              title: lang === 'ar' ? 'المزامنة السحابية المركزية مع قاعدة البيانات' : 'Central Database Sync & Replication',
              type: 'backend',
              desc: lang === 'ar' ? 'يتطلب ربط واجهات API وخوادم PostgreSQL/ERP في المراحل القادمة' : 'Planned for upcoming cloud backend and PostgreSQL service integration',
            },
            {
              title: lang === 'ar' ? 'إشعارات تيليجرام وخدمات البريد الفعلي' : 'Telegram Bot Webhooks & Push Services',
              type: 'backend',
              desc: lang === 'ar' ? 'يتطلب خادم وسيط ومفاتيح API لـ Telegram Bot و Push Gateway' : 'Requires external bot server and WebPush service credentials',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: '10px',
                background: 'var(--surface-raised, #f8fafc)',
                border: '1px solid var(--border-subtle, #f1f5f9)',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <div>
                <strong style={{ fontSize: '13px', color: 'var(--heading-text)' }}>{item.title}</strong>
                <span style={{ fontSize: '11.5px', color: 'var(--muted-text)', display: 'block', marginTop: '2px' }}>
                  {item.desc}
                </span>
              </div>

              <span
                style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  background: item.type === 'live' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                  color: item.type === 'live' ? 'var(--emerald, #10b981)' : '#64748b',
                }}
              >
                {item.type === 'live'
                  ? lang === 'ar' ? 'فعال في المتصفح' : 'Live Preference'
                  : lang === 'ar' ? 'يتطلب Backend قادم' : 'Backend Phase'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Reset Demo Data Maintenance */}
      <div
        style={{
          padding: '22px',
          borderRadius: '16px',
          border: '1.5px solid rgba(225, 29, 72, 0.25)',
          background: 'rgba(225, 29, 72, 0.02)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <strong style={{ fontSize: '15px', color: 'var(--rose, #e11d48)', display: 'block' }}>
            {t('admin.settings.demoDataTitle')}
          </strong>
          <span style={{ fontSize: '12px', color: 'var(--muted-text)', marginTop: '2px', display: 'block', maxWidth: '480px', lineHeight: 1.45 }}>
            {t('admin.settings.demoDataDesc')}
          </span>
        </div>

        <Button
          variant="secondary"
          type="button"
          onClick={handleReset}
          style={{
            background: 'rgba(225, 29, 72, 0.08)',
            borderColor: 'rgba(225, 29, 72, 0.3)',
            color: 'var(--rose, #e11d48)',
            fontWeight: 700,
            height: '40px',
            padding: '0 18px',
          }}
        >
          <RotateCcw size={15} style={{ marginInlineEnd: '6px' }} />
          {t('admin.settings.resetDemoButton')}
        </Button>
      </div>
    </div>
  )
}
