/**
 * Melhorias para mensagens: reações, respostas e fixação
 */
document.addEventListener('DOMContentLoaded', function() {
    // Elementos principais
    const chatMessages = document.getElementById('chatMessages');
    
    // Verificar se os elementos existem
    if (!chatMessages) {
        console.error('Elementos necessários não encontrados');
        return;
    }
    
    console.log('Inicializando melhorias para mensagens');
    
    // Emojis disponíveis para reações
    const availableReactions = ['👍', '❤️', '😂', '😮', '😢', '👏', '🔥', '🎉'];
    
    // Socket.io
    let socket = window.socket;
    
    // Verificar se o socket está disponível
    if (!socket) {
        console.error('Socket não encontrado');
        return;
    }
    
    // Eventos do socket
    socket.on('messageReaction', handleMessageReaction);
    socket.on('messagePinned', handleMessagePinned);
    
    /**
     * Adiciona o menu de reações a uma mensagem
     */
    function addReactionMenu(messageElement) {
        // Verificar se o menu já existe
        if (messageElement.querySelector('.reaction-menu')) {
            return;
        }
        
        // Criar o menu de reações
        const reactionMenu = document.createElement('div');
        reactionMenu.className = 'reaction-menu';
        
        // Adicionar os emojis disponíveis
        availableReactions.forEach(emoji => {
            const reactionBtn = document.createElement('button');
            reactionBtn.className = 'reaction-btn';
            reactionBtn.textContent = emoji;
            reactionBtn.title = `Reagir com ${emoji}`;
            
            // Adicionar evento de clique
            reactionBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                reactToMessage(messageElement.dataset.messageId, emoji);
            });
            
            reactionMenu.appendChild(reactionBtn);
        });
        
        // Adicionar o menu à mensagem
        messageElement.appendChild(reactionMenu);
    }
    
    /**
     * Adiciona o container de reações a uma mensagem
     */
    function addReactionContainer(messageElement) {
        // Verificar se o container já existe
        if (messageElement.querySelector('.reactions-container')) {
            return messageElement.querySelector('.reactions-container');
        }
        
        // Criar o container de reações
        const reactionsContainer = document.createElement('div');
        reactionsContainer.className = 'reactions-container';
        
        // Adicionar o container à mensagem
        messageElement.appendChild(reactionsContainer);
        
        return reactionsContainer;
    }
    
    /**
     * Atualiza as reações exibidas em uma mensagem
     */
    function updateMessageReactions(messageId, reactions) {
        // Encontrar a mensagem
        const messageElement = chatMessages.querySelector(`.message[data-message-id="${messageId}"]`);
        if (!messageElement) {
            console.error(`Mensagem com ID ${messageId} não encontrada`);
            return;
        }
        
        // Obter ou criar o container de reações
        const reactionsContainer = addReactionContainer(messageElement);
        
        // Limpar o container
        reactionsContainer.innerHTML = '';
        
        // Se não houver reações, esconder o container
        if (!reactions || Object.keys(reactions).length === 0) {
            reactionsContainer.style.display = 'none';
            return;
        }
        
        // Exibir o container
        reactionsContainer.style.display = 'flex';
        
        // Adicionar cada reação
        for (const [emoji, reactors] of Object.entries(reactions)) {
            if (!reactors || reactors.length === 0) continue;
            
            const reactionElement = document.createElement('div');
            reactionElement.className = 'reaction';
            
            // Verificar se o usuário atual reagiu
            const currentUserId = window.userInfo._id;
            const userReacted = reactors.some(reactor => reactor.userId === currentUserId);
            
            if (userReacted) {
                reactionElement.classList.add('user-reacted');
            }
            
            // Adicionar o emoji e o contador
            reactionElement.innerHTML = `
                <span class="reaction-emoji">${emoji}</span>
                <span class="reaction-count">${reactors.length}</span>
            `;
            
            // Adicionar título com os nomes dos usuários que reagiram
            const reactorNames = reactors.map(reactor => reactor.username).join(', ');
            reactionElement.title = reactorNames;
            
            // Adicionar evento de clique para alternar a reação
            reactionElement.addEventListener('click', function() {
                reactToMessage(messageId, emoji);
            });
            
            reactionsContainer.appendChild(reactionElement);
        }
    }
    
    /**
     * Envia uma reação para uma mensagem
     */
    function reactToMessage(messageId, reaction) {
        if (!messageId || !reaction) {
            console.error('ID da mensagem ou reação não especificados');
            return;
        }
        
        console.log(`Reagindo à mensagem ${messageId} com ${reaction}`);
        
        // Enviar a reação para o servidor
        fetch(`/api/messages/${messageId}/react`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${window.userInfo.token}`
            },
            body: JSON.stringify({ reaction })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao reagir à mensagem');
            }
            return response.json();
        })
        .then(data => {
            console.log('Reação enviada com sucesso:', data);
        })
        .catch(error => {
            console.error('Erro ao reagir à mensagem:', error);
            showNotification('Erro ao reagir à mensagem. Tente novamente.', 'error');
        });
    }
    
    /**
     * Manipula o evento de reação a uma mensagem
     */
    function handleMessageReaction(data) {
        console.log('Recebida reação a mensagem:', data);
        
        // Atualizar as reações na interface
        updateMessageReactions(data.messageId, data.reactions);
    }
    
    /**
     * Adiciona o botão de responder a uma mensagem
     */
    function addReplyButton(messageElement) {
        // Verificar se o botão já existe
        if (messageElement.querySelector('.reply-btn')) {
            return;
        }
        
        // Criar o botão de responder
        const replyBtn = document.createElement('button');
        replyBtn.className = 'message-action-btn reply-btn';
        replyBtn.innerHTML = '<i class="fas fa-reply"></i>';
        replyBtn.title = 'Responder';
        
        // Adicionar evento de clique
        replyBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            startReplyToMessage(messageElement);
        });
        
        // Criar o container de ações se não existir
        let actionsContainer = messageElement.querySelector('.message-actions');
        if (!actionsContainer) {
            actionsContainer = document.createElement('div');
            actionsContainer.className = 'message-actions';
            messageElement.appendChild(actionsContainer);
        }
        
        // Adicionar o botão ao container
        actionsContainer.appendChild(replyBtn);
    }
    
    /**
     * Inicia o processo de resposta a uma mensagem
     */
    function startReplyToMessage(messageElement) {
        const messageId = messageElement.dataset.messageId;
        const messageContent = messageElement.querySelector('.message-content p').textContent;
        const senderName = messageElement.dataset.senderName || 'Usuário';
        
        console.log(`Respondendo à mensagem ${messageId} de ${senderName}: ${messageContent}`);
        
        // Criar ou atualizar o container de resposta
        let replyContainer = document.querySelector('.reply-container');
        if (!replyContainer) {
            replyContainer = document.createElement('div');
            replyContainer.className = 'reply-container';
            
            // Inserir antes do input de mensagem
            const chatInputContainer = document.querySelector('.chat-input-container');
            chatInputContainer.insertBefore(replyContainer, chatInputContainer.firstChild);
        }
        
        // Atualizar o conteúdo do container
        replyContainer.innerHTML = `
            <div class="reply-preview">
                <div class="reply-info">
                    <span class="reply-to">Respondendo a ${senderName}</span>
                    <span class="reply-text">${messageContent.substring(0, 50)}${messageContent.length > 50 ? '...' : ''}</span>
                </div>
                <button class="cancel-reply-btn"><i class="fas fa-times"></i></button>
            </div>
        `;
        
        // Adicionar o ID da mensagem como atributo
        replyContainer.dataset.replyToId = messageId;
        
        // Adicionar evento para cancelar a resposta
        replyContainer.querySelector('.cancel-reply-btn').addEventListener('click', cancelReply);
        
        // Focar no input de mensagem
        document.getElementById('messageInput').focus();
    }
    
    /**
     * Cancela a resposta a uma mensagem
     */
    function cancelReply() {
        const replyContainer = document.querySelector('.reply-container');
        if (replyContainer) {
            replyContainer.remove();
        }
    }
    
    /**
     * Envia uma mensagem de resposta
     */
    function sendReplyMessage() {
        const replyContainer = document.querySelector('.reply-container');
        if (!replyContainer) {
            // Não é uma resposta, usar o método normal de envio
            return false;
        }
        
        const messageInput = document.getElementById('messageInput');
        const content = messageInput.value.trim();
        
        if (!content) {
            return false;
        }
        
        const replyToId = replyContainer.dataset.replyToId;
        
        if (!replyToId) {
            console.error('ID da mensagem original não encontrado');
            return false;
        }
        
        // Enviar a resposta para o servidor
        fetch(`/api/messages/${replyToId}/reply`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${window.userInfo.token}`
            },
            body: JSON.stringify({
                content,
                receiverId: window.currentChatUser._id
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao enviar resposta');
            }
            return response.json();
        })
        .then(data => {
            console.log('Resposta enviada com sucesso:', data);
            
            // Limpar o input e o container de resposta
            messageInput.value = '';
            cancelReply();
        })
        .catch(error => {
            console.error('Erro ao enviar resposta:', error);
            showNotification('Erro ao enviar resposta. Tente novamente.', 'error');
        });
        
        return true;
    }
    
    /**
     * Adiciona o botão de fixar a uma mensagem
     */
    function addPinButton(messageElement) {
        // Verificar se o botão já existe
        if (messageElement.querySelector('.pin-btn')) {
            return;
        }
        
        // Criar o botão de fixar
        const pinBtn = document.createElement('button');
        pinBtn.className = 'message-action-btn pin-btn';
        pinBtn.innerHTML = '<i class="fas fa-thumbtack"></i>';
        pinBtn.title = 'Fixar mensagem';
        
        // Verificar se a mensagem já está fixada
        if (messageElement.classList.contains('pinned')) {
            pinBtn.classList.add('active');
            pinBtn.title = 'Desafixar mensagem';
        }
        
        // Adicionar evento de clique
        pinBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            togglePinMessage(messageElement);
        });
        
        // Criar o container de ações se não existir
        let actionsContainer = messageElement.querySelector('.message-actions');
        if (!actionsContainer) {
            actionsContainer = document.createElement('div');
            actionsContainer.className = 'message-actions';
            messageElement.appendChild(actionsContainer);
        }
        
        // Adicionar o botão ao container
        actionsContainer.appendChild(pinBtn);
    }
    
    /**
     * Alterna o estado de fixado de uma mensagem
     */
    function togglePinMessage(messageElement) {
        const messageId = messageElement.dataset.messageId;
        
        console.log(`Alternando fixação da mensagem ${messageId}`);
        
        // Enviar a solicitação para o servidor
        fetch(`/api/messages/${messageId}/pin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${window.userInfo.token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao fixar/desafixar mensagem');
            }
            return response.json();
        })
        .then(data => {
            console.log('Mensagem fixada/desafixada com sucesso:', data);
        })
        .catch(error => {
            console.error('Erro ao fixar/desafixar mensagem:', error);
            showNotification('Erro ao fixar/desafixar mensagem. Tente novamente.', 'error');
        });
    }
    
    /**
     * Manipula o evento de fixação de uma mensagem
     */
    function handleMessagePinned(data) {
        console.log('Recebida atualização de fixação de mensagem:', data);
        
        // Encontrar a mensagem
        const messageElement = chatMessages.querySelector(`.message[data-message-id="${data.messageId}"]`);
        if (!messageElement) {
            console.error(`Mensagem com ID ${data.messageId} não encontrada`);
            return;
        }
        
        // Atualizar o estado de fixado
        if (data.isPinned) {
            messageElement.classList.add('pinned');
            
            // Atualizar o botão se existir
            const pinBtn = messageElement.querySelector('.pin-btn');
            if (pinBtn) {
                pinBtn.classList.add('active');
                pinBtn.title = 'Desafixar mensagem';
            }
            
            // Mover a mensagem para o topo se não estiver lá
            const firstMessage = chatMessages.firstElementChild;
            if (firstMessage && !firstMessage.classList.contains('pinned')) {
                chatMessages.insertBefore(messageElement, firstMessage);
            }
        } else {
            messageElement.classList.remove('pinned');
            
            // Atualizar o botão se existir
            const pinBtn = messageElement.querySelector('.pin-btn');
            if (pinBtn) {
                pinBtn.classList.remove('active');
                pinBtn.title = 'Fixar mensagem';
            }
            
            // Reordenar as mensagens (simplificado - em uma implementação real, recarregaríamos as mensagens)
            if (typeof window.loadMessages === 'function' && window.currentChatUser) {
                window.loadMessages(window.currentChatUser._id, false);
            }
        }
    }
    
    /**
     * Adiciona a visualização de mensagem respondida
     */
    function addReplyView(messageElement, replyToMessage) {
        if (!replyToMessage) return;
        
        // Criar o elemento de visualização de resposta
        const replyView = document.createElement('div');
        replyView.className = 'reply-view';
        
        // Obter informações da mensagem original
        const originalSender = replyToMessage.sender ? replyToMessage.sender.username : 'Usuário';
        const originalContent = replyToMessage.content;
        
        // Adicionar o conteúdo
        replyView.innerHTML = `
            <div class="reply-original">
                <span class="reply-sender">${originalSender}</span>
                <span class="reply-content">${originalContent.substring(0, 50)}${originalContent.length > 50 ? '...' : ''}</span>
            </div>
        `;
        
        // Adicionar evento de clique para navegar até a mensagem original
        replyView.addEventListener('click', function() {
            const originalMessageElement = chatMessages.querySelector(`.message[data-message-id="${replyToMessage._id}"]`);
            if (originalMessageElement) {
                originalMessageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                originalMessageElement.classList.add('highlight');
                setTimeout(() => {
                    originalMessageElement.classList.remove('highlight');
                }, 2000);
            }
        });
        
        // Inserir antes do conteúdo da mensagem
        const messageContent = messageElement.querySelector('.message-content');
        messageElement.insertBefore(replyView, messageContent);
    }
    
    /**
     * Mostra uma notificação na interface
     */
    function showNotification(message, type = 'success') {
        // Verificar se a função já existe globalmente
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, type);
            return;
        }
        
        // Implementação básica se a função global não existir
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    /**
     * Sobrescreve a função createMessageElement para adicionar as novas funcionalidades
     */
    if (typeof window.createMessageElement === 'function') {
        const originalCreateMessageElement = window.createMessageElement;
        
        window.createMessageElement = function(message, isMyMessage) {
            // Criar o elemento de mensagem usando a função original
            const messageElement = originalCreateMessageElement(message, isMyMessage);
            
            // Adicionar o ID da mensagem como atributo
            messageElement.dataset.messageId = message._id;
            
            // Adicionar o nome do remetente como atributo
            if (message.sender && message.sender.username) {
                messageElement.dataset.senderName = message.sender.username;
            }
            
            // Adicionar visualização de resposta se for uma resposta
            if (message.replyTo) {
                addReplyView(messageElement, message.replyTo);
            }
            
            // Adicionar botões de ação
            addReplyButton(messageElement);
            addPinButton(messageElement);
            
            // Adicionar menu de reações ao passar o mouse
            messageElement.addEventListener('mouseenter', function() {
                addReactionMenu(messageElement);
            });
            
            // Adicionar container de reações
            addReactionContainer(messageElement);
            
            // Atualizar reações se existirem
            if (message.reactions && Object.keys(message.reactions).length > 0) {
                updateMessageReactions(message._id, message.reactions);
            }
            
            // Marcar como fixada se necessário
            if (message.isPinned) {
                messageElement.classList.add('pinned');
                
                // Atualizar o botão de fixar
                const pinBtn = messageElement.querySelector('.pin-btn');
                if (pinBtn) {
                    pinBtn.classList.add('active');
                    pinBtn.title = 'Desafixar mensagem';
                }
            }
            
            return messageElement;
        };
    }
    
    /**
     * Sobrescreve a função sendMessage para adicionar suporte a respostas
     */
    if (typeof window.sendMessage === 'function') {
        const originalSendMessage = window.sendMessage;
        
        window.sendMessage = function() {
            // Verificar se é uma resposta
            if (document.querySelector('.reply-container')) {
                // Usar a função de enviar resposta
                const sent = sendReplyMessage();
                if (sent) return;
            }
            
            // Se não for uma resposta ou se falhar, usar a função original
            originalSendMessage();
        };
    }
    
    // Adicionar estilos para as novas funcionalidades
    const style = document.createElement('style');
    style.textContent = `
        /* Estilos para reações */
        .reaction-menu {
            display: flex;
            position: absolute;
            top: -30px;
            left: 50%;
            transform: translateX(-50%);
            background-color: white;
            border-radius: 20px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            padding: 5px;
            z-index: 10;
            opacity: 0;
            transition: opacity 0.2s;
        }
        
        .message:hover .reaction-menu {
            opacity: 1;
        }
        
        .reaction-btn {
            background: none;
            border: none;
            font-size: 16px;
            padding: 2px 5px;
            cursor: pointer;
            border-radius: 50%;
            transition: transform 0.2s;
        }
        
        .reaction-btn:hover {
            transform: scale(1.2);
        }
        
        .reactions-container {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
            margin-top: 5px;
        }
        
        .reaction {
            display: flex;
            align-items: center;
            background-color: #f0f2f5;
            border-radius: 10px;
            padding: 2px 5px;
            font-size: 12px;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        
        .reaction:hover {
            background-color: #e4e6eb;
        }
        
        .reaction.user-reacted {
            background-color: #e7f3ff;
        }
        
        .reaction-emoji {
            font-size: 14px;
            margin-right: 3px;
        }
        
        .reaction-count {
            font-size: 11px;
            color: #65676b;
        }
        
        /* Estilos para ações de mensagem */
        .message-actions {
            display: flex;
            position: absolute;
            top: 5px;
            right: 5px;
            opacity: 0;
            transition: opacity 0.2s;
        }
        
        .message:hover .message-actions {
            opacity: 1;
        }
        
        .message-action-btn {
            background: none;
            border: none;
            color: #65676b;
            font-size: 12px;
            padding: 3px;
            margin-left: 5px;
            cursor: pointer;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background-color 0.2s;
        }
        
        .message-action-btn:hover {
            background-color: rgba(0, 0, 0, 0.05);
            color: #1877f2;
        }
        
        .message-action-btn.active {
            color: #1877f2;
        }
        
        /* Estilos para respostas */
        .reply-container {
            background-color: #f0f2f5;
            border-left: 3px solid #1877f2;
            padding: 8px 10px;
            margin-bottom: 10px;
            border-radius: 0 8px 8px 0;
        }
        
        .reply-preview {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .reply-info {
            display: flex;
            flex-direction: column;
        }
        
        .reply-to {
            font-size: 12px;
            color: #1877f2;
            font-weight: bold;
        }
        
        .reply-text {
            font-size: 12px;
            color: #65676b;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 250px;
        }
        
        .cancel-reply-btn {
            background: none;
            border: none;
            color: #65676b;
            cursor: pointer;
            padding: 5px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .cancel-reply-btn:hover {
            background-color: rgba(0, 0, 0, 0.05);
        }
        
        .reply-view {
            background-color: rgba(0, 0, 0, 0.03);
            border-left: 2px solid #1877f2;
            padding: 5px 8px;
            margin-bottom: 5px;
            border-radius: 0 8px 8px 0;
            cursor: pointer;
        }
        
        .reply-view:hover {
            background-color: rgba(0, 0, 0, 0.05);
        }
        
        .reply-sender {
            font-size: 11px;
            color: #1877f2;
            font-weight: bold;
            display: block;
        }
        
        .reply-content {
            font-size: 11px;
            color: #65676b;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 200px;
            display: block;
        }
        
        /* Estilos para mensagens fixadas */
        .message.pinned {
            border-left: 3px solid #1877f2;
        }
        
        .message.pinned::before {
            content: "📌";
            position: absolute;
            top: 5px;
            left: 5px;
            font-size: 12px;
        }
        
        /* Animação de destaque */
        .message.highlight {
            animation: highlight 2s;
        }
        
        @keyframes highlight {
            0% { background-color: rgba(24, 119, 242, 0.2); }
            100% { background-color: transparent; }
        }
        
        /* Estilos para modo escuro */
        .dark-mode .reaction-menu {
            background-color: #2d2d2d;
        }
        
        .dark-mode .reaction {
            background-color: #3a3a3a;
        }
        
        .dark-mode .reaction:hover {
            background-color: #444;
        }
        
        .dark-mode .reaction.user-reacted {
            background-color: #1e3a5f;
        }
        
        .dark-mode .reaction-count {
            color: #b0b0b0;
        }
        
        .dark-mode .message-action-btn {
            color: #b0b0b0;
        }
        
        .dark-mode .message-action-btn:hover {
            background-color: rgba(255, 255, 255, 0.1);
            color: #4a9eff;
        }
        
        .dark-mode .message-action-btn.active {
            color: #4a9eff;
        }
        
        .dark-mode .reply-container {
            background-color: #2d2d2d;
            border-left-color: #4a9eff;
        }
        
        .dark-mode .reply-to {
            color: #4a9eff;
        }
        
        .dark-mode .reply-text {
            color: #b0b0b0;
        }
        
        .dark-mode .cancel-reply-btn {
            color: #b0b0b0;
        }
        
        .dark-mode .cancel-reply-btn:hover {
            background-color: rgba(255, 255, 255, 0.1);
        }
        
        .dark-mode .reply-view {
            background-color: rgba(255, 255, 255, 0.05);
            border-left-color: #4a9eff;
        }
        
        .dark-mode .reply-view:hover {
            background-color: rgba(255, 255, 255, 0.1);
        }
        
        .dark-mode .reply-sender {
            color: #4a9eff;
        }
        
        .dark-mode .reply-content {
            color: #b0b0b0;
        }
        
        .dark-mode .message.pinned {
            border-left-color: #4a9eff;
        }
        
        .dark-mode .message.highlight {
            animation: dark-highlight 2s;
        }
        
        @keyframes dark-highlight {
            0% { background-color: rgba(74, 158, 255, 0.2); }
            100% { background-color: transparent; }
        }
    `;
    document.head.appendChild(style);
});
