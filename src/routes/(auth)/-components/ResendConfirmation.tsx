import { resendConfirmation } from '@/api/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Mail } from 'lucide-react'
import { z } from 'zod'
import { AuthPageShell } from './AuthPageShell'

const resendSchema = z.object({ email: z.string().trim().email() })

export const ResendConfirmation = () => {
  const mutation = useMutation({ mutationFn: resendConfirmation })
  const form = useForm({
    defaultValues: { email: '' },
    validators: { onSubmit: resendSchema },
    onSubmit: ({ value }) => mutation.mutate(value.email),
  })
  return (
    <AuthPageShell
      title="Reenviar confirmação"
      description="Informe o e-mail usado no cadastro."
      footer={
        <Link to="/login" className="text-primary font-medium">
          Voltar para o login
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
        <Mail className="text-primary mx-auto size-10" />
        <form.Field name="email">
          {(field) => (
            <label className="grid gap-2 text-sm font-medium" htmlFor="resend-email">
              E-mail
              <Input
                id="resend-email"
                type="email"
                autoComplete="email"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />
            </label>
          )}
        </form.Field>
        {mutation.isSuccess && (
          <p role="status" className="text-sm text-emerald-700">
            Se a conta existir e ainda não estiver confirmada, enviaremos novas instruções.
          </p>
        )}
        {mutation.isError && (
          <p role="alert" className="text-destructive text-sm">
            Não foi possível processar a solicitação agora.
          </p>
        )}
        <form.Subscribe selector={(state) => state.canSubmit}>
          {(canSubmit) => (
            <Button type="submit" disabled={!canSubmit || mutation.isPending}>
              {mutation.isPending ? 'Enviando…' : 'Reenviar confirmação'}
            </Button>
          )}
        </form.Subscribe>
      </form>
    </AuthPageShell>
  )
}
