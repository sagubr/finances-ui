import { resetPassword } from '@/api/auth'
import { Button, buttonVariants } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, LockKeyhole } from 'lucide-react'
import { useState } from 'react'
import { z } from 'zod'
import { AuthPageShell } from './AuthPageShell'

const schema = z
  .object({
    token: z.string().trim().min(32, 'Informe o código recebido'),
    password: z.string().min(8, 'Use pelo menos 8 caracteres').max(128),
    confirmation: z.string(),
  })
  .refine((value) => value.password === value.confirmation, {
    path: ['confirmation'],
    message: 'As senhas não coincidem',
  })

export const ResetPassword = ({ initialToken = '' }: Readonly<{ initialToken?: string }>) => {
  const mutation = useMutation({ mutationFn: resetPassword })
  const [visiblePasswords, setVisiblePasswords] = useState({
    password: false,
    confirmation: false,
  })
  const form = useForm({
    defaultValues: { token: initialToken, password: '', confirmation: '' },
    validators: { onChange: schema, onSubmit: schema },
    onSubmit: ({ value }) => mutation.mutate({ token: value.token, password: value.password }),
  })

  if (mutation.isSuccess)
    return (
      <AuthPageShell
        title="Senha redefinida"
        description="Sua nova senha já está ativa."
        eyebrow="Tudo certo"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="bg-primary/10 flex size-14 items-center justify-center rounded-2xl">
            <CheckCircle2 className="text-primary size-7" />
          </span>
          <Link to="/login" className={buttonVariants({ className: 'h-11 w-full rounded-xl' })}>
            Entrar na Nummo <ArrowRight className="ml-1 size-4" />
          </Link>
        </div>
      </AuthPageShell>
    )

  return (
    <AuthPageShell
      title="Crie uma nova senha"
      description={
        initialToken
          ? 'Escolha uma nova senha para concluir a recuperação da sua conta.'
          : 'Informe o código recebido por e-mail e escolha uma senha segura.'
      }
      eyebrow="Proteja sua conta"
      headerAction={
        <Link
          to="/login"
          className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-xs transition-colors sm:text-sm"
        >
          <ArrowLeft className="size-3.5" /> Voltar
        </Link>
      }
    >
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          void form.handleSubmit()
        }}
      >
        <span className="bg-primary/10 flex size-12 items-center justify-center rounded-2xl">
          <LockKeyhole className="text-primary size-6" />
        </span>
        {!initialToken && (
          <form.Field name="token">
            {(field) => {
              const invalid = field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={invalid}>
                  <FieldLabel htmlFor="reset-token">Código de recuperação</FieldLabel>
                  <Input
                    id="reset-token"
                    autoComplete="one-time-code"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={invalid}
                    className="h-11 rounded-xl px-3.5"
                  />
                  {invalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          </form.Field>
        )}
        {(['password', 'confirmation'] as const).map((name) => (
          <form.Field key={name} name={name}>
            {(field) => {
              const invalid = field.state.meta.isTouched && !field.state.meta.isValid
              const labels = {
                password: 'Nova senha',
                confirmation: 'Confirme a nova senha',
              }
              return (
                <Field data-invalid={invalid}>
                  <FieldLabel htmlFor={`reset-${name}`}>{labels[name]}</FieldLabel>
                  <InputGroup className="border-input h-11 rounded-xl">
                    <InputGroupInput
                      id={`reset-${name}`}
                      type={visiblePasswords[name] ? 'text' : 'password'}
                      autoComplete="new-password"
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
                        onClick={() =>
                          setVisiblePasswords((current) => ({
                            ...current,
                            [name]: !current[name],
                          }))
                        }
                        aria-label={
                          visiblePasswords[name]
                            ? `Ocultar ${labels[name].toLowerCase()}`
                            : `Mostrar ${labels[name].toLowerCase()}`
                        }
                      >
                        {visiblePasswords[name] ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </Button>
                    </InputGroupAddon>
                  </InputGroup>
                  {invalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          </form.Field>
        ))}
        {mutation.isError && (
          <p
            role="alert"
            className="border-destructive/20 bg-destructive/5 text-destructive rounded-xl border px-3 py-2 text-sm"
          >
            O código é inválido ou expirou. Solicite um novo link.
          </p>
        )}
        <form.Subscribe selector={(state) => state.canSubmit}>
          {(canSubmit) => (
            <Button
              type="submit"
              size="lg"
              className="mt-1 h-11 rounded-xl"
              disabled={!canSubmit || mutation.isPending}
            >
              {mutation.isPending ? 'Salvando…' : 'Redefinir senha'}
              {!mutation.isPending && <ArrowRight className="ml-1 size-4" />}
            </Button>
          )}
        </form.Subscribe>
      </form>
    </AuthPageShell>
  )
}
