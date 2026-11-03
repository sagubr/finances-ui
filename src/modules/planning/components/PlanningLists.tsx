import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatMoney } from '@/modules/transactions/utils/money'
import { formatDatePtBr } from '@/utils/date'
import { useQuery } from '@tanstack/react-query'
import { planningApi } from '../api/planning.api'
import type { RecurringRule } from '../models/planning.types'
import { cardsQuery, recurringQuery, usePlanningMutation } from '../queries/planning.queries'
import { CreditCardForm } from './CreditCardForm'

export const RecurringRulesCard = ({ readOnly }: { readOnly: boolean }) => {
  const query = useQuery(recurringQuery())
  const toggle = usePlanningMutation((rule: RecurringRule) => planningApi.toggleRecurring(rule))
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recorrências</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {query.data?.items.map((rule) => (
          <div className="flex items-center justify-between gap-3 border-b pb-3" key={rule.id}>
            <div>
              <p className="font-medium">{rule.description}</p>
              <p className="text-muted-foreground text-sm">
                {formatMoney(rule.amountCents, rule.currency)} · próxima em{' '}
                {formatDatePtBr(rule.nextOccurrenceOn)}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={readOnly || toggle.isPending}
              onClick={() => toggle.mutate(rule)}
            >
              {rule.pausedAt ? 'Retomar' : 'Pausar'}
            </Button>
          </div>
        ))}
        {!query.isPending && !query.data?.items.length && (
          <p className="text-muted-foreground text-sm">Nenhuma recorrência cadastrada.</p>
        )}
      </CardContent>
    </Card>
  )
}

export const CreditCardsCard = ({ readOnly }: { readOnly: boolean }) => {
  const query = useQuery(cardsQuery())
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cartões de crédito</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <CreditCardForm readOnly={readOnly} />
        {query.data?.items.map((card) => (
          <div className="border-b pb-3" key={card.id}>
            <p className="font-medium">
              {card.name}
              {card.lastFour ? ` •••• ${card.lastFour}` : ''}
            </p>
            <p className="text-muted-foreground text-sm">
              Limite {formatMoney(card.limitCents, card.currency)} · fecha dia {card.closingDay} ·
              vence dia {card.dueDay}
            </p>
          </div>
        ))}
        {!query.isPending && !query.data?.items.length && (
          <p className="text-muted-foreground text-sm">Nenhum cartão cadastrado.</p>
        )}
      </CardContent>
    </Card>
  )
}
