import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/reports/exports')({
  beforeLoad: () => {
    throw redirect({ to: '/reports' })
  },
})
