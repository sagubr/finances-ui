import Table from '@/components/Table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Input } from '@/components/ui/input'
import { getDomainLabel } from '@/lib/domain-labels'
import {
  getActiveWorkspaceRole,
  workspaceAccessStore,
} from '@/modules/workspaces/store/workspace-access.store'
import { useQuery } from '@tanstack/react-query'
import { useStore } from '@tanstack/react-store'
import type { ColumnDef } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { planningApi } from '../api/planning.api'
import type { ImportRow } from '../models/planning.types'
import { importQuery, importRowsQuery, usePlanningMutation } from '../queries/planning.queries'

export const ImportsPage = () => {
  const readOnly = useStore(workspaceAccessStore, getActiveWorkspaceRole) === 'VIEWER'
  const [file, setFile] = useState<File | null>(null)
  const [batchId, setBatchId] = useState('')
  const [pendingAction, setPendingAction] = useState<'commit' | 'rollback' | null>(null)
  const batch = useQuery({
    ...importQuery(batchId),
    enabled: Boolean(batchId),
    refetchInterval: (query) =>
      query.state.data &&
      ['PREVIEWED', 'COMMITTED', 'ROLLED_BACK', 'FAILED'].includes(query.state.data.status)
        ? false
        : 1_500,
  })
  const rows = useQuery({
    ...importRowsQuery(batchId),
    enabled: Boolean(batchId) && batch.data?.status === 'PREVIEWED',
  })
  const upload = usePlanningMutation(planningApi.uploadImport)
  const commit = usePlanningMutation((id: string) => planningApi.commitImport(id))
  const rollback = usePlanningMutation((id: string) => planningApi.rollbackImport(id))
  const submit = async () => {
    if (!file) return
    const result = await upload.mutateAsync(file)
    setBatchId(result.id)
  }
  const rowColumns = useMemo<ColumnDef<ImportRow>[]>(
    () => [
      { accessorKey: 'rowNumber', header: 'Linha', size: 100 },
      {
        accessorKey: 'status',
        header: 'Situação',
        size: 150,
        cell: ({ row }) => getDomainLabel(row.original.status),
      },
      {
        id: 'description',
        header: 'Descrição',
        size: 320,
        cell: ({ row }) => String(row.original.normalized?.description ?? '—'),
      },
      {
        id: 'errors',
        header: 'Erros',
        size: 360,
        cell: ({ row }) => row.original.errors.join(', ') || '—',
      },
    ],
    [],
  )
  return (
    <div className="flex flex-col gap-6">
      <header className="border-b pb-5">
        <h1 className="font-heading text-2xl font-semibold">Importação</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Valide o arquivo antes de confirmar qualquer lançamento.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Novo arquivo</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Input
            className="max-w-md"
            accept=".csv,.xlsx"
            type="file"
            disabled={readOnly}
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
          <Button disabled={readOnly || !file || upload.isPending} onClick={() => void submit()}>
            Enviar e validar
          </Button>
        </CardContent>
      </Card>
      {batchId && (
        <Card>
          <CardHeader>
            <CardTitle>Lote {batchId}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">
              Situação:{' '}
              <strong>{batch.data ? getDomainLabel(batch.data.status) : 'Processando'}</strong>
              {batch.data ? ` · ${batch.data.rowCount} linhas` : ''}
            </p>
            <div className="flex gap-2">
              <Button
                disabled={readOnly || batch.data?.status !== 'PREVIEWED' || commit.isPending}
                onClick={() => setPendingAction('commit')}
              >
                Confirmar importação
              </Button>
              <Button
                variant="outline"
                disabled={readOnly || batch.data?.status !== 'COMMITTED' || rollback.isPending}
                onClick={() => setPendingAction('rollback')}
              >
                Reverter
              </Button>
            </div>
            {rows.data && (
              <div className="h-[500px] rounded-xl border">
                <Table<ImportRow>
                  columns={rowColumns}
                  data={rows.data.items}
                  getRowId={(row) => row.id}
                  enableRowSelection={false}
                  shouldRenderCheckbox={false}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}
      {pendingAction && (
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && setPendingAction(null)}
          title={pendingAction === 'commit' ? 'Confirmar importação?' : 'Reverter importação?'}
          description={
            pendingAction === 'commit'
              ? 'As linhas válidas serão transformadas em lançamentos financeiros.'
              : 'Os lançamentos criados por este lote serão revertidos.'
          }
          confirmText={pendingAction === 'commit' ? 'Confirmar importação' : 'Reverter lote'}
          type={pendingAction === 'commit' ? 'question' : 'warning'}
          isPending={pendingAction === 'commit' ? commit.isPending : rollback.isPending}
          onConfirm={async () => {
            if (pendingAction === 'commit') await commit.mutateAsync(batchId)
            else await rollback.mutateAsync(batchId)
            setPendingAction(null)
          }}
        />
      )}
    </div>
  )
}
