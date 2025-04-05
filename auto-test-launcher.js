/**
 * Script para abrir automaticamente o ambiente de teste de chamada de voz
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Verificando se deve abrir o ambiente de teste de chamada de voz...');
    
    // Verificar se o modo de teste automático está ativado
    const autoTest = localStorage.getItem('voiceCallAutoTest');
    
    if (autoTest === 'true') {
        console.log('Modo de teste automático ativado, abrindo ambiente de teste...');
        
        // Adicionar botão de teste no cabeçalho
        addTestButton();
        
        // Abrir ambiente de teste após 1 segundo
        setTimeout(() => {
            window.open('voice-call-test.html', '_blank');
        }, 1000);
    } else {
        console.log('Modo de teste automático desativado');
        
        // Adicionar botão de teste no cabeçalho de qualquer forma
        addTestButton();
    }
});

// Função para adicionar botão de teste no cabeçalho
function addTestButton() {
    // Verificar se o cabeçalho existe
    const header = document.querySelector('.chat-header') || document.querySelector('header');
    
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
}
