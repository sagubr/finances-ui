import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { DialogFooter } from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { SearchableSelect } from '@/components/ui/searchable-select'
import {
  accountsQueryOptions,
  categoriesQueryOptions,
} from '@/modules/transactions/queries/transaction.queries'
import { parseMoneyToCents } from '@/modules/transactions/utils/money'
import { parseCivilDate, toCivilDate, todayCivilDate } from '@/utils/date'
import { useForm } from '@tanstack/react-form'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { planningApi } from '../api/planning.api'
import type { InstallmentPlan } from '../models/planning.types'
import { cardsQuery, useCreateInstallments, usePlanningMutation } from '../queries/planning.queries'

const installmentFormSchema = z
  .object({
    description: z.string().trim().min(1, 'Informe a descrição.').max(500),
    amount: z
      .string()
      .refine((value) => Boolean(parseMoneyToCents(value)), 'Informe um valor maior que zero.'),
    target: z.enum(['ACCOUNT', 'CARD']),
    accountId: z.string(),
    creditCardId: z.string(),
    categoryId: z.string(),
    installments: z.number().int().min(1).max(600),
    firstDueOn: z.iso.date(),
  })
  .superRefine((value, context) => {
    if (value.target === 'ACCOUNT' && !value.accountId)
      context.addIssue({ code: 'custom', path: ['accountId'], message: 'Selecione uma conta.' })
    if (value.target === 'CARD' && !value.creditCardId)
      context.addIssue({ code: 'custom', path: ['creditCardId'], message: 'Selecione um cartão.' })
    if (value.target === 'CARD' && !value.categoryId)
      context.addIssue({
        code: 'custom',
        path: ['categoryId'],
        message: 'Selecione uma categoria.',
      })
  })

const AccountSelect = ({
  value,
  onChange,
  invalid = false,
  errors,
}: {
  value: string
  onChange: (value: string) => void
  invalid?: boolean
  errors?: Array<{ message?: string } | string | undefined>
}) => {
  const accounts = useQuery(accountsQueryOptions())
  return (
    <Field data-invalid={invalid}>
      <FieldLabel>Conta</FieldLabel>
      <SearchableSelect
        value={value}
        onValueChange={onChange}
        placeholder="Selecione uma conta"
        searchPlaceholder="Buscar conta..."
        options={(accounts.data?.items ?? []).map((account) => ({
          value: account.id,
          label: account.name,
          badge: account.currency,
        }))}
      />
      {invalid && <FieldError errors={errors} />}
    </Field>
  )
}

