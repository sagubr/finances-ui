# Nummo - Identidade visual

**Conceito:** uma moeda (*nummus*) com um sulco em espiral que cresce do centro para fora, como uma concha. A espiral e a forma dos juros compostos (crescimento paciente) e tambem um simbolo de calma. O contorno continua sendo uma moeda inteira. No wordmark, o "o" final e a mesma espiral em dourado.

## Cores
| Uso | Claro | Escuro |
|---|---|---|
| Fundo | `#1E7B50` | `#08170F` |
| Moeda | `#F5C84F` | `#F5C84F` |

## Arquivos
- `favicon.svg` - adaptativo (troca de cor sozinho no modo escuro)
- `favicon.ico`, `favicon-16x16/32x32/48x48.png`
- `icon-{16..1024}.png` e `icon-{...}-dark.png`
- `apple-touch-icon(.png|-dark.png)` - quadrado sem cantos (o iOS aplica a mascara)
- `maskable-icon-192/512(-dark).png` - sem cantos, simbolo na zona segura
- `mstile-150(.png|-dark.png)`, `browserconfig.xml`
- `safari-pinned-tab.svg` - monocromatico
- `logo-light.svg` (fundos claros) / `logo-dark.svg` (fundos escuros)
- `site.webmanifest` é gerado pelo `vite-plugin-pwa`; `.htaccess` permanece em `public/`

## `<head>`
```html
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="mask-icon" href="/safari-pinned-tab.svg" color="#1E7B50">
<!-- O vite-plugin-pwa injeta o link para /site.webmanifest no build. -->
<meta name="theme-color" content="#1E7B50" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#08170F" media="(prefers-color-scheme: dark)">
<meta name="msapplication-config" content="/browserconfig.xml">
```
