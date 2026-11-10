import { VersionBadge } from '@/components/VersionBadge'
import useGetLogo from '@/hooks/useGetLogo'
import { Link } from '@tanstack/react-router'
import { ShieldCheck } from 'lucide-react'
import type { ReactNode } from 'react'
import { LoginVisualPanel } from './Login/LoginVisualPanel'

type AuthLayoutProps = Readonly<{
  children: ReactNode
  headerAction?: ReactNode
}>

export const AuthLayout = ({ children, headerAction }: AuthLayoutProps) => {
  const logo = useGetLogo('icon')

  return (
    <main className="bg-background relative flex min-h-dvh items-center justify-center overflow-hidden p-0 sm:p-5 lg:p-8">
      <div
        className="bg-primary/8 pointer-events-none absolute -top-40 -left-40 size-96 rounded-full blur-3xl"
        aria-hidden="true"
      />
      <section className="bg-card relative z-10 grid min-h-dvh w-full overflow-hidden sm:min-h-[680px] sm:max-w-[1180px] sm:rounded-3xl sm:border sm:shadow-2xl lg:grid-cols-[0.92fr_1.08fr]">
        <div className="flex min-h-dvh flex-col px-5 py-6 sm:min-h-[680px] sm:px-10 sm:py-8 lg:px-12 xl:px-16">
          <header className="flex items-center justify-between gap-4">
            <Link to="/login" className="flex items-center gap-3" aria-label="Nummo — login">
              <span className="bg-primary/10 ring-primary/10 flex size-10 items-center justify-center rounded-xl ring-4">
                <img src={logo} alt="" className="size-6 object-contain" />
              </span>
              <span className="text-sm font-semibold tracking-tight">Nummo</span>
            </Link>
            {headerAction ?? (
              <Link
                to="/resend-confirmation"
                className="text-muted-foreground hover:text-foreground text-xs transition-colors sm:text-sm"
              >
                Precisa de ajuda?
              </Link>
            )}
          </header>

          <div className="flex flex-1 items-center py-8 sm:py-10">
            <div className="mx-auto w-full max-w-[390px]">{children}</div>
          </div>

          <div className="text-muted-foreground mx-auto mb-5 flex w-full max-w-[390px] items-center justify-center gap-2 text-center text-xs sm:justify-start">
            <ShieldCheck className="size-3.5" />
            <span>Sessão protegida e dados isolados por workspace.</span>
          </div>

          <footer className="flex items-center justify-between gap-4">
            <p className="text-muted-foreground text-[11px]">Organize. Planeje. Evolua.</p>
            <VersionBadge align="left" />
          </footer>
        </div>

        <LoginVisualPanel />
      </section>
    </main>
  )
}

type AuthPageShellProps = Readonly<{
  title: string
  description: string
  children: ReactNode
  eyebrow?: string
  footer?: ReactNode
  headerAction?: ReactNode
}>

export const AuthPageShell = ({
  title,
  description,
  children,
  eyebrow = 'Sua conta Nummo',
  footer,
  headerAction,
}: AuthPageShellProps) => (
  <AuthLayout headerAction={headerAction}>
    <div className="mb-7 space-y-2">
      <p className="text-primary text-xs font-semibold tracking-[0.18em] uppercase">{eyebrow}</p>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>

    {children}

    {footer && <div className="text-muted-foreground mt-6 text-center text-sm">{footer}</div>}
  </AuthLayout>
)
