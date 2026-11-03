import { MutationCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { toast } from 'sonner'

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: {
      loadingToast?: boolean
      loadingMessage?: string
    }
  }
}

const loadingToastIds = new WeakMap<object, string | number>()

const mutationCache = new MutationCache({
  onMutate: (_variables, mutation) => {
    if (mutation.meta?.loadingToast !== true && !mutation.meta?.loadingMessage) return
    const toastId = toast.loading(mutation.meta?.loadingMessage ?? 'Processando...')
    loadingToastIds.set(mutation, toastId)
  },
  onSettled: (_data, _error, _variables, _context, mutation) => {
    const toastId = loadingToastIds.get(mutation)
    if (toastId === undefined) return
    toast.dismiss(toastId)
    loadingToastIds.delete(mutation)
  },
})

export function getContext() {
  const queryClient = new QueryClient({
    mutationCache,
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
      },
    },
  })

  return {
    queryClient,
  }
}

type ProviderProps = {
  queryClient: QueryClient
  children: ReactNode
}

export function Provider({ queryClient, children }: ProviderProps) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
