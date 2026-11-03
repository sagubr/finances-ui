import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { AlertTriangle, Share2, ShieldOff } from 'lucide-react'
import type { ReactNode } from 'react'

export interface SharingConfirmationDialogProps {
  readonly open: boolean
  readonly resourceType: 'visão' | 'dashboard'
  readonly resourceName?: string
  readonly isShared: boolean
  readonly pending?: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onConfirm: () => void
  readonly children?: ReactNode
  readonly copy?: {
    readonly title: string
    readonly description: string
    readonly warning: string
    readonly confirmLabel: string
  }
  readonly className?: string
}

export const SharingConfirmationDialog = ({
  open,
  resourceType,
  resourceName,
  isShared,
  pending = false,
  onOpenChange,
  onConfirm,
  children,
  copy,
  className,
}: SharingConfirmationDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent
      className={cn(
        'flex max-h-[90dvh] min-h-0 flex-col overflow-hidden',
        className ?? 'sm:max-w-xl',
      )}
    >
      <div className="min-h-0 min-w-0 flex-1 space-y-5 overflow-x-hidden overflow-y-auto pr-1">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-medium">
            {isShared ? (
              <ShieldOff className="text-destructive size-4" />
            ) : (
              <Share2 className="text-primary size-4" />
            )}
            {copy?.title ??
              (isShared ? 'Revogar compartilhamento?' : `Compartilhar ${resourceType}?`)}
          </DialogTitle>
          <DialogDescription>
            {copy?.description ??
              `${resourceName ? `“${resourceName}”` : `Esta ${resourceType}`} ${isShared ? 'deixará de estar compartilhado.' : 'ficará disponível no espaço de trabalho.'}`}
          </DialogDescription>
        </DialogHeader>

        <div
          className={
            isShared
              ? 'border-destructive/30 bg-destructive/5 rounded-lg border p-3'
              : 'rounded-lg border border-amber-300/60 bg-amber-50/70 p-3 dark:bg-amber-950/20'
          }
        >
          <div className="flex items-start gap-2">
            <AlertTriangle
              className={
                isShared
                  ? 'text-destructive mt-0.5 size-4 shrink-0'
                  : 'mt-0.5 size-4 shrink-0 text-amber-700 dark:text-amber-300'
              }
            />
            <p className="text-foreground/80 text-xs leading-relaxed">
              {copy?.warning ??
                (isShared
                  ? `Membros que consomem este ${resourceType} apenas pelo compartilhamento perderão o acesso. Links internos, favoritos e integrações dependentes poderão deixar de funcionar para essas pessoas.`
                  : `Todos os membros autorizados do espaço financeiro poderão encontrar e consumir este ${resourceType}. Isso não cria uma chave de API nem libera acesso externo.`)}
            </p>
          </div>
        </div>

        {children}
      </div>

      <DialogFooter className="shrink-0">
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
          Cancelar
        </Button>
        <Button
          variant={isShared ? 'destructive' : 'default'}
          onClick={onConfirm}
          disabled={pending}
        >
          {copy?.confirmLabel ?? (isShared ? 'Revogar acesso' : 'Compartilhar')}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)
