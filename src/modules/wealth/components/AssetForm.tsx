import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { wealthApi } from '../api/wealth.api'
import type { Asset } from '../models/wealth.types'
import { useWealthMutation } from '../queries/wealth.queries'

const assetFormSchema = z.object({
  name: z.string().trim().min(1).max(160),
  value: z.string().regex(/^\d+([,.]\d{1,2})?$/),
  currency: z.string().trim().length(3),
})

export const AssetForm = ({
  readOnly,
  onSuccess,
  asset,
}: {
  readOnly: boolean
  onSuccess?: () => void
  asset?: Asset
}) => {
  const createMutation = useWealthMutation(wealthApi.createAsset)
  const updateMutation = useWealthMutation((input: Parameters<typeof wealthApi.updateAsset>[1]) =>
    asset ? wealthApi.updateAsset(asset, input) : Promise.reject(new Error('Missing asset')),
  )
  const mutation = asset ? updateMutation : createMutation
  const form = useForm({
    defaultValues: {
      name: asset?.name ?? '',
      value: asset ? (asset.acquisitionCostCents / 100).toFixed(2).replace('.', ',') : '',
      currency: asset?.currency ?? 'BRL',
    },
    validators: { onSubmit: assetFormSchema },
    onSubmit: async ({ value, formApi }) => {
      const cents = Math.round(Number(value.value.replace(',', '.')) * 100)
      if (!value.name.trim() || !Number.isSafeInteger(cents) || cents < 0) return
      const input = {
        name: value.name,
        status:
          asset?.status === 'PLANNED' || asset?.status === 'SOLD'
            ? asset.status
            : ('ACTIVE' as const),
        acquisitionCostCents: cents,
        currency: value.currency.toUpperCase(),
        valuationMethod: asset?.valuationMethod ?? ('COST' as const),
        residualValueCents: asset?.residualValueCents ?? 0,
      }
      if (asset) await updateMutation.mutateAsync(input)
      else await createMutation.mutateAsync({ ...input, status: 'ACTIVE' })
      formApi.reset()
      onSuccess?.()
    },
  })
  return (
    <form
      className="grid gap-3 sm:grid-cols-[1fr_160px_90px_auto]"
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <form.Field name="name">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={`asset-${field.name}`}>Bem</FieldLabel>
            <Input
              id={`asset-${field.name}`}
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
            />
          </Field>
        )}
      </form.Field>
      <form.Field name="value">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={`asset-${field.name}`}>Custo</FieldLabel>
            <Input
              id={`asset-${field.name}`}
              inputMode="decimal"
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
            />
          </Field>
        )}
      </form.Field>
      <form.Field name="currency">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={`asset-${field.name}`}>Moeda</FieldLabel>
            <Input
              id={`asset-${field.name}`}
              maxLength={3}
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
            />
          </Field>
        )}
      </form.Field>
      <Button type="submit" className="self-end" disabled={readOnly || mutation.isPending}>
        {mutation.isPending ? 'Salvando…' : asset ? 'Salvar alterações' : 'Adicionar'}
      </Button>
    </form>
  )
}
