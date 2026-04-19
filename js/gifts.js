const grid    = document.getElementById('gifts-grid');
const overlay = document.getElementById('pix-overlay');
const copyBtn = document.getElementById('pix-copy-btn');
const closeBtn = document.getElementById('pix-close-btn');

const PIX_CODE = '00020101021126500014br.gov.bcb.pix0128laurasilveirareyes@gmail.com5204000053039865802BR5913LAURA S REYES6008CURITIBA62070503***6304181C';

// ── Modal ─────────────────────────────────────────────────────────────────────

function openPix() {
    overlay.classList.remove('hidden');
}

function closePix() {
    overlay.classList.add('hidden');
    copyBtn.textContent = 'Copiar';
    copyBtn.classList.remove('copied');
}

// Fecha ao clicar no backdrop (fora do modal)
overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closePix();
});

closeBtn.addEventListener('click', closePix);

// Copiar código Pix
copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(PIX_CODE).then(() => {
        copyBtn.textContent = 'Copiado ✓';
        copyBtn.classList.add('copied');
        setTimeout(() => {
            copyBtn.textContent = 'Copiar';
            copyBtn.classList.remove('copied');
        }, 2500);
    });
});

// ── Lazy loading ──────────────────────────────────────────────────────────────

// IntersectionObserver: injeta o iframe quando o card entra no viewport.
// Uma vez carregado, o card permanece na memória (não desrenderiza ao sair).
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const gifDiv = entry.target;
        const id     = gifDiv.dataset.tenorId;
        const ratio  = gifDiv.dataset.aspectRatio;

        const iframe = document.createElement('iframe');
        iframe.src             = `https://tenor.com/embed/${id}`;
        iframe.allowFullscreen = true;

        gifDiv.appendChild(iframe);
        observer.unobserve(gifDiv);
    });
}, {
    rootMargin: '120px',
});

// ── Renderização dos cards ────────────────────────────────────────────────────

async function init() {
    let gifts;
    try {
        const res = await fetch('../../gifs/gifs.json');
        gifts = await res.json();
    } catch (err) {
        console.error('Erro ao carregar lista de presentes:', err);
        return;
    }

    gifts.forEach(gift => {
        const card = document.createElement('button');
        card.className = 'gift-card';
        card.type      = 'button';
        card.addEventListener('click', openPix);

        const title = document.createElement('p');
        title.className   = 'gift-title';
        title.textContent = gift.title;

        const gifDiv = document.createElement('div');
        gifDiv.className           = 'gift-gif';
        gifDiv.dataset.tenorId     = gift.tenor_id;
        gifDiv.dataset.aspectRatio = gift.aspect_ratio;

        const price = document.createElement('p');
        price.className   = 'gift-price';
        price.textContent = gift.price ?? 'R$0,00';

        card.appendChild(title);
        card.appendChild(gifDiv);
        card.appendChild(price);
        grid.appendChild(card);

        observer.observe(gifDiv);
    });
}

init();
