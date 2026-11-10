import { registerUser } from '@/api/auth'
import { Button, buttonVariants } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { z } from 'zod'
import { AuthPageShell } from './AuthPageShell'
import { AuthenticationDivider, GoogleAuthenticationButton } from './GoogleAuthenticationButton'

const registerSchema = z
  .object({
    displayName: z.string().trim().min(2, 'Informe seu nome').max(120),
    email: z.string().trim().email('Informe um e-mail válido'),
    password: z.string().min(8, 'Use pelo menos 8 caracteres').max(128),
    confirmPassword: z.string(),
  })
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

const registerFields = [
  {
    name: 'displayName',
    label: 'Nome',
    type: 'text',
    autoComplete: 'name',
    placeholder: 'Como devemos chamar você?',
  },
  {
    name: 'email',
    label: 'E-mail',
    type: 'email',
    autoComplete: 'email',
    placeholder: 'voce@exemplo.com',
  },
  {
    name: 'password',
    label: 'Senha',
    type: 'password',
    autoComplete: 'new-password',
    placeholder: 'Use pelo menos 8 caracteres',
  },
  {
    name: 'confirmPassword',
    label: 'Confirmar senha',
    type: 'password',
    autoComplete: 'new-password',
    placeholder: 'Digite a senha novamente',
  },
] as const

const loginHeaderAction = (
  <Link
    to="/login"
    className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-xs transition-colors sm:text-sm"
  >
    <ArrowLeft className="size-3.5" />
    Entrar
  </Link>
)

export const Register = () => {
  const mutation = useMutation({ mutationFn: registerUser })
  const [visiblePasswords, setVisiblePasswords] = useState({
    password: false,
    confirmPassword: false,
  })

  const togglePasswordVisibility = (name: 'password' | 'confirmPassword') => {
    setVisiblePasswords((current) => ({ ...current, [name]: !current[name] }))
  }

  const form = useForm({
    defaultValues: { displayName: '', email: '', password: '', confirmPassword: '' },
    validators: { onChange: registerSchema, onSubmit: registerSchema },
    onSubmit: ({ value }) =>
      mutation.mutate({
        displayName: value.displayName,
        email: value.email,
        password: value.password,
      }),
  })
  if (mutation.isSuccess)
    return (
      <AuthPageShell
        title="Conta criada"
        description="Seu acesso está pronto para confirmação."
        eyebrow="Bem-vindo à Nummo"
        headerAction={loginHeaderAction}
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="bg-primary/10 flex size-14 items-center justify-center rounded-2xl">
            <CheckCircle2 className="text-primary size-7" />
          </span>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {mutation.data.emailConfirmationRequired
              ? 'Enviamos as instruções de confirmação para seu e-mail.'
              : 'Sua conta já está confirmada. Você pode entrar agora.'}
          </p>
          <Link to="/login" className={buttonVariants({ className: 'h-11 w-full rounded-xl' })}>
            Ir para o login <ArrowRight className="ml-1 size-4" />
          </Link>
        </div>
      </AuthPageShell>
    )
  return (
    <AuthPageShell
      title="Criar sua conta"
      description="Crie seu acesso. Depois de entrar, você poderá criar seus espaços financeiros."
      eyebrow="Comece na Nummo"
      headerAction={loginHeaderAction}
      footer={
        <>
          Já possui conta?{' '}
          <Link to="/login" className="text-foreground font-semibold hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      <div className="mb-5 grid gap-5">
        <GoogleAuthenticationButton label="Criar conta com o Google" />
        <AuthenticationDivider />
      </div>
      <form
        className="grid gap-5"
        onSubmit={(event) => {
          event.preventDefault()
          void form.handleSubmit()
        }}
      >
        <FieldGroup className="gap-4">
          {registerFields.map((config) => (
            <form.Field key={config.name} name={config.name}>
              {(field) => {
                const invalid = field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={invalid}>
                    <FieldLabel htmlFor={config.name}>{config.label}</FieldLabel>
                    {config.type === 'password' ? (
                      <InputGroup className="border-input h-11 rounded-xl">
                        <InputGroupInput
                          id={config.name}
                          name={config.name}
                          type={visiblePasswords[config.name] ? 'text' : 'password'}
                          autoComplete={config.autoComplete}
                          placeholder={config.placeholder}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) => field.handleChange(event.target.value)}
                          aria-invalid={invalid}
                          className="h-10 border-none px-3.5 shadow-none focus-visible:ring-0"
                        />
                        <InputGroupAddon align="inline-end" className="border-none bg-transparent">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-foreground/70 hover:text-foreground h-full rounded-l-none"
                            onClick={() => togglePasswordVisibility(config.name)}
                            aria-label={
                              visiblePasswords[config.name]
                                ? `Ocultar ${config.label.toLowerCase()}`
                                : `Mostrar ${config.label.toLowerCase()}`
                            }
                          >
                            {visiblePasswords[config.name] ? (
                              <EyeOff className="size-4" />
                            ) : (
                              <Eye className="size-4" />
                            )}
                          </Button>
                        </InputGroupAddon>
                      </InputGroup>
                    ) : (
                      <Input
                        id={config.name}
                        name={config.name}
                        type={config.type}
                        autoComplete={config.autoComplete}
                        placeholder={config.placeholder}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
                        aria-invalid={invalid}
                        className="h-11 rounded-xl px-3.5"
                      />
                    )}
                    {invalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                )
              }}
            </form.Field>
          ))}
        </FieldGroup>
        {mutation.isError && (
          <p
            role="alert"
            className="border-destructive/20 bg-destructive/5 text-destructive rounded-xl border px-3 py-2 text-sm"
          >
            Não foi possível criar a conta. Verifique os dados ou tente outro e-mail.
          </p>
        )}
        <Button type="submit" size="lg" className="h-11 rounded-xl" disabled={mutation.isPending}>
          {mutation.isPending ? 'Criando conta…' : 'Criar conta'}
          {!mutation.isPending && <ArrowRight className="ml-1 size-4" />}
        </Button>
      </form>
    </AuthPageShell>
  )
}
