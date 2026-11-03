import { registerUser } from '@/api/auth'
import { Button, buttonVariants } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { CheckCircle2 } from 'lucide-react'
import { z } from 'zod'
import { AuthPageShell } from './AuthPageShell'

const registerSchema = z
  .object({
    displayName: z.string().trim().min(2, 'Informe seu nome').max(120),
    email: z.string().trim().email('Informe um e-mail válido'),
    password: z.string().min(12, 'Use pelo menos 12 caracteres').max(128),
    confirmPassword: z.string(),
  })
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

export const Register = () => {
  const mutation = useMutation({ mutationFn: registerUser })
  const form = useForm({
    defaultValues: { displayName: '', email: '', password: '', confirmPassword: '' },
    validators: { onSubmit: registerSchema },
    onSubmit: ({ value }) =>
      mutation.mutate({
        displayName: value.displayName,
        email: value.email,
        password: value.password,
      }),
  })
  if (mutation.isSuccess)
    return (
      <AuthPageShell title="Conta criada" description="Seu acesso está pronto para confirmação.">
        <div className="flex flex-col items-center gap-4 text-center">
          <CheckCircle2 className="size-10 text-emerald-600" />
          <p className="text-sm">Enviamos as instruções de confirmação para seu e-mail.</p>
          <Link to="/login" className={buttonVariants({ className: 'w-full' })}>
            Ir para o login
          </Link>
        </div>
      </AuthPageShell>
    )
  return (
    <AuthPageShell
      title="Criar conta"
      description="Crie seu acesso. Depois de entrar, você poderá criar seus espaços financeiros."
      footer={
        <>
          Já possui conta?{' '}
          <Link to="/login" className="text-primary font-medium">
            Entrar
          </Link>
        </>
      }
    >
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          void form.handleSubmit()
        }}
      >
        <FieldGroup>
          {(['displayName', 'email', 'password', 'confirmPassword'] as const).map((name) => (
            <form.Field key={name} name={name}>
              {(field) => {
                const invalid = field.state.meta.isTouched && !field.state.meta.isValid
                const labels = {
                  displayName: 'Nome',
                  email: 'E-mail',
                  password: 'Senha',
                  confirmPassword: 'Confirmar senha',
                }
                return (
                  <Field data-invalid={invalid}>
                    <FieldLabel htmlFor={name}>{labels[name]}</FieldLabel>
                    <Input
                      id={name}
                      type={
                        name.includes('password') || name.includes('Password')
                          ? 'password'
                          : name === 'email'
                            ? 'email'
                            : 'text'
                      }
                      autoComplete={
                        name === 'email'
                          ? 'email'
                          : name === 'displayName'
                            ? 'name'
                            : name === 'password'
                              ? 'new-password'
                              : 'new-password'
                      }
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      aria-invalid={invalid}
                    />
                    {invalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                )
              }}
            </form.Field>
          ))}
        </FieldGroup>
        {mutation.isError && (
          <p role="alert" className="text-destructive text-sm">
            Não foi possível criar a conta. Verifique os dados ou tente outro e-mail.
          </p>
        )}
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Criando conta…' : 'Criar conta'}
        </Button>
      </form>
    </AuthPageShell>
  )
}
