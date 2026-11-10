import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PlanningPage } from '@/modules/planning/pages/PlanningPage'
import { useNavigate } from '@tanstack/react-router'

import { FinancialStructurePage } from './FinancialStructurePage'

export type AccountsSection = 'accounts' | 'cards'

export function AccountsPage({ section }: Readonly<{ section: AccountsSection }>) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-6">
      <header className="border-b pb-5">
        <h1 className="font-heading text-2xl font-semibold">Contas e cartões</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Gerencie suas contas financeiras, cartões e faturas em um único lugar.
        </p>
      </header>

      <Tabs
        value={section}
        onValueChange={(value) =>
          void navigate({
            to: '/accounts',
            search: { tab: value === 'cards' ? 'cards' : undefined },
          })
        }
      >
        <TabsList className="grid min-h-14 w-full grid-cols-2 p-1.5">
          <TabsTrigger value="accounts" className="min-h-11 text-base">
            Contas
          </TabsTrigger>
          <TabsTrigger value="cards" className="min-h-11 text-base">
            Cartões
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {section === 'accounts' ? (
        <FinancialStructurePage section="accounts" embedded />
      ) : (
        <PlanningPage section="cards" embedded />
      )}
    </div>
  )
}
