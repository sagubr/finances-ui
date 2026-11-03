import { FinancialStructurePage } from '@/modules/transactions/pages/FinancialStructurePage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/accounts')({
  component: () => <FinancialStructurePage section="accounts" />,
})
