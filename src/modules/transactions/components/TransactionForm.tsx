import { ApiClientError } from '@/api/api-client.error'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { DialogFooter } from '@/components/ui/dialog'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { MoneyInput } from '@/components/ui/money-input'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { parseCivilDate, toCivilDate, todayCivilDate } from '@/utils/date'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { z } from 'zod'
import type {
  Account,
  Category,
  CreateTransactionInput,
  Transaction,
  TransactionLocation,
  TransactionType,
} from '../models/transaction.types'
import { useCreateTransaction, useUpdateTransaction } from '../queries/transaction.queries'
import { accountsForCurrency } from '../utils/account-selection'
import { formatCentsForInput, parseMoneyToCents } from '../utils/money'
import { TransactionLocationField } from './TransactionLocationField'

type TransactionFormProps = Readonly<{
  accounts: readonly Account[]
  categories: readonly Category[]
  transaction?: Transaction
  onCancel?: () => void
  onSuccess?: () => void
}>

const transactionFormSchema = z.object({
  accountId: z.string().min(1, 'Selecione uma conta.'),
  categoryId: z.string(),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER', 'CARD_PAYMENT', 'INVESTMENT']),
  status: z.enum(['PLANNED', 'CONFIRMED', 'SETTLED']),
  amount: z
    .string()
    .refine((value) => parseMoneyToCents(value) !== null, 'Informe um valor válido.'),
  description: z.string().trim().min(1, 'Informe uma descrição.').max(500),
  occurredOn: z.iso.date(),
})

