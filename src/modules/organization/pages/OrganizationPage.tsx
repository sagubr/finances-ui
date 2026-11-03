import { ResourceViewToolbar } from '@/components/ResourceViewToolbar'
import Table from '@/components/Table'
import { civilDateColumn, dateTimeColumn } from '@/components/Table/columns/date.columns'
import { TooltipButton } from '@/components/TooltipButton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useResourceViewMode } from '@/hooks/use-resource-view-mode'
import { getDomainLabel } from '@/lib/domain-labels'
import { formatMoney } from '@/modules/transactions/utils/money'
import {
  getActiveWorkspaceRole,
  workspaceAccessStore,
} from '@/modules/workspaces/store/workspace-access.store'
import { formatDatePtBr, formatDateTimePtBr } from '@/utils/date'
import { useQuery } from '@tanstack/react-query'
import { useStore } from '@tanstack/react-store'
import type { ColumnDef } from '@tanstack/react-table'
import { Bell, Check, ListTodo, Pencil, Sparkles, Target, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { organizationApi } from '../api/organization.api'
import { ActivityForm, GoalForm, WishlistForm } from '../components/OrganizationForms'
import type { Activity, Goal, Notification, WishlistItem } from '../models/organization.types'
import {
  activitiesQuery,
  goalsQuery,
  notificationsQuery,
  useOrganizationMutation,
  wishlistQuery,
} from '../queries/organization.queries'

type DialogName = 'activity' | 'goal' | 'wishlist' | null
export type OrganizationSection = 'goals' | 'wishlist' | 'activities' | 'notifications'

const sectionMetadata: Record<
  OrganizationSection,
  Readonly<{ title: string; description: string }>
> = {
  goals: {
    title: 'Metas',
    description: 'Defina resultados financeiros e acompanhe sua evolução.',
  },
  wishlist: {
    title: 'Lista de desejos',
    description: 'Organize desejos e prepare suas próximas conquistas.',
  },
  activities: {
    title: 'Atividades',
    description: 'Organize atividades conectadas ao seu planejamento.',
  },
  notifications: {
    title: 'Notificações',
    description: 'Acompanhe alertas e atualizações importantes do seu espaço financeiro.',
  },
}

export const OrganizationPage = ({ section }: Readonly<{ section: OrganizationSection }>) => {
  const activities = useQuery({ ...activitiesQuery(), enabled: section === 'activities' })
  const goals = useQuery({ ...goalsQuery(), enabled: section === 'goals' })
  const wishlist = useQuery({ ...wishlistQuery(), enabled: section === 'wishlist' })
  const notifications = useQuery({
    ...notificationsQuery(),
    enabled: section === 'notifications',
  })
  const read = useOrganizationMutation(organizationApi.readNotification)
  const readAll = useOrganizationMutation(organizationApi.readAllNotifications)
  const readOnly = useStore(workspaceAccessStore, getActiveWorkspaceRole) === 'VIEWER'
  const [dialog, setDialog] = useState<DialogName>(null)
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const [deletingActivity, setDeletingActivity] = useState<Activity | null>(null)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [deletingGoal, setDeletingGoal] = useState<Goal | null>(null)
  const [editingWishlist, setEditingWishlist] = useState<WishlistItem | null>(null)
  const [deletingWishlist, setDeletingWishlist] = useState<WishlistItem | null>(null)
  const removeActivity = useOrganizationMutation(organizationApi.removeActivity)
  const removeGoal = useOrganizationMutation(organizationApi.removeGoal)
  const removeWishlist = useOrganizationMutation(organizationApi.removeWishlistItem)
  const [activityView, setActivityView] = useResourceViewMode('organization-activities', 'list')
  const [goalView, setGoalView] = useResourceViewMode('organization-goals', 'grid')
  const [wishlistView, setWishlistView] = useResourceViewMode('organization-wishlist', 'list')
  const [notificationView, setNotificationView] = useResourceViewMode(
    'organization-notifications',
    'list',
  )
  const activityColumns = useMemo<ColumnDef<Activity>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Atividade',
        size: 320,
        cell: ({ row }) => (
          <span className="flex items-center gap-2">
            <span
              className="size-3 rounded-full"
              style={{ backgroundColor: row.original.color ?? '#64748B' }}
            />
            {row.original.name}
          </span>
        ),
      },
      {
        accessorKey: 'archivedAt',
        header: 'Situação',
        size: 160,
        cell: ({ row }) => (row.original.archivedAt ? 'Arquivada' : 'Ativa'),
      },
      {
        id: 'actions',
        header: 'Ações',
        size: 120,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <TooltipButton
              title="Editar atividade"
              variant="ghost"
              size="icon"
              disabled={readOnly}
              onClick={() => setEditingActivity(row.original)}
            >
              <Pencil />
            </TooltipButton>
            <TooltipButton
              title="Excluir atividade"
              variant="ghost"
              size="icon"
              disabled={readOnly}
              onClick={() => setDeletingActivity(row.original)}
            >
              <Trash2 className="text-destructive" />
            </TooltipButton>
          </div>
        ),
      },
    ],
    [readOnly],
  )
  const goalColumns = useMemo<ColumnDef<Goal>[]>(
    () => [
      { accessorKey: 'name', header: 'Meta', size: 320 },
      {
        accessorKey: 'targetValue',
        header: 'Alvo',
        size: 160,
        cell: ({ row }) => `${row.original.targetValue} ${row.original.unit}`,
      },
      {
        accessorKey: 'status',
        header: 'Situação',
        size: 140,
        cell: ({ row }) => getDomainLabel(row.original.status),
      },
      civilDateColumn<Goal>('startsOn', { header: 'Início', size: 140 }),
      {
        id: 'actions',
        header: 'Ações',
        size: 120,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <TooltipButton
              title="Editar meta"
              variant="ghost"
              size="icon"
              disabled={readOnly}
              onClick={() => setEditingGoal(row.original)}
            >
              <Pencil />
            </TooltipButton>
            <TooltipButton
              title="Excluir meta"
              variant="ghost"
              size="icon"
              disabled={readOnly}
              onClick={() => setDeletingGoal(row.original)}
            >
              <Trash2 className="text-destructive" />
            </TooltipButton>
          </div>
        ),
      },
    ],
    [readOnly],
  )
  const wishlistColumns = useMemo<ColumnDef<WishlistItem>[]>(
    () => [
      { accessorKey: 'name', header: 'Desejo', size: 320 },
      {
        accessorKey: 'estimatedPriceCents',
        header: 'Estimativa',
        size: 180,
        cell: ({ row }) =>
          row.original.estimatedPriceCents
            ? formatMoney(row.original.estimatedPriceCents, row.original.currency)
            : '—',
      },
      { accessorKey: 'priority', header: 'Prioridade', size: 120 },
      {
        accessorKey: 'status',
        header: 'Situação',
        size: 160,
        cell: ({ row }) => getDomainLabel(row.original.status),
      },
      {
        id: 'actions',
        header: 'Ações',
        size: 120,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <TooltipButton
              title="Editar desejo"
              variant="ghost"
              size="icon"
              disabled={readOnly}
              onClick={() => setEditingWishlist(row.original)}
            >
              <Pencil />
            </TooltipButton>
            <TooltipButton
              title="Excluir desejo"
              variant="ghost"
              size="icon"
              disabled={readOnly}
              onClick={() => setDeletingWishlist(row.original)}
            >
              <Trash2 className="text-destructive" />
            </TooltipButton>
          </div>
        ),
      },
    ],
    [readOnly],
  )
  const notificationColumns = useMemo<ColumnDef<Notification>[]>(
    () => [
      { accessorKey: 'title', header: 'Notificação', size: 300 },
      { accessorKey: 'body', header: 'Mensagem', size: 420 },
      dateTimeColumn<Notification>('createdAt', { header: 'Recebida em', size: 190 }),
      {
        id: 'actions',
        header: 'Ações',
        size: 150,
        cell: ({ row }) =>
          row.original.readAt ? (
            'Lida'
          ) : (
            <Button
              variant="ghost"
              size="sm"
              disabled={read.isPending}
              onClick={() => read.mutate(row.original.id)}
            >
              <Check /> Marcar como lida
            </Button>
          ),
      },
    ],
    [read],
  )
  const table = <T extends { id: string }>(columns: ColumnDef<T>[], items: T[]) => (
    <div className="h-[500px] rounded-xl border">
      <Table<T>
        columns={columns}
        data={items}
        getRowId={(item) => item.id}
        enableRowSelection={false}
        shouldRenderCheckbox={false}
      />
    </div>
  )
  const close = () => setDialog(null)
  const metadata = sectionMetadata[section]
  return (
    <div className="flex flex-col gap-6">
      <header className="border-b pb-5">
        <h1 className="font-heading text-2xl font-semibold">{metadata.title}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{metadata.description}</p>
      </header>
      {section === 'goals' && (
        <section className="space-y-4">
          <ResourceViewToolbar
            count={goals.data?.items.length ?? 0}
            label="metas"
            viewMode={goalView}
            onViewModeChange={setGoalView}
            onCreate={() => setDialog('goal')}
            createLabel="Nova meta"
            createDisabled={readOnly}
          />
          {goalView === 'list' ? (
            table(goalColumns, goals.data?.items ?? [])
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {goals.data?.items.map((goal) => (
                <Card
                  key={goal.id}
                  className="hover:border-primary/40 transition-all hover:shadow-xs"
                >
                  <CardHeader className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-xs">
                        {getDomainLabel(goal.status)}
                      </span>
                      <span className="text-muted-foreground text-[11px]">{goal.unit}</span>
                    </div>
                    <div className="flex gap-2">
                      <Target className="text-primary mt-0.5 size-4" />
                      <CardTitle className="text-base">{goal.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl font-semibold">
                      {goal.targetValue} {goal.unit}
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      Início em {formatDatePtBr(goal.startsOn)}
                    </p>
                  </CardContent>
                  <CardFooter className="flex gap-2 border-t pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 flex-1 rounded-full"
                      disabled={readOnly}
                      onClick={() => setEditingGoal(goal)}
                    >
                      <Pencil /> Editar
                    </Button>
                    <TooltipButton
                      title="Excluir meta"
                      variant="outline"
                      size="icon"
                      className="text-destructive size-8 rounded-full"
                      disabled={readOnly}
                      onClick={() => setDeletingGoal(goal)}
                    >
                      <Trash2 />
                    </TooltipButton>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}
      {section === 'wishlist' && (
        <section className="space-y-4">
          <ResourceViewToolbar
            count={wishlist.data?.items.length ?? 0}
            label="desejos"
            viewMode={wishlistView}
            onViewModeChange={setWishlistView}
            onCreate={() => setDialog('wishlist')}
            createLabel="Novo desejo"
            createDisabled={readOnly}
          />
          {wishlistView === 'list' ? (
            table(wishlistColumns, wishlist.data?.items ?? [])
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {wishlist.data?.items.map((item) => (
                <Card
                  key={item.id}
                  className="hover:border-primary/40 transition-all hover:shadow-xs"
                >
                  <CardHeader className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-xs">
                        {getDomainLabel(item.status)}
                      </span>
                      <span className="text-muted-foreground text-[11px]">
                        Prioridade {item.priority}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Sparkles className="text-primary mt-0.5 size-4" />
                      <CardTitle className="text-base">{item.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="text-xl font-semibold">
                    {item.estimatedPriceCents
                      ? formatMoney(item.estimatedPriceCents, item.currency)
                      : 'Sem estimativa'}
                  </CardContent>
                  <CardFooter className="flex gap-2 border-t pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 flex-1 rounded-full"
                      disabled={readOnly}
                      onClick={() => setEditingWishlist(item)}
                    >
                      <Pencil /> Editar
                    </Button>
                    <TooltipButton
                      title="Excluir desejo"
                      variant="outline"
                      size="icon"
                      className="text-destructive size-8 rounded-full"
                      disabled={readOnly}
                      onClick={() => setDeletingWishlist(item)}
                    >
                      <Trash2 />
                    </TooltipButton>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}
      {section === 'activities' && (
        <section className="space-y-4">
          <ResourceViewToolbar
            count={activities.data?.items.length ?? 0}
            label="atividades"
            viewMode={activityView}
            onViewModeChange={setActivityView}
            onCreate={() => setDialog('activity')}
            createLabel="Nova atividade"
            createDisabled={readOnly}
          />
          {activityView === 'list' ? (
            table(activityColumns, activities.data?.items ?? [])
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {activities.data?.items.map((activity) => (
                <Card
                  key={activity.id}
                  className="hover:border-primary/40 transition-all hover:shadow-xs"
                >
                  <CardHeader>
                    <div className="flex justify-between">
                      <span
                        className="size-3 rounded-full"
                        style={{ backgroundColor: activity.color ?? '#64748B' }}
                      />
                      <span className="text-muted-foreground text-[11px]">
                        {activity.archivedAt ? 'Arquivada' : 'Ativa'}
                      </span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <ListTodo className="text-primary size-4" />
                      <CardTitle className="text-base">{activity.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardFooter className="flex gap-2 border-t pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 flex-1 rounded-full"
                      disabled={readOnly}
                      onClick={() => setEditingActivity(activity)}
                    >
                      <Pencil /> Editar
                    </Button>
                    <TooltipButton
                      title="Excluir atividade"
                      variant="outline"
                      size="icon"
                      className="text-destructive size-8 rounded-full"
                      disabled={readOnly}
                      onClick={() => setDeletingActivity(activity)}
                    >
                      <Trash2 />
                    </TooltipButton>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}
      {section === 'notifications' && (
        <section className="space-y-4">
          <ResourceViewToolbar
            count={notifications.data?.items.length ?? 0}
            label="notificações"
            viewMode={notificationView}
            onViewModeChange={setNotificationView}
          />
          {(notifications.data?.items.some(({ readAt }) => !readAt) ?? false) && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                disabled={readAll.isPending}
                onClick={() => readAll.mutate(undefined)}
              >
                <Check /> Marcar todas como lidas
              </Button>
            </div>
          )}
          {notificationView === 'list' ? (
            table(notificationColumns, notifications.data?.items ?? [])
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {notifications.data?.items.map((notification) => (
                <Card
                  key={notification.id}
                  className="hover:border-primary/40 flex flex-col justify-between transition-all hover:shadow-xs"
                >
                  <CardHeader>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-xs">
                        {notification.readAt ? 'Lida' : 'Não lida'}
                      </span>
                      <span className="text-muted-foreground text-[11px]">
                        {formatDateTimePtBr(notification.createdAt)}
                      </span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Bell className="text-primary size-4" />
                      <CardTitle className="text-base">{notification.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="text-muted-foreground text-sm">
                    {notification.body}
                  </CardContent>
                  {!notification.readAt && (
                    <CardFooter className="border-t pt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full rounded-full"
                        disabled={read.isPending}
                        onClick={() => read.mutate(notification.id)}
                      >
                        <Check /> Marcar como lida
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          )}
        </section>
      )}
      <Dialog open={dialog !== null} onOpenChange={(open) => !open && close()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {dialog === 'activity'
                ? 'Nova atividade'
                : dialog === 'goal'
                  ? 'Nova meta'
                  : 'Novo desejo'}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados para adicionar o item ao espaço financeiro.
            </DialogDescription>
          </DialogHeader>
          {dialog === 'activity' && (
            <ActivityForm readOnly={readOnly} onCancel={close} onSuccess={close} />
          )}
          {dialog === 'goal' && <GoalForm readOnly={readOnly} onCancel={close} onSuccess={close} />}
          {dialog === 'wishlist' && (
            <WishlistForm readOnly={readOnly} onCancel={close} onSuccess={close} />
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={Boolean(editingGoal)} onOpenChange={(open) => !open && setEditingGoal(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar meta</DialogTitle>
            <DialogDescription>Atualize os dados da meta.</DialogDescription>
          </DialogHeader>
          {editingGoal && (
            <GoalForm
              key={editingGoal.id}
              goal={editingGoal}
              readOnly={readOnly}
              onCancel={() => setEditingGoal(null)}
              onSuccess={() => setEditingGoal(null)}
            />
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(editingWishlist)}
        onOpenChange={(open) => !open && setEditingWishlist(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar desejo</DialogTitle>
            <DialogDescription>Atualize os dados do item desejado.</DialogDescription>
          </DialogHeader>
          {editingWishlist && (
            <WishlistForm
              key={editingWishlist.id}
              item={editingWishlist}
              readOnly={readOnly}
              onCancel={() => setEditingWishlist(null)}
              onSuccess={() => setEditingWishlist(null)}
            />
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(editingActivity)}
        onOpenChange={(open) => !open && setEditingActivity(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar atividade</DialogTitle>
            <DialogDescription>Atualize os dados da atividade.</DialogDescription>
          </DialogHeader>
          {editingActivity && (
            <ActivityForm
              key={editingActivity.id}
              activity={editingActivity}
              readOnly={readOnly}
              onCancel={() => setEditingActivity(null)}
              onSuccess={() => setEditingActivity(null)}
            />
          )}
        </DialogContent>
      </Dialog>
      {deletingGoal && (
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && setDeletingGoal(null)}
          title="Excluir meta?"
          description="A meta será arquivada e seu histórico será preservado."
          confirmText="Excluir meta"
          type="danger"
          variant="destructive"
          isPending={removeGoal.isPending}
          onConfirm={async () => {
            await removeGoal.mutateAsync(deletingGoal)
            setDeletingGoal(null)
          }}
        />
      )}
      {deletingWishlist && (
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && setDeletingWishlist(null)}
          title="Excluir desejo?"
          description="O item será arquivado e deixará de aparecer na lista."
          confirmText="Excluir desejo"
          type="danger"
          variant="destructive"
          isPending={removeWishlist.isPending}
          onConfirm={async () => {
            await removeWishlist.mutateAsync(deletingWishlist)
            setDeletingWishlist(null)
          }}
        />
      )}
      {deletingActivity && (
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && setDeletingActivity(null)}
          title="Excluir atividade?"
          description="A atividade será arquivada e deixará de aparecer no planejamento."
          confirmText="Excluir atividade"
          type="danger"
          variant="destructive"
          isPending={removeActivity.isPending}
          onConfirm={async () => {
            await removeActivity.mutateAsync(deletingActivity)
            setDeletingActivity(null)
          }}
        />
      )}
    </div>
  )
}
