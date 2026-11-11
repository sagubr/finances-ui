import { WishlistPage } from '@/modules/organization/pages/WishlistPage'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'

export const Route = createFileRoute('/_app/wishlist')({
  validateSearch: z.object({
    status: z.enum(['PLANNED', 'PURCHASE_PENDING', 'PURCHASED', 'ARCHIVED']).optional(),
    from: z.iso.date().optional(),
    to: z.iso.date().optional(),
    priority: z.coerce.number().int().min(0).max(10).optional(),
  }),
  component: WishlistRoute,
})

function WishlistRoute() {
  const filters = Route.useSearch()
  const navigate = useNavigate()
  return (
    <WishlistPage
      filters={filters}
      onFiltersChange={(nextFilters) =>
        void navigate({ to: '/wishlist', search: nextFilters, replace: true })
      }
    />
  )
}
