import { MutationErrorMessage } from '@/components/MutationErrorMessage'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { DialogFooter } from '@/components/ui/dialog'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { SearchableSelect } from '@/components/ui/searchable-select'
import {
  accountsQueryOptions,
  categoriesQueryOptions,
} from '@/modules/transactions/queries/transaction.queries'
import { parseMoneyToCents } from '@/modules/transactions/utils/money'
import { workspaceAccessStore } from '@/modules/workspaces/store/workspace-access.store'
import { formatDatePtBr, parseCivilDate, toCivilDate, todayCivilDate } from '@/utils/date'
import { useForm } from '@tanstack/react-form'
import { useQuery } from '@tanstack/react-query'
import { useStore } from '@tanstack/react-store'
import { z } from 'zod'
import { planningApi } from '../api/planning.api'
import type { RecurringRule } from '../models/planning.types'
import { cardsQuery, usePlanningMutation } from '../queries/planning.queries'
import { resolveRecurringTimezone } from '../utils/recurrence'

const recurringFormSchema = z
  .object({
    description: z.string().trim().min(1, 'Informe a descrição.').max(500),
    amount: z
      .string()
      .refine((value) => Boolean(parseMoneyToCents(value)), 'Informe um valor válido.'),
    target: z.enum(['ACCOUNT', 'CARD']),
    accountId: z.string(),
    creditCardId: z.string(),
    categoryId: z.string(),
    type: z.enum(['INCOME', 'EXPENSE']),
    frequency: z.enum(['WEEKLY', 'MONTHLY', 'YEARLY']),
    interval: z.number().int().min(1).max(365),
    dayOfMonth: z.number().int().min(1).max(31),
    dayOfWeek: z.number().int().min(0).max(6),
    startsOn: z.iso.date(),
    endsOn: z.union([z.literal(''), z.iso.date()]),
  })
  .refine((value) => !value.endsOn || value.startsOn <= value.endsOn, {
    path: ['endsOn'],
    message: 'O término deve ser igual ou posterior ao início.',
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
        message: 'Selecione a categoria da assinatura.',
      })
  })

const weekdays = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
]

