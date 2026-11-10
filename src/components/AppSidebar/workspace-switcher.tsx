import { MutationErrorMessage } from '@/components/MutationErrorMessage'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import type { Workspace } from '@/modules/workspaces/models/workspace.types'
import { useCreateWorkspace, useWorkspaces, WORKSPACE_KEYS } from '@/modules/workspaces/queries'
import {
  getActiveWorkspaceBaseCurrency,
  setWorkspaceAccessActiveId,
  workspaceAccessStore,
} from '@/modules/workspaces/store/workspace-access.store'
import { useForm } from '@tanstack/react-form'
import { useQueryClient } from '@tanstack/react-query'
import { useStore } from '@tanstack/react-store'
import { Check, ChevronsUpDown } from 'lucide-react'
import { useState } from 'react'
import { z } from 'zod'

const workspaceSchema = z.object({
  name: z.string().trim().min(2).max(120),
  baseCurrency: z.string().trim().length(3, 'Informe a moeda base com três letras.'),
})

const CreateWorkspaceForm = ({ onSuccess }: Readonly<{ onSuccess: () => void }>) => {
  const mutation = useCreateWorkspace()
  const activeBaseCurrency = useStore(workspaceAccessStore, getActiveWorkspaceBaseCurrency)
  const form = useForm({
    defaultValues: { name: '', baseCurrency: activeBaseCurrency ?? '' },
    validators: { onSubmit: workspaceSchema },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync({
        name: value.name.trim(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        baseCurrency: value.baseCurrency.toUpperCase(),
      })
      onSuccess()
    },
  })
  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <form.Field name="name">
        {(field) => {
          const invalid = field.state.meta.isTouched && !field.state.meta.isValid
          return (
            <Field data-invalid={invalid}>
              <FieldLabel htmlFor="workspace-name">Nome do espaço financeiro</FieldLabel>
              <Input
                id="workspace-name"
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
              />
              {invalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>
      <form.Field name="baseCurrency">
        {(field) => {
          const invalid = field.state.meta.isTouched && !field.state.meta.isValid
          return (
            <Field data-invalid={invalid}>
              <FieldLabel htmlFor="workspace-base-currency">Moeda base</FieldLabel>
              <Input
                id="workspace-base-currency"
                maxLength={3}
                placeholder="Ex.: BRL"
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value.toUpperCase())}
              />
              {invalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>
      <MutationErrorMessage
        error={mutation.error}
        fallbackMessage="Não foi possível criar o workspace."
      />
      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Criando…' : 'Criar espaço financeiro'}
      </Button>
    </form>
  )
}

export function WorkspaceSwitcher({ compact = false }: Readonly<{ compact?: boolean }>) {
  const [createOpen, setCreateOpen] = useState(false)
  const { isMobile } = useSidebar()
  const queryClient = useQueryClient()
  const { data: workspaces = [], isLoading } = useWorkspaces()
  const activeWorkspaceId = useStore(workspaceAccessStore, (state) => state.activeWorkspaceId)
  const activeWorkspace =
    workspaces.find((workspace) => workspace.id === activeWorkspaceId) ?? workspaces[0]

  const selectWorkspace = async (workspace: Workspace) => {
    if (workspace.id === activeWorkspace?.id) return
    await queryClient.cancelQueries()
    setWorkspaceAccessActiveId(workspace.id)
    await queryClient.invalidateQueries({
      predicate: ({ queryKey }) => queryKey[0] !== WORKSPACE_KEYS.all[0],
    })
  }

  if (isLoading) {
    if (compact)
      return (
        <div className="flex h-11 min-w-0 items-center gap-2 sm:h-8">
          <Skeleton className="size-9 shrink-0 rounded-xl sm:size-8 sm:rounded-lg" />
          <Skeleton className="h-4 w-28" />
        </div>
      )
    return (
      <div className="flex h-12 items-center gap-2 px-2">
        <Skeleton className="size-8 rounded-lg" />
        <div className="grid flex-1 gap-1 group-data-[collapsible=icon]:hidden">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3 w-28" />
        </div>
      </div>
    )
  }

  const switcher = (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          compact ? (
            <button
              type="button"
              aria-label="Trocar espaço financeiro"
              className="hover:bg-muted focus-visible:ring-ring/50 flex h-11 max-w-52 min-w-0 items-center gap-2 rounded-xl pr-2 outline-none focus-visible:ring-3 sm:h-8 sm:rounded-lg"
            />
          ) : (
            <SidebarMenuButton
              size="lg"
              tooltip={activeWorkspace?.name ?? 'Criar espaço financeiro'}
              className="data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground"
            />
          )
        }
      >
        <img
          src="/favicon.svg"
          alt=""
          aria-hidden="true"
          className={
            compact
              ? 'size-9 shrink-0 rounded-xl sm:size-8 sm:rounded-lg'
              : 'size-8 shrink-0 rounded-lg'
          }
        />
        <div
          className={
            compact ? 'min-w-0 flex-1 text-left' : 'grid flex-1 text-left text-sm leading-tight'
          }
        >
          {!compact && <span className="truncate font-semibold">Nummo</span>}
          <span
            className={
              compact
                ? 'block truncate text-sm font-semibold'
                : 'text-foreground/70 truncate text-xs'
            }
          >
            {activeWorkspace?.name ?? 'Nenhum espaço financeiro'}
          </span>
        </div>
        <ChevronsUpDown className="size-4 shrink-0 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="bg-popover min-w-[min(20rem,calc(100vw-2rem))] rounded-xl p-1.5 before:hidden md:min-w-64"
        side={compact || isMobile ? 'bottom' : 'right'}
        align="start"
        sideOffset={6}
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-foreground/60 px-2 py-2 text-xs">
            Espaços financeiros
          </DropdownMenuLabel>
          {workspaces.map((workspace) => (
            <DropdownMenuItem
              key={workspace.id}
              onClick={() => void selectWorkspace(workspace)}
              className="min-h-11 gap-3 px-3 py-2 text-base md:min-h-9 md:text-sm"
            >
              <span className="min-w-0 flex-1 truncate">{workspace.name}</span>
              {workspace.id === activeWorkspace?.id && (
                <Check className="text-primary ml-auto size-4" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="min-h-11 px-3 py-2 text-base md:min-h-9 md:text-sm"
          onClick={() => setCreateOpen(true)}
        >
          Adicionar espaço financeiro
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <>
      {compact ? (
        switcher
      ) : (
        <SidebarMenu>
          <SidebarMenuItem>{switcher}</SidebarMenuItem>
        </SidebarMenu>
      )}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Novo espaço financeiro</DialogTitle>
            <DialogDescription>
              Crie uma área independente para organizar seus dados financeiros.
            </DialogDescription>
          </DialogHeader>
          <CreateWorkspaceForm onSuccess={() => setCreateOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
}
