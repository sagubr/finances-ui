import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import Show from '@/components/Show'
import { cn } from '@/lib/utils'
import type { Header, Table } from '@tanstack/react-table'
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ChevronsUpDown,
  Expand,
  EyeOff,
  Grid2x2X,
  Group,
  ListFilter,
  Minimize,
  MoreVertical,
  PinOff,
  RotateCcw,
  Ungroup,
} from 'lucide-react'
import { Filter } from '../../../Filter'

interface HeaderActionsProps<TData> {
  header: Header<TData, any>
  table: Table<TData>
}

const HeaderActions = <T,>({ header, table }: HeaderActionsProps<T>) => {
  const headerDef = header.column.columnDef.header
  const headerTitle =
    typeof headerDef === 'function' ? '' : header.column.columnDef.header?.toString()

  const renderMenuItem = header.column.columnDef.meta?.header?.menu?.renderMenuItem

  const menuClassname = header.column.columnDef.meta?.header?.menu?.className

  const canExpand = header.column.getIsGrouped() || header.column.columnDef.meta?.row?.isGrouped

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button size="icon" variant="ghost" className={cn('rounded-full', menuClassname)} />
        }
      >
        <MoreVertical className="text-foreground/70 group-hover:text-foreground size-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[300px]">
        <Show
          when={header.column.getCanFilter()}
          fallback={
            <DropdownMenuGroup>
              <div className="px-4 py-2">
                <p className="font-semibold">{headerTitle}</p>
              </div>
              <DropdownMenuSeparator />
            </DropdownMenuGroup>
          }
        >
          {() => (
            <DropdownMenuGroup>
              <div className="space-y-2 px-2 pt-2">
                <div className="flex items-center gap-2">
                  <ListFilter size={14} className="text-foreground/70" />
                  <p className="text-xs font-semibold">
                    {header.column.columnDef.header?.toString()}
                  </p>
                </div>
                <Filter column={header.column} />
              </div>
              <DropdownMenuSeparator />
            </DropdownMenuGroup>
          )}
        </Show>
        {renderMenuItem && (
          <DropdownMenuGroup>
            {renderMenuItem({ header })}
            <DropdownMenuSeparator />
          </DropdownMenuGroup>
        )}
        <DropdownMenuGroup>
          {header.column.getCanSort() && (
            <>
              <DropdownMenuItem
                className="group gap-2 focus:cursor-pointer"
                onClick={() => header.column.toggleSorting(false)}
              >
                <ArrowUp className="group-hover:text-primary-600 text-foreground/70" size={14} />{' '}
                Asc
              </DropdownMenuItem>
              <DropdownMenuItem
                className="group gap-2 focus:cursor-pointer"
                onClick={() => header.column.toggleSorting(true)}
              >
                <ArrowDown className="group-hover:text-primary-600 text-foreground/70" size={14} />
                Desc
              </DropdownMenuItem>
              <DropdownMenuItem
                className="group gap-2 focus:cursor-pointer"
                onClick={() => {
                  header.column.clearSorting()
                }}
              >
                <ChevronsUpDown
                  className="group-hover:text-primary-600 text-foreground/70"
                  size={14}
                />
                Resetar ordem
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          {canExpand && (
            <DropdownMenuItem
              className="group gap-2 focus:cursor-pointer"
              onClick={() => {
                table.toggleAllRowsExpanded()
              }}
            >
              {table.getIsAllRowsExpanded() ? (
                <>
                  <Minimize className="group-hover:text-primary-600 text-foreground/70" size={14} />
                  Minimizar linhas
                </>
              ) : (
                <>
                  <Expand className="group-hover:text-primary-600 text-foreground/70" size={14} />
                  Expandir linhas
                </>
              )}
            </DropdownMenuItem>
          )}
          {header.column.getCanGroup() && (
            <DropdownMenuItem
              className="group gap-2 focus:cursor-pointer"
              onClick={() => {
                header.column.toggleGrouping()
              }}
            >
              {header.column.getIsGrouped() ? (
                <>
                  <Ungroup className="group-hover:text-primary-600 text-foreground/70" size={14} />
                  Desagrupar
                </>
              ) : (
                <>
                  <Group className="group-hover:text-primary-600 text-foreground/70" size={14} />
                  Agrupar
                </>
              )}
            </DropdownMenuItem>
          )}
          {header.column.getCanPin() && (
            <>
              <DropdownMenuItem
                className="group gap-2 focus:cursor-pointer"
                onClick={() => header.column.pin('left')}
              >
                <ArrowLeft className="group-hover:text-primary-600 text-foreground/70" size={14} />
                Fixar à esquerda
              </DropdownMenuItem>
              <DropdownMenuItem
                className="group gap-2 focus:cursor-pointer"
                onClick={() => header.column.pin('right')}
              >
                <ArrowRight className="group-hover:text-primary-600 text-foreground/70" size={14} />
                Fixar à direita
              </DropdownMenuItem>
              <DropdownMenuItem
                className="group gap-2 focus:cursor-pointer"
                onClick={() => header.column.pin(false)}
              >
                <PinOff className="group-hover:text-primary-600 text-foreground/70" size={14} />
                Desfixar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
        </DropdownMenuGroup>
        {header.column.getCanHide() && (
          <DropdownMenuItem
            className="group gap-2 focus:cursor-pointer"
            onClick={() => header.column.toggleVisibility(false)}
          >
            <EyeOff className="group-hover:text-primary-600 text-foreground/70" size={14} /> Ocultar
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          className="group gap-2 focus:cursor-pointer"
          onClick={() => {
            header.column.clearSorting()
            header.column.resetSize()
          }}
        >
          <RotateCcw className="group-hover:text-primary-600 text-foreground/70" size={14} />
          Resetar coluna
        </DropdownMenuItem>
        <DropdownMenuItem
          className="group gap-2 focus:cursor-pointer"
          onClick={() => {
            table.reset()
          }}
        >
          <Grid2x2X className="group-hover:text-primary-600 text-foreground/70" size={14} />
          Resetar tabela
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default HeaderActions
