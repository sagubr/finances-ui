import { Register } from '@/routes/(auth)/-components/Register'
import { createFileRoute, redirect } from '@tanstack/react-router'
export const Route = createFileRoute('/(auth)/register')({
  beforeLoad: ({ context }) => {
    const auth = (context as Readonly<{ auth?: { isAuthenticated: boolean } | null }>).auth
    if (auth?.isAuthenticated) throw redirect({ to: '/' })
  },
  component: Register,
})
