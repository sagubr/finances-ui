import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/financial-structure')({
  beforeLoad: () => {
    throw redirect({ to: '/accounts' })
  },
})
