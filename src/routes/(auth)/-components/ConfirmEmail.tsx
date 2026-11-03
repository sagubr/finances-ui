import { confirmEmail } from '@/api/auth'
import { Button, buttonVariants } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight, CheckCircle2, MailCheck } from 'lucide-react'
import { z } from 'zod'
import { AuthPageShell } from './AuthPageShell'

const confirmationSchema = z.object({ token: z.string().trim().min(32) })

const loginHeaderAction = (
  <Link
    to="/login"
    className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-xs transition-colors sm:text-sm"
  >
    <ArrowLeft className="size-3.5" />
    Voltar
  </Link>
)

export const ConfirmEmail = ({ initialToken = '' }: Readonly<{ initialToken?: string }>) => {
  const mutation = useMutation({ mutationFn: confirmEmail })
  const form = useForm({
    defaultValues: { token: initialToken },
    validators: { onSubmit: confirmationSchema },
    onSubmit: ({ value }) => mutation.mutate(value.token),
  })
  if (mutation.isSuccess)
    return (
      <AuthPageShell
        title="E-mail confirmado"
        description="Seu endereço foi validado com sucesso."
        eyebrow="Tudo certo"
        headerAction={loginHeaderAction}
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
      title="Confirmar e-mail"
      description="Confirme o endereço associado à sua conta."
      eyebrow="Proteja sua conta"
      headerAction={loginHeaderAction}
      footer={
        <Link to="/resend-confirmation" className="text-foreground font-semibold hover:underline">
          Solicitar um novo código
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
          <MailCheck className="text-primary size-6" />
        </span>
        <form.Field name="token">
          {(field) => {
            const invalid = field.state.meta.isTouched && !field.state.meta.isValid

            return (
              <Field data-invalid={invalid}>
                <FieldLabel htmlFor="confirmation-token">Código de confirmação</FieldLabel>
                <Input
                  id="confirmation-token"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  autoComplete="one-time-code"
                  placeholder="Cole o código recebido por e-mail"
                  aria-invalid={invalid}
                  className="h-11 rounded-xl px-3.5"
                />
                {invalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>
        {mutation.isError && (
          <p
            role="alert"
            className="border-destructive/20 bg-destructive/5 text-destructive rounded-xl border px-3 py-2 text-sm"
          >
            O código é inválido ou expirou.
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
              {mutation.isPending ? 'Confirmando…' : 'Confirmar e-mail'}
              {!mutation.isPending && <ArrowRight className="ml-1 size-4" />}
            </Button>
          )}
        </form.Subscribe>
      </form>
    </AuthPageShell>
  )
}
