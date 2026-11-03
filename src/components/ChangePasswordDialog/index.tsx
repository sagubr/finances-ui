import { changePassword } from '@/api/auth'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthProvider'
import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { z } from 'zod'

const ChangePasswordDialog = () => {
  const { isChangePasswordOpen: isOpen, setChangePasswordOpen: onClose } = useAuth()

  const { mutate, isPending } = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success('Senha alterada com sucesso.')
      onClose(false)
    },
    onError: () => {
      toast.error('Erro ao alterar senha.', {
        description: 'Houve um erro ao alterar a senha. Tente novamente.',
      })
    },
  })

  const form = useForm({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    validators: {
      onChange: z
        .object({
          password: z.string().min(4, 'Senha deve ter no mínimo 4 caracteres.'),
          confirmPassword: z.string().min(4, 'Senha deve ter no mínimo 4 caracteres.'),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: 'Senhas não coincidem.',
          path: ['confirmPassword'],
        }),
    },
    onSubmit: async ({ value }) => {
      mutate(value.password)
    },
  })

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Alterar Senha</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            void form.handleSubmit()
          }}
        >
          <FieldGroup>
            <form.Field
              name="password"
              children={(field) => (
                <Field>
                  <FieldLabel>Nova senha</FieldLabel>
                  <Input
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    placeholder="Insira sua nova senha"
                    onChange={(e) => field.handleChange(e.target.value)}
                    type="password"
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            />
            <form.Field
              name="confirmPassword"
              children={(field) => (
                <Field>
                  <FieldLabel>Confirmar senha</FieldLabel>
                  <Input
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    placeholder="Confirme sua nova senha"
                    onChange={(e) => field.handleChange(e.target.value)}
                    type="password"
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            />
          </FieldGroup>
          <DialogFooter className="mt-6">
            <Button variant="ghost" onClick={() => onClose(false)} type="button">
              Cancelar
            </Button>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting || isPending}>
                  Confirmar
                </Button>
              )}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ChangePasswordDialog
