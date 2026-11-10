import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/budgets')({
  beforeLoad: () => {
    throw redirect({ to: '/installments', search: { tab: 'budgets' } })
  },
})
