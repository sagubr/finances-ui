import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/activities')({
  beforeLoad: () => {
    throw redirect({ to: '/transactions' })
  },
})
