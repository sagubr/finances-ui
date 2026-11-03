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
import { Field, FieldLabel } from '@/components/ui/field'
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
  setWorkspaceAccessActiveId,
  workspaceAccessStore,
} from '@/modules/workspaces/store/workspace-access.store'
import { useForm } from '@tanstack/react-form'
import { useQueryClient } from '@tanstack/react-query'
import { useStore } from '@tanstack/react-store'
import { Building2, Check, ChevronsUpDown, Plus } from 'lucide-react'
import { useState } from 'react'
import { z } from 'zod'

const workspaceSchema = z.object({ name: z.string().trim().min(2).max(120) })

const CreateWorkspaceForm = ({ onSuccess }: Readonly<{ onSuccess: () => void }>) => {
  const mutation = useCreateWorkspace()
  const form = useForm({
    defaultValues: { name: '' },
    validators: { onSubmit: workspaceSchema },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync({
        name: value.name.trim(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        baseCurrency: 'BRL',
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
        {(field) => (
          <Field>
            <FieldLabel htmlFor="workspace-name">Nome do espaço financeiro</FieldLabel>
            <Input
              id="workspace-name"
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
            />
          </Field>
        )}
      </form.Field>
      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Criando…' : 'Criar espaço financeiro'}
      </Button>
    </form>
  )
}

export function WorkspaceSwitcher() {
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

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <SidebarMenuButton
                  size="lg"
                  tooltip={activeWorkspace?.name ?? 'Criar espaço financeiro'}
                  className="data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground"
                />
              }
            >
              <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <Building2 className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Finanças</span>
                <span className="text-foreground/70 truncate text-xs">
                  {activeWorkspace?.name ?? 'Nenhum espaço financeiro'}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="bg-popover min-w-64 rounded-lg before:hidden"
              side={isMobile ? 'bottom' : 'right'}
              align="start"
              sideOffset={4}
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-foreground/60 text-xs">
                  Áreas de trabalho
                </DropdownMenuLabel>
                {workspaces.map((workspace) => (
                  <DropdownMenuItem
                    key={workspace.id}
                    onClick={() => void selectWorkspace(workspace)}
                    className="gap-2 p-2"
                  >
                    <div className="bg-background flex size-7 items-center justify-center rounded-md border">
                      <Building2 className="size-4" />
                    </div>
                    <span className="min-w-0 flex-1 truncate font-medium">{workspace.name}</span>
                    {workspace.id === activeWorkspace?.id && (
                      <Check className="text-primary ml-auto size-4" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 p-2" onClick={() => setCreateOpen(true)}>
                <div className="bg-background flex size-7 items-center justify-center rounded-md border">
                  <Plus className="size-4" />
                </div>
                <span className="font-medium">Adicionar espaço financeiro</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
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