export const RecurringForm = ({
  readOnly,
  onCancel,
  onSuccess,
  rule,
}: Readonly<{
  readOnly: boolean
  onCancel?: () => void
  onSuccess?: () => void
  rule?: RecurringRule
}>) => {
  const accounts = useQuery(accountsQueryOptions())
  const categories = useQuery(categoriesQueryOptions())
  const cards = useQuery(cardsQuery())
  const workspaceTimezone = useStore(
    workspaceAccessStore,
    (state) =>
      state.workspaces.find((workspace) => workspace.id === state.activeWorkspaceId)?.timezone ??
      '',
  )
  const timezone = resolveRecurringTimezone(rule?.timezone, workspaceTimezone)
  const createMutation = usePlanningMutation(planningApi.createRecurring)
  const updateMutation = usePlanningMutation(
    (input: Parameters<typeof planningApi.updateRecurring>[1]) =>
      rule
        ? planningApi.updateRecurring(rule, input)
        : Promise.reject(new Error('Missing recurring rule')),
  )
  const mutation = rule ? updateMutation : createMutation
  const start = rule?.startsOn ?? todayCivilDate()
  const form = useForm({
    defaultValues: {
      description: rule?.description ?? '',
      amount: rule ? (rule.amountCents / 100).toFixed(2).replace('.', ',') : '',
      target: rule?.creditCardId ? ('CARD' as const) : ('ACCOUNT' as const),
      accountId: rule?.accountId ?? '',
      creditCardId: rule?.creditCardId ?? '',
      categoryId: rule?.categoryId ?? '',
      type: rule?.type ?? ('EXPENSE' as const),
      frequency: rule?.frequency ?? ('MONTHLY' as const),
      interval: rule?.interval ?? 1,
      dayOfMonth: rule?.dayOfMonth ?? Number(start.slice(8, 10)),
      dayOfWeek: rule?.dayOfWeek ?? parseCivilDate(start).getDay(),
      startsOn: start,
      endsOn: rule?.endsOn ?? '',
    },
    validators: { onSubmit: recurringFormSchema },
    onSubmit: async ({ value }) => {
      const amountCents = parseMoneyToCents(value.amount)
      if (!amountCents) return
      if (!timezone) return
      const schedule = {
        description: value.description.trim(),
        amountCents,
        frequency: value.frequency,
        interval: value.interval,
        dayOfMonth: value.frequency === 'WEEKLY' ? null : value.dayOfMonth,
        dayOfWeek: value.frequency === 'WEEKLY' ? value.dayOfWeek : null,
        endsOn: value.endsOn || null,
        timezone,
      }
      if (rule) {
        await updateMutation.mutateAsync(schedule)
      } else {
        const selectedCard = cards.data?.items.find(({ id }) => id === value.creditCardId)
        if (value.target === 'CARD' && !selectedCard) return
        const accountId = value.target === 'CARD' ? selectedCard?.paymentAccountId : value.accountId
        const account = accounts.data?.items.find(({ id, active }) => id === accountId && active)
        if (!account) return
        await createMutation.mutateAsync({
          ...schedule,
          accountId: account.id,
          ...(value.target === 'CARD' ? { creditCardId: selectedCard?.id } : {}),
          categoryId: value.categoryId || undefined,
          type: value.target === 'CARD' ? 'EXPENSE' : value.type,
          currency: selectedCard?.currency ?? account.currency,
          dayOfMonth: schedule.dayOfMonth ?? undefined,
          dayOfWeek: schedule.dayOfWeek ?? undefined,
          startsOn: value.startsOn,
          endsOn: schedule.endsOn ?? undefined,
        })
      }
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
        {(field) => (
          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="rec-description">Descrição</FieldLabel>
            <Input
              id="rec-description"
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
            />
          </Field>
        )}
      </form.Field>
      <form.Field name="target">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>Destino</FieldLabel>
            <SearchableSelect
              id={field.name}
              value={field.state.value}
              disabled={Boolean(rule)}
              onValueChange={(value) => {
                field.handleChange(value as 'ACCOUNT' | 'CARD')
                if (value === 'CARD') form.setFieldValue('type', 'EXPENSE')
              }}
              options={[
                { value: 'ACCOUNT', label: 'Conta' },
                { value: 'CARD', label: 'Cartão de crédito' },
              ]}
            />
          </Field>
        )}
      </form.Field>
      <form.Field name="amount">
        {(field) => (
          <Field>
            <FieldLabel htmlFor="rec-amount">Valor</FieldLabel>
            <Input
              id="rec-amount"
              inputMode="decimal"
              placeholder="0,00"
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
            />
          </Field>
        )}
      </form.Field>
      <form.Subscribe selector={(state) => state.values.target}>
        {(target) => (
          <>
            <form.Field name="type">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Tipo</FieldLabel>
                  <SearchableSelect
                    id={field.name}
                    value={target === 'CARD' ? 'EXPENSE' : field.state.value}
                    disabled={Boolean(rule) || target === 'CARD'}
                    onValueChange={(value) => field.handleChange(value as 'INCOME' | 'EXPENSE')}
                    options={[
                      { value: 'EXPENSE', label: 'Despesa' },
                      { value: 'INCOME', label: 'Receita' },
                    ]}
                  />
                </Field>
              )}
            </form.Field>
            {target === 'CARD' ? (
              <form.Field name="creditCardId">
                {(field) => {
                  const invalid = !field.state.meta.isValid
                  return (
                    <Field data-invalid={invalid}>
                      <FieldLabel htmlFor={field.name}>Cartão</FieldLabel>
                      <SearchableSelect
                        id={field.name}
                        value={field.state.value}
                        disabled={Boolean(rule)}
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
                    <Field data-invalid={invalid}>
                      <FieldLabel htmlFor={field.name}>Conta</FieldLabel>
                      <SearchableSelect
                        id={field.name}
                        value={field.state.value}
                        disabled={Boolean(rule)}
                        onValueChange={field.handleChange}
                        placeholder="Selecione uma conta"
                        searchPlaceholder="Buscar conta..."
                        options={(accounts.data?.items ?? [])
                          .filter((account) => account.active)
                          .map((account) => ({
                            value: account.id,
                            label: account.name,
                            badge: account.currency,
                          }))}
                      />
                      {invalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  )
                }}
              </form.Field>
            )}
          </>
        )}
      </form.Subscribe>
      <form.Subscribe selector={(state) => state.values.type}>
        {(type) => (
          <form.Field name="categoryId">
            {(field) => {
              const invalid = !field.state.meta.isValid
              return (
                <Field data-invalid={invalid}>
                  <FieldLabel htmlFor={field.name}>Categoria</FieldLabel>
                  <SearchableSelect
                    id={field.name}
                    value={field.state.value}
                    disabled={Boolean(rule)}
                    onValueChange={field.handleChange}
                    placeholder="Sem categoria"
                    searchPlaceholder="Buscar categoria..."
                    options={(categories.data?.items ?? [])
                      .filter((category) => category.active && category.type === type)
                      .map((category) => ({ value: category.id, label: category.name }))}
                  />
                  {invalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          </form.Field>
        )}
      </form.Subscribe>
      <form.Field name="frequency">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>Frequência</FieldLabel>
            <SearchableSelect
              id={field.name}
              value={field.state.value}
              onValueChange={(value) =>
                field.handleChange(value as 'WEEKLY' | 'MONTHLY' | 'YEARLY')
              }
              options={[
                { value: 'WEEKLY', label: 'Semanal' },
                { value: 'MONTHLY', label: 'Mensal' },
                { value: 'YEARLY', label: 'Anual' },
              ]}
            />
          </Field>
        )}
      </form.Field>
      <form.Field name="interval">
        {(field) => (
          <Field>
            <FieldLabel htmlFor="rec-interval">Intervalo</FieldLabel>
            <Input
              id="rec-interval"
              type="number"
              min={1}
              max={365}
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.valueAsNumber)}
            />
            <FieldDescription>Repete a cada quantidade de períodos informada.</FieldDescription>
          </Field>
        )}
      </form.Field>
      <form.Subscribe selector={(state) => state.values.frequency}>
        {(frequency) =>
          frequency === 'WEEKLY' ? (
            <form.Field name="dayOfWeek">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Dia da semana</FieldLabel>
                  <SearchableSelect
                    id={field.name}
                    value={String(field.state.value)}
                    onValueChange={(value) => field.handleChange(Number(value))}
                    options={weekdays.map((label, value) => ({ value: String(value), label }))}
                  />
                </Field>
              )}
            </form.Field>
          ) : (
            <form.Field name="dayOfMonth">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor="rec-day">Dia do mês</FieldLabel>
                  <Input
                    id="rec-day"
                    type="number"
                    min={1}
                    max={31}
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.valueAsNumber)}
                  />
                </Field>
              )}
            </form.Field>
          )
        }
      </form.Subscribe>
      <form.Field name="startsOn">
        {(field) => (
          <Field>
            <FieldLabel>Início</FieldLabel>
            {rule ? (
              <Input value={formatDatePtBr(field.state.value)} disabled />
            ) : (
              <DatePicker
                value={parseCivilDate(field.state.value)}
                onChange={(value) => value && field.handleChange(toCivilDate(value))}
                enableYearNavigation
              />
            )}
          </Field>
        )}
      </form.Field>
      <form.Field name="endsOn">
        {(field) => {
          const invalid = field.state.meta.isTouched && !field.state.meta.isValid
          return (
            <Field data-invalid={invalid}>
              <FieldLabel>Término opcional</FieldLabel>
              <div className="flex gap-2">
                <DatePicker
                  value={field.state.value ? parseCivilDate(field.state.value) : undefined}
                  onChange={(value) => field.handleChange(value ? toCivilDate(value) : '')}
                  enableYearNavigation
                />
                {field.state.value && (
                  <Button type="button" variant="outline" onClick={() => field.handleChange('')}>
                    Limpar
                  </Button>
                )}
              </div>
              {invalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>
      {rule && (
        <p className="text-muted-foreground text-xs sm:col-span-2">
          Conta, categoria, tipo e data inicial são preservados. A nova programação vale para as
          próximas ocorrências que ainda forem geradas.
        </p>
      )}
      {!timezone && (
        <p role="alert" className="text-destructive text-xs sm:col-span-2">
          Não foi possível identificar o fuso horário do workspace. Recarregue a página antes de
          salvar.
        </p>
      )}
      <div className="sm:col-span-2">
        <MutationErrorMessage
          error={mutation.error}
          fallbackMessage="Não foi possível salvar a recorrência."
        />
      </div>
      <DialogFooter className="sm:col-span-2">
        <Button type="button" variant="outline" disabled={mutation.isPending} onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={readOnly || mutation.isPending || !timezone}>
          {mutation.isPending ? 'Salvando…' : rule ? 'Salvar alterações' : 'Criar recorrência'}
        </Button>
      </DialogFooter>
    </form>
  )
}
