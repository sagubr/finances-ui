import { AccountsPage } from '@/modules/transactions/pages/AccountsPage'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

export const Route = createFileRoute('/_app/accounts')({
  validateSearch: z.object({ tab: z.enum(['accounts', 'cards']).optional() }),
  component: AccountsRoute,
})

function AccountsRoute() {
  const search = Route.useSearch()
  return <AccountsPage section={search.tab ?? 'accounts'} />
}
