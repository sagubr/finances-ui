import { PlanningPage } from '@/modules/planning/pages/PlanningPage'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

export const Route = createFileRoute('/_app/installments')({
  validateSearch: z.object({ tab: z.enum(['installments', 'budgets']).optional() }),
  component: InstallmentsRoute,
})

function InstallmentsRoute() {
  const search = Route.useSearch()
  return <PlanningPage section={search.tab ?? 'installments'} />
}
