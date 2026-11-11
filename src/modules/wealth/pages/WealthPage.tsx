import {
  ResourceCollectionSkeleton,
  ResourceEmptyState,
} from '@/components/ResourceCollectionState'
import { ResourceErrorState } from '@/components/ResourceErrorState'
import { ResourceMetricCard } from '@/components/ResourceMetricCard'
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
import { useResourceViewMode } from '@/hooks/useResourceViewStore'
import { getDomainLabel } from '@/lib/domain-labels'
import { formatMoney } from '@/modules/transactions/utils/money'
import {
  getActiveWorkspaceRole,
  workspaceAccessStore,
} from '@/modules/workspaces/store/workspace-access.store'
import { filterResources } from '@/utils/resource-search'
import { useQuery } from '@tanstack/react-query'
import { useStore } from '@tanstack/react-store'
import type { ColumnDef } from '@tanstack/react-table'
import { BriefcaseBusiness, ChartCandlestick, Pencil, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { wealthApi } from '../api/wealth.api'
import { AssetForm } from '../components/AssetForm'
import { InvestmentOrderForm } from '../components/InvestmentForms'
import type { Asset, Position } from '../models/wealth.types'
import { assetsQuery, positionsQuery, useWealthMutation } from '../queries/wealth.queries'

type WealthDialog = 'order' | 'edit-order' | 'asset' | null
export type WealthSection = 'positions' | 'assets'

const sectionMetadata: Record<WealthSection, Readonly<{ title: string; description: string }>> = {
  positions: {
    title: 'Carteira de ações',
    description: 'Acompanhe quanto você investiu, o valor atual e o resultado das suas posições.',
  },
  assets: {
    title: 'Bens',
    description: 'Registre e acompanhe os bens que compõem seu patrimônio.',
  },
}

const formatDecimalMoney = (value: string | number, currency: string) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value))

const formatPercent = (value: string | number) =>
  `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(Number(value))}%`

const formatQuantity = (value: string | number) =>
  new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 8,
    minimumFractionDigits: 0,
  }).format(Number(value))

