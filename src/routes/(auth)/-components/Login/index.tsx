import { authenticateUser } from '@/api/auth'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Spinner } from '@/components/ui/spinner'
import { useAuth } from '@/contexts/AuthProvider'
import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import { AuthLayout } from '../AuthPageShell'

const schema = z.object({
  email: z.string().email('Informe um e-mail válido'),
  password: z.string().min(1, 'Insira a senha'),
})

type LoginProps = {
  redirectTo?: string
}

const Login = ({ redirectTo = '/' }: LoginProps) => {
  const { authenticate } = useAuth()
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
    <AuthLayout>
      <div className="mb-8 space-y-2">
        <p className="text-primary text-xs font-semibold tracking-[0.18em] uppercase">
          Bem-vindo de volta
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Entre na sua conta</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Acesse seu planejamento e acompanhe sua vida financeira com clareza.
        </p>
      </div>

      <form
        id="login-form"
        className="flex w-full flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit()
        }}
      >
        <FieldGroup className="gap-4">
          <form.Field name="email">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>E-mail</FieldLabel>
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
                    className="h-11 rounded-xl px-3.5"
                  />
                  {isInvalid && <FieldError>{field.state.meta.errors.join(', ')}</FieldError>}
                </Field>
              )
            }}
          </form.Field>
        </FieldGroup>
        <FieldGroup className="gap-4">
          <form.Field name="password">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Senha</FieldLabel>
                  <InputGroup className="border-input h-11 rounded-xl">
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
                      className="h-10 border-none px-3.5 shadow-none focus-visible:ring-0"
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
        <Button
          type="submit"
          size="lg"
          className="mt-1 h-11 w-full rounded-xl"
          disabled={isPending}
        >
          {isPending && <Spinner className="mr-2 size-4" />}
          <span>{isPending ? 'Entrando...' : 'Entrar'}</span>
          {!isPending && <ArrowRight className="ml-1 size-4" />}
        </Button>
        <p className="text-muted-foreground text-center text-sm">
          Ainda não tem uma conta?{' '}
          <Link to="/register" className="text-foreground font-semibold hover:underline">
            Crie sua conta
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}

export default Login
