import { ChartNoAxesCombined, Landmark, ShieldCheck, WalletCards } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'

const trustSignals = [
  {
    label: 'Dados protegidos',
    icon: ShieldCheck,
    orbitClassName: 'size-[440px]',
    initialRotation: 220,
  },
  {
    label: 'Visão consolidada',
    icon: ChartNoAxesCombined,
    orbitClassName: 'size-[330px]',
    initialRotation: 100,
  },
  {
    label: 'Controle por competência',
    icon: WalletCards,
    orbitClassName: 'size-[250px]',
    initialRotation: -20,
  },
] as const

const orbitDuration = 36

export const LoginVisualPanel = () => {
  const reduceMotion = useReducedMotion()

  return (
    <aside className="bg-muted/20 relative hidden min-h-[680px] overflow-hidden border-l lg:flex lg:flex-col lg:justify-between">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden="true"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 38%, color-mix(in oklab, var(--primary) 14%, transparent), transparent 38%)',
        }}
      />

      <div
        className="relative flex min-h-[510px] flex-1 items-center justify-center"
        aria-hidden="true"
      >
        <div className="border-border/70 absolute size-[440px] rounded-full border" />
        <div className="border-border/70 absolute size-[330px] rounded-full border" />
        <motion.div
          className="border-border/70 absolute size-[250px] rounded-full border border-dashed"
          animate={reduceMotion ? undefined : { rotate: 360 }}
          transition={{ duration: 42, ease: 'linear', repeat: Infinity }}
        />

        {trustSignals.map(({ label, icon: Icon, orbitClassName, initialRotation }) => {
          const finalRotation = initialRotation + 360

          return (
            <motion.div
              key={label}
              className={`absolute ${orbitClassName}`}
              initial={{ rotate: initialRotation }}
              animate={reduceMotion ? undefined : { rotate: finalRotation }}
              transition={{ duration: orbitDuration, ease: 'linear', repeat: Infinity }}
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <motion.div
                  initial={{ rotate: -initialRotation }}
                  animate={reduceMotion ? undefined : { rotate: -finalRotation }}
                  transition={{ duration: orbitDuration, ease: 'linear', repeat: Infinity }}
                  className="border-border/80 bg-background/90 text-foreground flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium whitespace-nowrap shadow-sm backdrop-blur"
                >
                  <Icon className="text-primary size-3.5" />
                  {label}
                </motion.div>
              </div>
            </motion.div>
          )
        })}

        <motion.div
          className="border-border/80 bg-background/75 absolute flex size-28 items-center justify-center rounded-full border shadow-2xl backdrop-blur"
          animate={reduceMotion ? undefined : { scale: [1, 1.04, 1] }}
          transition={{ duration: 4, ease: 'easeInOut', repeat: Infinity }}
        >
          <div className="bg-primary text-primary-foreground flex size-14 items-center justify-center rounded-2xl shadow-lg">
            <Landmark className="size-7" />
          </div>
        </motion.div>
      </div>

      <div className="relative space-y-5 px-10 pb-10 xl:px-14 xl:pb-12">
        <blockquote className="max-w-lg text-xl leading-relaxed font-medium tracking-tight xl:text-2xl">
          “Clareza para decidir hoje, tranquilidade para planejar o amanhã.”
        </blockquote>
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 ring-primary/15 flex size-10 items-center justify-center rounded-full ring-4">
            <ChartNoAxesCombined className="text-primary size-4" />
          </div>
          <div>
            <p className="text-sm font-medium">Sua vida financeira em um só lugar</p>
            <p className="text-muted-foreground text-xs">
              Contas, cartões e planejamento integrados
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