export const WealthPage = ({ section }: Readonly<{ section: WealthSection }>) => {
  const positions = useQuery({ ...positionsQuery(), enabled: section === 'positions' })
  const assets = useQuery({ ...assetsQuery(), enabled: section === 'assets' })
  const readOnly = useStore(workspaceAccessStore, getActiveWorkspaceRole) === 'VIEWER'
  const [dialog, setDialog] = useState<WealthDialog>(null)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
  const [deletingAsset, setDeletingAsset] = useState<Asset | null>(null)
  const [editingPosition, setEditingPosition] = useState<Position | null>(null)
  const [deletingPosition, setDeletingPosition] = useState<Position | null>(null)
  const [search, setSearch] = useState('')
  const removeAsset = useWealthMutation(wealthApi.removeAsset)
  const removeOrder = useWealthMutation(
    (position: Position) =>
      position.orderId && position.orderVersion !== null
        ? wealthApi.removeOrder(position.orderId, position.orderVersion)
        : Promise.reject(new Error('Esta posição não possui uma ordem editável.')),
  )
  const [positionView, setPositionView] = useResourceViewMode('wealth-positions', 'list')
  const [assetView, setAssetView] = useResourceViewMode('wealth-assets', 'list')
  const positionColumns = useMemo<ColumnDef<Position>[]>(
    () => [
      { accessorKey: 'symbol', header: 'Código', size: 140 },
      { accessorKey: 'name', header: 'Ativo', size: 300 },
      {
        accessorKey: 'quantity',
        header: 'Quantidade',
        size: 150,
        cell: ({ row }) => formatQuantity(row.original.quantity),
      },
      {
        accessorKey: 'averageCost',
        header: 'Preço médio',
        size: 160,
        cell: ({ row }) => formatDecimalMoney(row.original.averageCost, row.original.currency),
      },
      {
        accessorKey: 'currentValue',
        header: 'Valor atual',
        size: 160,
        cell: ({ row }) =>
          row.original.currentValue
            ? formatDecimalMoney(row.original.currentValue, row.original.currency)
            : '—',
      },
      {
        accessorKey: 'unrealizedResult',
        header: 'Resultado',
        size: 180,
        cell: ({ row }) => {
          const result = row.original.unrealizedResult
          if (!result) return '—'
          const positive = Number(result) >= 0
          return (
            <span className={positive ? 'text-emerald-600' : 'text-destructive'}>
              {formatDecimalMoney(result, row.original.currency)}
              {row.original.unrealizedPercent
                ? ` (${formatPercent(row.original.unrealizedPercent)})`
                : ''}
            </span>
          )
        },
      },
      {
        id: 'actions',
        header: 'Ações',
        size: 120,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <TooltipButton
              title="Editar posição"
              variant="ghost"
              size="icon"
              disabled={readOnly || !row.original.orderId}
              onClick={() => setEditingPosition(row.original)}
            >
              <Pencil />
            </TooltipButton>
            <TooltipButton
              title="Excluir posição"
              variant="ghost"
              size="icon"
              disabled={readOnly || !row.original.orderId}
              onClick={() => setDeletingPosition(row.original)}
            >
              <Trash2 className="text-destructive" />
            </TooltipButton>
          </div>
        ),
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
  const filteredPositions = filterResources(positions.data?.items ?? [], search)
  const filteredAssets = filterResources(assets.data?.items ?? [], search)
  const portfolioSummaries = positions.data?.summaries ?? []

  return (
    <div className="flex flex-col gap-6">
      <header className="border-b pb-5">
        <h1 className="font-heading text-2xl font-semibold">{metadata.title}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{metadata.description}</p>
      </header>
      {section === 'positions' && (
        <div className="grid gap-3 sm:grid-cols-3">
          {portfolioSummaries.map((summary) => (
            <div key={summary.currency} className="contents">
              <ResourceMetricCard
                label={`Investido · ${summary.currency}`}
                value={formatDecimalMoney(summary.invested, summary.currency)}
              />
              <ResourceMetricCard
                label={`Valor atual · ${summary.currency}`}
                value={formatDecimalMoney(summary.current, summary.currency)}
              />
              <ResourceMetricCard
                label={`Resultado · ${summary.currency}`}
                value={formatDecimalMoney(summary.result, summary.currency)}
                tone={summary.result.startsWith('-') ? 'negative' : 'positive'}
              />
            </div>
          ))}
        </div>
      )}
      {section === 'positions' && (
        <section className="space-y-4">
          <ResourceViewToolbar
            count={filteredPositions.length}
            label="posições"
            viewMode={positionView}
            onViewModeChange={setPositionView}
            onCreate={() => setDialog('order')}
            createLabel="Cadastrar posição"
            createDisabled={readOnly}
            search={{ value: search, onValueChange: setSearch, placeholder: 'Buscar posição' }}
          />
          {positions.isPending ? (
            <ResourceCollectionSkeleton viewMode={positionView} />
          ) : positions.isError ? (
            <ResourceErrorState
              compact
              title="Não foi possível carregar as posições"
              error={positions.error}
              fallbackMessage="Tente carregar suas posições novamente."
              onRetry={() => void positions.refetch()}
              isRetrying={positions.isFetching}
            />
          ) : positions.data.items.length === 0 ? (
            <ResourceEmptyState
              title="Nenhuma posição de investimento"
              description="Registre uma ordem para começar a acompanhar sua carteira de investimentos."
              actionLabel="Cadastrar posição"
              onAction={() => setDialog('order')}
              actionDisabled={readOnly}
            />
          ) : positionView === 'list' ? (
            <div className="h-[500px] rounded-xl border">
              <Table<Position>
                columns={positionColumns}
                data={filteredPositions}
                getRowId={(item) => `${item.accountId}-${item.instrumentId}`}
                enableRowSelection={false}
                shouldRenderCheckbox={false}
              />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredPositions.map((position) => (
                <Card
                  key={`${position.accountId}-${position.instrumentId}`}
                  className="hover:border-primary/40 transition-all hover:shadow-xs"
                >
                  <CardHeader className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-xs">{position.symbol}</span>
                      <span className="text-muted-foreground text-[11px]">
                        {formatQuantity(position.quantity)} cotas
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="bg-muted flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg">
                        {position.logoUrl ? (
                          <img
                            src={position.logoUrl}
                            alt={`Logo ${position.symbol}`}
                            className="size-full object-contain p-1"
                            onError={(event) => {
                              event.currentTarget.style.display = 'none'
                            }}
                          />
                        ) : (
                          <ChartCandlestick className="text-primary size-4" />
                        )}
                      </div>
                      <CardTitle className="truncate text-base">{position.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl font-semibold">
                      {position.currentValue
                        ? formatDecimalMoney(position.currentValue, position.currency)
                        : 'Cotação indisponível'}
                    </p>
                    <p
                      className={`mt-1 text-sm font-medium ${
                        Number(position.unrealizedResult ?? 0) >= 0
                          ? 'text-emerald-600'
                          : 'text-destructive'
                      }`}
                    >
                      {position.unrealizedResult
                        ? `${formatDecimalMoney(position.unrealizedResult, position.currency)} · ${formatPercent(position.unrealizedPercent ?? 0)}`
                        : 'Resultado indisponível'}
                    </p>
                    <p className="text-muted-foreground mt-2 text-xs">
                      Preço médio {formatDecimalMoney(position.averageCost, position.currency)}
                      {position.latestPrice
                        ? ` · cotação ${formatDecimalMoney(position.latestPrice, position.currency)}`
                        : ''}
                    </p>
                  </CardContent>
                  <CardFooter className="flex gap-2 border-t pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 flex-1 rounded-full"
                      disabled={readOnly || !position.orderId}
                      onClick={() => setEditingPosition(position)}
                    >
                      <Pencil /> Editar
                    </Button>
                    <TooltipButton
                      title="Excluir posição"
                      variant="outline"
                      size="icon"
                      className="text-destructive size-8 rounded-full"
                      disabled={readOnly || !position.orderId}
                      onClick={() => setDeletingPosition(position)}
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
      {section === 'assets' && (
        <section className="space-y-4">
          <ResourceViewToolbar
            count={filteredAssets.length}
            label="bens"
            viewMode={assetView}
            onViewModeChange={setAssetView}
            onCreate={() => setDialog('asset')}
            createLabel="Novo bem"
            createDisabled={readOnly}
            search={{ value: search, onValueChange: setSearch, placeholder: 'Buscar bem' }}
          />
          {assets.isPending ? (
            <ResourceCollectionSkeleton viewMode={assetView} />
          ) : assets.isError ? (
            <ResourceErrorState
              compact
              title="Não foi possível carregar os bens"
              error={assets.error}
              fallbackMessage="Tente carregar seus bens novamente."
              onRetry={() => void assets.refetch()}
              isRetrying={assets.isFetching}
            />
          ) : assets.data.items.length === 0 ? (
            <ResourceEmptyState
              title="Nenhum bem cadastrado"
              description="Cadastre imóveis, veículos e outros bens que compõem seu patrimônio."
              actionLabel="Cadastrar bem"
              onAction={() => setDialog('asset')}
              actionDisabled={readOnly}
            />
          ) : assetView === 'list' ? (
            <div className="h-[500px] rounded-xl border">
              <Table<Asset>
                columns={assetColumns}
                data={filteredAssets}
                getRowId={(item) => item.id}
                enableRowSelection={false}
                shouldRenderCheckbox={false}
              />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredAssets.map((asset) => (
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
            <DialogTitle>{dialog === 'order' ? 'Cadastrar posição' : 'Novo bem'}</DialogTitle>
            <DialogDescription>
              {dialog === 'order'
                ? 'Informe o ticker, a quantidade e o seu preço médio atual.'
                : 'Preencha os dados para atualizar seu patrimônio.'}
            </DialogDescription>
          </DialogHeader>
          {dialog === 'order' && (
            <InvestmentOrderForm readOnly={readOnly} onCancel={close} onSuccess={close} />
          )}
          {dialog === 'asset' && <AssetForm readOnly={readOnly} onSuccess={close} />}
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(editingPosition)}
        onOpenChange={(open) => !open && setEditingPosition(null)}
      >
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar posição</DialogTitle>
            <DialogDescription>Atualize os dados da ordem desta posição.</DialogDescription>
          </DialogHeader>
          {editingPosition && (
            <InvestmentOrderForm
              key={`${editingPosition.orderId}-${editingPosition.orderVersion}`}
              position={editingPosition}
              readOnly={readOnly}
              onCancel={() => setEditingPosition(null)}
              onSuccess={() => setEditingPosition(null)}
            />
          )}
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
      {deletingPosition && (
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && setDeletingPosition(null)}
          title="Excluir posição?"
          description="A última ordem desta posição será excluída e a carteira será recalculada."
          confirmText="Excluir posição"
          type="danger"
          variant="destructive"
          isPending={removeOrder.isPending}
          onConfirm={async () => {
            await removeOrder.mutateAsync(deletingPosition)
            setDeletingPosition(null)
          }}
        />
      )}
    </div>
  )
}
