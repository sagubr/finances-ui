import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import React, { useCallback, useEffect, useMemo } from 'react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { OnPaginationStateChangeFn } from '../../type'
import PaginationButton from './components/PaginationButton'

export const DEFAULT_PAGE_SIZE = 25

const pageSizes = [25, 50, 75, 100, 500, 1000, 5000]
const pageSizeItems = pageSizes.map((size) => ({
  value: size.toString(),
  label: size.toString(),
}))

interface TablePaginationProps {
  totalPages: number
  totalItems: number
  selectedPage: number
  pageSize?: number
  enablePageSizeChange?: boolean
  onPaginationChange: OnPaginationStateChangeFn
}

const TOTAL_VISIBLE_PAGES = 5

const getPageIndices = (totalPages: number, selectedPage: number): number[] => {
  if (totalPages <= 0) return [0]
  if (totalPages <= TOTAL_VISIBLE_PAGES) {
    return Array.from({ length: totalPages }, (_, i) => i)
  }

  const rawLeft = Math.max(0, selectedPage - Math.floor(TOTAL_VISIBLE_PAGES / 2))
  const rawRight = rawLeft + TOTAL_VISIBLE_PAGES - 1
  const adjustedRight = rawRight >= totalPages ? totalPages - 1 : rawRight
  const adjustedLeft =
    rawRight >= totalPages ? Math.max(0, adjustedRight - TOTAL_VISIBLE_PAGES + 1) : rawLeft

  const count = adjustedRight - adjustedLeft + 1
  return Array.from({ length: count }, (_, i) => adjustedLeft + i)
}

const TablePagination: React.FC<TablePaginationProps> = React.memo(
  ({
    totalPages,
    totalItems,
    selectedPage,
    enablePageSizeChange = true,
    pageSize = DEFAULT_PAGE_SIZE,
    onPaginationChange,
  }) => {
    const handlePageChange = useCallback(
      (page: number) => {
        onPaginationChange((prev) => ({
          ...prev,
          pageIndex: page,
        }))
      },
      [onPaginationChange],
    )

    const pageIndices = useMemo(
      () => getPageIndices(totalPages, selectedPage),
      [totalPages, selectedPage],
    )

    useEffect(() => {
      if (totalPages !== 0 && selectedPage >= totalPages) {
        handlePageChange(0)
      }
    }, [selectedPage, totalPages])

    const isFirstPage = selectedPage === 0
    const isLastPage = selectedPage >= totalPages - 1

    return (
      <div className="border-border/40 mt-4 flex items-center justify-between border-t pt-4">
        <div className="flex items-center gap-2">
          {enablePageSizeChange ? (
            <>
              <Select
                items={pageSizeItems}
                value={pageSize.toString()}
                onValueChange={(value) => {
                  onPaginationChange((prev) => ({
                    ...prev,
                    pageSize: Number(value),
                  }))
                }}
              >
                <SelectTrigger className="w-fit">
                  <SelectValue className="text-foreground/70 text-sm" />
                </SelectTrigger>
                <SelectContent>
                  {pageSizes.map((size) => (
                    <SelectItem key={size} value={size.toString()} label={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p>de</p>
            </>
          ) : null}
          <p>
            <span className="font-semibold">{totalItems}</span> registros
          </p>
        </div>

        <div className="flex items-center p-2">
          <button
            className={cn(
              'text-foreground/70 flex h-7 w-[24px] items-center justify-center',
              isFirstPage ? 'text-foreground/70' : 'hover:bg-neutral-100',
            )}
            onClick={() => handlePageChange(0)}
            disabled={isFirstPage}
          >
            <ChevronsLeft size={18} strokeWidth={2} />
          </button>
          <button
            className={cn(
              'text-foreground/70 flex h-7 w-[24px] items-center justify-center',
              isFirstPage ? 'text-foreground/70' : 'hover:bg-neutral-100',
            )}
            onClick={() => handlePageChange(Math.max(0, selectedPage - 1))}
            disabled={isFirstPage}
          >
            <ChevronLeft size={16} strokeWidth={2} />
          </button>
          <ul className="flex items-center">
            {pageIndices.map((pageIndex) => (
              <PaginationButton
                key={`page-${pageIndex}`}
                page={pageIndex + 1}
                disabled={pageIndex === selectedPage || totalPages === 0}
                onClick={() => handlePageChange(pageIndex)}
              />
            ))}
          </ul>
          <button
            className={cn(
              'text-foreground/70 flex h-7 w-[24px] items-center justify-center',
              isLastPage ? 'text-foreground/70' : 'hover:bg-neutral-100',
            )}
            onClick={() => handlePageChange(Math.min(totalPages - 1, selectedPage + 1))}
            disabled={isLastPage}
          >
            <ChevronRight size={16} strokeWidth={2} />
          </button>
          <button
            className={cn(
              'text-foreground/70 flex h-7 w-[24px] items-center justify-center',
              isLastPage ? 'text-foreground/70' : 'hover:bg-neutral-100',
            )}
            onClick={() => handlePageChange(totalPages - 1)}
            disabled={isLastPage}
          >
            <ChevronsRight size={18} strokeWidth={2} />
          </button>
        </div>
      </div>
    )
  },
)
TablePagination.displayName = 'TablePagination'

export default TablePagination
