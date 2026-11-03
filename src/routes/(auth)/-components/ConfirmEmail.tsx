import { confirmEmail } from '@/api/auth'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { CheckCircle2, MailCheck } from 'lucide-react'
import { z } from 'zod'
import { AuthPageShell } from './AuthPageShell'

const confirmationSchema = z.object({ token: z.string().trim().min(32) })

export const ConfirmEmail = ({ initialToken = '' }: Readonly<{ initialToken?: string }>) => {
  const mutation = useMutation({ mutationFn: confirmEmail })
  const form = useForm({
    defaultValues: { token: initialToken },
    validators: { onSubmit: confirmationSchema },
    onSubmit: ({ value }) => mutation.mutate(value.token),
  })
  if (mutation.isSuccess)
    return (
      <AuthPageShell title="E-mail confirmado" description="Seu endereço foi validado com sucesso.">
        <div className="flex flex-col items-center gap-4 text-center">
          <CheckCircle2 className="size-10 text-emerald-600" />
          <Link to="/login" className={buttonVariants({ className: 'w-full' })}>
            Entrar na aplicação
          </Link>
        </div>
      </AuthPageShell>
    )
  return (
    <AuthPageShell
      title="Confirmar e-mail"
      description="Confirme o endereço associado à sua conta."
      footer={
        <Link to="/resend-confirmation" className="text-primary font-medium">
          Solicitar um novo código
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
        <MailCheck className="text-primary mx-auto size-10" />
        <form.Field name="token">
          {(field) => (
            <label className="grid gap-2 text-sm font-medium" htmlFor="confirmation-token">
              Código de confirmação
              <Input
                id="confirmation-token"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                autoComplete="one-time-code"
              />
            </label>
          )}
        </form.Field>
        {mutation.isError && (
          <p role="alert" className="text-destructive text-sm">
            O código é inválido ou expirou.
          </p>
        )}
        <form.Subscribe selector={(state) => state.canSubmit}>
          {(canSubmit) => (
            <Button type="submit" disabled={!canSubmit || mutation.isPending}>
              {mutation.isPending ? 'Confirmando…' : 'Confirmar e-mail'}
            </Button>
          )}
        </form.Subscribe>
      </form>
    </AuthPageShell>
  )
}
