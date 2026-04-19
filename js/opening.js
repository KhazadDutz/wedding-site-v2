// ===== CONFIGURAÇÕES DE TIMING (ms) =====
const TIMING = {
    runeGlowStart:  5000,   // início do brilho nas runas (junto com a frase)
    phraseDelay:    5000,   // frase começa a aparecer
    inputDelay:     11000,  // input aparece após a frase (6s depois)
    doorOpenDuration: 1800, // duração da animação da porta abrindo
    overlayFadeDelay: 1900, // fade-out do overlay após porta abrir
};

// Palavras válidas (case-insensitive)
const VALID_WORDS = ['amigo', 'mellon', 'friend'];

// ===== ELEMENTOS =====
const overlay        = document.getElementById('opening-overlay');
const doorContainer  = document.getElementById('door-container');
const phraseContainer = document.getElementById('phrase-container');
const inputContainer = document.getElementById('input-container');
const passwordInput  = document.getElementById('password-input');
const fakePlaceholder = document.getElementById('fake-placeholder');
const errorMessage   = document.getElementById('error-message');

// ===== SEQUÊNCIA DE ANIMAÇÃO =====
window.addEventListener('DOMContentLoaded', () => {

    // Ativa brilho das runas na imagem
    setTimeout(() => {
        doorContainer.classList.add('runes-glowing');
    }, TIMING.runeGlowStart);

    // Exibe a frase
    setTimeout(() => {
        phraseContainer.classList.add('visible');
    }, TIMING.phraseDelay);

    // Exibe o input e inicia ciclo do placeholder
    setTimeout(() => {
        inputContainer.classList.add('visible');
        // Em touch devices o focus programático não exibe o teclado no iOS
        // e abre inesperadamente no Android — o usuário toca para focar
        if (!('ontouchstart' in window)) {
            passwordInput.focus();
        }
        startPlaceholderCycle();
    }, TIMING.inputDelay);
});

// ===== PLACEHOLDER CICLANDO =====
const PLACEHOLDER_WORDS = ['amigo', 'friend', 'mellon'];
let placeholderIndex = 0;
let placeholderInterval = null;

function startPlaceholderCycle() {
    updatePlaceholder();
    placeholderInterval = setInterval(() => {
        if (passwordInput.value.length > 0) return; // não troca enquanto digita
        placeholderIndex = (placeholderIndex + 1) % PLACEHOLDER_WORDS.length;
        updatePlaceholder();
    }, 2000);
}

function updatePlaceholder() {
    const word = PLACEHOLDER_WORDS[placeholderIndex];
    fakePlaceholder.innerHTML = `<span class="placeholder-highlight">${word}</span>`;
    fakePlaceholder.style.animation = 'none';
    fakePlaceholder.offsetHeight; // reflow
    fakePlaceholder.style.animation = 'placeholderFade 0.4s ease';
}

// ===== INPUT: ocultar placeholder ao digitar =====
passwordInput.addEventListener('input', () => {
    fakePlaceholder.style.opacity = passwordInput.value.length > 0 ? '0' : '1';
    hideError();

    // Valida automaticamente assim que uma palavra válida é digitada
    const value = passwordInput.value.toLowerCase().trim();
    if (VALID_WORDS.includes(value)) {
        openDoor();
    }
});

// ===== INPUT: validar ao pressionar Enter =====
passwordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        validate();
    }
});

// ===== VALIDAÇÃO =====
function validate() {
    const value = passwordInput.value.toLowerCase().trim();

    if (VALID_WORDS.includes(value)) {
        openDoor();
    } else if (value.length > 0) {
        showError();
    }
}

// ===== ABRIR A PORTA =====
function openDoor() {
    passwordInput.disabled = true;
    inputContainer.style.transition = 'opacity 0.5s';
    inputContainer.style.opacity = '0';
    phraseContainer.style.transition = 'opacity 0.5s';
    phraseContainer.style.opacity = '0';

    // Ativa iluminação retangular (só ao abrir)
    overlay.classList.add('door-awakening');

    setTimeout(() => {
        doorContainer.classList.add('door-open');
    }, 600);

    // Após porta totalmente aberta, zoom de entrada pelo vão
    const doorFullyOpen = 600 + TIMING.doorOpenDuration + 200;
    setTimeout(() => {
        doorContainer.classList.add('door-enter');
    }, doorFullyOpen);

    // Redirect ao fim do zoom (900ms de animação)
    setTimeout(() => {
        window.location.href = 'routes/menu/';
    }, doorFullyOpen + 900);
}

// ===== MOSTRAR ERRO =====
function showError() {
    errorMessage.classList.add('visible');

    // Efeito de tremida no input
    passwordInput.classList.add('input-error');
    passwordInput.value = '';
    fakePlaceholder.style.opacity = '1';

    setTimeout(() => {
        passwordInput.classList.remove('input-error');
    }, 500);
}

function hideError() {
    errorMessage.classList.remove('visible');
}

// ===== RECONHECIMENTO DE VOZ =====
const micBtn = document.getElementById('mic-btn');
const SpeechAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechAPI) {
    // Browser não suporta — oculta o botão silenciosamente
    micBtn.style.display = 'none';
} else {
    const recognition = new SpeechAPI();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 8;

    let isListening = false;

    micBtn.addEventListener('click', () => {
        if (isListening) return;
        isListening = true;
        micBtn.classList.add('listening');
        hideError();
        recognition.start();
    });

    recognition.addEventListener('result', (e) => {
        const results = e.results[0];
        for (let i = 0; i < results.length; i++) {
            // Normaliza: minúsculas + remove acentos (méllon → mellon)
            const spoken = results[i].transcript
                .toLowerCase()
                .trim()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '');

            if (VALID_WORDS.includes(spoken)) {
                passwordInput.value = spoken;
                fakePlaceholder.style.opacity = '0';
                openDoor();
                return;
            }
        }
        // Nenhuma alternativa reconhecida como palavra válida
        showError();
    });

    recognition.addEventListener('end', () => {
        isListening = false;
        micBtn.classList.remove('listening');
    });

    recognition.addEventListener('error', (e) => {
        isListening = false;
        micBtn.classList.remove('listening');
        if (e.error !== 'aborted' && e.error !== 'no-speech') showError();
    });
}
