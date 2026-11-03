import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { DialogFooter } from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { categoriesQueryOptions } from '@/modules/transactions/queries/transaction.queries'
import { parseMoneyToCents } from '@/modules/transactions/utils/money'
import { parseCivilDate, toCivilDate, todayCivilDate } from '@/utils/date'
import { useForm } from '@tanstack/react-form'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import type { CreditCard, StatementPurchase } from '../models/planning.types'
import {
  cardsQuery,
  useCreateCardPurchase,
  useUpdateCardPurchase,
} from '../queries/planning.queries'

const cardPurchaseFormSchema = z.object({
  cardId: z.string().min(1, 'Selecione um cartão.'),
  description: z.string().trim().min(1, 'Informe a descrição.').max(500),
  categoryId: z.string().min(1, 'Selecione uma categoria.'),
  amount: z
    .string()
    .refine((value) => Boolean(parseMoneyToCents(value)), 'Informe um valor válido.'),
  occurredOn: z.iso.date(),
})

export const CardPurchaseForm = ({
  card,
  purchase,
  readOnly = false,
  onCancel,
  onSuccess,
}: Readonly<{
  card?: CreditCard
  purchase?: StatementPurchase
  readOnly?: boolean
  onCancel?: () => void
  onSuccess: () => void
}>) => {
  const cards = useQuery({ ...cardsQuery(), enabled: !card })
  const categories = useQuery(categoriesQueryOptions())
  const availableCards = card ? [card] : (cards.data?.items ?? []).filter(({ active }) => active)
  const expenseCategories = (categories.data?.items ?? []).filter(
    (category) => category.type === 'EXPENSE' && category.active,
  )
  const mutation = useCreateCardPurchase()
  const updateMutation = useUpdateCardPurchase()
  const isPending = mutation.isPending || updateMutation.isPending
  const form = useForm({
    defaultValues: {
      cardId: card?.id ?? '',
      description: purchase?.description ?? '',
      categoryId: purchase?.categoryId ?? '',
      amount: purchase ? (purchase.amountCents / 100).toFixed(2).replace('.', ',') : '',
      occurredOn: purchase?.occurredOn ?? todayCivilDate(),
    },
    validators: { onSubmit: cardPurchaseFormSchema },
    onSubmit: async ({ value }) => {
      const amountCents = parseMoneyToCents(value.amount)
      const selectedCard = availableCards.find(({ id }) => id === value.cardId)
      if (!amountCents || !selectedCard) return
      const input = {
        categoryId: value.categoryId,
        amountCents,
        description: value.description.trim(),
        occurredOn: value.occurredOn,
      }
      if (purchase) await updateMutation.mutateAsync({ cardId: selectedCard.id, purchase, input })
      else await mutation.mutateAsync({ card: selectedCard, input })
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
      {!card && (
        <form.Field name="cardId">
          {(field) => {
            const invalid = field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={invalid} className="sm:col-span-2">
                <FieldLabel>Cartão</FieldLabel>
                <SearchableSelect
                  value={field.state.value}
                  onValueChange={field.handleChange}
                  placeholder="Selecione um cartão"
                  searchPlaceholder="Buscar cartão..."
                  options={availableCards.map((item) => ({
                    value: item.id,
                    label: item.name,
                    badge: item.lastFour ? `•••• ${item.lastFour}` : item.currency,
                  }))}
                />
                {invalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>
      )}
      <form.Field name="description">
        {(field) => {
          const invalid = field.state.meta.isTouched && !field.state.meta.isValid
          return (
            <Field data-invalid={invalid} className="sm:col-span-2">
              <FieldLabel htmlFor="card-purchase-description">Descrição</FieldLabel>
              <Input
                id="card-purchase-description"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />
              {invalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>
      <form.Field name="categoryId">
        {(field) => {
          const invalid = field.state.meta.isTouched && !field.state.meta.isValid
          return (
            <Field data-invalid={invalid}>
              <FieldLabel>Categoria de despesa</FieldLabel>
              <SearchableSelect
                value={field.state.value}
                onValueChange={field.handleChange}
                placeholder="Selecione uma categoria"
                searchPlaceholder="Buscar categoria..."
                options={expenseCategories.map((category) => ({
                  value: category.id,
                  label: category.name,
                }))}
              />
              {invalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>
      <form.Field name="amount">
        {(field) => {
          const invalid = field.state.meta.isTouched && !field.state.meta.isValid
          return (
            <Field data-invalid={invalid}>
              <FieldLabel htmlFor="card-purchase-amount">Valor</FieldLabel>
              <Input
                id="card-purchase-amount"
                inputMode="decimal"
                placeholder="0,00"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />
              {invalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>
      <form.Field name="occurredOn">
        {(field) => (
          <Field className="sm:col-span-2">
            <FieldLabel>Data da compra</FieldLabel>
            <DatePicker
              value={parseCivilDate(field.state.value)}
              onChange={(value) => value && field.handleChange(toCivilDate(value))}
              enableYearNavigation
            />
          </Field>
        )}
      </form.Field>
      {availableCards.length === 0 && (
        <p className="text-muted-foreground text-sm sm:col-span-2">
          Cadastre um cartão antes de lançar uma compra.
        </p>
      )}
      {expenseCategories.length === 0 && (
        <p className="text-muted-foreground text-sm sm:col-span-2">
          Cadastre uma categoria de despesa antes de lançar uma compra.
        </p>
      )}
      <DialogFooter className="sm:col-span-2">
        <Button type="button" variant="outline" disabled={isPending} onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={
            readOnly || isPending || availableCards.length === 0 || expenseCategories.length === 0
          }
        >
          {isPending ? 'Salvando…' : purchase ? 'Salvar alterações' : 'Lançar compra'}
        </Button>
      </DialogFooter>
    </form>
  )
}