export const TransactionForm = ({
  accounts,
  categories,
  transaction,
  onCancel,
  onSuccess,
}: TransactionFormProps) => {
  const createMutation = useCreateTransaction()
  const updateMutation = useUpdateTransaction()
  const mutation = transaction ? updateMutation : createMutation
  const [location, setLocation] = useState<TransactionLocation | null>(
    transaction?.location ?? null,
  )
  const availableAccounts = accountsForCurrency(
    accounts.filter(({ active }) => active),
    transaction?.currency,
  )
  const form = useForm({
    defaultValues: {
      accountId: transaction?.accountId ?? availableAccounts[0]?.id ?? '',
      categoryId: transaction?.categoryId ?? '',
      type: transaction?.type ?? ('EXPENSE' as TransactionType),
      status: transaction?.status ?? ('CONFIRMED' as 'PLANNED' | 'CONFIRMED' | 'SETTLED'),
      amount: formatCentsForInput(transaction?.amountCents),
      description: transaction?.description ?? '',
      occurredOn: transaction?.occurredOn ?? todayCivilDate(),
    },
    validators: { onSubmit: transactionFormSchema },
    onSubmit: async ({ value, formApi }) => {
      const amountCents = parseMoneyToCents(value.amount)
      const account = availableAccounts.find(({ id }) => id === value.accountId)
      if (!amountCents || !account) return
      const category = categories.find(
        ({ id, type, active }) => id === value.categoryId && type === value.type && active,
      )
      if (transaction) {
        await updateMutation.mutateAsync({
          id: transaction.id,
          input: {
            expectedVersion: transaction.version,
            accountId: account.id,
            categoryId: category?.id ?? null,
            amountCents,
            description: value.description.trim(),
            occurredOn: value.occurredOn,
            location: value.type === 'EXPENSE' ? location : null,
          },
        })
        onSuccess?.()
        return
      }
      if (value.type !== 'INCOME' && value.type !== 'EXPENSE') return
      const input: CreateTransactionInput = {
        accountId: account.id,
        ...(category ? { categoryId: category.id } : {}),
        type: value.type,
        status: value.status,
        amountCents,
        currency: account.currency,
        description: value.description.trim(),
        occurredOn: value.occurredOn,
        ...(value.type === 'EXPENSE' && location ? { location } : {}),
      }
      await createMutation.mutateAsync(input)
      formApi.reset({ ...value, amount: '', description: '' })
      setLocation(null)
      onSuccess?.()
    },
  })
  const mutationMessage =
    mutation.error instanceof ApiClientError ? mutation.error.message : undefined

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <FieldGroup className="grid gap-3">
        <form.Field name="type">
          {(field) => {
            const standardType = field.state.value === 'EXPENSE' || field.state.value === 'INCOME'
            return (
              <Field>
                <FieldLabel>Tipo de lançamento</FieldLabel>
                {standardType ? (
                  <Tabs
                    value={field.state.value}
                    onValueChange={(value) => field.handleChange(value as TransactionType)}
                  >
                    <TabsList className="grid min-h-14 w-full grid-cols-2 p-1.5">
                      <TabsTrigger
                        value="EXPENSE"
                        className="data-active:bg-destructive/10 data-active:text-destructive min-h-11 text-base"
                        disabled={Boolean(transaction)}
                      >
                        Despesa
                      </TabsTrigger>
                      <TabsTrigger
                        value="INCOME"
                        className="min-h-11 text-base data-active:bg-emerald-500/10 data-active:text-emerald-700 dark:data-active:text-emerald-300"
                        disabled={Boolean(transaction)}
                      >
                        Receita
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                ) : (
                  <Input
                    value={
                      field.state.value === 'CARD_PAYMENT'
                        ? 'Pagamento de fatura'
                        : field.state.value === 'TRANSFER'
                          ? 'Transferência'
                          : 'Investimento'
                    }
                    disabled
                  />
                )}
              </Field>
            )
          }}
        </form.Field>
      </FieldGroup>
      <FieldGroup className="grid gap-3">
        <form.Field name="status">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Situação</FieldLabel>
              <SearchableSelect
                id={field.name}
                value={field.state.value}
                disabled={Boolean(transaction)}
                onValueChange={(value) =>
                  field.handleChange(value as 'PLANNED' | 'CONFIRMED' | 'SETTLED')
                }
                options={[
                  { value: 'PLANNED', label: 'Planejada' },
                  { value: 'CONFIRMED', label: 'Confirmada' },
                  { value: 'SETTLED', label: 'Liquidada' },
                ]}
              />
            </Field>
          )}
        </form.Field>
      </FieldGroup>
      <form.Field name="accountId">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>Conta</FieldLabel>
            <SearchableSelect
              id={field.name}
              value={field.state.value}
              onValueChange={field.handleChange}
              placeholder="Selecione uma conta"
              searchPlaceholder="Buscar conta..."
              options={availableAccounts.map((account) => ({
                value: account.id,
                label: account.name,
                badge: account.currency,
              }))}
            />
          </Field>
        )}
      </form.Field>
      <form.Subscribe selector={(state) => state.values.type}>
        {(type) => (
          <form.Field name="categoryId">
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Categoria</FieldLabel>
                <SearchableSelect
                  id={field.name}
                  value={field.state.value}
                  onValueChange={field.handleChange}
                  placeholder="Sem categoria"
                  searchPlaceholder="Buscar categoria..."
                  options={categories
                    .filter((category) => category.active && category.type === type)
                    .map((category) => ({ value: category.id, label: category.name }))}
                />
              </Field>
            )}
          </form.Field>
        )}
      </form.Subscribe>
      <FieldGroup className="grid gap-3 sm:grid-cols-2">
        <form.Field name="amount">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Valor</FieldLabel>
                <MoneyInput
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onValueChange={field.handleChange}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>
        <form.Field name="occurredOn">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Data</FieldLabel>
              <DatePicker
                value={parseCivilDate(field.state.value)}
                onChange={(value) => value && field.handleChange(toCivilDate(value))}
                placeholder="Selecione a data"
                enableYearNavigation
              />
            </Field>
          )}
        </form.Field>
      </FieldGroup>
      <form.Field name="description">
        {(field) => {
          const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor={field.name}>Descrição</FieldLabel>
              <Input
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>
      <form.Subscribe selector={(state) => [state.values.type, state.values.occurredOn] as const}>
        {([type, occurredOn]) =>
          type === 'EXPENSE' ? (
            <TransactionLocationField
              value={location}
              occurredOn={occurredOn}
              onChange={setLocation}
              autoCapture={!transaction}
            />
          ) : null
        }
      </form.Subscribe>
      {mutationMessage && <p className="text-destructive text-sm">{mutationMessage}</p>}
      <DialogFooter>
        <Button type="button" variant="outline" disabled={mutation.isPending} onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={mutation.isPending || availableAccounts.length === 0}>
          {mutation.isPending && <Spinner className="mr-2 size-4" />}
          {transaction ? 'Salvar alterações' : 'Salvar transação'}
        </Button>
      </DialogFooter>
    </form>
  )
}
