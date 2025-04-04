/**
 * Sistema de backup de conversas
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando sistema de backup de conversas');
    
    // Criar botão de backup
    const backupButton = document.createElement('button');
    backupButton.id = 'backupButton';
    backupButton.innerHTML = '💾';
    backupButton.title = 'Backup de conversas';
    backupButton.style.backgroundColor = '#4CAF50';
    backupButton.style.color = 'white';
    backupButton.style.border = 'none';
    backupButton.style.borderRadius = '50%';
    backupButton.style.width = '40px';
    backupButton.style.height = '40px';
    backupButton.style.fontSize = '20px';
    backupButton.style.cursor = 'pointer';
    backupButton.style.position = 'fixed';
    backupButton.style.bottom = '120px';
    backupButton.style.right = '20px';
    backupButton.style.zIndex = '1000';
    backupButton.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.3)';
    
    // Adicionar botão ao corpo do documento
    document.body.appendChild(backupButton);
    
    // Criar modal de backup
    const backupModal = document.createElement('div');
    backupModal.id = 'backupModal';
    backupModal.style.position = 'fixed';
    backupModal.style.top = '0';
    backupModal.style.left = '0';
    backupModal.style.width = '100%';
    backupModal.style.height = '100%';
    backupModal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    backupModal.style.display = 'none';
    backupModal.style.justifyContent = 'center';
    backupModal.style.alignItems = 'center';
    backupModal.style.zIndex = '2000';
    
    // Conteúdo do modal
    const modalContent = document.createElement('div');
    modalContent.className = 'backup-modal-content';
    modalContent.style.backgroundColor = 'white';
    modalContent.style.borderRadius = '10px';
    modalContent.style.padding = '20px';
    modalContent.style.width = '90%';
    modalContent.style.maxWidth = '500px';
    
    // Título do modal
    const modalTitle = document.createElement('h3');
    modalTitle.textContent = 'Backup de Conversas';
    modalTitle.style.marginTop = '0';
    modalTitle.style.marginBottom = '20px';
    modalTitle.style.textAlign = 'center';
    modalContent.appendChild(modalTitle);
    
    // Opções de backup
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'backup-options';
    
    // Opção de exportar todas as conversas
    const exportAllOption = createBackupOption(
        '📤 Exportar todas as conversas',
        'Baixar um arquivo com todas as suas conversas',
        exportAllConversations
    );
    optionsContainer.appendChild(exportAllOption);
    
    // Opção de exportar conversa atual
    const exportCurrentOption = createBackupOption(
        '📝 Exportar conversa atual',
        'Baixar um arquivo com a conversa aberta atualmente',
        exportCurrentConversation
    );
    optionsContainer.appendChild(exportCurrentOption);
    
    // Opção de importar conversas
    const importOption = createBackupOption(
        '📥 Importar conversas',
        'Restaurar conversas a partir de um arquivo de backup',
        showImportDialog
    );
    optionsContainer.appendChild(importOption);
    
    // Opção de limpar todas as conversas
    const clearAllOption = createBackupOption(
        '🗑️ Limpar todas as conversas',
        'Remover todas as conversas armazenadas localmente',
        confirmClearAllConversations
    );
    clearAllOption.style.borderBottom = 'none';
    optionsContainer.appendChild(clearAllOption);
    
    modalContent.appendChild(optionsContainer);
    
    // Botão de fechar
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Fechar';
    closeButton.style.display = 'block';
    closeButton.style.margin = '20px auto 0';
    closeButton.style.padding = '8px 20px';
    closeButton.style.backgroundColor = '#f5f5f5';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '5px';
    closeButton.style.cursor = 'pointer';
    
    closeButton.addEventListener('click', function() {
        hideBackupModal();
    });
    
    modalContent.appendChild(closeButton);
    
    // Adicionar conteúdo ao modal
    backupModal.appendChild(modalContent);
    
    // Adicionar modal ao corpo do documento
    document.body.appendChild(backupModal);
    
    // Adicionar evento de clique ao botão de backup
    backupButton.addEventListener('click', function() {
        showBackupModal();
    });
    
    // Função para criar opção de backup
    function createBackupOption(title, description, clickHandler) {
        const option = document.createElement('div');
        option.className = 'backup-option';
        option.style.padding = '15px';
        option.style.borderBottom = '1px solid #eee';
        option.style.cursor = 'pointer';
        option.style.transition = 'background-color 0.2s';
        
        // Título
        const optionTitle = document.createElement('div');
        optionTitle.className = 'backup-option-title';
        optionTitle.textContent = title;
        optionTitle.style.fontWeight = 'bold';
        optionTitle.style.marginBottom = '5px';
        option.appendChild(optionTitle);
        
        // Descrição
        const optionDescription = document.createElement('div');
        optionDescription.className = 'backup-option-description';
        optionDescription.textContent = description;
        optionDescription.style.fontSize = '14px';
        optionDescription.style.color = '#666';
        option.appendChild(optionDescription);
        
        // Efeito de hover
        option.addEventListener('mouseover', function() {
            this.style.backgroundColor = '#f5f5f5';
        });
        
        option.addEventListener('mouseout', function() {
            this.style.backgroundColor = 'transparent';
        });
        
        // Adicionar evento de clique
        option.addEventListener('click', clickHandler);
        
        return option;
    }
    
    // Função para mostrar o modal de backup
    function showBackupModal() {
        backupModal.style.display = 'flex';
    }
    
    // Função para ocultar o modal de backup
    function hideBackupModal() {
        backupModal.style.display = 'none';
    }
    
    // Função para exportar todas as conversas
    function exportAllConversations() {
        // Verificar se o usuário está logado
        if (!window.userInfo || !window.userInfo.userId) {
            showNotification('Você precisa estar logado para exportar conversas.');
            return;
        }
        
        // Obter todas as conversas do localStorage
        const conversations = {};
        let hasConversations = false;
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            
            // Verificar se é uma chave de conversa
            if (key.startsWith('chat_')) {
                const messages = JSON.parse(localStorage.getItem(key));
                conversations[key] = messages;
                hasConversations = true;
            }
        }
        
        if (!hasConversations) {
            showNotification('Nenhuma conversa encontrada para exportar.');
            return;
        }
        
        // Criar objeto de backup
        const backup = {
            userId: window.userInfo.userId,
            username: window.userInfo.username,
            exportDate: new Date().toISOString(),
            conversations: conversations
        };
        
        // Converter para JSON
        const backupJson = JSON.stringify(backup, null, 2);
        
        // Criar blob e link de download
        const blob = new Blob([backupJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = `chat_backup_${formatDate(new Date())}.json`;
        downloadLink.style.display = 'none';
        
        document.body.appendChild(downloadLink);
        downloadLink.click();
        
        // Limpar
        setTimeout(() => {
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(url);
        }, 100);
        
        showNotification('Backup de todas as conversas exportado com sucesso.');
        hideBackupModal();
    }
    
    // Função para exportar conversa atual
    function exportCurrentConversation() {
        // Verificar se há uma conversa ativa
        if (!window.currentChatUser) {
            showNotification('Nenhuma conversa aberta para exportar.');
            return;
        }
        
        // Verificar se o usuário está logado
        if (!window.userInfo || !window.userInfo.userId) {
            showNotification('Você precisa estar logado para exportar conversas.');
            return;
        }
        
        // Obter mensagens da conversa atual
        const chatKey = `chat_${window.userInfo.userId}_${window.currentChatUser._id}`;
        const messages = localStorage.getItem(chatKey);
        
        if (!messages) {
            showNotification('Nenhuma mensagem encontrada para exportar.');
            return;
        }
        
        // Criar objeto de backup
        const backup = {
            userId: window.userInfo.userId,
            username: window.userInfo.username,
            contact: {
                userId: window.currentChatUser._id,
                username: window.currentChatUser.username
            },
            exportDate: new Date().toISOString(),
            messages: JSON.parse(messages)
        };
        
        // Converter para JSON
        const backupJson = JSON.stringify(backup, null, 2);
        
        // Criar blob e link de download
        const blob = new Blob([backupJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = `chat_with_${window.currentChatUser.username}_${formatDate(new Date())}.json`;
        downloadLink.style.display = 'none';
        
        document.body.appendChild(downloadLink);
        downloadLink.click();
        
        // Limpar
        setTimeout(() => {
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(url);
        }, 100);
        
        showNotification(`Conversa com ${window.currentChatUser.username} exportada com sucesso.`);
        hideBackupModal();
    }
    
    // Função para mostrar diálogo de importação
    function showImportDialog() {
        // Verificar se o usuário está logado
        if (!window.userInfo || !window.userInfo.userId) {
            showNotification('Você precisa estar logado para importar conversas.');
            return;
        }
        
        // Criar input de arquivo
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        fileInput.style.display = 'none';
        
        // Adicionar evento de mudança
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    try {
                        const backup = JSON.parse(e.target.result);
                        importConversations(backup);
                    } catch (error) {
                        console.error('Erro ao importar backup:', error);
                        showNotification('Erro ao importar backup. Verifique se o arquivo é válido.');
                    }
                };
                
                reader.readAsText(file);
            }
        });
        
        document.body.appendChild(fileInput);
        fileInput.click();
        
        // Limpar
        setTimeout(() => {
            document.body.removeChild(fileInput);
        }, 100);
    }
    
    // Função para importar conversas
    function importConversations(backup) {
        // Verificar se o backup é válido
        if (!backup || !backup.conversations) {
            showNotification('Arquivo de backup inválido.');
            return;
        }
        
        // Importar conversas
        let importCount = 0;
        
        for (const key in backup.conversations) {
            if (backup.conversations.hasOwnProperty(key)) {
                // Verificar se a chave é válida
                if (key.startsWith('chat_')) {
                    // Obter mensagens existentes
                    const existingMessages = localStorage.getItem(key);
                    const existingArray = existingMessages ? JSON.parse(existingMessages) : [];
                    
                    // Obter mensagens do backup
                    const backupMessages = backup.conversations[key];
                    
                    // Mesclar mensagens (evitar duplicatas)
                    const mergedMessages = [...existingArray];
                    
                    backupMessages.forEach(message => {
                        // Verificar se a mensagem já existe
                        const exists = mergedMessages.some(m => 
                            m._id === message._id || 
                            (m.content === message.content && 
                             m.sender === message.sender && 
                             m.timestamp === message.timestamp)
                        );
                        
                        if (!exists) {
                            mergedMessages.push(message);
                            importCount++;
                        }
                    });
                    
                    // Ordenar mensagens por timestamp
                    mergedMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                    
                    // Salvar mensagens mescladas
                    localStorage.setItem(key, JSON.stringify(mergedMessages));
                }
            }
        }
        
        showNotification(`Backup importado com sucesso. ${importCount} mensagens adicionadas.`);
        hideBackupModal();
        
        // Recarregar conversa atual se estiver aberta
        if (window.currentChatUser && typeof window.loadMessages === 'function') {
            window.loadMessages(window.currentChatUser._id, true);
        }
    }
    
    // Função para confirmar limpeza de todas as conversas
    function confirmClearAllConversations() {
        // Verificar se o usuário está logado
        if (!window.userInfo || !window.userInfo.userId) {
            showNotification('Você precisa estar logado para limpar conversas.');
            return;
        }
        
        // Criar modal de confirmação
        const confirmModal = document.createElement('div');
        confirmModal.className = 'confirm-modal';
        confirmModal.style.position = 'fixed';
        confirmModal.style.top = '0';
        confirmModal.style.left = '0';
        confirmModal.style.width = '100%';
        confirmModal.style.height = '100%';
        confirmModal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        confirmModal.style.display = 'flex';
        confirmModal.style.justifyContent = 'center';
        confirmModal.style.alignItems = 'center';
        confirmModal.style.zIndex = '3000';
        
        // Conteúdo do modal
        const confirmContent = document.createElement('div');
        confirmContent.className = 'confirm-content';
        confirmContent.style.backgroundColor = 'white';
        confirmContent.style.borderRadius = '10px';
        confirmContent.style.padding = '20px';
        confirmContent.style.width = '90%';
        confirmContent.style.maxWidth = '400px';
        confirmContent.style.textAlign = 'center';
        
        // Ícone de aviso
        const warningIcon = document.createElement('div');
        warningIcon.innerHTML = '⚠️';
        warningIcon.style.fontSize = '48px';
        warningIcon.style.marginBottom = '10px';
        confirmContent.appendChild(warningIcon);
        
        // Título
        const confirmTitle = document.createElement('h3');
        confirmTitle.textContent = 'Limpar todas as conversas?';
        confirmTitle.style.marginTop = '0';
        confirmTitle.style.marginBottom = '10px';
        confirmContent.appendChild(confirmTitle);
        
        // Mensagem
        const confirmMessage = document.createElement('p');
        confirmMessage.textContent = 'Esta ação não pode ser desfeita. Todas as suas conversas serão removidas permanentemente.';
        confirmMessage.style.marginBottom = '20px';
        confirmContent.appendChild(confirmMessage);
        
        // Botões
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'space-between';
        
        // Botão de cancelar
        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancelar';
        cancelButton.style.padding = '8px 20px';
        cancelButton.style.backgroundColor = '#f5f5f5';
        cancelButton.style.border = 'none';
        cancelButton.style.borderRadius = '5px';
        cancelButton.style.cursor = 'pointer';
        cancelButton.style.flex = '1';
        cancelButton.style.marginRight = '10px';
        
        cancelButton.addEventListener('click', function() {
            document.body.removeChild(confirmModal);
        });
        
        buttonContainer.appendChild(cancelButton);
        
        // Botão de confirmar
        const confirmButton = document.createElement('button');
        confirmButton.textContent = 'Limpar';
        confirmButton.style.padding = '8px 20px';
        confirmButton.style.backgroundColor = '#f44336';
        confirmButton.style.color = 'white';
        confirmButton.style.border = 'none';
        confirmButton.style.borderRadius = '5px';
        confirmButton.style.cursor = 'pointer';
        confirmButton.style.flex = '1';
        
        confirmButton.addEventListener('click', function() {
            clearAllConversations();
            document.body.removeChild(confirmModal);
        });
        
        buttonContainer.appendChild(confirmButton);
        confirmContent.appendChild(buttonContainer);
        
        // Adicionar modal ao corpo do documento
        confirmModal.appendChild(confirmContent);
        document.body.appendChild(confirmModal);
    }
    
    // Função para limpar todas as conversas
    function clearAllConversations() {
        // Verificar se o usuário está logado
        if (!window.userInfo || !window.userInfo.userId) {
            showNotification('Você precisa estar logado para limpar conversas.');
            return;
        }
        
        // Obter todas as chaves de conversa
        const chatKeys = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            
            // Verificar se é uma chave de conversa
            if (key.startsWith('chat_')) {
                chatKeys.push(key);
            }
        }
        
        // Remover todas as conversas
        chatKeys.forEach(key => {
            localStorage.removeItem(key);
        });
        
        showNotification(`${chatKeys.length} conversas removidas com sucesso.`);
        hideBackupModal();
        
        // Limpar conversa atual se estiver aberta
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            chatMessages.innerHTML = '';
        }
    }
    
    // Função para formatar data
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    }
    
    // Função para mostrar notificação
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'backup-notification';
        notification.textContent = message;
        notification.style.position = 'fixed';
        notification.style.bottom = '170px';
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
});
