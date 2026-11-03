import { ReportsPage } from '@/modules/reports/pages/ReportsPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/reports/forecast')({
  component: () => <ReportsPage section="forecast" />,
})
