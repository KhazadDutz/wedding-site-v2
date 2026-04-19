// =====================================================
//  CONFIGURAÇÃO — Atualize com a URL do Apps Script
// =====================================================
//
//  O script deve escrever na aba "Mensagens" da planilha.
//  Colunas: A = mensagem, B = nome.
//
//  Exemplo de função doGet:
//
//     function doGet(e) {
//       var sheet = SpreadsheetApp
//         .getActiveSpreadsheet()
//         .getSheetByName('Mensagens');
//       var msg  = e.parameter.message || '';
//       var name = e.parameter.name    || '';
//       if (msg) sheet.appendRow([msg, name]);
//       return ContentService
//         .createTextOutput(JSON.stringify({ status: 'ok' }))
//         .setMimeType(ContentService.MimeType.JSON);
//     }
//
//  Publique como Web App:
//    Implantações → Nova implantação → Tipo: App da Web
//    → Executar como: Eu mesmo → Quem tem acesso: Qualquer pessoa
//
//  Cole a URL gerada abaixo.
//
const MESSAGES_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzo0A9mqK8OiHEXRBpU2_4rD9KNZ4fYyr7rf3iErojItC7PQhKou5hRI4H128WUicSr/exec';
// =====================================================

const messageInput = document.getElementById('message-input');
const nameInput    = document.getElementById('name-input');
const sendBtn      = document.getElementById('send-btn');
const successMsg   = document.getElementById('success-msg');

// Bloqueia submissão nativa do form (evita navegação ao pressionar Enter)
document.getElementById('messages-form').addEventListener('submit', (e) => {
    e.preventDefault();
});

// Enter no campo de nome dispara envio
nameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        sendBtn.click();
    }
});

sendBtn.addEventListener('click', async () => {
    const message = messageInput.value.trim();
    const name    = nameInput.value.trim();

    if (!message) { messageInput.focus(); return; }
    if (!name)    { nameInput.focus();    return; }

    sendBtn.disabled = true;

    try {
        const url = `${MESSAGES_ENDPOINT}?message=${encodeURIComponent(message)}&name=${encodeURIComponent(name)}`;
        // fetch sem no-cors: o Apps Script processa e grava antes de responder.
        // O erro de CORS na resposta é esperado e ignorado — os dados chegam ao Sheets.
        await fetch(url);
    } catch (_) {
        // CORS error esperado — dados já foram gravados no Sheets
    }

    messageInput.style.display = 'none';
    nameInput.style.display    = 'none';
    sendBtn.style.display      = 'none';
    successMsg.classList.remove('hidden');

    setTimeout(() => { window.location.href = '../menu'; }, 2000);
});
