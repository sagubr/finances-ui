import { WealthPage } from '@/modules/wealth/pages/WealthPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/positions')({
  component: () => <WealthPage section="positions" />,
})
