import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/investment-accounts')({
  beforeLoad: () => {
    throw redirect({ to: '/accounts' })
  },
})
