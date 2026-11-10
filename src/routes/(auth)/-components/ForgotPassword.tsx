import { recoverPassword } from '@/api/auth'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight, KeyRound } from 'lucide-react'
import { z } from 'zod'
import { AuthPageShell } from './AuthPageShell'

const schema = z.object({ email: z.string().trim().email('Informe um e-mail válido') })

export const ForgotPassword = () => {
  const mutation = useMutation({ mutationFn: recoverPassword })
  const form = useForm({
    defaultValues: { email: '' },
    validators: { onSubmit: schema },
    onSubmit: ({ value }) => mutation.mutate(value.email),
  })

  return (
    <AuthPageShell
      title="Recuperar senha"
      description="Informe seu e-mail e enviaremos um link seguro para criar uma nova senha."
      eyebrow="Recupere seu acesso"
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
        className="grid gap-5"
        onSubmit={(event) => {
          event.preventDefault()
          void form.handleSubmit()
        }}
      >
        <span className="bg-primary/10 flex size-12 items-center justify-center rounded-2xl">
          <KeyRound className="text-primary size-6" />
        </span>
        <form.Field name="email">
          {(field) => {
            const invalid = field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={invalid}>
                <FieldLabel htmlFor="recovery-email">E-mail</FieldLabel>
                <Input
                  id="recovery-email"
                  type="email"
                  autoComplete="email"
                  placeholder="voce@exemplo.com"
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
        {mutation.isSuccess && (
          <p
            role="status"
            className="border-primary/20 bg-primary/5 rounded-xl border px-3 py-2 text-sm leading-relaxed"
          >
            Se a conta existir, enviaremos as instruções para redefinir a senha.
          </p>
        )}
        {mutation.isError && (
          <p
            role="alert"
            className="border-destructive/20 bg-destructive/5 text-destructive rounded-xl border px-3 py-2 text-sm"
          >
            Não foi possível processar a solicitação agora.
          </p>
        )}
        <form.Subscribe selector={(state) => state.canSubmit}>
          {(canSubmit) => (
            <Button
              type="submit"
              size="lg"
              className="h-11 rounded-xl"
              disabled={!canSubmit || mutation.isPending}
            >
              {mutation.isPending ? 'Enviando…' : 'Enviar link'}
              {!mutation.isPending && <ArrowRight className="ml-1 size-4" />}
            </Button>
          )}
        </form.Subscribe>
      </form>
    </AuthPageShell>
  )
}
