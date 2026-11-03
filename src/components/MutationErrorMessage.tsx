import { extractErrorMessage } from '@/api/utils'

export const MutationErrorMessage = ({
  error,
  fallbackMessage = 'Não foi possível salvar. Tente novamente.',
}: Readonly<{ error: unknown; fallbackMessage?: string }>) =>
  error ? (
    <p role="alert" className="text-destructive text-sm">
      {extractErrorMessage(error, fallbackMessage)}
    </p>
  ) : null
