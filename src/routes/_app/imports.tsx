import { ImportsPage } from '@/modules/planning/pages/ImportsPage'
import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/_app/imports')({ component: ImportsPage })
