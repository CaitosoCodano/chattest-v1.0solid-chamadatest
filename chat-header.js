/**
 * Funções para atualizar o cabeçalho do chat
 */
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se a função já existe no escopo global
    if (typeof window.updateChatHeader === 'function') {
        console.log('Função updateChatHeader já existe, não será sobrescrita');
        return;
    }
    
    // Elementos principais
    const chatHeader = document.getElementById('chatHeader');
    
    // Verificar se os elementos existem
    if (!chatHeader) {
        console.error('Cabeçalho do chat não encontrado');
        return;
    }
    
    console.log('Inicializando funções de cabeçalho do chat');
    
    /**
     * Função para atualizar o cabeçalho do chat
     */
    window.updateChatHeader = function(user) {
        if (!user) {
            console.error('Usuário não fornecido para updateChatHeader');
            return;
        }
        
        console.log('Atualizando cabeçalho do chat para usuário:', user);
        
        // Determinar o status do usuário
        let statusClass = 'offline';
        let statusText = 'Offline';
        let statusIcon = '';
        
        if (user.status) {
            statusClass = user.status;
            
            if (user.status === 'online') {
                statusText = 'Online';
            } else if (user.status === 'away') {
                statusText = 'Ausente';
            } else if (user.status === 'busy') {
                statusText = 'Ocupado';
            } else if (user.status === 'invisible') {
                statusText = 'Invisível';
            } else if (user.status === 'custom' && user.customStatus) {
                statusClass = 'custom';
                statusIcon = user.customStatus.emoji || '✏️';
                statusText = user.customStatus.text || 'Status personalizado';
            } else {
                statusText = 'Offline';
            }
        } else if (user.online !== undefined) {
            statusClass = user.online ? 'online' : 'offline';
            statusText = user.online ? 'Online' : 'Offline';
        }
        
        // Atualizar cabeçalho do chat
        chatHeader.innerHTML = `
            <div class="chat-user-info">
                <img src="${user.avatarUrl || user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}" alt="${user.username}">
                <h3>${user.username}</h3>
                <div class="chat-header-status">
                    <div class="chat-header-status-icon ${statusClass}">${statusClass === 'custom' ? statusIcon : ''}</div>
                    <div class="chat-header-status-text">${statusText}</div>
                </div>
            </div>
        `;
        
        console.log('Cabeçalho do chat atualizado com sucesso');
    };
    
    /**
     * Sobrescrever a função startChatWith para usar updateChatHeader
     */
    if (typeof window.startChatWith === 'function') {
        console.log('Sobrescrevendo função startChatWith');
        
        const originalStartChatWith = window.startChatWith;
        
        window.startChatWith = function(user) {
            console.log('Iniciando chat com usuário:', user);
            
            // Chamar a função original
            originalStartChatWith(user);
            
            // Atualizar o cabeçalho do chat
            window.updateChatHeader(user);
        };
    } else {
        console.error('Função startChatWith não encontrada, não será sobrescrita');
    }
});
