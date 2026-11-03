import { ModeToggle } from '@/components/ModeToggle'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthProvider'
import { ChevronRight, LockKeyhole, Palette, Settings, UserRound } from 'lucide-react'
import { type ReactNode, useId } from 'react'

const SettingsSection = ({
  title,
  description,
  icon,
  children,
}: Readonly<{
  title: string
  description: string
  icon: ReactNode
  children: ReactNode
}>) => {
  const headingId = useId()
  return (
    <section className="space-y-3" aria-labelledby={headingId}>
      <div className="flex items-start gap-3">
        <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-xl">
          {icon}
        </div>
        <div>
          <h2 id={headingId} className="font-heading text-lg font-semibold">
            {title}
          </h2>
          <p className="text-muted-foreground mt-0.5 text-sm">{description}</p>
        </div>
      </div>
      {children}
    </section>
  )
}

export function SettingsLayout() {
  const { auth, setChangePasswordOpen } = useAuth()
  return (
    <div className="flex w-full min-w-0 flex-col gap-8">
      <header className="border-b pb-5">
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <Settings className="text-primary size-6" /> Configurações
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Conta, espaço financeiro e preferências em um único lugar.
        </p>
      </header>

      <SettingsSection
        title="Conta"
        description="Identidade e segurança da sua conta de usuário."
        icon={<UserRound className="size-4" />}
      >
        <Card>
          <CardContent className="divide-y p-0">
            <div className="grid gap-4 p-4 sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground text-xs">Nome</p>
                <p className="mt-1 font-medium">{auth.data?.user}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">E-mail</p>
                <p className="mt-1 font-medium">{auth.data?.email}</p>
              </div>
            </div>
            <button
              type="button"
              className="hover:bg-muted flex min-h-14 w-full items-center gap-3 px-4 text-left transition-colors"
              onClick={() => setChangePasswordOpen(true)}
            >
              <LockKeyhole className="text-muted-foreground size-4" />
              <span className="min-w-0 flex-1">
                <span className="block font-medium">Alterar senha</span>
                <span className="text-muted-foreground block text-xs">
                  Atualize sua credencial de acesso.
                </span>
              </span>
              <ChevronRight className="text-muted-foreground size-4" />
            </button>
          </CardContent>
        </Card>
      </SettingsSection>

      <SettingsSection
        title="Preferências"
        description="Ajuste a experiência visual da aplicação."
        icon={<Palette className="size-4" />}
      >
        <Card>
          <CardContent className="flex min-h-16 items-center gap-3 p-4">
            <Palette className="text-muted-foreground size-4" />
            <span className="min-w-0 flex-1">
              <span className="block font-medium">Aparência</span>
              <span className="text-muted-foreground block text-xs">
                Escolha entre tema claro, escuro ou automático.
              </span>
            </span>
            <ModeToggle />
          </CardContent>
        </Card>
      </SettingsSection>
    </div>
  )
}
