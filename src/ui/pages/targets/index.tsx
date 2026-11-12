'use client'

import { useState, useMemo } from 'react'
import {
  Target,
  Plus,
  Search,
  X,
  Filter,
  TrendingUp,
  Award,
  Calendar,
  Users,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/ui/design-system/components/Button'
import { EmptyState } from '@/ui/design-system/components/EmptyState'
import { Toast } from '@/ui/design-system/components/Toast'
import { useT } from '@/lib/i18n'
import { formatCurrency } from '@/lib/format'
import { useStore } from '@/data/mock/store'
import {
  targetsStore,
  createTarget,
  updateTarget,
  deleteTarget,
  calculateTargetProgress,
  type SalesTarget,
  type TargetPeriod,
} from '@/data/mock/targets'
import { invoicesStore } from '@/data/mock/invoices'
import { salesOrdersStore } from '@/data/mock/sales-orders'
import { usersStore } from '@/data/mock/users'
import { TargetCard } from './components/TargetCard'
import { TargetFormModal } from './components/TargetFormModal'
import { TargetDeleteModal } from './components/TargetDeleteModal'

export interface TargetsPageProps {
  role?: 'admin' | 'rep'
  currentUserName?: string
  onAction?: (msg: string) => void
}

export default function TargetsPage({
  role = 'admin',
  currentUserName = 'Alex Morgan',
  onAction,
}: TargetsPageProps) {
  const { t, lang } = useT()

  // Reactive Stores: Targets, Invoices, Sales Orders, Users
  const targets = useStore(targetsStore)
  const invoices = useStore(invoicesStore)
  const salesOrders = useStore(salesOrdersStore)
  const users = useStore(usersStore)

  // Modals State
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTarget, setEditingTarget] = useState<SalesTarget | null>(null)
  const [deletingTarget, setDeletingTarget] = useState<SalesTarget | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Filters State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState<string>('All Periods')
  const [selectedRep, setSelectedRep] = useState<string>(
    role === 'rep' ? currentUserName : 'All Representatives',
  )

  const showToast = (msg: string) => {
    setToastMessage(msg)
    onAction?.(msg)
    window.setTimeout(() => setToastMessage(null), 3500)
  }

  // Get list of reps for filter dropdown
  const availableReps = useMemo(() => {
    const list = users.filter((u) => u.roleType === 'rep' || u.role.toLowerCase().includes('representative'))
    return list.map((r) => r.name)
  }, [users])

  // Role scoping: Reps see their assigned targets by default
  const roleScopedTargets = useMemo(() => {
    if (role === 'rep') {
      return targets.filter((tgt) => tgt.repName.toLowerCase() === currentUserName.toLowerCase())
    }
    return targets
  }, [targets, role, currentUserName])

  // Filtered targets
  const filteredTargets = useMemo(() => {
    return roleScopedTargets.filter((tgt) => {
      // 1. Search Query
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const matchName = tgt.name.toLowerCase().includes(q) || (tgt.name_ar && tgt.name_ar.toLowerCase().includes(q))
        const matchRep = tgt.repName.toLowerCase().includes(q) || (tgt.repName_ar && tgt.repName_ar.toLowerCase().includes(q))
        if (!matchName && !matchRep) return false
      }

      // 2. Period Filter
      if (selectedPeriod !== 'All Periods') {
        if (tgt.period !== selectedPeriod) return false
      }

      // 3. Representative Filter (for Admins)
      if (role !== 'rep' && selectedRep !== 'All Representatives') {
        if (tgt.repName.toLowerCase() !== selectedRep.toLowerCase()) return false
      }

      return true
    })
  }, [roleScopedTargets, searchQuery, selectedPeriod, selectedRep, role])

  // Overall KPI Progress across all scoped targets
  const overallKpis = useMemo(() => {
    let totalTargetGoal = 0
    let totalAchieved = 0

    roleScopedTargets.forEach((tgt) => {
      totalTargetGoal += tgt.targetValue
      const prog = calculateTargetProgress(tgt, invoices, salesOrders)
      totalAchieved += prog.achievedAmount
    })

    const overallPercent = totalTargetGoal > 0 ? Math.round((totalAchieved / totalTargetGoal) * 100) : 0
    const overallRemaining = Math.max(0, totalTargetGoal - totalAchieved)

    return {
      totalTargetGoal,
      totalAchieved,
      overallPercent,
      overallRemaining,
      count: roleScopedTargets.length,
    }
  }, [roleScopedTargets, invoices, salesOrders])

  // Handlers for Target Management
  const handleOpenCreate = () => {
    setEditingTarget(null)
    setIsFormOpen(true)
  }

  const handleOpenEdit = (target: SalesTarget) => {
    setEditingTarget(target)
    setIsFormOpen(true)
  }

  const handleSaveTarget = (data: Omit<SalesTarget, 'id' | 'createdAt'>) => {
    if (editingTarget) {
      updateTarget(editingTarget.id, data, currentUserName)
      showToast(
        lang === 'ar'
          ? `تم تحديث المستهدف "${data.name}" بنجاح`
          : `Target "${data.name}" updated successfully`,
      )
    } else {
      createTarget(data, currentUserName)
      showToast(
        lang === 'ar'
          ? `تم إنشاء المستهدف "${data.name}" بنجاح`
          : `Target "${data.name}" created successfully`,
      )
    }
  }

  const handleDeleteConfirm = (id: string) => {
    const success = deleteTarget(id, currentUserName)
    if (success) {
      showToast(
        lang === 'ar'
          ? 'تم حذف المستهدف بنجاح وتحديث التقارير'
          : 'Sales target deleted successfully',
      )
    }
  }

  return (
    <section className="content" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div className="page-intro" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="eyebrow">
            <Target /> {t('targets.eyebrow')}
          </span>
          <h1>{t('targets.title')}</h1>
          <p className="story">
            {lang === 'ar'
              ? 'إدارة حصص ومستهدفات المبيعات لمندوبي الدعاية وتتبع الإيرادات ونسب التحقيق في الوقت الفعلي.'
              : 'Manage sales quotas for medical representatives and track real-time revenue pacing.'}
          </p>
        </div>

        {/* Action: Create Target */}
        <div>
          <Button
            variant="primary"
            onClick={handleOpenCreate}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              height: '42px',
              padding: '0 18px',
              borderRadius: '14px',
              fontWeight: 700,
            }}
          >
            <Plus size={17} />
            <span>{lang === 'ar' ? 'إنشاء مستهدف جديد' : 'Create Target'}</span>
          </Button>
        </div>
      </div>

      {/* KPI Overview Strip (When targets exist) */}
      {roleScopedTargets.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '14px',
          }}
        >
          {/* KPI 1: Overall Target Value */}
          <div
            style={{
              padding: '18px 20px',
              borderRadius: '18px',
              background: 'var(--card-bg, #ffffff)',
              border: '1px solid var(--border-card, #e2e8f0)',
              boxShadow: 'var(--card-shadow)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted-text)' }}>
                {lang === 'ar' ? 'إجمالي قيمة المستهدفات' : 'Total Target Goal'}
              </span>
              <Target size={17} style={{ color: 'var(--sky, #0284c7)' }} />
            </div>
            <strong style={{ fontSize: '22px', fontWeight: 800, color: 'var(--heading-text)', display: 'block' }}>
              {formatCurrency(overallKpis.totalTargetGoal, 'EGP', lang)}
            </strong>
            <span style={{ fontSize: '11px', color: 'var(--muted-text)', marginTop: '4px', display: 'block' }}>
              {lang === 'ar' ? `${overallKpis.count} مستهدفات نشطة` : `${overallKpis.count} active sales quotas`}
            </span>
          </div>

          {/* KPI 2: Total Achieved Revenue */}
          <div
            style={{
              padding: '18px 20px',
              borderRadius: '18px',
              background: 'var(--card-bg, #ffffff)',
              border: '1px solid var(--border-card, #e2e8f0)',
              boxShadow: 'var(--card-shadow)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted-text)' }}>
                {lang === 'ar' ? 'الإيرادات المحققة فعلياً' : 'Achieved Revenue'}
              </span>
              <TrendingUp size={17} style={{ color: 'var(--emerald, #10b981)' }} />
            </div>
            <strong style={{ fontSize: '22px', fontWeight: 800, color: 'var(--emerald, #10b981)', display: 'block' }}>
              {formatCurrency(overallKpis.totalAchieved, 'EGP', lang)}
            </strong>
            <span style={{ fontSize: '11px', color: 'var(--muted-text)', marginTop: '4px', display: 'block' }}>
              {lang === 'ar' ? 'محسوبة تلقائياً من الفواتير وأوامر البيع' : 'Calculated automatically from sales invoices'}
            </span>
          </div>

          {/* KPI 3: Attainment Rate */}
          <div
            style={{
              padding: '18px 20px',
              borderRadius: '18px',
              background: 'var(--card-bg, #ffffff)',
              border: '1px solid var(--border-card, #e2e8f0)',
              boxShadow: 'var(--card-shadow)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted-text)' }}>
                {lang === 'ar' ? 'نسبة الإنجاز الإجمالية' : 'Overall Attainment'}
              </span>
              <Award size={17} style={{ color: overallKpis.overallPercent >= 100 ? 'var(--emerald)' : 'var(--sky, #0284c7)' }} />
            </div>
            <strong style={{ fontSize: '22px', fontWeight: 800, color: overallKpis.overallPercent >= 100 ? 'var(--emerald, #10b981)' : 'var(--sky, #0284c7)', display: 'block' }}>
              {overallKpis.overallPercent}%
            </strong>
            <span style={{ fontSize: '11px', color: 'var(--muted-text)', marginTop: '4px', display: 'block' }}>
              {lang === 'ar' ? `المتبقي: ${formatCurrency(overallKpis.overallRemaining, 'EGP', lang)}` : `Remaining: ${formatCurrency(overallKpis.overallRemaining, 'EGP', lang)}`}
            </span>
          </div>
        </div>
      )}

      {/* Target Management Toolbar / Filters */}
      {roleScopedTargets.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: '380px' }}>
            <Search
              size={15}
              style={{
                position: 'absolute',
                top: '50%',
                transform: 'translateY(-50%)',
                insetInlineStart: '12px',
                color: 'var(--muted-text)',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'ar' ? 'البحث باسم المستهدف أو المندوب...' : 'Search by target or representative...'}
              style={{
                width: '100%',
                height: '40px',
                paddingInlineStart: '36px',
                paddingInlineEnd: searchQuery ? '36px' : '12px',
                borderRadius: '12px',
                border: '1px solid var(--border-input, #cbd5e1)',
                background: 'var(--card-bg, #ffffff)',
                color: 'var(--heading-text)',
                fontSize: '13px',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  insetInlineEnd: '10px',
                  border: 0,
                  background: 'transparent',
                  color: 'var(--muted-text)',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter Dropdowns: Period & Rep */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Period Filter */}
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              style={{
                height: '40px',
                padding: '0 12px',
                borderRadius: '12px',
                border: '1px solid var(--border-input, #cbd5e1)',
                background: 'var(--card-bg, #ffffff)',
                color: 'var(--heading-text)',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              <option value="All Periods">{lang === 'ar' ? 'كل الفترات' : 'All Periods'}</option>
              <option value="Monthly">{lang === 'ar' ? 'شهري (Monthly)' : 'Monthly'}</option>
              <option value="Quarterly">{lang === 'ar' ? 'ربع سنوي (Quarterly)' : 'Quarterly'}</option>
            </select>

            {/* Rep Filter (Admin only) */}
            {role !== 'rep' && (
              <select
                value={selectedRep}
                onChange={(e) => setSelectedRep(e.target.value)}
                style={{
                  height: '40px',
                  padding: '0 12px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-input, #cbd5e1)',
                  background: 'var(--card-bg, #ffffff)',
                  color: 'var(--heading-text)',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                <option value="All Representatives">{lang === 'ar' ? 'كل المندوبين' : 'All Representatives'}</option>
                {availableReps.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      )}

      {/* Target Cards Grid */}
      {roleScopedTargets.length === 0 ? (
        /* Empty State: No targets exist in the system */
        <div
          style={{
            padding: '50px 24px',
            borderRadius: '20px',
            background: 'var(--card-bg, #ffffff)',
            border: '1px dashed var(--border-card, #cbd5e1)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'rgba(2, 132, 199, 0.1)',
              color: 'var(--sky, #0284c7)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Target size={28} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--heading-text)' }}>
              {lang === 'ar' ? 'لا توجد مستهدفات مبيعات محددة بعد' : 'No sales targets defined yet'}
            </h3>
            <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: 'var(--muted-text)', maxWidth: '440px' }}>
              {lang === 'ar'
                ? 'ابدأ بتحديد حصص ومستهدفات المبيعات الشهرية أو الربع سنوية لمندوبي الدعاية لمتابعة معدل الإنجاز والإيرادات في الوقت الفعلي.'
                : 'Define monthly or quarterly revenue quotas for your sales representatives to track real-time performance.'}
            </p>
          </div>
          <Button variant="primary" onClick={handleOpenCreate} style={{ marginTop: '8px' }}>
            <Plus data-icon="inline-start" />
            <span>{lang === 'ar' ? 'إنشاء أول مستهدف' : 'Create First Target'}</span>
          </Button>
        </div>
      ) : filteredTargets.length === 0 ? (
        /* Empty State: Filters yielded no match */
        <EmptyState
          message={
            lang === 'ar'
              ? 'لم يتم العثور على أي مستهدفات تطابق معايير البحث والتصفية المحددة.'
              : 'No sales targets match your selected filter criteria.'
          }
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '18px',
          }}
        >
          {filteredTargets.map((target) => {
            const progress = calculateTargetProgress(target, invoices, salesOrders)
            return (
              <TargetCard
                key={target.id}
                target={target}
                progress={progress}
                onEdit={handleOpenEdit}
                onDelete={(t) => setDeletingTarget(t)}
                canManage={role === 'admin'}
              />
            )
          })}
        </div>
      )}

      {/* Target Form Modal (Create / Edit) */}
      <TargetFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setEditingTarget(null)
        }}
        onSave={handleSaveTarget}
        targetToEdit={editingTarget}
      />

      {/* Target Delete Confirmation Modal */}
      <TargetDeleteModal
        isOpen={Boolean(deletingTarget)}
        target={deletingTarget}
        onClose={() => setDeletingTarget(null)}
        onConfirm={handleDeleteConfirm}
      />

      {/* Toast Notification */}
      {toastMessage && <Toast message={toastMessage} />}
    </section>
  )
}
