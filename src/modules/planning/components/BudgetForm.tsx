import { MutationErrorMessage } from '@/components/MutationErrorMessage'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { categoriesQueryOptions } from '@/modules/transactions/queries/transaction.queries'
import { parseNonNegativeMoneyToCents } from '@/modules/transactions/utils/money'
import {
  getActiveWorkspaceBaseCurrency,
  workspaceAccessStore,
} from '@/modules/workspaces/store/workspace-access.store'
import { useForm } from '@tanstack/react-form'
import { useQuery } from '@tanstack/react-query'
import { useStore } from '@tanstack/react-store'
import { z } from 'zod'
import { planningApi } from '../api/planning.api'
import type { Budget } from '../models/planning.types'
import { usePlanningMutation } from '../queries/planning.queries'

const budgetFormSchema = z.object({
  categoryId: z.string().trim().min(1, 'Selecione uma categoria.'),
  limit: z
    .string()
    .refine((value) => parseNonNegativeMoneyToCents(value) !== null, 'Informe um valor válido.'),
  currency: z.string().trim().length(3),
})

export const BudgetForm = ({
  month,
  readOnly,
  onCancel,
  onSuccess,
  budget,
}: {
  month: string
  readOnly: boolean
  onCancel?: () => void
  onSuccess?: () => void
  budget?: Budget
}) => {
  const createMutation = usePlanningMutation(planningApi.createBudget)
  const updateMutation = usePlanningMutation(
    ({ budget, limitCents }: { budget: Budget; limitCents: number }) =>
      planningApi.updateBudget(budget, limitCents),
  )
  const mutation = budget ? updateMutation : createMutation
  const categories = useQuery(categoriesQueryOptions())
  const baseCurrency = useStore(workspaceAccessStore, getActiveWorkspaceBaseCurrency)
  const form = useForm({
    defaultValues: {
      categoryId: budget?.categoryId ?? '',
      limit: budget ? (budget.limitCents / 100).toFixed(2).replace('.', ',') : '',
      currency: budget?.currency ?? baseCurrency ?? '',
    },
    validators: { onSubmit: budgetFormSchema },
    onSubmit: async ({ value, formApi }) => {
      const limitCents = parseNonNegativeMoneyToCents(value.limit)
      if (!value.categoryId || limitCents === null) return
      if (budget) await updateMutation.mutateAsync({ budget, limitCents })
      else
        await createMutation.mutateAsync({
          month,
          categoryId: value.categoryId,
          limitCents,
          currency: value.currency.toUpperCase(),
        })
      formApi.reset()
      onSuccess?.()
    },
  })
  return (
    <form
      className="grid gap-3 sm:grid-cols-[1fr_160px_90px]"
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <form.Field name="categoryId">
        {(field) => {
          const invalid = !field.state.meta.isValid
          return (
            <Field data-invalid={invalid}>
              <FieldLabel htmlFor={field.name}>Categoria</FieldLabel>
              <SearchableSelect
                id={field.name}
                value={field.state.value}
                onValueChange={field.handleChange}
                disabled={Boolean(budget)}
                placeholder="Selecione uma categoria"
                searchPlaceholder="Buscar categoria..."
                options={(categories.data?.items ?? [])
                  .filter((category) => category.active && category.type === 'EXPENSE')
                  .map((category) => ({ value: category.id, label: category.name }))}
              />
              {invalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>
      <form.Field name="limit">
        {(field) => {
          const invalid = !field.state.meta.isValid
          return (
            <Field data-invalid={invalid}>
              <FieldLabel htmlFor={field.name}>Limite</FieldLabel>
              <Input
                id={field.name}
                inputMode="decimal"
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
              />
              {invalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>
      <form.Field name="currency">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>Moeda</FieldLabel>
            <Input
              id={field.name}
              maxLength={3}
              disabled={Boolean(budget)}
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
            />
          </Field>
        )}
      </form.Field>
      <div className="sm:col-span-3">
        <MutationErrorMessage
          error={mutation.error}
          fallbackMessage="Não foi possível salvar o orçamento."
        />
      </div>
      <DialogFooter className="sm:col-span-3">
        <Button type="button" variant="outline" disabled={mutation.isPending} onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={readOnly || mutation.isPending || (!budget && !baseCurrency)}
        >
          {mutation.isPending ? 'Salvando…' : budget ? 'Salvar alterações' : 'Criar orçamento'}
        </Button>
      </DialogFooter>
    </form>
  )
}
