# Página 4 — Presentes (Lista de Presentes)

## Descrição
Página com a lista de presentes desejados pelos noivos.
Cada presente é representado por um card (título + GIF) que funciona como link para o QR Code da conta bancária dos noivos.

## Fonte de dados
- Arquivo: `gifs/gifs.json`
- Cada entrada contém: `title`, `tenor_id`, `aspect_ratio`
- Os cards são renderizados dinamicamente via JavaScript

## Layout

### Desktop (≥ 481px)
- Grade de 4 cards por linha
- Cards com largura igual, alinhados em grid

### Mobile (≤ 480px)
- Grade de 2 cards por linha

### Cada card
- Título do presente (texto, acima do GIF)
- GIF do Tenor (embed via `tenor_id` + `aspect_ratio`)
- O card inteiro é clicável (link `<a>`)
- Ao clicar, abre o QR Code da conta bancária dos noivos

## Navegação
- Botão "Voltar ao menu" fixo no canto superior direito (mesmo padrão das outras páginas)
- Voltar → `/menu`

## Pendências antes de implementar
- [ ] URL/imagem do QR Code da conta bancária (para o link de cada card)
- [ ] Preencher títulos e GIFs no `gifs/gifs.json` (~20 presentes)

## Performance — Lazy Loading
- Cada card usa um placeholder vazio até entrar no viewport
- Ao entrar na tela (IntersectionObserver), o embed Tenor é injetado no card
- Uma vez renderizado, o card permanece na memória (não desrenderiza ao sair)
- Desrenderizar ao sair foi descartado: causa flickering e delay ao rolar de volta, e o ganho de memória com ~20 cards é desprezível

## Observações
- O script do Tenor (`https://tenor.com/embed.js`) deve ser carregado uma única vez na página
- Estilo visual dark/gold consistente com o restante do site
