/**
 * Script para restaurar o botão de chamada
 * Este script garante que o botão de chamada seja exibido corretamente
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando restauração do botão de chamada');
    
    // Função para adicionar o botão de chamada
    function addCallButton() {
        // Verificar se o cabeçalho existe
        const chatHeader = document.getElementById('chatHeader');
        if (!chatHeader) {
            console.log('Cabeçalho do chat não encontrado, tentando novamente em 500ms');
            setTimeout(addCallButton, 500);
            return;
        }
        
        // Verificar se já existe um botão de chamada
        if (document.getElementById('headerCallButton')) {
            console.log('Botão de chamada já existe');
            return;
        }
        
        console.log('Adicionando botão de chamada ao cabeçalho');
        
        // Verificar se já existe um container de menu
        let menuContainer = chatHeader.querySelector('.chat-header-menu');
        
        // Se não existir, criar um
        if (!menuContainer) {
            menuContainer = document.createElement('div');
            menuContainer.className = 'chat-header-menu';
            menuContainer.style.display = 'flex';
            menuContainer.style.alignItems = 'center';
            menuContainer.style.marginLeft = 'auto';
            chatHeader.appendChild(menuContainer);
        }
        
        // Criar botão de chamada
        const callButton = document.createElement('button');
        callButton.id = 'headerCallButton';
        callButton.innerHTML = '<i class="fas fa-phone"></i>';
        callButton.title = 'Iniciar chamada de voz';
        callButton.className = 'header-button';
        callButton.style.background = 'none';
        callButton.style.border = 'none';
        callButton.style.fontSize = '18px';
        callButton.style.cursor = 'pointer';
        callButton.style.padding = '5px 10px';
        callButton.style.color = '#1877f2';
        
        // Adicionar evento de clique
        callButton.addEventListener('click', function() {
            if (window.startCall && typeof window.startCall === 'function') {
                window.startCall();
            } else if (window.webrtcCall && typeof window.webrtcCall.startCall === 'function') {
                // Inicializar WebRTC se necessário
                if (typeof window.webrtcCall.initialize === 'function') {
                    window.webrtcCall.initialize();
                }
                
                // Iniciar chamada
                if (window.currentChatUser) {
                    window.webrtcCall.startCall(window.currentChatUser._id, window.currentChatUser.username);
                } else {
                    alert('Selecione um contato para iniciar uma chamada');
                }
            } else {
                alert('Função de chamada não disponível');
            }
        });
        
        // Adicionar botão ao cabeçalho
        menuContainer.insertBefore(callButton, menuContainer.firstChild);
        
        console.log('Botão de chamada adicionado com sucesso');
    }
    
    // Adicionar o botão de chamada
    addCallButton();
    
    // Verificar periodicamente se o botão de chamada existe
    setInterval(function() {
        if (!document.getElementById('headerCallButton') && document.getElementById('chatHeader')) {
            console.log('Botão de chamada não encontrado, adicionando novamente');
            addCallButton();
        }
    }, 2000);
    
    // Observar mudanças no DOM para detectar quando o chat é aberto
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' || mutation.type === 'attributes') {
                const chatHeader = document.getElementById('chatHeader');
                if (chatHeader && !document.getElementById('headerCallButton')) {
                    console.log('Cabeçalho do chat detectado, adicionando botão de chamada');
                    addCallButton();
                }
            }
        });
    });
    
    // Configurar o observador
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
    });
    
    // Adicionar o botão quando o chat é iniciado
    document.addEventListener('chatStarted', function() {
        console.log('Evento chatStarted detectado');
        setTimeout(addCallButton, 100);
        setTimeout(addCallButton, 500);
    });
});
