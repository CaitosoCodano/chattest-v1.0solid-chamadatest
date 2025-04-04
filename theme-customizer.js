/**
 * Sistema de temas personalizados
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando sistema de temas personalizados');
    
    // Lista de temas predefinidos
    const predefinedThemes = [
        {
            name: 'Padrão',
            colors: {
                primary: '#1877f2',
                secondary: '#e4e6eb',
                background: '#ffffff',
                text: '#050505',
                sentMessage: '#e9f5ff',
                receivedMessage: '#f0f2f5'
            }
        },
        {
            name: 'Escuro',
            colors: {
                primary: '#2e89ff',
                secondary: '#3a3b3c',
                background: '#18191a',
                text: '#e4e6eb',
                sentMessage: '#2e89ff',
                receivedMessage: '#3a3b3c'
            }
        },
        {
            name: 'Sepia',
            colors: {
                primary: '#8b5a2b',
                secondary: '#f5e8c9',
                background: '#f9f1e0',
                text: '#5c4033',
                sentMessage: '#e6d5b8',
                receivedMessage: '#f5e8c9'
            }
        },
        {
            name: 'Neon',
            colors: {
                primary: '#00ff00',
                secondary: '#1a1a1a',
                background: '#000000',
                text: '#ffffff',
                sentMessage: '#003300',
                receivedMessage: '#1a1a1a'
            }
        },
        {
            name: 'Pastel',
            colors: {
                primary: '#ffb6c1',
                secondary: '#e6e6fa',
                background: '#f8f9fa',
                text: '#696969',
                sentMessage: '#ffdab9',
                receivedMessage: '#e6e6fa'
            }
        }
    ];
    
    // Tema atual
    let currentTheme = localStorage.getItem('chatTheme') ? 
        JSON.parse(localStorage.getItem('chatTheme')) : 
        predefinedThemes[0];
    
    // Criar botão de tema
    const themeButton = document.createElement('button');
    themeButton.id = 'themeButton';
    themeButton.innerHTML = '🎨';
    themeButton.title = 'Personalizar tema';
    themeButton.style.backgroundColor = currentTheme.colors.primary;
    themeButton.style.color = 'white';
    themeButton.style.border = 'none';
    themeButton.style.borderRadius = '50%';
    themeButton.style.width = '40px';
    themeButton.style.height = '40px';
    themeButton.style.fontSize = '20px';
    themeButton.style.cursor = 'pointer';
    themeButton.style.position = 'fixed';
    themeButton.style.bottom = '70px';
    themeButton.style.right = '20px';
    themeButton.style.zIndex = '1000';
    themeButton.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.3)';
    
    // Adicionar botão ao corpo do documento
    document.body.appendChild(themeButton);
    
    // Criar painel de temas
    const themePanel = document.createElement('div');
    themePanel.id = 'themePanel';
    themePanel.style.position = 'fixed';
    themePanel.style.top = '50%';
    themePanel.style.left = '50%';
    themePanel.style.transform = 'translate(-50%, -50%)';
    themePanel.style.backgroundColor = 'white';
    themePanel.style.borderRadius = '10px';
    themePanel.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
    themePanel.style.padding = '20px';
    themePanel.style.zIndex = '2000';
    themePanel.style.display = 'none';
    themePanel.style.maxWidth = '500px';
    themePanel.style.width = '90%';
    
    // Adicionar título
    const title = document.createElement('h3');
    title.textContent = 'Personalizar tema';
    title.style.marginTop = '0';
    title.style.marginBottom = '15px';
    title.style.textAlign = 'center';
    themePanel.appendChild(title);
    
    // Adicionar seletor de temas predefinidos
    const presetContainer = document.createElement('div');
    presetContainer.className = 'theme-preset-container';
    presetContainer.style.marginBottom = '20px';
    
    const presetLabel = document.createElement('div');
    presetLabel.textContent = 'Temas predefinidos:';
    presetLabel.style.marginBottom = '10px';
    presetLabel.style.fontWeight = 'bold';
    presetContainer.appendChild(presetLabel);
    
    const presetGrid = document.createElement('div');
    presetGrid.className = 'theme-preset-grid';
    presetGrid.style.display = 'grid';
    presetGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(100px, 1fr))';
    presetGrid.style.gap = '10px';
    
    predefinedThemes.forEach(theme => {
        const presetItem = document.createElement('div');
        presetItem.className = 'theme-preset-item';
        presetItem.dataset.theme = theme.name;
        presetItem.style.padding = '10px';
        presetItem.style.borderRadius = '5px';
        presetItem.style.backgroundColor = theme.colors.background;
        presetItem.style.color = theme.colors.text;
        presetItem.style.cursor = 'pointer';
        presetItem.style.textAlign = 'center';
        presetItem.style.border = '2px solid transparent';
        presetItem.style.transition = 'transform 0.2s';
        
        // Marcar tema atual
        if (currentTheme.name === theme.name) {
            presetItem.style.border = `2px solid ${theme.colors.primary}`;
        }
        
        // Nome do tema
        const themeName = document.createElement('div');
        themeName.textContent = theme.name;
        themeName.style.marginBottom = '5px';
        presetItem.appendChild(themeName);
        
        // Amostra de cores
        const colorSample = document.createElement('div');
        colorSample.style.display = 'flex';
        colorSample.style.justifyContent = 'center';
        colorSample.style.gap = '5px';
        
        // Cor primária
        const primaryColor = document.createElement('div');
        primaryColor.style.width = '15px';
        primaryColor.style.height = '15px';
        primaryColor.style.backgroundColor = theme.colors.primary;
        primaryColor.style.borderRadius = '50%';
        colorSample.appendChild(primaryColor);
        
        // Cor secundária
        const secondaryColor = document.createElement('div');
        secondaryColor.style.width = '15px';
        secondaryColor.style.height = '15px';
        secondaryColor.style.backgroundColor = theme.colors.secondary;
        secondaryColor.style.borderRadius = '50%';
        colorSample.appendChild(secondaryColor);
        
        presetItem.appendChild(colorSample);
        
        // Efeito de hover
        presetItem.addEventListener('mouseover', function() {
            this.style.transform = 'scale(1.05)';
        });
        
        presetItem.addEventListener('mouseout', function() {
            this.style.transform = 'scale(1)';
        });
        
        // Adicionar evento de clique
        presetItem.addEventListener('click', function() {
            const themeName = this.dataset.theme;
            const theme = predefinedThemes.find(t => t.name === themeName);
            if (theme) {
                applyTheme(theme);
                updatePresetSelection(themeName);
            }
        });
        
        presetGrid.appendChild(presetItem);
    });
    
    presetContainer.appendChild(presetGrid);
    themePanel.appendChild(presetContainer);
    
    // Adicionar personalizador de cores
    const customContainer = document.createElement('div');
    customContainer.className = 'theme-custom-container';
    
    const customLabel = document.createElement('div');
    customLabel.textContent = 'Personalizar cores:';
    customLabel.style.marginBottom = '10px';
    customLabel.style.fontWeight = 'bold';
    customContainer.appendChild(customLabel);
    
    // Criar campos de cores
    const colorFields = [
        { id: 'primary', label: 'Cor primária' },
        { id: 'secondary', label: 'Cor secundária' },
        { id: 'background', label: 'Fundo' },
        { id: 'text', label: 'Texto' },
        { id: 'sentMessage', label: 'Mensagens enviadas' },
        { id: 'receivedMessage', label: 'Mensagens recebidas' }
    ];
    
    const colorGrid = document.createElement('div');
    colorGrid.className = 'theme-color-grid';
    colorGrid.style.display = 'grid';
    colorGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(150px, 1fr))';
    colorGrid.style.gap = '10px';
    
    colorFields.forEach(field => {
        const colorField = document.createElement('div');
        colorField.className = 'theme-color-field';
        colorField.style.marginBottom = '10px';
        
        const colorLabel = document.createElement('label');
        colorLabel.textContent = field.label;
        colorLabel.style.display = 'block';
        colorLabel.style.marginBottom = '5px';
        colorField.appendChild(colorLabel);
        
        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.id = `theme-${field.id}`;
        colorInput.value = currentTheme.colors[field.id];
        colorInput.style.width = '100%';
        colorInput.style.height = '30px';
        colorInput.style.border = 'none';
        colorInput.style.borderRadius = '5px';
        colorInput.style.cursor = 'pointer';
        
        // Adicionar evento de mudança
        colorInput.addEventListener('input', function() {
            const customTheme = {
                name: 'Personalizado',
                colors: {
                    primary: document.getElementById('theme-primary').value,
                    secondary: document.getElementById('theme-secondary').value,
                    background: document.getElementById('theme-background').value,
                    text: document.getElementById('theme-text').value,
                    sentMessage: document.getElementById('theme-sentMessage').value,
                    receivedMessage: document.getElementById('theme-receivedMessage').value
                }
            };
            
            applyTheme(customTheme, false);
            updatePresetSelection(null);
        });
        
        colorField.appendChild(colorInput);
        colorGrid.appendChild(colorField);
    });
    
    customContainer.appendChild(colorGrid);
    themePanel.appendChild(customContainer);
    
    // Adicionar botões de ação
    const actionContainer = document.createElement('div');
    actionContainer.className = 'theme-action-container';
    actionContainer.style.display = 'flex';
    actionContainer.style.justifyContent = 'space-between';
    actionContainer.style.marginTop = '20px';
    
    // Botão de salvar
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Salvar';
    saveButton.style.padding = '8px 15px';
    saveButton.style.backgroundColor = currentTheme.colors.primary;
    saveButton.style.color = 'white';
    saveButton.style.border = 'none';
    saveButton.style.borderRadius = '5px';
    saveButton.style.cursor = 'pointer';
    
    saveButton.addEventListener('click', function() {
        const customTheme = {
            name: 'Personalizado',
            colors: {
                primary: document.getElementById('theme-primary').value,
                secondary: document.getElementById('theme-secondary').value,
                background: document.getElementById('theme-background').value,
                text: document.getElementById('theme-text').value,
                sentMessage: document.getElementById('theme-sentMessage').value,
                receivedMessage: document.getElementById('theme-receivedMessage').value
            }
        };
        
        applyTheme(customTheme, true);
        hideThemePanel();
    });
    
    actionContainer.appendChild(saveButton);
    
    // Botão de cancelar
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancelar';
    cancelButton.style.padding = '8px 15px';
    cancelButton.style.backgroundColor = '#f5f5f5';
    cancelButton.style.border = 'none';
    cancelButton.style.borderRadius = '5px';
    cancelButton.style.cursor = 'pointer';
    
    cancelButton.addEventListener('click', function() {
        // Restaurar tema atual
        applyTheme(currentTheme);
        hideThemePanel();
    });
    
    actionContainer.appendChild(cancelButton);
    themePanel.appendChild(actionContainer);
    
    // Adicionar painel ao corpo do documento
    document.body.appendChild(themePanel);
    
    // Adicionar evento de clique ao botão de tema
    themeButton.addEventListener('click', function() {
        showThemePanel();
    });
    
    // Função para mostrar o painel de temas
    function showThemePanel() {
        themePanel.style.display = 'block';
        
        // Adicionar overlay para fechar ao clicar fora
        const overlay = document.createElement('div');
        overlay.className = 'theme-panel-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        overlay.style.zIndex = '1999';
        
        overlay.addEventListener('click', function() {
            hideThemePanel();
        });
        
        document.body.appendChild(overlay);
    }
    
    // Função para ocultar o painel de temas
    function hideThemePanel() {
        themePanel.style.display = 'none';
        
        // Remover overlay
        const overlay = document.querySelector('.theme-panel-overlay');
        if (overlay) {
            overlay.remove();
        }
    }
    
    // Função para atualizar a seleção de tema predefinido
    function updatePresetSelection(themeName) {
        const presetItems = document.querySelectorAll('.theme-preset-item');
        
        presetItems.forEach(item => {
            if (item.dataset.theme === themeName) {
                const theme = predefinedThemes.find(t => t.name === themeName);
                item.style.border = `2px solid ${theme.colors.primary}`;
            } else {
                item.style.border = '2px solid transparent';
            }
        });
    }
    
    // Função para aplicar tema
    function applyTheme(theme, save = true) {
        // Atualizar tema atual
        if (save) {
            currentTheme = theme;
            localStorage.setItem('chatTheme', JSON.stringify(theme));
        }
        
        // Atualizar cor do botão de tema
        themeButton.style.backgroundColor = theme.colors.primary;
        
        // Atualizar cor do botão de salvar
        const saveButton = document.querySelector('.theme-action-container button:first-child');
        if (saveButton) {
            saveButton.style.backgroundColor = theme.colors.primary;
        }
        
        // Criar ou atualizar folha de estilo
        let styleElement = document.getElementById('custom-theme-style');
        
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = 'custom-theme-style';
            document.head.appendChild(styleElement);
        }
        
        // Definir regras CSS
        styleElement.textContent = `
            :root {
                --primary-color: ${theme.colors.primary};
                --secondary-color: ${theme.colors.secondary};
                --background-color: ${theme.colors.background};
                --text-color: ${theme.colors.text};
                --sent-message-color: ${theme.colors.sentMessage};
                --received-message-color: ${theme.colors.receivedMessage};
            }
            
            body {
                background-color: var(--background-color);
                color: var(--text-color);
            }
            
            .sidebar {
                background-color: var(--background-color);
                border-right: 1px solid var(--secondary-color);
            }
            
            .chat-container {
                background-color: var(--background-color);
            }
            
            .chat-header {
                background-color: var(--background-color);
                border-bottom: 1px solid var(--secondary-color);
            }
            
            .message.sent {
                background-color: var(--sent-message-color);
            }
            
            .message.received {
                background-color: var(--received-message-color);
            }
            
            .message-input-container {
                background-color: var(--background-color);
                border-top: 1px solid var(--secondary-color);
            }
            
            #messageInput {
                background-color: var(--secondary-color);
                color: var(--text-color);
            }
            
            #sendButton {
                background-color: var(--primary-color);
            }
            
            .contact {
                background-color: var(--background-color);
                border-bottom: 1px solid var(--secondary-color);
            }
            
            .contact:hover {
                background-color: var(--secondary-color);
            }
            
            .status-indicator.online {
                background-color: #4CAF50;
            }
            
            .status-indicator.away {
                background-color: #FFC107;
            }
            
            .status-indicator.offline {
                background-color: #9E9E9E;
            }
            
            .unread-badge {
                background-color: var(--primary-color);
            }
            
            /* Ajustes para modo escuro */
            ${theme.name === 'Escuro' ? `
                input, textarea, select, button {
                    background-color: var(--secondary-color);
                    color: var(--text-color);
                    border: 1px solid #555;
                }
                
                .modal-content {
                    background-color: var(--background-color);
                    color: var(--text-color);
                }
                
                .welcome-screen {
                    background-color: var(--background-color);
                    color: var(--text-color);
                }
            ` : ''}
        `;
        
        // Mostrar notificação
        if (save) {
            showNotification(`Tema "${theme.name}" aplicado com sucesso.`);
        }
    }
    
    // Função para mostrar notificação
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'theme-notification';
        notification.textContent = message;
        notification.style.position = 'fixed';
        notification.style.bottom = '120px';
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
    
    // Aplicar tema atual
    applyTheme(currentTheme);
});
