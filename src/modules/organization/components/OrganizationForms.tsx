import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { DialogFooter } from '@/components/ui/dialog'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { MoneyInput } from '@/components/ui/money-input'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { Textarea } from '@/components/ui/textarea'
import { formatCentsForInput, parseMoneyToCents } from '@/lib/money'
import {
  getActiveWorkspaceBaseCurrency,
  workspaceAccessStore,
} from '@/modules/workspaces/store/workspace-access.store'
import { parseCivilDate, toCivilDate, todayCivilDate } from '@/utils/date'
import { useForm } from '@tanstack/react-form'
import { useStore } from '@tanstack/react-store'
import { z } from 'zod'
import { organizationApi } from '../api/organization.api'
import type { Activity, Goal, WishlistItem } from '../models/organization.types'
import { useOrganizationMutation } from '../queries/organization.queries'

const activityFormSchema = z.object({
  name: z.string().trim().min(1).max(120),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
})
const goalFormSchema = z.object({
  name: z.string().trim().min(1).max(160),
  targetValue: z
    .string()
    .regex(/^\d{1,20}(\.\d{1,10})?$/)
    .refine((value) => Number(value) > 0),
  unit: z.string().trim().min(1).max(30),
})
const wishlistFormSchema = z.object({
  name: z.string().trim().min(1).max(200),
  url: z.union([
    z.literal(''),
    z
      .string()
      .url()
      .max(2048)
      .refine((value) => value.startsWith('https://') || value.startsWith('http://')),
  ]),
  price: z.union([
    z.literal(''),
    z.string().refine((value) => parseMoneyToCents(value) !== null, 'Informe um valor válido.'),
  ]),
  currency: z.string().trim().length(3),
  priority: z.number().int().min(0).max(10),
  reason: z.string().trim().max(500),
  plannedOn: z.union([z.literal(''), z.iso.date()]),
})
export const ActivityForm = ({
  readOnly,
  onCancel,
  onSuccess,
  activity,
}: {
  readOnly: boolean
  onCancel: () => void
  onSuccess?: () => void
  activity?: Activity
}) => {
  const createMutation = useOrganizationMutation(organizationApi.createActivity)
  const updateMutation = useOrganizationMutation((input: { name: string; color?: string }) =>
    activity
      ? organizationApi.updateActivity(activity, input)
      : Promise.reject(new Error('Missing activity')),
  )
  const mutation = activity ? updateMutation : createMutation
  const form = useForm({
    defaultValues: { name: activity?.name ?? '', color: activity?.color ?? '#64748B' },
    validators: { onSubmit: activityFormSchema },
    onSubmit: async ({ value, formApi }) => {
      if (!value.name.trim()) return
      if (activity) await updateMutation.mutateAsync(value)
      else await createMutation.mutateAsync(value)
      formApi.reset()
      onSuccess?.()
    },
  })
  return (
    <form
      className="grid gap-4 sm:grid-cols-[1fr_auto]"
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <form.Field name="name">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={`activity-${field.name}`}>Atividade</FieldLabel>
            <Input
              id={`activity-${field.name}`}
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
            />
          </Field>
        )}
      </form.Field>
      <form.Field name="color">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={`activity-${field.name}`}>Cor</FieldLabel>
            <Input
              className="w-16"
              id={`activity-${field.name}`}
              type="color"
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
            />
          </Field>
        )}
      </form.Field>
      <DialogFooter className="sm:col-span-2">
        <Button type="button" variant="outline" disabled={mutation.isPending} onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={readOnly || mutation.isPending}>
          {mutation.isPending ? 'Salvando…' : activity ? 'Salvar alterações' : 'Criar atividade'}
        </Button>
      </DialogFooter>
    </form>
  )
}
export const GoalForm = ({
  readOnly,
  onCancel,
  onSuccess,
  goal,
}: {
  readOnly: boolean
  onCancel: () => void
  onSuccess?: () => void
  goal?: Goal
}) => {
  const createMutation = useOrganizationMutation(organizationApi.createGoal)
  const updateMutation = useOrganizationMutation(
    (input: { name: string; targetValue: string; unit: string }) =>
      goal ? organizationApi.updateGoal(goal, input) : Promise.reject(new Error('Missing goal')),
  )
  const mutation = goal ? updateMutation : createMutation
  const form = useForm({
    defaultValues: {
      name: goal?.name ?? '',
      targetValue: goal?.targetValue ?? '',
      unit: goal?.unit ?? 'R$',
    },
    validators: { onSubmit: goalFormSchema },
    onSubmit: async ({ value, formApi }) => {
      if (!value.name || Number(value.targetValue) <= 0) return
      if (goal) await updateMutation.mutateAsync(value)
      else
        await createMutation.mutateAsync({
          name: value.name,
          type: 'MANUAL',
          targetValue: value.targetValue,
          unit: value.unit,
          startsOn: todayCivilDate(),
        })
      formApi.reset()
      onSuccess?.()
    },
  })
  return (
    <form
      className="grid gap-4 sm:grid-cols-[1fr_130px_100px]"
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <form.Field name="name">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={`goal-${field.name}`}>Meta</FieldLabel>
            <Input
              id={`goal-${field.name}`}
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
            />
          </Field>
        )}
      </form.Field>
      <form.Field name="targetValue">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={`goal-${field.name}`}>Alvo</FieldLabel>
            <Input
              id={`goal-${field.name}`}
              inputMode="decimal"
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
            />
          </Field>
        )}
      </form.Field>
      <form.Field name="unit">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={`goal-${field.name}`}>Unidade</FieldLabel>
            <Input
              id={`goal-${field.name}`}
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
            />
          </Field>
        )}
      </form.Field>
      <DialogFooter className="sm:col-span-3">
        <Button type="button" variant="outline" disabled={mutation.isPending} onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={readOnly || mutation.isPending}>
          {mutation.isPending ? 'Salvando…' : goal ? 'Salvar alterações' : 'Criar meta'}
        </Button>
      </DialogFooter>
    </form>
  )
}
export const WishlistForm = ({
  readOnly,
  onCancel,
  onSuccess,
  item,
}: {
  readOnly: boolean
  onCancel: () => void
  onSuccess?: () => void
  item?: WishlistItem
}) => {
  const createMutation = useOrganizationMutation(organizationApi.createWishlistItem)
  const updateMutation = useOrganizationMutation(
    (input: {
      name: string
      url?: string
      estimatedPriceCents?: number
      currency: string
      priority: number
      reason?: string
      plannedOn?: string
    }) =>
      item
        ? organizationApi.updateWishlistItem(item, input)
        : Promise.reject(new Error('Missing wishlist item')),
  )
  const mutation = item ? updateMutation : createMutation
  const baseCurrency = useStore(workspaceAccessStore, getActiveWorkspaceBaseCurrency)
  const form = useForm({
    defaultValues: {
      name: item?.name ?? '',
      url: item?.url ?? '',
      price: formatCentsForInput(item?.estimatedPriceCents),
      currency: item?.currency ?? baseCurrency ?? '',
      priority: item?.priority ?? 0,
      reason: item?.reason ?? '',
      plannedOn: item?.plannedOn ?? '',
    },
    validators: { onSubmit: wishlistFormSchema },
    onSubmit: async ({ value, formApi }) => {
      const cents = value.price ? parseMoneyToCents(value.price) : undefined
      if (!value.name || cents === null) return
      const input = {
        name: value.name,
        url: value.url || undefined,
        estimatedPriceCents: cents && cents > 0 ? cents : undefined,
        currency: value.currency.toUpperCase(),
        priority: value.priority,
        reason: value.reason || undefined,
        plannedOn: value.plannedOn || undefined,
      }
      if (item) await updateMutation.mutateAsync(input)
      else await createMutation.mutateAsync(input)
      formApi.reset()
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
      <form.Field name="name">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={`wish-${field.name}`}>Desejo</FieldLabel>
            <Input
              id={`wish-${field.name}`}
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
            />
          </Field>
        )}
      </form.Field>
      <form.Field name="price">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={`wish-${field.name}`}>Estimativa</FieldLabel>
            <MoneyInput
              id={`wish-${field.name}`}
              value={field.state.value}
              onValueChange={field.handleChange}
            />
          </Field>
        )}
      </form.Field>
      <form.Field name="url">
        {(field) => (
          <Field className="sm:col-span-2">
            <FieldLabel htmlFor={`wish-${field.name}`}>Link opcional</FieldLabel>
            <Input
              id={`wish-${field.name}`}
              type="url"
              placeholder="https://"
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
            />
          </Field>
        )}
      </form.Field>
      <form.Field name="currency">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={`wish-${field.name}`}>Moeda</FieldLabel>
            <SearchableSelect
              id={`wish-${field.name}`}
              value={field.state.value}
              onValueChange={field.handleChange}
              placeholder="Selecione a moeda"
              searchPlaceholder="Buscar moeda..."
              options={Array.from(
                new Set(
                  [baseCurrency, field.state.value, 'BRL', 'USD', 'EUR'].filter(
                    (currency): currency is string => Boolean(currency),
                  ),
                ),
              ).map((currency) => ({ value: currency, label: currency }))}
            />
          </Field>
        )}
      </form.Field>
      <form.Field name="priority">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={`wish-${field.name}`}>Prioridade (0–10)</FieldLabel>
            <SearchableSelect
              id={`wish-${field.name}`}
              value={String(field.state.value)}
              onValueChange={(value) => field.handleChange(Number(value))}
              options={Array.from({ length: 11 }, (_, priority) => ({
                value: String(priority),
                label: `Prioridade ${priority}`,
              }))}
            />
          </Field>
        )}
      </form.Field>
      <form.Field name="plannedOn">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={`wish-${field.name}`}>Data planejada</FieldLabel>
            <DatePicker
              value={field.state.value ? parseCivilDate(field.state.value) : undefined}
              onChange={(value) => field.handleChange(value ? toCivilDate(value) : '')}
              placeholder="Selecione a data"
              enableYearNavigation
            />
          </Field>
        )}
      </form.Field>
      <form.Field name="reason">
        {(field) => (
          <Field className="sm:col-span-2">
            <FieldLabel htmlFor={`wish-${field.name}`}>Motivo</FieldLabel>
            <Textarea
              id={`wish-${field.name}`}
              maxLength={500}
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
            />
          </Field>
        )}
      </form.Field>
      <DialogFooter className="sm:col-span-2">
        <Button type="button" variant="outline" disabled={mutation.isPending} onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={readOnly || mutation.isPending || (!item && !baseCurrency)}>
          {mutation.isPending ? 'Salvando…' : item ? 'Salvar alterações' : 'Adicionar desejo'}
        </Button>
      </DialogFooter>
    </form>
  )
}
