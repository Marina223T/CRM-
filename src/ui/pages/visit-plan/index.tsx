import { useState } from 'react'
import { CalendarDays, Route, Briefcase, Plus, Edit3 } from 'lucide-react'
import { Button } from '@/ui/design-system/components/Button'
import { StatusPill } from '@/ui/design-system/components/StatusPill'
import { Toast } from '@/ui/design-system/components/Toast'
import { useT } from '@/lib/i18n'
import { formatDate } from '@/lib/format'
import { useStore } from '@/data/mock/store'
import { visitPlansStore, type VisitPlan } from '@/data/mock/visit-plans'
import { PlanCalendar } from './components/PlanCalendar'
import { RouteStops } from './components/RouteStops'
import { EditVisitPlanDrawer } from './components/EditVisitPlanDrawer'
import { VacationManagement } from './components/VacationManagement'

export interface VisitPlanPageProps {
  role?: 'admin' | 'rep'
  currentUserName?: string
}

export default function VisitPlanPage({
  role = 'admin',
  currentUserName = 'Alex Morgan',
}: VisitPlanPageProps) {
  const { t, lang } = useT()
  const visitPlans = useStore(visitPlansStore)

  const [activeTab, setActiveTab] = useState<'plans' | 'calendar' | 'vacations'>('plans')
  const [editingPlan, setEditingPlan] = useState<VisitPlan | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const notify = (msg: string) => {
    setToastMessage(msg)
    window.setTimeout(() => setToastMessage(null), 3000)
  }

  return (
    <section className="content">
      <div className="page-intro">
        <div>
          <span className="eyebrow">
            <CalendarDays /> {t('visitPlan.eyebrow')}
          </span>
          <h1>{t('visitPlan.title')}</h1>
          <p className="story">{t('visitPlan.subtitle')}</p>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', margin: '24px 0 16px' }}>
        <button
          type="button"
          onClick={() => setActiveTab('plans')}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            border: activeTab === 'plans' ? '1px solid var(--accent-primary, #2563eb)' : '1px solid var(--border-soft)',
            background: activeTab === 'plans' ? 'rgba(37, 99, 235, 0.1)' : 'var(--surface)',
            color: activeTab === 'plans' ? 'var(--accent-primary, #2563eb)' : 'var(--muted-text)',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Route size={15} />
          {lang === 'ar' ? 'خطط الزيارات' : 'Visit Plans'} ({visitPlans.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('calendar')}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            border: activeTab === 'calendar' ? '1px solid #059669' : '1px solid var(--border-soft)',
            background: activeTab === 'calendar' ? 'rgba(16, 185, 129, 0.1)' : 'var(--surface)',
            color: activeTab === 'calendar' ? '#059669' : 'var(--muted-text)',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <CalendarDays size={15} />
          {lang === 'ar' ? 'التقويم التفاعلي الموحد' : 'Unified Calendar'}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('vacations')}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            border: activeTab === 'vacations' ? '1px solid #d97706' : '1px solid var(--border-soft)',
            background: activeTab === 'vacations' ? 'rgba(245, 158, 11, 0.1)' : 'var(--surface)',
            color: activeTab === 'vacations' ? '#d97706' : 'var(--muted-text)',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Briefcase size={15} />
          {lang === 'ar' ? 'إجازات الموظفين' : 'Employee Vacations'}
        </button>
      </div>

      {/* TAB 1: VISIT PLANS */}
      {activeTab === 'plans' && (
        <div style={{ marginTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px' }}>
                {lang === 'ar' ? 'الخطط الميدانية النشطة والمسودات' : 'Field Visit Plans'}
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--muted-text)' }}>
                {lang === 'ar'
                  ? 'إدارة الخطط الشهرية والأسبوعية وتحديد المستهدفين'
                  : 'Manage weekly/monthly target routes, assigned representatives, and target organizations'}
              </span>
            </div>
          </div>

          <div className="collection-list">
            {visitPlans.map((plan) => (
              <div
                key={plan.id}
                className="collection-card"
                style={{
                  padding: '16px 20px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-soft)',
                  background: 'var(--surface)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  marginBottom: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ocean)' }}>
                        {plan.id}
                      </span>
                      <strong style={{ fontSize: '15px' }}>{plan.name}</strong>
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--muted-text)' }}>
                      👤 {plan.repName} · 📅 {formatDate(plan.startDate, lang)} &rarr; {formatDate(plan.endDate, lang)} · ⏱️ {plan.frequency}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <StatusPill status={plan.status} />
                    <Button
                      variant="secondary"
                      type="button"
                      style={{ fontSize: '12px', height: '30px', padding: '0 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      onClick={() => setEditingPlan(plan)}
                    >
                      <Edit3 size={13} />
                      {lang === 'ar' ? 'تعديل الخطة' : 'Edit Plan'}
                    </Button>
                  </div>
                </div>

                <div style={{ fontSize: '12px', color: 'var(--muted-text)', lineHeight: 1.5 }}>
                  <div>
                    <strong>{lang === 'ar' ? 'المستهدفون: ' : 'Target Clients: '}</strong>
                    {plan.targetClients.join(', ')}
                  </div>
                  <div>
                    <strong>{lang === 'ar' ? 'المنتجات / الحملات: ' : 'Planned Products: '}</strong>
                    {plan.plannedProducts.join(', ')}
                  </div>
                  {plan.notes && (
                    <div style={{ marginTop: '4px', fontStyle: 'italic' }}>
                      &ldquo;{plan.notes}&rdquo;
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '24px' }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '14px', color: 'var(--muted-text)' }}>
              {t('visitPlan.todayRoute')}
            </h4>
            <RouteStops />
          </div>
        </div>
      )}

      {/* TAB 2: UNIFIED INTERACTIVE CALENDAR */}
      {activeTab === 'calendar' && (
        <div>
          <PlanCalendar />
        </div>
      )}

      {/* TAB 3: EMPLOYEE VACATIONS */}
      {activeTab === 'vacations' && (
        <div>
          <VacationManagement
            role={role}
            currentUserName={currentUserName}
            onAction={notify}
          />
        </div>
      )}

      {/* Edit Visit Plan Drawer */}
      <EditVisitPlanDrawer
        plan={editingPlan}
        isOpen={Boolean(editingPlan)}
        onClose={() => setEditingPlan(null)}
        onSaved={(updated) => {
          notify(lang === 'ar' ? `تم تحديث خطة ${updated.name}` : `Plan ${updated.name} updated successfully`)
        }}
        currentUserName={currentUserName}
      />

      {toastMessage && <Toast message={toastMessage} />}
    </section>
  )
}
