/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  /** Nome ou identificador do ambiente: 'development' | 'staging' | 'production' | 'test' */
  readonly VITE_APP_ENV?: string
  /** Versão da aplicação injetada ou configurada */
  readonly VITE_APP_VERSION?: string
  readonly VITE_VERSION?: string
  /** Nome do sistema analítico para headers de telemetria */
  readonly VITE_SYSTEM?: string
  /** URL base do backend de API (ex: http://localhost:3009/api/v1) */
  readonly VITE_API_URL?: string
  /** MapLibre style URL used by the optional satellite mode. */
  readonly VITE_MAP_STYLE_SATELLITE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