export const InstallmentForm = ({
  readOnly,
  onCancel,
  onSuccess,
  plan,
}: {
  readOnly: boolean
  onCancel?: () => void
  onSuccess?: () => void
  plan?: InstallmentPlan
}) => {
  const createMutation = useCreateInstallments()
  const updateMutation = usePlanningMutation(
    (input: Omit<Parameters<typeof planningApi.createInstallments>[0], 'installments'>) =>
      plan
        ? planningApi.updateInstallments(plan, input)
        : Promise.reject(new Error('Missing installment plan')),
  )
  const mutation = plan ? updateMutation : createMutation
  const accounts = useQuery(accountsQueryOptions())
  const categories = useQuery(categoriesQueryOptions())
  const cards = useQuery(cardsQuery())
  const form = useForm({
    defaultValues: {
      description: plan?.description ?? '',
      amount: plan ? (plan.totalAmountCents / 100).toFixed(2).replace('.', ',') : '',
      installments: plan?.installments ?? 2,
      target: plan?.creditCardId ? ('CARD' as const) : ('ACCOUNT' as const),
      accountId: plan?.accountId ?? '',
      creditCardId: plan?.creditCardId ?? '',
      categoryId: plan?.categoryId ?? '',
      firstDueOn: plan?.firstDueOn ?? todayCivilDate(),
    },
    validators: { onSubmit: installmentFormSchema },
    onSubmit: async ({ value }) => {
      const totalAmountCents = parseMoneyToCents(value.amount)
      if (!totalAmountCents) return
      const selectedCard = cards.data?.items.find(({ id }) => id === value.creditCardId)
      const accountId = value.target === 'CARD' ? selectedCard?.paymentAccountId : value.accountId
      const currency =
        value.target === 'CARD'
          ? selectedCard?.currency
          : accounts.data?.items.find(({ id }) => id === value.accountId)?.currency
      if (!currency || !accountId) return
      const input = {
        accountId,
        ...(value.target === 'CARD' && selectedCard ? { creditCardId: selectedCard.id } : {}),
        categoryId: value.categoryId || undefined,
        description: value.description.trim(),
        totalAmountCents,
        firstDueOn: value.firstDueOn,
        currency,
      }
      if (plan) await updateMutation.mutateAsync(input)
      else await createMutation.mutateAsync({ ...input, installments: value.installments })
      onSuccess?.()
    },
  })
  return (
    <form
      className="grid gap-4 sm:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <form.Field name="description">
        {(field) => {
          const invalid = !field.state.meta.isValid
          return (
            <Field data-invalid={invalid}>
              <FieldLabel htmlFor={`inst-${field.name}`}>Descrição</FieldLabel>
              <Input
                id={`inst-${field.name}`}
                aria-invalid={invalid}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />
              {invalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>
      {!plan && (
        <form.Field name="target">
          {(field) => (
            <Field>
              <FieldLabel>Destino</FieldLabel>
              <SearchableSelect
                value={field.state.value}
                onValueChange={(value) => field.handleChange(value as 'ACCOUNT' | 'CARD')}
                options={[
                  { value: 'ACCOUNT', label: 'Conta' },
                  { value: 'CARD', label: 'Cartão de crédito' },
                ]}
              />
            </Field>
          )}
        </form.Field>
      )}
      <form.Field name="amount">
        {(field) => {
          const invalid = !field.state.meta.isValid
          return (
            <Field data-invalid={invalid}>
              <FieldLabel htmlFor={`inst-${field.name}`}>Valor total</FieldLabel>
              <Input
                id={`inst-${field.name}`}
                aria-invalid={invalid}
                inputMode="decimal"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />
              {invalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>
      <form.Subscribe selector={(state) => state.values.target}>
        {(target) =>
          target === 'CARD' ? (
            <form.Field name="creditCardId">
              {(field) => {
                const invalid = !field.state.meta.isValid
                return (
                  <Field data-invalid={invalid}>
                    <FieldLabel>Cartão</FieldLabel>
                    <SearchableSelect
                      value={field.state.value}
                      onValueChange={field.handleChange}
                      placeholder="Selecione um cartão"
                      options={(cards.data?.items ?? [])
                        .filter((card) => card.active && card.paymentAccountId)
                        .map((card) => ({
                          value: card.id,
                          label: card.name,
                          badge: card.lastFour ? `•••• ${card.lastFour}` : card.currency,
                        }))}
                    />
                    {invalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                )
              }}
            </form.Field>
          ) : (
            <form.Field name="accountId">
              {(field) => {
                const invalid = !field.state.meta.isValid
                return (
                  <AccountSelect
                    value={field.state.value}
                    onChange={field.handleChange}
                    invalid={invalid}
                    errors={field.state.meta.errors}
                  />
                )
              }}
            </form.Field>
          )
        }
      </form.Subscribe>
      <form.Field name="categoryId">
        {(field) => {
          const invalid = !field.state.meta.isValid
          return (
            <Field data-invalid={invalid}>
              <FieldLabel>Categoria de despesa</FieldLabel>
              <SearchableSelect
                value={field.state.value}
                onValueChange={field.handleChange}
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
      <form.Field name="installments">
        {(field) => {
          const invalid = !field.state.meta.isValid
          return (
            <Field data-invalid={invalid}>
              <FieldLabel htmlFor={`inst-${field.name}`}>Parcelas</FieldLabel>
              <Input
                id={`inst-${field.name}`}
                aria-invalid={invalid}
                type="number"
                min={1}
                max={600}
                value={field.state.value}
                disabled={Boolean(plan)}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.valueAsNumber)}
              />
              {invalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>
      <form.Field name="firstDueOn">
        {(field) => {
          const invalid = !field.state.meta.isValid
          return (
            <Field data-invalid={invalid}>
              <FieldLabel>Data da primeira parcela</FieldLabel>
              <DatePicker
                value={parseCivilDate(field.state.value)}
                onChange={(value) => value && field.handleChange(toCivilDate(value))}
              />
              {invalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>
      <DialogFooter className="sm:col-span-2">
        <Button type="button" variant="outline" disabled={mutation.isPending} onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={readOnly || mutation.isPending}>
          {mutation.isPending ? 'Salvando…' : plan ? 'Salvar alterações' : 'Gerar parcelas'}
        </Button>
      </DialogFooter>
    </form>
  )
}
