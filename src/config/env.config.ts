/**
 * Configuração centralizada e tipada de variáveis de ambiente do Frontend.
 *
 * Utiliza as variáveis injetadas pelo Vite (`import.meta.env`) com validações
 * e defaults defensivos para desenvolvimento, homologação (staging) e produção.
 */

export type AppEnvironment = 'development' | 'staging' | 'production' | 'test'

export interface EnvConfig {
  /** Ambiente atual da aplicação ('development' | 'staging' | 'production' | 'test') */
  env: AppEnvironment
  /** Modo informado pelo Vite (import.meta.env.MODE) */
  mode: string
  /** Versão atual do aplicativo */
  version: string
  /** Identificador do sistema para headers e rastreabilidade */
  system: string
  /** URL base bruta configurada da API */
  rawApiUrl: string
  /** URL canônica para endpoints da API v1 */
  apiV1Url: string
  /** Flag indicando se é ambiente de desenvolvimento */
  isDev: boolean
  /** Flag indicando se é ambiente de staging/homologação */
  isStaging: boolean
  /** Flag indicando se é ambiente de produção */
  isProd: boolean
  /** Flag indicando se está executando testes */
  isTest: boolean
}

const rawEnv = (
  import.meta.env.VITE_APP_ENV ||
  import.meta.env.MODE ||
  'development'
).toLowerCase() as AppEnvironment

const normalizedEnv: AppEnvironment = ['development', 'staging', 'production', 'test'].includes(
  rawEnv,
)
  ? rawEnv
  : 'development'

const rawApiUrl = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3005/api/v1'

const normalizedApiV1Url = rawApiUrl.endsWith('/api/v1')
  ? rawApiUrl
  : `${rawApiUrl.replace(/\/+$/, '')}/api/v1`

export const envConfig: EnvConfig = {
  env: normalizedEnv,
  mode: import.meta.env.MODE || normalizedEnv,
  version:
    (import.meta.env.VITE_APP_VERSION as string) ||
    (import.meta.env.VITE_VERSION as string) ||
    '0.1.0',
  system: (import.meta.env.VITE_SYSTEM as string) || 'FINANCES',
  rawApiUrl,
  apiV1Url: normalizedApiV1Url,
  isDev: normalizedEnv === 'development',
  isStaging: normalizedEnv === 'staging',
  isProd: normalizedEnv === 'production',
  isTest: normalizedEnv === 'test',
}

export default envConfig
