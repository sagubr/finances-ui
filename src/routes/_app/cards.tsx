import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/cards')({
  beforeLoad: () => {
    throw redirect({ to: '/accounts', search: { tab: 'cards' } })
  },
})
