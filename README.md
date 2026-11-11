# Finances UI

SPA/PWA em React 19, Vite 8 e TanStack, sanitizada a partir da `_reference/ui`.

## Estrutura

- `src/api`: cliente HTTP e contratos de fronteira;
- `src/components`: shell e componentes compartilhados;
- `src/components/ui`: primitives do design system;
- `src/contexts`: providers globais estritamente necessários;
- `src/integrations`: integração de bibliotecas externas;
- `src/modules`: boundaries funcionais por módulo financeiro;
- `src/routes`: composição de rotas, sem regra de negócio.

Os packages analíticos da referência não fazem parte deste projeto. Componentes financeiros devem ser decompostos por boundary e usar TanStack Query/Form em vez de concentrar estado em páginas.

## Comandos

```bash
npm run dev
npm run typecheck
npm test
npm run build
```

## Deploy pelo GitHub Actions

O workflow [`deploy-ui.yml`](.github/workflows/deploy-ui.yml) gera o `.env.production` com
`SpicyPizza/create-envfile`, executa o build de produção e envia o conteúdo de `dist` para
`/opt/nummo/ui`.

Configure como **Variables**:

- `UI_VITE_API_URL`;
- `UI_VITE_SYSTEM`;
- `UI_VITE_MAP_STYLE_SATELLITE_URL` (opcional);
- `VPS_SSH_PORT` (opcional, padrão `22`);
- `VPS_UI_PATH` (opcional, padrão `/opt/nummo/ui`).

O workflow usa também os **Secrets** compartilhados `VPS_HOST`, `VPS_USERNAME` e `VPS_SSH_KEY`.
