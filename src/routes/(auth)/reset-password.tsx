import { ResetPassword } from '@/routes/(auth)/-components/ResetPassword'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

export const Route = createFileRoute('/(auth)/reset-password')({
  validateSearch: (search) => z.object({ token: z.string().optional() }).parse(search),
  component: ResetPasswordRoute,
})

function ResetPasswordRoute() {
  return <ResetPassword initialToken={Route.useSearch().token} />
}
