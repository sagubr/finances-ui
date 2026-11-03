'use client'

import { Dialog as DialogPrimitive } from '@base-ui/react/dialog'
import * as React from 'react'

import { Button } from '#/components/ui/button.tsx'
import { cn } from '#/lib/utils.ts'
import { RiCloseLine } from '@remixicon/react'

const DialogContext = React.createContext<{ open: boolean }>({ open: false })

type AnimatedDialogContentProps = {
  open: boolean
  className?: DialogPrimitive.Popup.Props['className']
  children: React.ReactNode
  showCloseButton?: boolean
  popupProps?: Omit<DialogPrimitive.Popup.Props, 'children' | 'className'>
  nested?: boolean
  overlayClassName?: string
}

function AnimatedDialogContent({
  open,
  className,
  children,
  showCloseButton = true,
  popupProps,
  nested = false,
  overlayClassName,
}: AnimatedDialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Backdrop
        data-slot="dialog-overlay"
        className={cn(
          'fixed inset-0 isolate transition-opacity duration-200 data-[state=closed]:opacity-0 data-[state=open]:opacity-100',
          nested
            ? 'z-[60] bg-black/70 backdrop-blur-sm supports-backdrop-filter:backdrop-blur-sm'
            : 'z-50 bg-black/50 backdrop-blur-xs supports-backdrop-filter:backdrop-blur-xs',
          overlayClassName,
        )}
      />

      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cn(
          'pointer-events-none fixed inset-0 flex items-center justify-center',
          nested ? 'z-[60]' : 'z-50',
        )}
        {...popupProps}
      >
        <div
          className={cn(
            'bg-popover text-popover-foreground ring-foreground/10 pointer-events-auto relative w-[calc(100%-2rem)] max-w-lg rounded-xl p-4 text-sm ring-1 outline-none sm:w-full',
            'mx-auto grid gap-4 shadow-lg transition-all duration-200 ease-out',
            'data-[state=open]:scale-100 data-[state=open]:opacity-100',
            'data-[state=closed]:scale-95 data-[state=closed]:opacity-0',
            typeof className === 'string' ? className : undefined,
          )}
        >
          {children}
          {showCloseButton && (
            <DialogPrimitive.Close
              data-slot="dialog-close"
              render={
                <Button
                  variant="ghost"
                  className="absolute top-3 right-3 size-8 rounded-md [&_svg]:size-4"
                  size="icon-sm"
                />
              }
            >
              <RiCloseLine aria-hidden />
              <span className="sr-only">Fechar</span>
            </DialogPrimitive.Close>
          )}
        </div>
      </DialogPrimitive.Popup>
    </DialogPrimitive.Portal>
  )
}

function Dialog({
  children,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
  ...props
}: DialogPrimitive.Root.Props) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen)
  const open = openProp ?? internalOpen

  const handleOpenChange: DialogPrimitive.Root.Props['onOpenChange'] = React.useCallback(
    (next: boolean, details: unknown) => {
      if (openProp === undefined) setInternalOpen(next)
      onOpenChange?.(next, details as never)
    },
    [onOpenChange, openProp],
  )
  const contextValue = React.useMemo(() => ({ open }), [open])

  return (
    <DialogContext.Provider value={contextValue}>
      <DialogPrimitive.Root
        data-slot="dialog"
        open={open}
        onOpenChange={handleOpenChange}
        {...props}
      >
        {children}
      </DialogPrimitive.Root>
    </DialogContext.Provider>
  )
}

function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({ ...props }: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({ className, ...props }: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        'fixed inset-0 isolate z-50 bg-black/50 backdrop-blur-xs supports-backdrop-filter:backdrop-blur-xs',
        className,
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  open: openProp,
  nested = false,
  overlayClassName,
  ...props
}: DialogPrimitive.Popup.Props & {
  showCloseButton?: boolean
  open?: boolean
  nested?: boolean
  overlayClassName?: string
}) {
  const { open: contextOpen } = React.useContext(DialogContext)
  const open = openProp ?? contextOpen

  return (
    <AnimatedDialogContent
      open={open}
      className={className}
      showCloseButton={showCloseButton}
      nested={nested}
      overlayClassName={overlayClassName}
      popupProps={props}
    >
      {children}
    </AnimatedDialogContent>
  )
}

DialogContent.displayName = 'DialogContent'

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="dialog-header" className={cn('flex flex-col gap-2', className)} {...props} />
  )
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<'div'> & { showCloseButton?: boolean }) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        'bg-muted/15 -mx-4 mt-1 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-end',
        className,
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close render={<Button variant="outline" />}>Fechar</DialogPrimitive.Close>
      )}
    </div>
  )
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn('font-heading text-base leading-none font-medium', className)}
      {...props}
    />
  )
}

function DialogDescription({ className, ...props }: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        'text-foreground/70 *:[a]:hover:text-foreground text-sm *:[a]:underline *:[a]:underline-offset-3',
        className,
      )}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
