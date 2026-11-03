import { useState } from 'react'

export const useDisclosure = (initialOpen?: boolean) => {
  const [isOpen, setIsOpen] = useState(initialOpen ?? false)

  const onOpen = () => setIsOpen(true)
  const onClose = () => setIsOpen(false)
  const onToggle = () => setIsOpen((prev) => !prev)

  const onOpenChange = (open: boolean) => setIsOpen(open)

  return {
    isOpen,
    onOpen,
    onClose,
    onToggle,
    onOpenChange,
  }
}
