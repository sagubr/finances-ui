import { MutationErrorMessage } from '@/components/MutationErrorMessage'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { DialogFooter } from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { parseCivilDate, toCivilDate, todayCivilDate } from '@/utils/date'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import type { Account, TransactionStatus } from '../models/transaction.types'
import { useCreateTransfer } from '../queries/transaction.queries'
import { parseMoneyToCents } from '../utils/money'

const transferFormSchema = z
  .object({
    fromAccountId: z.string().min(1, 'Selecione a conta de origem.'),
    toAccountId: z.string().min(1, 'Selecione a conta de destino.'),
    status: z.enum(['PLANNED', 'CONFIRMED', 'SETTLED']),
    amount: z
      .string()
      .refine((value) => Boolean(parseMoneyToCents(value)), 'Informe um valor válido.'),
    description: z.string().trim().min(1, 'Informe a descrição.').max(500),
    occurredOn: z.iso.date(),
  })
  .refine(({ fromAccountId, toAccountId }) => fromAccountId !== toAccountId, {
    message: 'Origem e destino devem ser diferentes.',
    path: ['toAccountId'],
  })

export const TransferForm = ({
  accounts,
  onCancel,
  onSuccess,
}: Readonly<{
  accounts: readonly Account[]
  onCancel: () => void
  onSuccess: () => void
}>) => {
  const mutation = useCreateTransfer()
  const hasCompatiblePair = accounts.some((account, index) =>
    accounts.some(
      (candidate, candidateIndex) =>
        candidateIndex !== index && candidate.currency === account.currency,
    ),
  )
  const form = useForm({
    defaultValues: {
      fromAccountId:
        accounts.find(({ type }) => type !== 'BROKERAGE' && type !== 'BENEFIT')?.id ??
        accounts[0]?.id ??
        '',
      toAccountId: '',
      status: 'SETTLED' as TransactionStatus,
      amount: '',
      description: '',
      occurredOn: todayCivilDate(),
    },
    validators: { onSubmit: transferFormSchema },
    onSubmit: async ({ value }) => {
      const from = accounts.find(({ id }) => id === value.fromAccountId)
      const to = accounts.find(({ id }) => id === value.toAccountId)
      const amountCents = parseMoneyToCents(value.amount)
      if (!from || !to || !amountCents || from.currency !== to.currency) return
      await mutation.mutateAsync({
        fromAccountId: from.id,
        toAccountId: to.id,
        amountCents,
        currency: from.currency,
        description: value.description.trim(),
        occurredOn: value.occurredOn,
        status: value.status,
      })
      onSuccess()
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
      <form.Field name="fromAccountId">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>Conta de origem</FieldLabel>
            <SearchableSelect
              id={field.name}
              value={field.state.value}
              onValueChange={(value) => {
                field.handleChange(value)
                form.setFieldValue('toAccountId', '')
              }}
              options={accounts.map((account) => ({
                value: account.id,
                label: account.name,
                badge: account.type === 'BROKERAGE' ? 'Investimentos' : account.currency,
              }))}
            />
          </Field>
        )}
      </form.Field>
      <form.Field name="toAccountId">
        {(field) => {
          const invalid = field.state.meta.isTouched && !field.state.meta.isValid
          return (
            <Field data-invalid={invalid}>
              <FieldLabel htmlFor={field.name}>Conta de destino</FieldLabel>
              <form.Subscribe selector={(state) => state.values.fromAccountId}>
                {(fromAccountId) => {
                  const source = accounts.find(({ id }) => id === fromAccountId)
                  return (
                    <SearchableSelect
                      id={field.name}
                      value={field.state.value}
                      onValueChange={field.handleChange}
                      placeholder="Selecione o destino"
                      options={accounts
                        .filter(
                          (account) =>
                            account.id !== fromAccountId && account.currency === source?.currency,
                        )
                        .map((account) => ({
                          value: account.id,
                          label: account.name,
                          badge:
                            account.type === 'BROKERAGE'
                              ? 'Investimentos'
                              : account.type === 'BENEFIT'
                                ? 'Benefício'
                                : account.currency,
                        }))}
                    />
                  )
                }}
              </form.Subscribe>
              {invalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>
      <form.Field name="status">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>Situação</FieldLabel>
            <SearchableSelect
              id={field.name}
              value={field.state.value}
              onValueChange={(value) => field.handleChange(value as TransactionStatus)}
              options={[
                { value: 'PLANNED', label: 'Planejada' },
                { value: 'CONFIRMED', label: 'Confirmada' },
                { value: 'SETTLED', label: 'Liquidada' },
              ]}
            />
          </Field>
        )}
      </form.Field>
      <form.Field name="amount">
        {(field) => (
          <Field>
            <FieldLabel>Valor</FieldLabel>
            <Input
              inputMode="decimal"
              placeholder="0,00"
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
            />
          </Field>
        )}
      </form.Field>
      <form.Field name="occurredOn">
        {(field) => (
          <Field>
            <FieldLabel>Data</FieldLabel>
            <DatePicker
              value={parseCivilDate(field.state.value)}
              onChange={(value) => value && field.handleChange(toCivilDate(value))}
              enableYearNavigation
            />
          </Field>
        )}
      </form.Field>
      <form.Field name="description">
        {(field) => (
          <Field>
            <FieldLabel>Descrição</FieldLabel>
            <Input
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
              placeholder="Ex.: Aporte mensal"
            />
          </Field>
        )}
      </form.Field>
      <div className="sm:col-span-2">
        <MutationErrorMessage
          error={mutation.error}
          fallbackMessage="Não foi possível salvar a transferência."
        />
      </div>
      {!hasCompatiblePair && (
        <p className="text-muted-foreground text-sm sm:col-span-2">
          São necessárias duas contas ativas na mesma moeda para realizar uma transferência.
        </p>
      )}
      <DialogFooter className="sm:col-span-2">
        <Button type="button" variant="outline" disabled={mutation.isPending} onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={mutation.isPending || !hasCompatiblePair}>
          {mutation.isPending ? 'Salvando…' : 'Salvar transferência'}
        </Button>
      </DialogFooter>
    </form>
  )
}
