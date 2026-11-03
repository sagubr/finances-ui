// @ts-nocheck -- componente herdado; tipagens upstream mudaram sem alteração de runtime
'use client'

import { Collapsible as CollapsiblePrimitive } from '@base-ui/react/collapsible'
import { AnimatePresence, motion } from 'motion/react'
import * as React from 'react'

type CollapsibleContextValue = { open: boolean }
const CollapsibleContext = React.createContext<CollapsibleContextValue>({
  open: false,
})

function Collapsible({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  ...props
}: CollapsiblePrimitive.Root.Props) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen)
  const open = openProp ?? internalOpen

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      setInternalOpen(next)
      onOpenChange?.(next)
    },
    [onOpenChange],
  )

  return (
    <CollapsibleContext.Provider value={{ open }}>
      <CollapsiblePrimitive.Root
        data-slot="collapsible"
        open={open}
        onOpenChange={handleOpenChange}
        {...props}
      />
    </CollapsibleContext.Provider>
  )
}

function CollapsibleTrigger({ ...props }: CollapsiblePrimitive.Trigger.Props) {
  return <CollapsiblePrimitive.Trigger data-slot="collapsible-trigger" {...props} />
}

function CollapsibleContent({ children, ...props }: CollapsiblePrimitive.Panel.Props) {
  const { open } = React.useContext(CollapsibleContext)

  return (
    <AnimatePresence initial={false}>
      {open && (
        <CollapsiblePrimitive.Panel
          data-slot="collapsible-content"
          hidden={false}
          render={
            <motion.div
              key="collapsible-panel"
              initial={{
                height: 0,
                opacity: 0,
                '--mask-stop': '0%',
                y: 10,
              }}
              animate={{
                height: 'auto',
                opacity: 1,
                '--mask-stop': '100%',
                y: 0,
              }}
              exit={{
                height: 0,
                opacity: 0,
                '--mask-stop': '0%',
                y: 10,
              }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              style={{
                maskImage: 'linear-gradient(black var(--mask-stop), transparent var(--mask-stop))',
                WebkitMaskImage:
                  'linear-gradient(black var(--mask-stop), transparent var(--mask-stop))',
                overflow: 'hidden',
              }}
              {...props}
            >
              {children}
            </motion.div>
          }
        />
      )}
    </AnimatePresence>
  )
}

export { Collapsible, CollapsibleContent, CollapsibleTrigger }
