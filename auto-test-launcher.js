/**
 * Script para abrir automaticamente o ambiente de teste de chamada de voz
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Verificando se deve abrir o ambiente de teste de chamada de voz...');

    // Verificar se estamos na página de chat (não na página de login)
    // Verificamos se elementos específicos da página de chat estão presentes
    const isChatPage = document.getElementById('chatContainer') ||
                      document.getElementById('sidebar') ||
                      document.querySelector('.chat-container') ||
                      document.querySelector('.sidebar');

    if (!isChatPage) {
        console.log('Não estamos na página de chat, não inicializando o ambiente de teste');
        return;
    }

    console.log('Página de chat detectada, verificando modo de teste...');

    // Verificar se o modo de teste automático está ativado
    const autoTest = localStorage.getItem('voiceCallAutoTest');

    // Adicionar botão de teste no cabeçalho de qualquer forma
    addTestButton();

    if (autoTest === 'true') {
        console.log('Modo de teste automático ativado, abrindo ambiente de teste...');

        // Abrir ambiente de teste após 2 segundos
        // Aumentamos o tempo para garantir que a página de chat esteja completamente carregada
        setTimeout(() => {
            window.open('voice-call-test.html', '_blank');
        }, 2000);
    } else {
        console.log('Modo de teste automático desativado');
    }
});

// Função para adicionar botão de teste no cabeçalho
function addTestButton() {
    // Verificar se estamos na página de chat
    const isChatPage = document.getElementById('chatContainer') ||
                      document.getElementById('sidebar') ||
                      document.querySelector('.chat-container') ||
                      document.querySelector('.sidebar');

    if (!isChatPage) {
        console.log('Não estamos na página de chat, não adicionando botão de teste');
        return;
    }

    // Verificar se o cabeçalho existe
    const header = document.querySelector('.chat-header') ||
                  document.querySelector('header') ||
                  document.getElementById('chatHeader');

    if (!header) {
        console.log('Cabeçalho não encontrado, tentando novamente em 1 segundo...');
        setTimeout(addTestButton, 1000);
        return;
    }

    // Verificar se o botão já existe
    if (document.getElementById('voiceCallTestButton')) {
        return;
    }

    // Criar botão de teste
    const testButton = document.createElement('button');
    testButton.id = 'voiceCallTestButton';
    testButton.innerHTML = '<i class="fas fa-vial"></i> Teste de Chamada';
    testButton.title = 'Abrir ambiente de teste de chamada de voz';
    testButton.style.background = 'none';
    testButton.style.border = 'none';
    testButton.style.color = '#1877f2';
    testButton.style.cursor = 'pointer';
    testButton.style.padding = '5px 10px';
    testButton.style.marginLeft = '10px';
    testButton.style.fontSize = '14px';

    // Adicionar evento de clique
    testButton.addEventListener('click', function() {
        window.open('voice-call-test.html', '_blank');
    });

    // Adicionar botão ao cabeçalho
    header.appendChild(testButton);

    console.log('Botão de teste adicionado ao cabeçalho');

    // Adicionar também um link no menu lateral, se existir
    const sidebar = document.getElementById('sidebar') || document.querySelector('.sidebar');
    if (sidebar) {
        // Verificar se o link já existe
        if (document.getElementById('voiceCallTestLink')) {
            return;
        }

        // Criar link de teste
        const testLink = document.createElement('div');
        testLink.id = 'voiceCallTestLink';
        testLink.className = 'sidebar-item';
        testLink.innerHTML = '<i class="fas fa-vial"></i> Teste de Chamada';
        testLink.title = 'Abrir ambiente de teste de chamada de voz';
        testLink.style.padding = '10px';
        testLink.style.cursor = 'pointer';
        testLink.style.borderBottom = '1px solid #eee';

        // Adicionar evento de clique
        testLink.addEventListener('click', function() {
            window.open('voice-call-test.html', '_blank');
        });

        // Adicionar link ao menu lateral
        sidebar.appendChild(testLink);

        console.log('Link de teste adicionado ao menu lateral');
    }
}
