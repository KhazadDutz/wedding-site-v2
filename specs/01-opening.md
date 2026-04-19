# Página 1 — Opening (Abertura do Convite)
endpoint - https://khazaddutz.github.io/wedding-site/
arquivo - `index.html`

## Descrição
Tela de abertura inspirada nas Portas de Durin do Senhor dos Anéis. O usuário precisa digitar a palavra certa para "abrir" as portas e acessar o convite.

A imagem `images/opening/door_of_durin.png` inicia em tons de cinza. Após ~5 segundos as runas acendem proceduralmente via CSS (brilho dourado/azul). Em seguida a frase aparece abaixo da porta. Depois de mais ~6 segundos o input aparece.

Ao digitar a palavra correta, a porta abre com animação, o overlay faz fade-out e o browser é redirecionado para `/routes/menu/`.

## Layout
- Fullscreen, fundo escuro `#070508` com gradiente radial (tons roxo-escuro/preto)
- Porta centralizada verticalmente na tela
- Frase logo abaixo da porta (mesma largura)
- Input logo abaixo da frase (mesma largura)
- Todos os elementos ocupam espaço desde o início (sem layout shift)

## Elementos

### Imagem da Porta
- Arquivo: `images/opening/door_of_durin.png`
- Dividida em duas metades (`#door-left`, `#door-right`) via CSS `background-size: 200%`
- Inicia em `grayscale(100%) brightness(0.75)`
- Ao acender runas: `grayscale(20%) brightness(1)`
- Ao abrir: `grayscale(0%) brightness(1.1)` + `drop-shadow` azul
- Dimensões responsivas: `width: min(72vw, 460px)`, `aspect-ratio: 3/4`, `max-height: 62vh`

### Efeitos de Runa (dentro do `#door-container`)
- `#rune-glow-overlay`: radial gradient azul pulsando (`runeGlowPulse`)
- `#rune-streaks`: dois raios de luz verticais se movendo (`streakMove`)
- Ambos ativados pela classe `.door-awakening` no container
- Ambos desaparecem imediatamente quando `.door-open` é adicionado

### Frase
- Texto: `"As Portas de Durin, Senhor de Moria. Fale, amigo, e entre."`
- A palavra **amigo** tem destaque azul (`.phrase-highlight`)
- Animação de brilho da esquerda para a direita (`phraseRevealLTR`, 10s loop)
- Aparece `opacity: 0; visibility: hidden` → classe `.visible` revela
- Mesma largura que a porta

### Input
- Placeholder falso (`#fake-placeholder`) cicla entre: `amigo`, `friend`, `mellon` (a cada 2s)
- Somente a palavra em destaque azul, sem texto "escreva"
- Placeholder desaparece ao digitar
- Palavras válidas (case-insensitive): `amigo`, `mellon`, `friend`
- Validação automática ao digitar (sem precisar de Enter)
- Enter também valida

### Mensagem de Erro
- Texto: `"Esta não é a palavra certa. A porta permanece fechada."`
- Usa `visibility: hidden` + `min-height: 2.4em` para reservar espaço e evitar layout shift
- Aparece com animação + shake no input

## Animações / Efeitos

### Sequência de timing (ms)
| Evento | Delay |
|---|---|
| Runas acendem | 5000ms |
| Frase aparece | 5000ms (simultâneo) |
| Input aparece | 11000ms |
| Porta abre (animação) | 1800ms |
| Fade-out do overlay | 1900ms após porta abrir |

### Abertura da Porta
1. Input e frase fazem fade-out (0.5s)
2. Classe `door-awakening` ativa brilho retangular azul intenso
3. Após 600ms: classe `door-open` → metades giram 3D (`perspective rotateY ±105deg`)
4. Fade-out do overlay e `window.location.href = 'menu/'` simultâneos

## Navegação
- Senha correta → porta abre → fade-out + redirect para `/routes/menu/`
- Senha errada → mensagem de erro + shake, input limpo

## Estrutura de arquivos
- `index.html` — HTML da página
- `css/opening.css` — estilos
- `js/opening.js` — lógica e timing
- `images/opening/door_of_durin.png` — imagem da porta

## Status
**Concluído.** Pendente de commit/push.

## Observações
- Imagens do LOTR podem ter restrições de copyright — considerar tornar o repositório privado
- Roteamento sem `.html` funciona via estrutura de pastas (`pasta/index.html`) — não usar libs de roteamento
