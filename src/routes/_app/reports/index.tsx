import { ReportsPage } from '@/modules/reports/pages/ReportsPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/reports/')({
  component: () => <ReportsPage section="annual" />,
})
