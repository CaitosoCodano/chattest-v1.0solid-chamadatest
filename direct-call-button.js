/**
 * Implementação direta do botão de chamada para garantir que ele apareça
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando botão de chamada direto');
    
    // Criar botão de chamada
    const callButton = document.createElement('button');
    callButton.id = 'directCallButton';
    callButton.innerHTML = '<i class="fas fa-phone"></i> Chamar';
    callButton.style.backgroundColor = '#4CAF50';
    callButton.style.color = 'white';
    callButton.style.border = 'none';
    callButton.style.borderRadius = '5px';
    callButton.style.padding = '8px 12px';
    callButton.style.cursor = 'pointer';
    callButton.style.marginLeft = '10px';
    callButton.style.fontWeight = 'bold';
    callButton.style.display = 'none';
    
    // Adicionar botão ao corpo do documento
    document.body.appendChild(callButton);
    
    // Função para posicionar o botão no cabeçalho do chat
    function positionCallButton() {
        const chatHeader = document.getElementById('chatHeader');
        const activeChat = document.getElementById('activeChat');
        
        if (chatHeader && window.currentChatUser && activeChat && 
            window.getComputedStyle(activeChat).display !== 'none') {
            
            // Posicionar o botão no cabeçalho
            const headerRect = chatHeader.getBoundingClientRect();
            callButton.style.position = 'fixed';
            callButton.style.top = (headerRect.top + headerRect.height/2 - 20) + 'px';
            callButton.style.right = '20px';
            callButton.style.zIndex = '1000';
            callButton.style.display = 'block';
        } else {
            callButton.style.display = 'none';
        }
    }
    
    // Verificar periodicamente a posição do botão
    setInterval(positionCallButton, 500);
    
    // Também verificar quando o chat é iniciado
    document.addEventListener('chatStarted', function() {
        setTimeout(positionCallButton, 100);
        setTimeout(positionCallButton, 500);
    });
    
    // Adicionar evento de clique para iniciar chamada
    callButton.addEventListener('click', function() {
        if (window.startCall && typeof window.startCall === 'function') {
            window.startCall();
        } else {
            alert('Função de chamada não disponível');
        }
    });
    
    // Expor a função startCall globalmente
    window.startCall = function() {
        if (!window.currentChatUser) {
            alert('Selecione um contato para iniciar uma chamada');
            return;
        }
        
        alert(`Iniciando chamada para ${window.currentChatUser.username}...`);
        console.log(`Chamada iniciada para ${window.currentChatUser.username}`);
        
        // Aqui seria a integração com o WebRTC
        if (window.socket) {
            window.socket.emit('callUser', {
                targetUserId: window.currentChatUser._id,
                callerName: window.userInfo.username
            });
        }
    };
});
