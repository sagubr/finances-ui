import { ResendConfirmation } from '@/routes/(auth)/-components/ResendConfirmation'
import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/(auth)/resend-confirmation')({
  component: ResendConfirmation,
})
