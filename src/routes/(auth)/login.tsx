import Login from '@/routes/(auth)/-components/Login'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/(auth)/login')({
  validateSearch: (search) => loginSearchSchema.parse(search),
  beforeLoad: (ctx) => {
    const { context, search } = ctx

    const auth = (context as Readonly<{ auth?: { isAuthenticated: boolean } | null }>).auth

    if (auth?.isAuthenticated)
      throw redirect({
        to: search.redirect ?? '/',
      })
  },
  component: LoginRoute,
})

function LoginRoute() {
  const search = Route.useSearch()

  return <Login redirectTo={search.redirect} />
}
