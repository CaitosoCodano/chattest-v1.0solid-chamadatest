/**
 * Sistema de compartilhamento de tela
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando sistema de compartilhamento de tela');
    
    // Variáveis para compartilhamento de tela
    let screenStream = null;
    let isSharing = false;
    
    // Criar botão de compartilhamento de tela
    const screenShareButton = document.createElement('button');
    screenShareButton.id = 'screenShareButton';
    screenShareButton.innerHTML = '📺';
    screenShareButton.title = 'Compartilhar tela';
    screenShareButton.style.backgroundColor = '#2196f3';
    screenShareButton.style.color = 'white';
    screenShareButton.style.border = 'none';
    screenShareButton.style.borderRadius = '50%';
    screenShareButton.style.width = '40px';
    screenShareButton.style.height = '40px';
    screenShareButton.style.fontSize = '20px';
    screenShareButton.style.cursor = 'pointer';
    screenShareButton.style.position = 'fixed';
    screenShareButton.style.bottom = '20px';
    screenShareButton.style.right = '20px';
    screenShareButton.style.zIndex = '1000';
    screenShareButton.style.display = 'none';
    screenShareButton.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.3)';
    
    // Adicionar botão ao corpo do documento
    document.body.appendChild(screenShareButton);
    
    // Criar container para o compartilhamento de tela
    const screenShareContainer = document.createElement('div');
    screenShareContainer.id = 'screenShareContainer';
    screenShareContainer.style.position = 'fixed';
    screenShareContainer.style.top = '0';
    screenShareContainer.style.left = '0';
    screenShareContainer.style.width = '100%';
    screenShareContainer.style.height = '100%';
    screenShareContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
    screenShareContainer.style.zIndex = '2000';
    screenShareContainer.style.display = 'none';
    screenShareContainer.style.flexDirection = 'column';
    screenShareContainer.style.alignItems = 'center';
    screenShareContainer.style.justifyContent = 'center';
    
    // Adicionar elementos ao container
    screenShareContainer.innerHTML = `
        <div style="position: absolute; top: 10px; right: 10px;">
            <button id="stopScreenShareButton" style="background-color: #f44336; color: white; border: none; border-radius: 5px; padding: 8px 15px; cursor: pointer;">
                Parar compartilhamento
            </button>
        </div>
        <div style="width: 90%; height: 80%; background-color: black; border-radius: 5px; overflow: hidden;">
            <video id="screenShareVideo" style="width: 100%; height: 100%; object-fit: contain;" autoplay></video>
        </div>
        <div style="margin-top: 20px; color: white; font-weight: bold;">
            Compartilhando tela com <span id="screenShareRecipient">usuário</span>
        </div>
    `;
    
    // Adicionar container ao corpo do documento
    document.body.appendChild(screenShareContainer);
    
    // Adicionar evento de clique para iniciar compartilhamento
    screenShareButton.addEventListener('click', function() {
        if (isSharing) {
            stopScreenSharing();
        } else {
            startScreenSharing();
        }
    });
    
    // Adicionar evento de clique para parar compartilhamento
    document.getElementById('stopScreenShareButton').addEventListener('click', function() {
        stopScreenSharing();
    });
    
    // Função para iniciar compartilhamento de tela
    async function startScreenSharing() {
        if (!window.currentChatUser) {
            showNotification('Selecione um contato para compartilhar a tela.');
            return;
        }
        
        try {
            // Verificar se o navegador suporta compartilhamento de tela
            if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
                showNotification('Seu navegador não suporta compartilhamento de tela.');
                return;
            }
            
            // Solicitar permissão para compartilhar a tela
            screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    cursor: 'always'
                },
                audio: false
            });
            
            // Mostrar a tela compartilhada
            const video = document.getElementById('screenShareVideo');
            video.srcObject = screenStream;
            
            // Atualizar interface
            isSharing = true;
            screenShareButton.style.backgroundColor = '#f44336';
            screenShareButton.title = 'Parar compartilhamento';
            
            // Mostrar container de compartilhamento
            screenShareContainer.style.display = 'flex';
            
            // Atualizar nome do destinatário
            document.getElementById('screenShareRecipient').textContent = window.currentChatUser.username;
            
            // Configurar evento para quando o compartilhamento terminar
            screenStream.getVideoTracks()[0].onended = function() {
                stopScreenSharing();
            };
            
            // Enviar notificação para o destinatário (se implementado)
            if (window.socket) {
                window.socket.emit('screenShareStarted', {
                    receiverId: window.currentChatUser._id
                });
            }
            
            showNotification(`Compartilhando tela com ${window.currentChatUser.username}.`);
        } catch (error) {
            console.error('Erro ao compartilhar tela:', error);
            showNotification('Não foi possível compartilhar a tela. Verifique as permissões do navegador.');
        }
    }
    
    // Função para parar compartilhamento de tela
    function stopScreenSharing() {
        if (screenStream) {
            // Parar todas as faixas de vídeo
            screenStream.getTracks().forEach(track => track.stop());
            screenStream = null;
            
            // Atualizar interface
            isSharing = false;
            screenShareButton.style.backgroundColor = '#2196f3';
            screenShareButton.title = 'Compartilhar tela';
            
            // Ocultar container de compartilhamento
            screenShareContainer.style.display = 'none';
            
            // Enviar notificação para o destinatário (se implementado)
            if (window.socket && window.currentChatUser) {
                window.socket.emit('screenShareStopped', {
                    receiverId: window.currentChatUser._id
                });
            }
            
            showNotification('Compartilhamento de tela encerrado.');
        }
    }
    
    // Função para mostrar/ocultar botão de compartilhamento
    function updateScreenShareButtonVisibility() {
        const activeChat = document.getElementById('activeChat');
        
        if (activeChat && window.currentChatUser && 
            window.getComputedStyle(activeChat).display !== 'none') {
            screenShareButton.style.display = 'block';
        } else {
            screenShareButton.style.display = 'none';
            
            // Parar compartilhamento se estiver ativo
            if (isSharing) {
                stopScreenSharing();
            }
        }
    }
    
    // Verificar periodicamente a visibilidade do botão
    setInterval(updateScreenShareButtonVisibility, 1000);
    
    // Também verificar quando o chat é iniciado
    document.addEventListener('chatStarted', function() {
        setTimeout(updateScreenShareButtonVisibility, 100);
        setTimeout(updateScreenShareButtonVisibility, 500);
    });
    
    // Função para mostrar notificação
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'screen-share-notification';
        notification.textContent = message;
        notification.style.position = 'fixed';
        notification.style.bottom = '70px';
        notification.style.right = '20px';
        notification.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        notification.style.color = 'white';
        notification.style.padding = '10px 20px';
        notification.style.borderRadius = '5px';
        notification.style.zIndex = '1000';
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s';
        
        document.body.appendChild(notification);
        
        // Mostrar notificação
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 10);
        
        // Remover notificação após 3 segundos
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
    
    // Interceptar eventos de compartilhamento de tela
    if (window.socket) {
        // Quando alguém inicia um compartilhamento de tela
        window.socket.on('screenShareStarted', function(data) {
            showNotification(`${data.senderName} está compartilhando a tela. Esta funcionalidade requer implementação adicional no servidor.`);
        });
        
        // Quando alguém para um compartilhamento de tela
        window.socket.on('screenShareStopped', function(data) {
            showNotification(`${data.senderName} parou de compartilhar a tela.`);
        });
    }
});
