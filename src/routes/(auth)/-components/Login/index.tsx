import { AnimatedGridPattern } from '#/components/backgrounds/animated-grid-pattern'
import { authenticateUser } from '@/api/auth'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Spinner } from '@/components/ui/spinner'
import { VersionBadge } from '@/components/VersionBadge'
import { useAuth } from '@/contexts/AuthProvider'
import useGetLogo from '@/hooks/useGetLogo'
import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email('Informe um e-mail válido'),
  password: z.string().min(1, 'Insira a senha'),
})

type LoginProps = {
  redirectTo?: string
}

const Login = ({ redirectTo = '/' }: LoginProps) => {
  const { authenticate } = useAuth()
  const logo = useGetLogo('icon')
  const navigate = useNavigate()
  const [isVisible, setIsVisible] = useState(false)

  const getRedirectPath = (path: string) => {
    try {
      const url = new URL(path, window.location.origin)
      return url.pathname
    } catch {
      const pathname = path.split('?')[0].split('#')[0]
      return pathname || '/'
    }
  }

  const { mutate, isPending } = useMutation({
    mutationFn: authenticateUser,
    meta: {
      loadingToast: false,
    },
    onSuccess: (session) => {
      authenticate(session)
      void navigate({ to: getRedirectPath(redirectTo), replace: true })
    },
    onError: () => {
      toast.error('Erro ao fazer login', {
        description: 'Credenciais inválidas. Tente novamente.',
      })
    },
  })

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validators: {
      onSubmit: schema,
    },
    onSubmit: ({ value }) => {
      mutate({
        email: value.email,
        password: value.password,
      })
    },
  })

  return (
    <div className="bg-background relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8">
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.1}
        duration={3}
        repeatDelay={1}
        className="inset-0 h-full w-full"
      />
      <div className="relative z-10 flex w-full max-w-[400px] flex-col">
        <form
          id="login-form"
          className="bg-card/95 flex w-full flex-col gap-4 rounded-2xl border p-7 shadow-xl backdrop-blur-sm sm:p-8"
          onSubmit={(e) => {
            e.preventDefault()
            void form.handleSubmit()
          }}
        >
          <div className="mb-1 flex w-full flex-col items-center justify-center space-y-2 text-center">
            <img src={logo} alt="Finanças" className="size-12 object-contain" />
            <h1 className="text-xl font-semibold tracking-tight">Finanças</h1>
            <p className="text-muted-foreground max-w-xs text-xs leading-relaxed">
              Entre para acessar seu planejamento financeiro.
            </p>
          </div>
          <FieldGroup className="gap-3">
            <form.Field name="email">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>E-mail</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      autoComplete="email"
                      type="email"
                      placeholder="voce@exemplo.com"
                    />
                    {isInvalid && <FieldError>{field.state.meta.errors.join(', ')}</FieldError>}
                  </Field>
                )
              }}
            </form.Field>
          </FieldGroup>
          <FieldGroup className="gap-3">
            <form.Field name="password">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>Senha</FieldLabel>
                    <InputGroup className="border-input">
                      <InputGroupInput
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        autoComplete="current-password"
                        type={isVisible ? 'text' : 'password'}
                        placeholder="Insira sua senha"
                        className="border-none shadow-none focus-visible:ring-0"
                      />
                      <InputGroupAddon align="inline-end" className="border-none bg-transparent">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-foreground/70 hover:text-foreground h-full rounded-l-none"
                          onClick={() => setIsVisible(!isVisible)}
                          aria-label={isVisible ? 'Ocultar senha' : 'Mostrar senha'}
                        >
                          {isVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </Button>
                      </InputGroupAddon>
                    </InputGroup>
                    {isInvalid && <FieldError>{field.state.meta.errors.join(', ')}</FieldError>}
                  </Field>
                )
              }}
            </form.Field>
          </FieldGroup>
          <Button type="submit" className="mt-1 h-9 w-full rounded-lg" disabled={isPending}>
            {isPending && <Spinner className="mr-2 size-4" />}
            {isPending ? 'Entrando...' : 'Login'}
          </Button>
          <div className="flex items-center justify-between text-xs">
            <Link to="/register" className="text-primary font-medium hover:underline">
              Criar conta
            </Link>
            <Link to="/resend-confirmation" className="text-muted-foreground hover:text-foreground">
              Reenviar confirmação
            </Link>
          </div>
          <div className="flex justify-center pt-1">
            <VersionBadge align="center" />
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
