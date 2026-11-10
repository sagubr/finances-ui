import { ReportsPage } from '@/modules/reports/pages/ReportsPage'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

export const Route = createFileRoute('/_app/reports/')({
  validateSearch: z.object({ tab: z.enum(['annual', 'forecast']).optional() }),
  component: ReportsRoute,
})

function ReportsRoute() {
  const search = Route.useSearch()
  return <ReportsPage section={search.tab ?? 'annual'} />
}
