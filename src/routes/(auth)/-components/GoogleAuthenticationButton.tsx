import { buttonVariants } from '@/components/ui/button'
import { envConfig } from '@/config/env.config'
import { cn } from '@/lib/utils'

export const GoogleAuthenticationButton = ({ label }: { label: string }) => (
  <a
    href={`${envConfig.apiV1Url}/auth/google`}
    className={cn(buttonVariants({ variant: 'outline' }), 'h-11 w-full rounded-xl')}
  >
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4">
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.41"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.98-.9 6.63-2.36l-3.24-2.54c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.77-5.61-4.14H3.04v2.62A10 10 0 0 0 12 22"
      />
      <path
        fill="#FBBC05"
        d="M6.39 13.92A6 6 0 0 1 6.08 12c0-.67.12-1.32.31-1.92V7.46H3.04A10 10 0 0 0 2 12c0 1.63.39 3.17 1.04 4.54z"
      />
      <path
        fill="#EA4335"
        d="M12 5.94c1.47 0 2.79.5 3.83 1.5l2.87-2.88A9.63 9.63 0 0 0 12 2a10 10 0 0 0-8.96 5.46l3.35 2.62C7.18 7.7 9.39 5.94 12 5.94"
      />
    </svg>
    {label}
  </a>
)

export const AuthenticationDivider = () => (
  <div className="flex items-center gap-3" aria-hidden="true">
    <span className="bg-border h-px flex-1" />
    <span className="text-muted-foreground text-xs">ou continue com e-mail</span>
    <span className="bg-border h-px flex-1" />
  </div>
)
