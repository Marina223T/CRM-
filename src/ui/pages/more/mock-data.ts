import {
  Activity,
  ArrowUpRight,
  Boxes,
  Warehouse,
  TrendingUp,
  BadgeDollarSign,
  Settings2,
  SlidersHorizontal,
  Stethoscope,
  Target,
} from 'lucide-react'
import type { ElementType } from 'react'

export interface MoreLinkItem {
  name: string
  name_ar?: string
  icon: ElementType
  targetPage?: string
}

export const moreLinksMockData: MoreLinkItem[] = [
  { name: 'Distribution Overview', name_ar: 'نظرة عامة على التوزيع', icon: Boxes, targetPage: 'Distribution Overview' },
  { name: 'Warehouses', name_ar: 'المستودعات', icon: Warehouse, targetPage: 'Warehouses' },
  { name: 'Sell-out', name_ar: 'مبيعات الصيدليات', icon: Activity, targetPage: 'Sell-out' },
  { name: 'Performance Analytics', name_ar: 'تحليلات الأداء', icon: TrendingUp, targetPage: 'Performance Analytics' },
  { name: 'Cash In', name_ar: 'التحصيلات النقدية', icon: BadgeDollarSign, targetPage: 'Cash In' },
  { name: 'Visits', name_ar: 'الزيارات', icon: Stethoscope, targetPage: 'Visits' },
  { name: 'Targets', name_ar: 'الأهداف', icon: Target, targetPage: 'Targets' },
  { name: 'Admin panel', name_ar: 'لوحة الإدارة', icon: Settings2, targetPage: 'Admin' },
  { name: 'Settings', name_ar: 'الإعدادات', icon: SlidersHorizontal, targetPage: 'Settings' },
]
