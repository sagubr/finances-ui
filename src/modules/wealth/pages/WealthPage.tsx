import { ResourceViewToolbar } from '@/components/ResourceViewToolbar'
import Table from '@/components/Table'
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
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import type { ColumnDef } from '@tanstack/react-table'
import { BriefcaseBusiness, ChartCandlestick, Landmark, Pencil, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { wealthApi } from '../api/wealth.api'
import { AssetForm } from '../components/AssetForm'
import { InvestmentOrderForm } from '../components/InvestmentForms'
import type { Asset, InvestmentAccount, Position } from '../models/wealth.types'
import {
  assetsQuery,
  investmentAccountsQuery,
  netWorthQuery,
  positionsQuery,
  useWealthMutation,
} from '../queries/wealth.queries'

type WealthDialog = 'order' | 'asset' | null
export type WealthSection = 'positions' | 'investment-accounts' | 'assets'

const sectionMetadata: Record<WealthSection, Readonly<{ title: string; description: string }>> = {
  positions: {
    title: 'Posições',
    description: 'Acompanhe a composição e o custo das suas posições de investimento.',
  },
  'investment-accounts': {
    title: 'Contas de investimento',
    description: 'Gerencie as contas utilizadas para registrar ordens e investimentos.',
  },
  assets: {
    title: 'Bens',
    description: 'Registre e acompanhe os bens que compõem seu patrimônio.',
  },
}

export const WealthPage = ({ section }: Readonly<{ section: WealthSection }>) => {
  const netWorth = useQuery({ ...netWorthQuery(), enabled: section === 'positions' })
  const accounts = useQuery({
    ...investmentAccountsQuery(),
    enabled: section === 'investment-accounts',
  })
  const positions = useQuery({ ...positionsQuery(), enabled: section === 'positions' })
  const assets = useQuery({ ...assetsQuery(), enabled: section === 'assets' })
  const readOnly = useStore(workspaceAccessStore, getActiveWorkspaceRole) === 'VIEWER'
  const navigate = useNavigate()
  const [dialog, setDialog] = useState<WealthDialog>(null)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
  const [deletingAsset, setDeletingAsset] = useState<Asset | null>(null)
  const removeAsset = useWealthMutation(wealthApi.removeAsset)
  const [positionView, setPositionView] = useResourceViewMode('wealth-positions', 'list')
  const [accountView, setAccountView] = useResourceViewMode('wealth-accounts', 'list')
  const [assetView, setAssetView] = useResourceViewMode('wealth-assets', 'list')
  const accountColumns = useMemo<ColumnDef<InvestmentAccount>[]>(
    () => [
      { accessorKey: 'name', header: 'Conta de investimento', size: 320 },
      { accessorKey: 'currency', header: 'Moeda', size: 120 },
      {
        accessorKey: 'active',
        header: 'Situação',
        size: 140,
        cell: ({ row }) => (row.original.active ? 'Ativa' : 'Inativa'),
      },
    ],
    [],
  )
  const positionColumns = useMemo<ColumnDef<Position>[]>(
    () => [
      { accessorKey: 'symbol', header: 'Código', size: 140 },
      { accessorKey: 'name', header: 'Ativo', size: 300 },
      { accessorKey: 'quantity', header: 'Quantidade', size: 150 },
      { accessorKey: 'averageCost', header: 'Custo médio', size: 160 },
      { accessorKey: 'totalCost', header: 'Custo total', size: 160 },
      {
        accessorKey: 'latestPrice',
        header: 'Último preço',
        size: 160,
        cell: ({ row }) => row.original.latestPrice ?? '—',
      },
    ],
    [],
  )
  const assetColumns = useMemo<ColumnDef<Asset>[]>(
    () => [
      { accessorKey: 'name', header: 'Bem', size: 320 },
      {
        accessorKey: 'status',
        header: 'Situação',
        size: 140,
        cell: ({ row }) => getDomainLabel(row.original.status),
      },
      {
        accessorKey: 'acquisitionCostCents',
        header: 'Custo de aquisição',
        size: 200,
        cell: ({ row }) => formatMoney(row.original.acquisitionCostCents, row.original.currency),
      },
      { accessorKey: 'valuationMethod', header: 'Avaliação', size: 190 },
      {
        id: 'actions',
        header: 'Ações',
        size: 120,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <TooltipButton
              title="Editar bem"
              variant="ghost"
              size="icon"
              disabled={readOnly}
              onClick={() => setEditingAsset(row.original)}
            >
              <Pencil />
            </TooltipButton>
            <TooltipButton
              title="Excluir bem"
              variant="ghost"
              size="icon"
              disabled={readOnly}
              onClick={() => setDeletingAsset(row.original)}
            >
              <Trash2 className="text-destructive" />
            </TooltipButton>
          </div>
        ),
      },
    ],
    [readOnly],
  )
  const close = () => setDialog(null)
  const metadata = sectionMetadata[section]
  return (
    <div className="flex flex-col gap-6">
      <header className="border-b pb-5">
        <h1 className="font-heading text-2xl font-semibold">{metadata.title}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{metadata.description}</p>
      </header>
      {section === 'positions' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {netWorth.data?.totals.map((total) => (
            <Card key={total.currency}>
              <CardHeader>
                <CardTitle className="text-sm">Patrimônio em {total.currency}</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold">
                {formatMoney(total.amountCents, total.currency)}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {section === 'positions' && (
        <section className="space-y-4">
          <ResourceViewToolbar
            count={positions.data?.items.length ?? 0}
            label="posições"
            viewMode={positionView}
            onViewModeChange={setPositionView}
            onCreate={() => setDialog('order')}
            createLabel="Registrar ordem"
            createDisabled={readOnly}
          />
          {positionView === 'list' ? (
            <div className="h-[500px] rounded-xl border">
              <Table<Position>
                columns={positionColumns}
                data={positions.data?.items ?? []}
                getRowId={(item) => `${item.investmentAccountId}-${item.instrumentId}`}
                enableRowSelection={false}
                shouldRenderCheckbox={false}
              />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {positions.data?.items.map((position) => (
                <Card
                  key={`${position.investmentAccountId}-${position.instrumentId}`}
                  className="hover:border-primary/40 transition-all hover:shadow-xs"
                >
                  <CardHeader className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-xs">{position.symbol}</span>
                      <span className="text-muted-foreground text-[11px]">
                        {position.quantity} cotas
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <ChartCandlestick className="text-primary mt-0.5 size-4" />
                      <CardTitle className="truncate text-base">{position.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl font-semibold">{position.totalCost}</p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      Custo médio {position.averageCost}
                      {position.latestPrice ? ` · último ${position.latestPrice}` : ''}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}
      {section === 'investment-accounts' && (
        <section className="space-y-4">
          <ResourceViewToolbar
            count={accounts.data?.items.length ?? 0}
            label="contas de investimento"
            viewMode={accountView}
            onViewModeChange={setAccountView}
            onCreate={() => void navigate({ to: '/accounts' })}
            createLabel="Gerenciar contas"
          />
          {accountView === 'list' ? (
            <div className="h-[500px] rounded-xl border">
              <Table<InvestmentAccount>
                columns={accountColumns}
                data={accounts.data?.items ?? []}
                getRowId={(item) => item.id}
                enableRowSelection={false}
                shouldRenderCheckbox={false}
              />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {accounts.data?.items.map((account) => (
                <Card
                  key={account.id}
                  className="hover:border-primary/40 transition-all hover:shadow-xs"
                >
                  <CardHeader className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-xs">
                        {account.active ? 'Ativa' : 'Inativa'}
                      </span>
                      <span className="text-muted-foreground text-[11px]">{account.currency}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Landmark className="text-primary mt-0.5 size-4" />
                      <CardTitle className="text-base">{account.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="text-muted-foreground text-sm">
                    Conta usada para registrar ordens e consolidar posições.
                  </CardContent>
                  <CardFooter className="border-t pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-full rounded-full"
                      onClick={() => void navigate({ to: '/accounts' })}
                    >
                      Gerenciar em Contas
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}
      {section === 'assets' && (
        <section className="space-y-4">
          <ResourceViewToolbar
            count={assets.data?.items.length ?? 0}
            label="bens"
            viewMode={assetView}
            onViewModeChange={setAssetView}
            onCreate={() => setDialog('asset')}
            createLabel="Novo bem"
            createDisabled={readOnly}
          />
          {assetView === 'list' ? (
            <div className="h-[500px] rounded-xl border">
              <Table<Asset>
                columns={assetColumns}
                data={assets.data?.items ?? []}
                getRowId={(item) => item.id}
                enableRowSelection={false}
                shouldRenderCheckbox={false}
              />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {assets.data?.items.map((asset) => (
                <Card
                  key={asset.id}
                  className="hover:border-primary/40 transition-all hover:shadow-xs"
                >
                  <CardHeader className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-xs">
                        {getDomainLabel(asset.status)}
                      </span>
                      <span className="text-muted-foreground text-[11px]">{asset.currency}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <BriefcaseBusiness className="text-primary mt-0.5 size-4" />
                      <CardTitle className="truncate text-base">{asset.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl font-semibold">
                      {formatMoney(asset.acquisitionCostCents, asset.currency)}
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      Avaliação: {asset.valuationMethod}
                    </p>
                  </CardContent>
                  <CardFooter className="flex gap-2 border-t pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 flex-1 rounded-full"
                      disabled={readOnly}
                      onClick={() => setEditingAsset(asset)}
                    >
                      <Pencil /> Editar
                    </Button>
                    <TooltipButton
                      title="Excluir bem"
                      variant="outline"
                      size="icon"
                      className="text-destructive size-8 rounded-full"
                      disabled={readOnly}
                      onClick={() => setDeletingAsset(asset)}
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
      <Dialog open={dialog !== null} onOpenChange={(open) => !open && close()}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{dialog === 'order' ? 'Registrar ordem' : 'Novo bem'}</DialogTitle>
            <DialogDescription>Preencha os dados para atualizar seu patrimônio.</DialogDescription>
          </DialogHeader>
          {dialog === 'order' && <InvestmentOrderForm readOnly={readOnly} onSuccess={close} />}
          {dialog === 'asset' && <AssetForm readOnly={readOnly} onSuccess={close} />}
        </DialogContent>
      </Dialog>
      <Dialog open={Boolean(editingAsset)} onOpenChange={(open) => !open && setEditingAsset(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar bem</DialogTitle>
            <DialogDescription>Atualize os dados do bem.</DialogDescription>
          </DialogHeader>
          {editingAsset && (
            <AssetForm
              key={editingAsset.id}
              asset={editingAsset}
              readOnly={readOnly}
              onSuccess={() => setEditingAsset(null)}
            />
          )}
        </DialogContent>
      </Dialog>
      {deletingAsset && (
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && setDeletingAsset(null)}
          title="Excluir bem?"
          description="O bem será arquivado e deixará de compor as listagens e o patrimônio."
          confirmText="Excluir bem"
          type="danger"
          variant="destructive"
          isPending={removeAsset.isPending}
          onConfirm={async () => {
            await removeAsset.mutateAsync(deletingAsset)
            setDeletingAsset(null)
          }}
        />
      )}
    </div>
  )
}
