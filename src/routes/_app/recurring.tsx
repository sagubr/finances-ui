import { TransactionsPage } from '@/modules/transactions/pages/TransactionsPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/recurring')({
  component: () => <TransactionsPage initialView="recurring" />,
})
