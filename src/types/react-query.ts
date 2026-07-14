import type { ToastMutationMeta } from '@/lib/toast'

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: ToastMutationMeta
  }
}
