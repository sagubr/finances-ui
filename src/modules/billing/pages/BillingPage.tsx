import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getDomainLabel } from '@/lib/domain-labels'
import { formatMoney } from '@/modules/transactions/utils/money'
import { formatDatePtBr } from '@/utils/date'
import { useQuery } from '@tanstack/react-query'
import { plansQuery, subscriptionQuery, usageQuery } from '../queries/billing.queries'
export const BillingPage = ({ embedded = false }: Readonly<{ embedded?: boolean }>) => {
  const plans = useQuery(plansQuery())
  const subscription = useQuery(subscriptionQuery())
  const usage = useQuery(usageQuery())
  return (
    <div className="flex flex-col gap-6">
      {!embedded && (
        <header className="border-b pb-5">
          <h1 className="font-heading text-2xl font-semibold">Plano e uso</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Estado confirmado pela API. Nenhum pagamento é inferido no navegador.
          </p>
        </header>
      )}
      <Card>
        <CardHeader>
          <CardTitle>{subscription.data?.name ?? 'Sem assinatura ativa'}</CardTitle>
          <CardDescription>
            {subscription.data
              ? `Situação: ${getDomainLabel(subscription.data.status)}`
              : 'Escolha de plano indisponível até a integração do provedor ser homologada.'}
          </CardDescription>
        </CardHeader>
        {subscription.data?.currentPeriodEnd && (
          <CardContent>
            Período atual até {formatDatePtBr(subscription.data.currentPeriodEnd)}
          </CardContent>
        )}
      </Card>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {plans.data?.items.map((plan) => (
          <Card key={plan.id}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.code}</CardDescription>
            </CardHeader>
            <CardContent className="text-xl font-semibold">
              {formatMoney(plan.priceCents, plan.currency)}
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Consumo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {usage.data?.items.map((item) => (
            <div className="flex justify-between border-b pb-2" key={`${item.key}-${item.period}`}>
              <span>{item.key}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
