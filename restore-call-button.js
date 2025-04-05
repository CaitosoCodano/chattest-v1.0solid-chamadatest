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

        // Abordagem simplificada: adicionar o botão diretamente ao cabeçalho
        // Criar um container para o botão de chamada
        const callButtonContainer = document.createElement('div');
        callButtonContainer.className = 'call-button-container';
        callButtonContainer.style.position = 'absolute';
        callButtonContainer.style.right = '50px'; // Posicionar à direita, com espaço para o menu
        callButtonContainer.style.top = '50%';
        callButtonContainer.style.transform = 'translateY(-50%)';
        callButtonContainer.style.zIndex = '99'; // Garantir que fique acima de outros elementos

        // Adicionar o container ao cabeçalho
        chatHeader.appendChild(callButtonContainer);

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
        callButton.style.padding = '8px';
        callButton.style.color = '#1877f2';
        callButton.style.borderRadius = '50%';
        callButton.style.width = '36px';
        callButton.style.height = '36px';
        callButton.style.display = 'flex';
        callButton.style.alignItems = 'center';
        callButton.style.justifyContent = 'center';
        callButton.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';

        // Adicionar efeito hover
        callButton.onmouseover = function() {
            this.style.backgroundColor = 'rgba(24, 119, 242, 0.1)';
        };
        callButton.onmouseout = function() {
            this.style.backgroundColor = 'transparent';
        };

        // Adicionar evento de clique
        callButton.addEventListener('click', function() {
            console.log('Botão de chamada clicado');
            if (window.startCall && typeof window.startCall === 'function') {
                console.log('Usando função startCall global');
                window.startCall();
            } else if (window.webrtcCall && typeof window.webrtcCall.startCall === 'function') {
                console.log('Usando função webrtcCall.startCall');
                // Inicializar WebRTC se necessário
                if (typeof window.webrtcCall.initialize === 'function') {
                    window.webrtcCall.initialize();
                }

                // Iniciar chamada
                if (window.currentChatUser) {
                    console.log('Iniciando chamada para', window.currentChatUser.username);
                    window.webrtcCall.startCall(window.currentChatUser._id, window.currentChatUser.username);
                } else {
                    alert('Selecione um contato para iniciar uma chamada');
                }
            } else {
                console.error('Função de chamada não disponível');
                alert('Função de chamada não disponível');
            }
        });

        // Adicionar botão ao container
        callButtonContainer.appendChild(callButton);

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
