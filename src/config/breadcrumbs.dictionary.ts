/**
 * Dicionário de tradução dos segmentos de rota para os Breadcrumbs (pt-BR).
 *
 * Mapeia cada slug/segmento de URL para seu nome amigável em português,
 * permitindo expansão centralizada para novas rotas e módulos do sistema.
 */
export const BREADCRUMB_DICTIONARY: Record<string, string> = {
  // Rotas Principais
  '': 'Início',
  home: 'Início',
  transactions: 'Transações',
  imports: 'Importação',
  privacy: 'Privacidade e dados',
  billing: 'Plano e uso',
  wealth: 'Patrimônio',
  planning: 'Planejamento',
  explore: 'Explorar',
  views: 'Pipelines de dados',
  questions: 'Pipelines de dados',
  dashboards: 'Dashboards',
  collections: 'Coleções',
  catalog: 'Catálogo',
  operations: 'Operações',
  materializations: 'Materializações',
  'financial-structure': 'Estrutura financeira',
  accounts: 'Contas',
  categories: 'Categorias',
  organization: 'Objetivos',
  goals: 'Metas',
  wishlist: 'Lista de desejos',
  activities: 'Atividades',
  notifications: 'Notificações',
  positions: 'Posições',
  'investment-accounts': 'Contas de investimento',
  assets: 'Bens',
  budgets: 'Orçamentos',
  recurring: 'Recorrências',
  installments: 'Parcelamentos',
  cards: 'Cartões',

  // Negócio / Datamart
  business: 'Negócio',
  datamart: 'Datamart',
  countries: 'Países',
  states: 'Estados',
  'managerial-regions': 'Regiões Gerenciais',
  'business-units': 'Unidades de Negócio',
  'sales-rooms': 'Salas de Vendas',
  'owner-divisions': 'Divisões de Proprietário',
  'commercial-managers': 'Gerentes Comerciais',
  'manager-roles': 'Tipos de Atuação',
  networks: 'Redes Comerciais',
  'network-types': 'Tipos de Rede',

  // Configurações & Administração
  settings: 'Configurações',
  admin: 'Administração',
  users: 'Usuários',
  members: 'Membros',
  groups: 'Grupos',
  'data-sources': 'Fontes de Dados',
  permissions: 'Permissões',
  security: 'Segurança',

  // Relatórios & Processos
  reports: 'Relatórios',
  comparison: 'Comparativo mensal',
  forecast: 'Fluxo previsto',
  exports: 'Exportações',
  login: 'Entrar',
  register: 'Criar conta',
  'confirm-email': 'Confirmar e-mail',
  'resend-confirmation': 'Reenviar confirmação',
  scheduled: 'Agendados',
  export: 'Exportar',
  forms: 'Formulários',
  templates: 'Modelos',
  processes: 'Processos em Execução',
  'data-library': 'Biblioteca de Dados',
  'form-builder': 'Modelos',
  integrations: 'Integrações',
  preview: 'Visualizar',
  table: 'Tabela',
  example: 'Exemplos',
}

/**
 * Converte um slug/segmento de rota para o label formatado em português.
 * Caso não esteja no dicionário, converte kebab-case em Capitalized Words.
 */
export function getBreadcrumbLabel(segment: string): string {
  const normalized = segment.trim().toLowerCase()
  if (/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(normalized)) return 'Detalhes'
  if (BREADCRUMB_DICTIONARY[normalized]) {
    return BREADCRUMB_DICTIONARY[normalized]
  }

  // Fallback inteligente: kebab-case ou snake_case -> Palavras Capitalizadas
  return normalized
    .split(/[-_]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
