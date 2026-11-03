import { PlanningPage } from '@/modules/planning/pages/PlanningPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/budgets')({
  component: () => <PlanningPage section="budgets" />,
})
