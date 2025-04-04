/**
 * Integração de botões para o chat
 * Este script substitui os botões individuais por uma interface mais organizada
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando integração de botões');
    
    // Remover botões existentes que podem estar causando problemas
    removeExistingButtons();
    
    // Criar container para os botões
    const buttonContainer = document.createElement('div');
    buttonContainer.id = 'chatToolbar';
    buttonContainer.className = 'chat-toolbar';
    buttonContainer.style.display = 'flex';
    buttonContainer.style.alignItems = 'center';
    buttonContainer.style.gap = '10px';
    buttonContainer.style.padding = '5px 10px';
    buttonContainer.style.borderTop = '1px solid #eee';
    buttonContainer.style.backgroundColor = '#f9f9f9';
    
    // Adicionar botões ao container
    addToolbarButtons(buttonContainer);
    
    // Adicionar container à interface
    const messageInputContainer = document.querySelector('.message-input-container');
    if (messageInputContainer) {
        // Inserir antes do formulário de mensagem
        const messageForm = messageInputContainer.querySelector('form');
        if (messageForm) {
            messageInputContainer.insertBefore(buttonContainer, messageForm);
        } else {
            messageInputContainer.appendChild(buttonContainer);
        }
        
        // Ajustar o tamanho da caixa de mensagem
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.style.width = 'calc(100% - 50px)';
        }
    }
    
    // Adicionar botão de chamada ao cabeçalho do chat
    addCallButtonToHeader();
    
    // Função para remover botões existentes
    function removeExistingButtons() {
        // Lista de IDs de botões para remover
        const buttonIds = [
            'searchButton',
            'pollButton',
            'translateButton',
            'voiceMessageButton',
            'ephemeralButton',
            'callButton',
            'directCallButton',
            'screenShareButton',
            'backupButton',
            'themeButton'
        ];
        
        // Remover botões pelo ID
        buttonIds.forEach(id => {
            const button = document.getElementById(id);
            if (button) {
                button.remove();
            }
        });
        
        // Remover containers de botões
        const containers = document.querySelectorAll('.voice-message-button-container, .translate-button-container, .ephemeral-button-container');
        containers.forEach(container => {
            container.remove();
        });
    }
    
    // Função para adicionar botões à barra de ferramentas
    function addToolbarButtons(container) {
        // Definir botões
        const buttons = [
            { id: 'searchBtn', icon: '🔍', title: 'Pesquisar mensagens', onClick: showSearchPanel },
            { id: 'voiceBtn', icon: '🎤', title: 'Enviar mensagem de voz', onClick: handleVoiceMessage },
            { id: 'pollBtn', icon: '📊', title: 'Criar enquete', onClick: showPollPanel },
            { id: 'translateBtn', icon: '🌐', title: 'Traduzir mensagens', onClick: showTranslatePanel },
            { id: 'tempBtn', icon: '⏱️', title: 'Mensagem temporária', onClick: toggleTemporaryMessage }
        ];
        
        // Criar botões
        buttons.forEach(button => {
            const btn = document.createElement('button');
            btn.id = button.id;
            btn.innerHTML = button.icon;
            btn.title = button.title;
            btn.className = 'toolbar-button';
            btn.style.background = 'none';
            btn.style.border = 'none';
            btn.style.fontSize = '18px';
            btn.style.cursor = 'pointer';
            btn.style.padding = '5px';
            btn.style.borderRadius = '5px';
            btn.style.transition = 'background-color 0.2s';
            
            // Efeito de hover
            btn.addEventListener('mouseover', function() {
                this.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
            });
            
            btn.addEventListener('mouseout', function() {
                this.style.backgroundColor = 'transparent';
            });
            
            // Adicionar evento de clique
            btn.addEventListener('click', button.onClick);
            
            container.appendChild(btn);
        });
        
        // Adicionar botões de configuração à direita
        const spacer = document.createElement('div');
        spacer.style.flex = '1';
        container.appendChild(spacer);
        
        // Botão de tema
        const themeBtn = document.createElement('button');
        themeBtn.id = 'themeBtn';
        themeBtn.innerHTML = '🎨';
        themeBtn.title = 'Personalizar tema';
        themeBtn.className = 'toolbar-button';
        themeBtn.style.background = 'none';
        themeBtn.style.border = 'none';
        themeBtn.style.fontSize = '18px';
        themeBtn.style.cursor = 'pointer';
        themeBtn.style.padding = '5px';
        themeBtn.style.borderRadius = '5px';
        
        themeBtn.addEventListener('click', showThemePanel);
        container.appendChild(themeBtn);
        
        // Botão de backup
        const backupBtn = document.createElement('button');
        backupBtn.id = 'backupBtn';
        backupBtn.innerHTML = '💾';
        backupBtn.title = 'Backup de conversas';
        backupBtn.className = 'toolbar-button';
        backupBtn.style.background = 'none';
        backupBtn.style.border = 'none';
        backupBtn.style.fontSize = '18px';
        backupBtn.style.cursor = 'pointer';
        backupBtn.style.padding = '5px';
        backupBtn.style.borderRadius = '5px';
        
        backupBtn.addEventListener('click', showBackupPanel);
        container.appendChild(backupBtn);
    }
    
    // Função para adicionar botão de chamada ao cabeçalho do chat
    function addCallButtonToHeader() {
        // Verificar se o cabeçalho existe
        const chatHeader = document.getElementById('chatHeader');
        if (!chatHeader) return;
        
        // Verificar se já existe um botão de menu
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
            } else {
                alert('Função de chamada não disponível');
            }
        });
        
        // Adicionar botão ao cabeçalho
        menuContainer.insertBefore(callButton, menuContainer.firstChild);
    }
    
    // Funções para os botões
    
    // Pesquisa
    function showSearchPanel() {
        if (typeof window.showSearchPanel === 'function') {
            window.showSearchPanel();
        } else {
            // Implementação básica
            alert('Funcionalidade de pesquisa não disponível');
        }
    }
    
    // Mensagem de voz
    function handleVoiceMessage() {
        if (typeof window.startRecording === 'function') {
            window.startRecording();
        } else {
            // Implementação básica
            alert('Funcionalidade de mensagem de voz não disponível');
        }
    }
    
    // Enquete
    function showPollPanel() {
        if (typeof window.showPollModal === 'function') {
            window.showPollModal();
        } else {
            // Implementação básica
            alert('Funcionalidade de enquete não disponível');
        }
    }
    
    // Tradução
    function showTranslatePanel() {
        if (typeof window.showLanguageSelector === 'function') {
            window.showLanguageSelector();
        } else {
            // Implementação básica
            alert('Funcionalidade de tradução não disponível');
        }
    }
    
    // Mensagem temporária
    let temporaryMessageEnabled = false;
    
    function toggleTemporaryMessage() {
        temporaryMessageEnabled = !temporaryMessageEnabled;
        
        const btn = document.getElementById('tempBtn');
        if (btn) {
            if (temporaryMessageEnabled) {
                btn.style.color = '#ff5722';
                showNotification('Mensagem temporária ativada. A próxima mensagem desaparecerá após ser lida.');
            } else {
                btn.style.color = '';
                showNotification('Mensagem temporária desativada.');
            }
        }
        
        // Armazenar estado
        window.nextMessageEphemeral = temporaryMessageEnabled;
    }
    
    // Tema
    function showThemePanel() {
        if (typeof window.showThemePanel === 'function') {
            window.showThemePanel();
        } else {
            // Implementação básica
            alert('Funcionalidade de personalização de tema não disponível');
        }
    }
    
    // Backup
    function showBackupPanel() {
        if (typeof window.showBackupModal === 'function') {
            window.showBackupModal();
        } else {
            // Implementação básica
            alert('Funcionalidade de backup não disponível');
        }
    }
    
    // Função para mostrar notificação
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
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
    
    // Expor funções globalmente
    window.showSearchPanel = showSearchPanel;
    window.showPollModal = showPollPanel;
    window.showLanguageSelector = showTranslatePanel;
    window.showThemePanel = showThemePanel;
    window.showBackupModal = showBackupPanel;
});
