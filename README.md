# Biblioteca Global de Resumos (PWA)

PWA completa inspirada no design fornecido, com fluxo de autenticação, navegação por abas, criação de resumos, perfil, notificações, comentários, downloads e configurações.

## Funcionalidades implementadas

- Login e registo local (dados persistidos em `localStorage`)
- Home com pesquisa e filtros por categoria
- Cards de resumos com ações de favoritar e download
- Publicação de novo resumo com modal e upload PDF simulado
- Perfil com estatísticas do utilizador e lista dos próprios resumos
- Ecrãs de Downloads, Notificações, Comentários e Configurações
- Instalação como app (PWA) via manifest + service worker
- Funcionamento offline para assets principais

## Estrutura

- `index.html`: shell da app e layouts dos ecrãs
- `styles.css`: tema visual mobile-first semelhante ao mockup
- `script.js`: estado, lógica, renderização de views e interações
- `manifest.webmanifest`: metadados PWA
- `sw.js`: cache offline
- `assets/icon.svg`: ícone da aplicação

## Execução

Basta servir a pasta com um servidor estático e abrir no browser.

Exemplo:

```bash
python -m http.server 8080
```

Depois abrir `http://localhost:8080`.
