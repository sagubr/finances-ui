import {
  CardDetailsPage,
  type CardStatementView,
  type StatementStatusFilter,
} from '@/modules/planning/pages/CardDetailsPage'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

const cardDetailsSearchSchema = z.object({
  statement: z.string().optional(),
  status: z.enum(['ALL', 'OPEN', 'CLOSED', 'PARTIALLY_PAID', 'PAID']).optional().catch('ALL'),
  q: z.string().optional().catch(''),
  view: z.enum(['current', 'statements']).optional().catch('current'),
})

export const Route = createFileRoute('/_app/cards_/$cardId')({
  validateSearch: cardDetailsSearchSchema,
  component: CardDetailsRoute,
})

function CardDetailsRoute() {
  const { cardId } = Route.useParams()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  return (
    <CardDetailsPage
      cardId={cardId}
      statementId={search.statement}
      status={(search.status ?? 'ALL') as StatementStatusFilter}
      search={search.q ?? ''}
      view={(search.view ?? 'current') as CardStatementView}
      onFiltersChange={(filters) => {
        void navigate({
          search: (previous) => ({
            ...previous,
            ...(Object.hasOwn(filters, 'statementId') ? { statement: filters.statementId } : {}),
            ...(Object.hasOwn(filters, 'status') ? { status: filters.status } : {}),
            ...(Object.hasOwn(filters, 'search') ? { q: filters.search } : {}),
            ...(Object.hasOwn(filters, 'view') ? { view: filters.view } : {}),
          }),
          replace: true,
        })
      }}
    />
  )
}
