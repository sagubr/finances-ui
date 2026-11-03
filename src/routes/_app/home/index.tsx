import { HomePage } from '@/modules/home/components/HomePage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/home/')({
  component: HomePage,
})
