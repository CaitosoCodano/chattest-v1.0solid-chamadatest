/**
 * Script para ajustar a largura das mensagens com base no conteúdo
 */
document.addEventListener('DOMContentLoaded', function() {
    // Função para ajustar a largura das mensagens
    function adjustMessageWidth() {
        // Selecionar todas as mensagens
        const messages = document.querySelectorAll('.message');
        
        messages.forEach(message => {
            const content = message.querySelector('.message-content p');
            if (!content) return;
            
            const text = content.textContent;
            
            // Se o texto tiver menos de 30 caracteres, ajustar a largura
            if (text.length < 30) {
                // Calcular a largura aproximada (cada caractere tem aproximadamente 8px de largura)
                const minWidth = Math.max(150, text.length * 8 + 40); // 40px para padding
                
                // Aplicar a largura mínima
                message.style.minWidth = minWidth + 'px';
                message.querySelector('.message-bubble').style.minWidth = (minWidth - 30) + 'px';
                content.style.minWidth = (minWidth - 60) + 'px';
            } else {
                // Para mensagens mais longas, usar os valores padrão do CSS
                message.style.minWidth = '';
                message.querySelector('.message-bubble').style.minWidth = '';
                content.style.minWidth = '';
            }
        });
    }
    
    // Observar mudanças no DOM para ajustar mensagens novas
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        const observer = new MutationObserver(function(mutations) {
            adjustMessageWidth();
        });
        
        observer.observe(chatMessages, { childList: true, subtree: true });
        
        // Ajustar mensagens existentes
        adjustMessageWidth();
    }
    
    // Sobrescrever a função createMessageElement para ajustar a largura das mensagens
    if (typeof window.createMessageElement === 'function') {
        const originalCreateMessageElement = window.createMessageElement;
        
        window.createMessageElement = function(message, isMyMessage) {
            const messageElement = originalCreateMessageElement(message, isMyMessage);
            
            // Ajustar a largura da mensagem
            setTimeout(() => {
                const content = messageElement.querySelector('.message-content p');
                if (!content) return;
                
                const text = content.textContent;
                
                // Se o texto tiver menos de 30 caracteres, ajustar a largura
                if (text.length < 30) {
                    // Calcular a largura aproximada (cada caractere tem aproximadamente 8px de largura)
                    const minWidth = Math.max(150, text.length * 8 + 40); // 40px para padding
                    
                    // Aplicar a largura mínima
                    messageElement.style.minWidth = minWidth + 'px';
                    messageElement.querySelector('.message-bubble').style.minWidth = (minWidth - 30) + 'px';
                    content.style.minWidth = (minWidth - 60) + 'px';
                }
            }, 10);
            
            return messageElement;
        };
    }
});
