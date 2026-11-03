import { MutationErrorMessage } from '@/components/MutationErrorMessage'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AlertTriangle, HelpCircle, Info, Loader2, Trash2 } from 'lucide-react'
import React from 'react'

export interface ConfirmDialogProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly title: string
  readonly description?: React.ReactNode
  readonly confirmText?: string
  readonly cancelText?: string
  readonly variant?: 'default' | 'destructive' | 'outline' | 'secondary'
  readonly type?: 'warning' | 'danger' | 'info' | 'question'
  readonly isPending?: boolean
  readonly nested?: boolean
  readonly onConfirm: () => void | Promise<void>
  readonly onCancel?: () => void
}

export const ConfirmDialog = React.memo<ConfirmDialogProps>(
  ({
    open,
    onOpenChange,
    title,
    description,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'default',
    type = 'question',
    isPending = false,
    nested = true,
    onConfirm,
    onCancel,
  }) => {
    const [confirmationError, setConfirmationError] = React.useState<unknown>(null)
    const handleCancel = () => {
      setConfirmationError(null)
      onCancel?.()
      onOpenChange(false)
    }

    const handleConfirm = async () => {
      setConfirmationError(null)
      try {
        await onConfirm()
        onOpenChange(false)
      } catch (error) {
        setConfirmationError(error)
      }
    }

    const renderIcon = () => {
      if (type === 'danger' || variant === 'destructive') {
        return (
          <div className="bg-destructive/15 text-destructive flex size-9 shrink-0 items-center justify-center rounded-xl">
            <Trash2 className="size-4" />
          </div>
        )
      }
      if (type === 'warning') {
        return (
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500">
            <AlertTriangle className="size-4" />
          </div>
        )
      }
      if (type === 'info') {
        return (
          <div className="bg-primary/15 text-primary flex size-9 shrink-0 items-center justify-center rounded-xl">
            <Info className="size-4" />
          </div>
        )
      }
      return (
        <div className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-xl">
          <HelpCircle className="size-4" />
        </div>
      )
    }

    return (
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next && !isPending) {
            handleCancel()
          }
        }}
      >
        <DialogContent nested={nested} className="max-w-md gap-5 p-6" showCloseButton={!isPending}>
          <DialogHeader className="gap-3">
            <div className="flex items-start gap-3">
              {renderIcon()}
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-base leading-tight font-semibold">{title}</DialogTitle>
                {description && (
                  <DialogDescription className="text-muted-foreground mt-2 text-xs leading-relaxed">
                    {description}
                  </DialogDescription>
                )}
              </div>
            </div>
          </DialogHeader>

          <MutationErrorMessage
            error={confirmationError}
            fallbackMessage="Não foi possível concluir a ação. Tente novamente."
          />

          <DialogFooter className="border-border/40 mt-2 flex items-center justify-end gap-2 border-t pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={isPending}
            >
              {cancelText}
            </Button>
            <Button
              type="button"
              variant={variant}
              size="sm"
              onClick={() => void handleConfirm()}
              disabled={isPending}
            >
              {isPending && <Loader2 aria-hidden="true" className="mr-2 size-3.5 animate-spin" />}
              {confirmText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  },
)

ConfirmDialog.displayName = 'ConfirmDialog'
