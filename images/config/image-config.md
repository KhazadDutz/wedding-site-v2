# Configuração de Imagens por Dispositivo

Referência obrigatória ao criar ou editar qualquer página do projeto.
Sempre verificar este arquivo antes de definir imagens e breakpoints.

---

## Breakpoints

| Dispositivo | Condição | Imagem a usar |
|---|---|---|
| Mobile portrait | `max-width: 480px` + `orientation: portrait` | versão `_mobile.png` |
| Tablet, landscape, desktop | acima de 480px ou landscape | versão padrão (landscape/quadrada) |

---

## HTML — Elemento `<picture>`

Usar sempre o elemento `<picture>` para alternar imagens entre dispositivos:

```html
<picture>
    <source media="(max-width: 480px) and (orientation: portrait)" srcset="../../images/[pasta]/[imagem]_mobile.png">
    <img id="[pagina]-image" src="../../images/[pasta]/[imagem].png" alt="[descrição]">
</picture>
```

---

## CSS — Configurações por dispositivo

### Desktop / Tablet / Landscape (padrão)
```css
#[pagina]-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    display: block;
}
```

### Mobile Portrait (≤ 480px)
```css
@media (max-width: 480px) and (orientation: portrait) {
    #[pagina]-image {
        object-fit: contain;
        object-position: center 85%;
    }
}
```

- `object-fit: contain` — imagem inteira visível, sem cortes
- `object-position: center 85%` — imagem posicionada na parte inferior da tela
- Áreas vazias ficam com a cor de fundo da página (`#050305`), imperceptíveis

---

## Nomenclatura de arquivos

| Versão | Sufixo | Exemplo |
|---|---|---|
| Desktop/padrão | sem sufixo | `moria.png` |
| Mobile portrait | `_mobile` | `moria_mobile.png` |

---

## Dimensões recomendadas

| Versão | Proporção | Resolução sugerida |
|---|---|---|
| Desktop | 16:9 ou 3:2 (landscape) | 1920×1080 ou 1440×960 |
| Mobile portrait | 2:3 (portrait) | 1024×1536 |

---

## Observações

- O fundo padrão do projeto é `#050305` — áreas sem imagem ficam praticamente invisíveis
- Sempre testar no Chrome DevTools (`Ctrl+Shift+M`) com iPhone (390px) portrait e landscape
- O easter egg da página menu tem posição ajustada para mobile — ao criar novas páginas com elementos clicáveis, revisar posicionamento no breakpoint mobile
