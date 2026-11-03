import { ConfirmEmail } from '@/routes/(auth)/-components/ConfirmEmail'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
export const Route = createFileRoute('/(auth)/confirm-email')({
  validateSearch: (search) => z.object({ token: z.string().optional() }).parse(search),
  component: ConfirmEmailRoute,
})
function ConfirmEmailRoute() {
  return <ConfirmEmail initialToken={Route.useSearch().token} />
}
