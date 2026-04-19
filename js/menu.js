// ===== MENU =====

const behindDoor    = document.getElementById('behind-door');
const easterEggBtn  = document.getElementById('easter-egg-btn');
const foolOverlay   = document.getElementById('fool-overlay');

// Ativa a entrada do menu ao carregar a página
window.addEventListener('DOMContentLoaded', () => {
    triggerMenuEntrance();
});

const GIF_DURATION  = 2500; // duração aproximada do GIF em ms
const TEXT_DURATION = 4000; // tempo que o texto fica visível após o GIF

const foolGif  = document.getElementById('fool-gif');
const foolText = document.getElementById('fool-text');
let foolTimeout = null;

// Easter egg: "Fool of a Took"
easterEggBtn.addEventListener('click', () => {
    if (!foolOverlay.classList.contains('hidden')) return; // já visível

    // fase 1: mostra GIF, esconde texto
    foolText.classList.add('hidden-phase');
    foolGif.classList.remove('hidden-phase');
    foolOverlay.classList.remove('hidden', 'fading-out');

    clearTimeout(foolTimeout);

    // fase 2: GIF termina → esconde GIF, mostra texto
    foolTimeout = setTimeout(() => {
        foolGif.classList.add('hidden-phase');
        setTimeout(() => {
            foolText.classList.remove('hidden-phase');
        }, 400); // aguarda fade-out do GIF
    }, GIF_DURATION);

    // fase 3: texto exibido → fade-out do overlay
    setTimeout(() => {
        foolOverlay.classList.add('fading-out');
        setTimeout(() => {
            foolOverlay.classList.add('hidden');
            foolOverlay.classList.remove('fading-out');
        }, 600);
    }, GIF_DURATION + 400 + TEXT_DURATION);
});

// Função chamada pelo opening.js quando a porta abre
function triggerMenuEntrance() {
    behindDoor.classList.add('menu-visible');
}
