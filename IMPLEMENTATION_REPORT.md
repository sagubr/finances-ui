# Relatório de implementação da interface

Data: 2 de novembro de 2026

## Resultado

A UI financeira está conectada aos contratos públicos da API nas ondas 0–6. A estrutura aplicada em todos os domínios é:

```text
route fina → page → componente/formulário → query/mutation
→ API do módulo → apiClient central → API
```

Foram implementados os fluxos de sessão/workspace, transações, importação, planejamento, relatórios, investimentos, patrimônio, organização, privacidade e leitura de plano/uso. Estado remoto fica no TanStack Query; formulários ficam no TanStack Form; cálculos canônicos não são duplicados no browser.

## Decisões relevantes

- O catálogo de instrumentos tem cache global; dados financeiros têm cache por workspace.
- Importação usa polling apenas durante processamento e mostra as linhas normalizadas sem renderizar conteúdo como HTML.
- Operações de criação recebem idempotency key; operações versionadas enviam a versão conhecida.
- Billing é informativo. Checkout e portal não foram inventados enquanto os providers não estão publicados.
- Payroll e administração não ganharam telas falsas porque não possuem contratos públicos seguros.
- Nenhuma migration foi criada. A UI não conhece Drizzle nem PostgreSQL diretamente.

## Problemas encontrados

- a cópia inicial tinha cliente Axios e estado de sessão duplicados;
- CSRF, request ID e workspace não estavam centralizados;
- URL local apontava para a porta incorreta;
- troca de workspace dependia de sincronização por effect;
- a árvore copiada contém componentes analíticos que não pertencem ao produto financeiro;
- algumas specs descrevem experiências além dos contratos atuais, como preferências push, administração e integrações externas.

O legado não utilizado segue fora das rotas e do lint ativo; a remoção física fica para depois da validação visual, evitando apagar primitives ainda reutilizadas.

## Validação

Typecheck, lint, testes, formatação e build/PWA compõem o gate final. O detalhamento de escopo e os próximos testes com banco real estão em [`.specs/40-frontend-implementation-audit.md`](.specs/40-frontend-implementation-audit.md).
