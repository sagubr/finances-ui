import { CheckCheck, type LucideIcon } from 'lucide-react'
import { Button } from './button'

export interface NotificationListItem {
  readonly id: string
  readonly title: string
  readonly subtitle: string
  readonly time: string
  readonly icon: LucideIcon
  readonly unread?: boolean
}

export function NotificationList({
  items,
  onSelect,
  onReadAll,
  emptyLabel = 'Tudo em dia por aqui.',
}: {
  readonly items: readonly NotificationListItem[]
  readonly onSelect: (id: string) => void
  readonly onReadAll?: () => void
  readonly emptyLabel?: string
}) {
  return (
    <div className="bg-card text-card-foreground flex w-80 max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-xl border">
      <div className="flex items-center justify-between border-b p-4">
        <h3 className="text-sm font-semibold">Notificações</h3>
        {items.length > 0 && (
          <span className="bg-primary text-primary-foreground flex size-5 items-center justify-center rounded-full text-[10px] font-bold">
            {items.length}
          </span>
        )}
      </div>
      <div className="max-h-[60vh] overflow-y-auto p-2">
        {items.length === 0 ? (
          <div className="text-muted-foreground flex flex-col items-center py-8 text-center">
            <CheckCheck className="mb-2 size-8 opacity-50" />
            <p className="text-xs">{emptyLabel}</p>
          </div>
        ) : (
          items.map((item) => {
            const Icon = item.icon
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => onSelect(item.id)}
                className="hover:bg-muted flex w-full items-center gap-3 rounded-lg p-2 text-left"
              >
                <span className="bg-background rounded-lg border p-2">
                  <Icon className="text-muted-foreground size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{item.title}</span>
                  <span className="text-muted-foreground block truncate text-xs">
                    {item.subtitle}
                  </span>
                  <span className="text-muted-foreground text-[10px]">{item.time}</span>
                </span>
                {item.unread && (
                  <span
                    className="bg-primary ml-auto size-2 shrink-0 rounded-full"
                    aria-label="Não lida"
                  />
                )}
              </button>
            )
          })
        )}
      </div>
      {items.length > 0 && onReadAll && (
        <div className="border-t p-2">
          <Button variant="ghost" size="sm" className="w-full text-xs" onClick={onReadAll}>
            Marcar todas como lidas
          </Button>
        </div>
      )}
    </div>
  )
}
