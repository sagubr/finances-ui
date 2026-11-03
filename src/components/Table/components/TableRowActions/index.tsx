import { DeleteIcon } from '@/components/ui/icons/delete-icon'
import { MoreHorizontal, Pencil } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { ReactNode } from 'react'

interface Action {
  label: string
  icon?: ReactNode
  action: () => void
}

interface Submenu {
  title: string
  items: Action[]
}

type TableRowActionsProps = {
  actions?: Action[]
  submenus?: Submenu[]
  onClickDelete?: () => void
  onClickEdit?: () => void
}

const TableRowActions = ({
  actions,
  submenus,
  onClickDelete,
  onClickEdit,
}: TableRowActionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            className="hover:bg-transparent dark:hover:bg-transparent"
            size="icon"
            variant="ghost"
          />
        }
      >
        <span className="sr-only">Abrir menu</span>
        <MoreHorizontal className="text-foreground h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="border-none" align="end">
        {submenus &&
          submenus.map((submenu) => (
            <div key={submenu.title}>
              <DropdownMenuLabel className="py-1">{submenu.title}</DropdownMenuLabel>
              {submenu.items.map((action) => (
                <DropdownMenuItem className="gap-2" onClick={action.action}>
                  {action.icon}
                  {action.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
            </div>
          ))}
        <DropdownMenuLabel className="py-1">Ações</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {actions &&
          actions.map((action) => (
            <DropdownMenuItem className="gap-2" onClick={action.action}>
              {action.icon}
              {action.label}
            </DropdownMenuItem>
          ))}
        {onClickEdit && (
          <DropdownMenuItem className="gap-2" onClick={onClickEdit}>
            <Pencil className="size-3.5" />
            Editar
          </DropdownMenuItem>
        )}
        {onClickDelete && (
          <DropdownMenuItem
            className="gap-2 text-red-500 focus:text-red-500"
            onClick={onClickDelete}
          >
            <DeleteIcon size={14} className="text-destructive/75" />
            Excluir
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default TableRowActions
