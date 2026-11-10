import { ForgotPassword } from '@/routes/(auth)/-components/ForgotPassword'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/forgot-password')({
  component: ForgotPassword,
})
