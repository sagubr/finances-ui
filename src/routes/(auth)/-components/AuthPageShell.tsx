import { AnimatedGridPattern } from '@/components/backgrounds/animated-grid-pattern'
import useGetLogo from '@/hooks/useGetLogo'
import type { ReactNode } from 'react'

type AuthPageShellProps = Readonly<{
  title: string
  description: string
  children: ReactNode
  footer?: ReactNode
}>

export const AuthPageShell = ({ title, description, children, footer }: AuthPageShellProps) => {
  const logo = useGetLogo('icon')
  return (
    <main className="bg-background relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8">
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.1}
        duration={3}
        repeatDelay={1}
        className="inset-0 h-full w-full"
      />
      <section className="bg-card/95 relative z-10 flex w-full max-w-[440px] flex-col gap-5 rounded-2xl border p-7 shadow-xl backdrop-blur-sm sm:p-8">
        <header className="flex flex-col items-center space-y-2 text-center">
          <img src={logo} alt="Finanças" className="size-12 object-contain" />
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          <p className="text-muted-foreground max-w-sm text-xs leading-relaxed">{description}</p>
        </header>
        {children}
        {footer && <footer className="text-muted-foreground text-center text-sm">{footer}</footer>}
      </section>
    </main>
  )
}
