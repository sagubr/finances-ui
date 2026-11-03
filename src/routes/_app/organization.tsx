import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/organization')({
  beforeLoad: () => {
    throw redirect({ to: '/goals' })
  },
})
