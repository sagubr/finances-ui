import { SettingsLayout } from '@/modules/settings/components/SettingsLayout'
import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/_app/settings')({ component: SettingsLayout })
