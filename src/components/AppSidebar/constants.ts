import type { FileRouteTypes } from '@/routeTree.gen'
import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  CalendarClock,
  House,
  Landmark,
  ReceiptText,
  Repeat2,
  Settings,
  Tags,
  Target,
  TrendingUp,
  WalletCards,
} from 'lucide-react'

export type NavItem = {
  id: string
  title: string
  url?: FileRouteTypes['to']
  icon?: LucideIcon
  items?: NavItem[]
  badge?: string
}

type NavigationGroupId = 'overview' | 'finance' | 'insights' | 'account'
type MobilePlacement = 'primary' | 'more' | 'hidden'

type NavigationModule = NavItem & {
  group: NavigationGroupId
  sidebar: Readonly<{ visible: boolean; order: number }>
  mobile: Readonly<{ placement: MobilePlacement; order?: number }>
}

export type NavGroup = { id: NavigationGroupId; label: string; items: NavItem[] }

const module = (value: NavigationModule) => value

export const NAVIGATION_MODULES = [
  module({
    id: 'dashboard',
    title: 'Início',
    url: '/home',
    icon: House,
    group: 'overview',
    sidebar: { visible: true, order: 10 },
    mobile: { placement: 'primary', order: 10 },
  }),
  module({
    id: 'transactions',
    title: 'Transações',
    url: '/transactions',
    icon: ReceiptText,
    group: 'finance',
    sidebar: { visible: true, order: 20 },
    mobile: { placement: 'primary', order: 20 },
    items: [
      { id: 'transaction-list', title: 'Lançamentos', url: '/transactions', icon: ReceiptText },
      {
        id: 'transaction-installments',
        title: 'Parcelamentos',
        url: '/installments',
        icon: CalendarClock,
      },
      {
        id: 'transaction-recurring',
        title: 'Recorrências',
        url: '/recurring',
        icon: Repeat2,
      },
      { id: 'transaction-budgets', title: 'Orçamentos', url: '/budgets', icon: Target },
      { id: 'transaction-cards', title: 'Cartões', url: '/cards', icon: WalletCards },
    ],
  }),
  module({
    id: 'financial-structure',
    title: 'Estrutura financeira',
    url: '/accounts',
    icon: Landmark,
    group: 'finance',
    sidebar: { visible: true, order: 45 },
    mobile: { placement: 'more', order: 5 },
    items: [
      { id: 'financial-accounts', title: 'Contas', url: '/accounts', icon: Landmark },
      { id: 'financial-categories', title: 'Categorias', url: '/categories', icon: Tags },
    ],
  }),
  module({
    id: 'reports',
    title: 'Relatórios',
    url: '/reports',
    icon: BarChart3,
    group: 'insights',
    sidebar: { visible: true, order: 50 },
    mobile: { placement: 'more', order: 10 },
    items: [
      { id: 'reports-annual', title: 'Relatório anual', url: '/reports', icon: BarChart3 },
      {
        id: 'reports-forecast',
        title: 'Fluxo previsto',
        url: '/reports/forecast',
        icon: TrendingUp,
      },
    ],
  }),
  module({
    id: 'settings',
    title: 'Configurações',
    url: '/settings',
    icon: Settings,
    group: 'account',
    sidebar: { visible: false, order: 60 },
    mobile: { placement: 'more', order: 20 },
  }),
] satisfies NavigationModule[]

const groupDefinitions: readonly Readonly<{
  id: NavigationGroupId
  label: string
  order: number
}>[] = [
  { id: 'overview', label: 'Visão geral', order: 10 },
  { id: 'finance', label: 'Gestão financeira', order: 20 },
  { id: 'insights', label: 'Análises', order: 30 },
  { id: 'account', label: 'Conta e aplicativo', order: 40 },
]

const bySidebarOrder = (left: NavigationModule, right: NavigationModule) =>
  left.sidebar.order - right.sidebar.order

export const NAV_GROUPS: NavGroup[] = [...groupDefinitions]
  .sort((left, right) => left.order - right.order)
  .flatMap((group) => {
    const items = NAVIGATION_MODULES.filter(
      (item) => item.sidebar.visible && item.group === group.id,
    ).sort(bySidebarOrder)
    return items.length > 0 ? [{ id: group.id, label: group.label, items }] : []
  })

const mobileItems = (placement: Exclude<MobilePlacement, 'hidden'>) =>
  NAVIGATION_MODULES.filter((item) => item.mobile.placement === placement).sort(
    (left, right) => (left.mobile.order ?? 0) - (right.mobile.order ?? 0),
  )

export const BOTTOM_PRIMARY_ITEMS: readonly NavItem[] = mobileItems('primary')
export const BOTTOM_MORE_ITEMS: readonly NavItem[] = mobileItems('more')
