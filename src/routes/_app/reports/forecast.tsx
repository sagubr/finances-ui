import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/reports/forecast')({
  beforeLoad: () => {
    throw redirect({ to: '/reports', search: { tab: 'forecast' } })
  },
})
