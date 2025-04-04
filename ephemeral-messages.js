/**
 * Sistema de mensagens temporárias (que desaparecem após serem lidas)
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando sistema de mensagens temporárias');
    
    // Adicionar botão de mensagem temporária ao campo de mensagem
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        // Criar container para o botão
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'ephemeral-button-container';
        buttonContainer.style.position = 'absolute';
        buttonContainer.style.right = '50px';
        buttonContainer.style.top = '50%';
        buttonContainer.style.transform = 'translateY(-50%)';
        
        // Criar botão
        const ephemeralButton = document.createElement('button');
        ephemeralButton.className = 'ephemeral-button';
        ephemeralButton.innerHTML = '⏱️';
        ephemeralButton.title = 'Enviar mensagem temporária';
        ephemeralButton.style.background = 'none';
        ephemeralButton.style.border = 'none';
        ephemeralButton.style.fontSize = '20px';
        ephemeralButton.style.cursor = 'pointer';
        ephemeralButton.style.opacity = '0.7';
        ephemeralButton.style.transition = 'opacity 0.2s';
        
        // Efeito de hover
        ephemeralButton.addEventListener('mouseover', function() {
            this.style.opacity = '1';
        });
        
        ephemeralButton.addEventListener('mouseout', function() {
            this.style.opacity = '0.7';
        });
        
        // Variável para controlar se a próxima mensagem será temporária
        let nextMessageEphemeral = false;
        
        // Adicionar evento de clique
        ephemeralButton.addEventListener('click', function() {
            nextMessageEphemeral = !nextMessageEphemeral;
            
            if (nextMessageEphemeral) {
                ephemeralButton.style.color = '#ff5722';
                ephemeralButton.title = 'Mensagem temporária ativada';
                showNotification('Mensagem temporária ativada. A próxima mensagem desaparecerá após ser lida.');
            } else {
                ephemeralButton.style.color = 'inherit';
                ephemeralButton.title = 'Enviar mensagem temporária';
                showNotification('Mensagem temporária desativada.');
            }
        });
        
        // Adicionar botão ao container
        buttonContainer.appendChild(ephemeralButton);
        
        // Adicionar container ao campo de mensagem
        messageInput.parentNode.style.position = 'relative';
        messageInput.parentNode.appendChild(buttonContainer);
        
        // Interceptar o envio de mensagens
        const sendButton = document.getElementById('sendButton');
        if (sendButton) {
            const originalClickHandler = sendButton.onclick;
            
            sendButton.onclick = function(e) {
                if (nextMessageEphemeral) {
                    // Adicionar flag para mensagem temporária
                    const messageText = messageInput.value.trim();
                    if (messageText) {
                        // Enviar mensagem temporária
                        sendEphemeralMessage(messageText);
                        
                        // Limpar campo de mensagem
                        messageInput.value = '';
                        
                        // Resetar flag
                        nextMessageEphemeral = false;
                        ephemeralButton.style.color = 'inherit';
                        ephemeralButton.title = 'Enviar mensagem temporária';
                        
                        // Prevenir comportamento padrão
                        e.preventDefault();
                        return false;
                    }
                } else if (originalClickHandler) {
                    // Chamar handler original
                    return originalClickHandler.call(this, e);
                }
            };
        }
    }
    
    // Função para enviar mensagem temporária
    function sendEphemeralMessage(text) {
        if (!window.socket || !window.currentChatUser) {
            showNotification('Não foi possível enviar a mensagem temporária.');
            return;
        }
        
        // Enviar mensagem para o servidor com flag de temporária
        window.socket.emit('sendMessage', {
            receiverId: window.currentChatUser._id,
            content: text,
            ephemeral: true
        });
        
        // Criar elemento de mensagem temporária
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            const messageElement = document.createElement('div');
            messageElement.className = 'message sent ephemeral';
            messageElement.innerHTML = `
                <div class="message-content">
                    <div class="message-text">${text}</div>
                    <div class="message-meta">
                        <span class="message-time">${new Date().toLocaleTimeString()}</span>
                        <span class="ephemeral-indicator">⏱️ Temporária</span>
                    </div>
                </div>
            `;
            
            // Adicionar estilo para mensagem temporária
            messageElement.style.backgroundColor = 'rgba(255, 87, 34, 0.1)';
            messageElement.style.borderColor = 'rgba(255, 87, 34, 0.3)';
            
            // Adicionar mensagem ao chat
            chatMessages.appendChild(messageElement);
            
            // Rolar para a última mensagem
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
    
    // Função para mostrar notificação
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'ephemeral-notification';
        notification.textContent = message;
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.left = '50%';
        notification.style.transform = 'translateX(-50%)';
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
    
    // Interceptar recebimento de mensagens para tratar mensagens temporárias
    if (window.socket) {
        const originalMessageHandler = window.socket._callbacks['$newMessage'];
        
        if (originalMessageHandler && originalMessageHandler.length > 0) {
            const originalHandler = originalMessageHandler[0];
            
            window.socket.off('newMessage');
            window.socket.on('newMessage', function(data) {
                // Verificar se é uma mensagem temporária
                if (data.ephemeral) {
                    // Criar elemento de mensagem temporária
                    const chatMessages = document.getElementById('chatMessages');
                    if (chatMessages && window.currentChatUser && data.sender._id === window.currentChatUser._id) {
                        const messageElement = document.createElement('div');
                        messageElement.className = 'message received ephemeral';
                        messageElement.innerHTML = `
                            <div class="message-content">
                                <div class="message-text">${data.content}</div>
                                <div class="message-meta">
                                    <span class="message-time">${new Date(data.timestamp).toLocaleTimeString()}</span>
                                    <span class="ephemeral-indicator">⏱️ Temporária</span>
                                </div>
                            </div>
                        `;
                        
                        // Adicionar estilo para mensagem temporária
                        messageElement.style.backgroundColor = 'rgba(255, 87, 34, 0.1)';
                        messageElement.style.borderColor = 'rgba(255, 87, 34, 0.3)';
                        
                        // Adicionar mensagem ao chat
                        chatMessages.appendChild(messageElement);
                        
                        // Rolar para a última mensagem
                        chatMessages.scrollTop = chatMessages.scrollHeight;
                        
                        // Configurar temporizador para remover a mensagem após 10 segundos
                        setTimeout(() => {
                            messageElement.style.opacity = '0';
                            messageElement.style.transition = 'opacity 0.5s';
                            
                            setTimeout(() => {
                                messageElement.remove();
                            }, 500);
                        }, 10000);
                        
                        // Marcar como lida
                        window.socket.emit('markAsRead', {
                            senderId: data.sender._id
                        });
                    }
                } else {
                    // Chamar handler original para mensagens normais
                    originalHandler(data);
                }
            });
        }
    }
});
