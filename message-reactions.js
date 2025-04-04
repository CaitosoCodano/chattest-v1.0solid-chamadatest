/**
 * Sistema de reações rápidas para mensagens
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando sistema de reações para mensagens');
    
    // Lista de emojis disponíveis para reações
    const availableReactions = [
        { emoji: '👍', name: 'like' },
        { emoji: '❤️', name: 'love' },
        { emoji: '😂', name: 'laugh' },
        { emoji: '😮', name: 'wow' },
        { emoji: '😢', name: 'sad' },
        { emoji: '😡', name: 'angry' }
    ];
    
    // Criar o painel de reações
    const reactionsPanel = document.createElement('div');
    reactionsPanel.className = 'reactions-panel';
    reactionsPanel.style.display = 'none';
    reactionsPanel.style.position = 'absolute';
    reactionsPanel.style.backgroundColor = 'white';
    reactionsPanel.style.borderRadius = '20px';
    reactionsPanel.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
    reactionsPanel.style.padding = '5px 10px';
    reactionsPanel.style.zIndex = '1000';
    
    // Adicionar emojis ao painel
    availableReactions.forEach(reaction => {
        const emojiButton = document.createElement('button');
        emojiButton.className = 'reaction-button';
        emojiButton.innerHTML = reaction.emoji;
        emojiButton.title = reaction.name;
        emojiButton.style.background = 'none';
        emojiButton.style.border = 'none';
        emojiButton.style.fontSize = '20px';
        emojiButton.style.cursor = 'pointer';
        emojiButton.style.margin = '0 2px';
        emojiButton.style.transition = 'transform 0.2s';
        
        // Efeito de hover
        emojiButton.addEventListener('mouseover', function() {
            this.style.transform = 'scale(1.2)';
        });
        
        emojiButton.addEventListener('mouseout', function() {
            this.style.transform = 'scale(1)';
        });
        
        // Adicionar evento de clique para reagir à mensagem
        emojiButton.addEventListener('click', function() {
            const messageId = reactionsPanel.dataset.messageId;
            addReaction(messageId, reaction);
            hideReactionsPanel();
        });
        
        reactionsPanel.appendChild(emojiButton);
    });
    
    // Adicionar o painel ao corpo do documento
    document.body.appendChild(reactionsPanel);
    
    // Função para mostrar o painel de reações
    function showReactionsPanel(messageElement) {
        const messageId = messageElement.dataset.id;
        const rect = messageElement.getBoundingClientRect();
        
        reactionsPanel.dataset.messageId = messageId;
        reactionsPanel.style.top = (rect.bottom + window.scrollY + 5) + 'px';
        reactionsPanel.style.left = (rect.left + window.scrollX) + 'px';
        reactionsPanel.style.display = 'block';
    }
    
    // Função para ocultar o painel de reações
    function hideReactionsPanel() {
        reactionsPanel.style.display = 'none';
        reactionsPanel.dataset.messageId = '';
    }
    
    // Função para adicionar uma reação a uma mensagem
    function addReaction(messageId, reaction) {
        console.log(`Adicionando reação ${reaction.emoji} à mensagem ${messageId}`);
        
        // Encontrar a mensagem
        const messageElement = document.querySelector(`.message[data-id="${messageId}"]`);
        if (!messageElement) return;
        
        // Verificar se já existe um container de reações
        let reactionsContainer = messageElement.querySelector('.message-reactions');
        if (!reactionsContainer) {
            // Criar container de reações
            reactionsContainer = document.createElement('div');
            reactionsContainer.className = 'message-reactions';
            reactionsContainer.style.display = 'flex';
            reactionsContainer.style.flexWrap = 'wrap';
            reactionsContainer.style.marginTop = '5px';
            messageElement.appendChild(reactionsContainer);
        }
        
        // Verificar se a reação já existe
        const existingReaction = reactionsContainer.querySelector(`.reaction[data-name="${reaction.name}"]`);
        if (existingReaction) {
            // Incrementar contador
            const counter = existingReaction.querySelector('.reaction-counter');
            let count = parseInt(counter.textContent);
            counter.textContent = (count + 1).toString();
            
            // Animar a reação
            existingReaction.style.transform = 'scale(1.2)';
            setTimeout(() => {
                existingReaction.style.transform = 'scale(1)';
            }, 200);
        } else {
            // Criar nova reação
            const reactionElement = document.createElement('div');
            reactionElement.className = 'reaction';
            reactionElement.dataset.name = reaction.name;
            reactionElement.style.display = 'flex';
            reactionElement.style.alignItems = 'center';
            reactionElement.style.backgroundColor = '#f0f2f5';
            reactionElement.style.borderRadius = '10px';
            reactionElement.style.padding = '2px 5px';
            reactionElement.style.margin = '2px';
            reactionElement.style.fontSize = '14px';
            reactionElement.style.transition = 'transform 0.2s';
            
            // Emoji
            const emojiSpan = document.createElement('span');
            emojiSpan.className = 'reaction-emoji';
            emojiSpan.textContent = reaction.emoji;
            emojiSpan.style.marginRight = '3px';
            
            // Contador
            const counterSpan = document.createElement('span');
            counterSpan.className = 'reaction-counter';
            counterSpan.textContent = '1';
            
            reactionElement.appendChild(emojiSpan);
            reactionElement.appendChild(counterSpan);
            reactionsContainer.appendChild(reactionElement);
            
            // Animar a nova reação
            reactionElement.style.transform = 'scale(0)';
            setTimeout(() => {
                reactionElement.style.transform = 'scale(1)';
            }, 10);
        }
        
        // Enviar a reação para o servidor (se implementado)
        if (window.socket) {
            window.socket.emit('messageReaction', {
                messageId: messageId,
                reaction: reaction.name,
                emoji: reaction.emoji
            });
        }
    }
    
    // Adicionar botão de reação a cada mensagem
    function addReactionButtonToMessages() {
        const messages = document.querySelectorAll('.message');
        
        messages.forEach(message => {
            // Verificar se já tem botão de reação
            if (message.querySelector('.reaction-button-container')) return;
            
            // Criar container para o botão
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'reaction-button-container';
            buttonContainer.style.position = 'absolute';
            buttonContainer.style.right = '5px';
            buttonContainer.style.top = '5px';
            buttonContainer.style.opacity = '0';
            buttonContainer.style.transition = 'opacity 0.2s';
            
            // Criar botão de reação
            const reactionButton = document.createElement('button');
            reactionButton.className = 'message-reaction-button';
            reactionButton.innerHTML = '😀';
            reactionButton.style.background = 'none';
            reactionButton.style.border = 'none';
            reactionButton.style.fontSize = '16px';
            reactionButton.style.cursor = 'pointer';
            reactionButton.style.padding = '2px';
            reactionButton.title = 'Adicionar reação';
            
            // Adicionar evento de clique
            reactionButton.addEventListener('click', function(e) {
                e.stopPropagation();
                showReactionsPanel(message);
            });
            
            buttonContainer.appendChild(reactionButton);
            message.appendChild(buttonContainer);
            
            // Mostrar/ocultar botão ao passar o mouse
            message.addEventListener('mouseover', function() {
                buttonContainer.style.opacity = '1';
            });
            
            message.addEventListener('mouseout', function() {
                buttonContainer.style.opacity = '0';
            });
        });
    }
    
    // Observar mudanças no DOM para adicionar botões de reação a novas mensagens
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                addReactionButtonToMessages();
            }
        });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Adicionar botões de reação às mensagens existentes
    setTimeout(addReactionButtonToMessages, 1000);
    
    // Fechar o painel de reações ao clicar fora dele
    document.addEventListener('click', function(e) {
        if (!reactionsPanel.contains(e.target) && 
            !e.target.classList.contains('message-reaction-button')) {
            hideReactionsPanel();
        }
    });
    
    // Expor funções globalmente
    window.messageReactions = {
        addReaction: addReaction,
        showPanel: showReactionsPanel,
        hidePanel: hideReactionsPanel
    };
});
