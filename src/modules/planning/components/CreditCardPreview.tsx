import { CreditCard as CreditCardIcon, Wifi } from 'lucide-react'
import type { CreditCard } from '../models/planning.types'

const brandLabels: Record<NonNullable<CreditCard['brand']>, string> = {
  VISA: 'VISA',
  MASTERCARD: 'mastercard',
  ELO: 'elo',
  AMEX: 'AMEX',
  HIPERCARD: 'Hipercard',
  OTHER: 'Cartão',
}

export function CreditCardPreview({ card }: Readonly<{ card: CreditCard }>) {
  const brand = card.brand ?? 'OTHER'

  return (
    <div
      className="border-border/70 bg-muted/35 text-foreground relative aspect-[1.586/1] w-full overflow-hidden rounded-xl border p-5 shadow-inner"
      aria-label={`${card.name}, ${brandLabels[brand]}${card.lastFour ? `, final ${card.lastFour}` : ''}`}
    >
      <div className="bg-primary/5 absolute -top-16 -right-12 size-44 rounded-full blur-2xl" />
      <div className="bg-foreground/3 absolute -bottom-20 -left-16 size-48 rounded-full blur-2xl" />
      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-muted-foreground text-[10px] tracking-[0.14em] uppercase">
              Cartão de crédito
            </p>
            <p className="mt-1 max-w-52 truncate text-sm font-semibold">{card.name}</p>
          </div>
          <span className="border-border/70 bg-background/70 rounded-md border px-2 py-1 text-[10px] font-semibold tracking-wide uppercase shadow-xs">
            {brandLabels[brand]}
          </span>
        </div>
        <div className="text-muted-foreground flex items-center gap-3">
          <span className="border-border bg-background flex h-7 w-9 items-center justify-center rounded-md border shadow-xs">
            <CreditCardIcon className="size-4 stroke-[1.5]" aria-hidden="true" />
          </span>
          <Wifi className="size-4 rotate-90 stroke-[1.5]" aria-hidden="true" />
        </div>
        <div>
          <p className="font-mono text-base tracking-[0.14em] tabular-nums">
            •••• •••• •••• {card.lastFour ?? '••••'}
          </p>
          <div className="text-muted-foreground mt-3 flex items-end justify-between gap-4 text-[10px]">
            <span>Fecha dia {card.closingDay}</span>
            <span>Vence dia {card.dueDay}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
