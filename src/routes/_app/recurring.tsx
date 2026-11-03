import { PlanningPage } from '@/modules/planning/pages/PlanningPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/recurring')({
  component: () => <PlanningPage section="recurring" />,
})
