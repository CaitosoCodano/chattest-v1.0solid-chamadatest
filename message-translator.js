/**
 * Sistema de tradução de mensagens
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando sistema de tradução de mensagens');
    
    // Lista de idiomas disponíveis
    const availableLanguages = [
        { code: 'en', name: 'Inglês' },
        { code: 'es', name: 'Espanhol' },
        { code: 'fr', name: 'Francês' },
        { code: 'de', name: 'Alemão' },
        { code: 'it', name: 'Italiano' },
        { code: 'ja', name: 'Japonês' },
        { code: 'ko', name: 'Coreano' },
        { code: 'zh', name: 'Chinês' },
        { code: 'ru', name: 'Russo' },
        { code: 'ar', name: 'Árabe' }
    ];
    
    // Adicionar botão de tradução ao campo de mensagem
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        // Criar container para o botão
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'translate-button-container';
        buttonContainer.style.position = 'absolute';
        buttonContainer.style.right = '110px';
        buttonContainer.style.top = '50%';
        buttonContainer.style.transform = 'translateY(-50%)';
        
        // Criar botão
        const translateButton = document.createElement('button');
        translateButton.className = 'translate-button';
        translateButton.innerHTML = '🌐';
        translateButton.title = 'Traduzir mensagens';
        translateButton.style.background = 'none';
        translateButton.style.border = 'none';
        translateButton.style.fontSize = '20px';
        translateButton.style.cursor = 'pointer';
        translateButton.style.opacity = '0.7';
        translateButton.style.transition = 'opacity 0.2s';
        
        // Efeito de hover
        translateButton.addEventListener('mouseover', function() {
            this.style.opacity = '1';
        });
        
        translateButton.addEventListener('mouseout', function() {
            this.style.opacity = '0.7';
        });
        
        // Adicionar evento de clique
        translateButton.addEventListener('click', function() {
            showLanguageSelector();
        });
        
        // Adicionar botão ao container
        buttonContainer.appendChild(translateButton);
        
        // Adicionar container ao campo de mensagem
        messageInput.parentNode.style.position = 'relative';
        messageInput.parentNode.appendChild(buttonContainer);
    }
    
    // Criar seletor de idioma
    const languageSelector = document.createElement('div');
    languageSelector.className = 'language-selector';
    languageSelector.style.position = 'fixed';
    languageSelector.style.top = '50%';
    languageSelector.style.left = '50%';
    languageSelector.style.transform = 'translate(-50%, -50%)';
    languageSelector.style.backgroundColor = 'white';
    languageSelector.style.borderRadius = '10px';
    languageSelector.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
    languageSelector.style.padding = '20px';
    languageSelector.style.zIndex = '1000';
    languageSelector.style.display = 'none';
    languageSelector.style.maxWidth = '400px';
    languageSelector.style.width = '90%';
    
    // Adicionar título
    const title = document.createElement('h3');
    title.textContent = 'Selecione o idioma para tradução';
    title.style.marginTop = '0';
    title.style.marginBottom = '15px';
    title.style.textAlign = 'center';
    languageSelector.appendChild(title);
    
    // Adicionar lista de idiomas
    const languageList = document.createElement('div');
    languageList.className = 'language-list';
    languageList.style.maxHeight = '300px';
    languageList.style.overflowY = 'auto';
    
    availableLanguages.forEach(language => {
        const languageItem = document.createElement('div');
        languageItem.className = 'language-item';
        languageItem.textContent = language.name;
        languageItem.dataset.code = language.code;
        languageItem.style.padding = '10px';
        languageItem.style.cursor = 'pointer';
        languageItem.style.borderBottom = '1px solid #eee';
        languageItem.style.transition = 'background-color 0.2s';
        
        // Efeito de hover
        languageItem.addEventListener('mouseover', function() {
            this.style.backgroundColor = '#f5f5f5';
        });
        
        languageItem.addEventListener('mouseout', function() {
            this.style.backgroundColor = 'transparent';
        });
        
        // Adicionar evento de clique
        languageItem.addEventListener('click', function() {
            const languageCode = this.dataset.code;
            translateMessages(languageCode);
            hideLanguageSelector();
        });
        
        languageList.appendChild(languageItem);
    });
    
    languageSelector.appendChild(languageList);
    
    // Adicionar botão de cancelar
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancelar';
    cancelButton.style.marginTop = '15px';
    cancelButton.style.padding = '8px 15px';
    cancelButton.style.backgroundColor = '#f5f5f5';
    cancelButton.style.border = 'none';
    cancelButton.style.borderRadius = '5px';
    cancelButton.style.cursor = 'pointer';
    cancelButton.style.display = 'block';
    cancelButton.style.margin = '15px auto 0';
    
    cancelButton.addEventListener('click', function() {
        hideLanguageSelector();
    });
    
    languageSelector.appendChild(cancelButton);
    
    // Adicionar seletor ao corpo do documento
    document.body.appendChild(languageSelector);
    
    // Função para mostrar o seletor de idioma
    function showLanguageSelector() {
        languageSelector.style.display = 'block';
        
        // Adicionar overlay para fechar ao clicar fora
        const overlay = document.createElement('div');
        overlay.className = 'language-selector-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        overlay.style.zIndex = '999';
        
        overlay.addEventListener('click', function() {
            hideLanguageSelector();
        });
        
        document.body.appendChild(overlay);
    }
    
    // Função para ocultar o seletor de idioma
    function hideLanguageSelector() {
        languageSelector.style.display = 'none';
        
        // Remover overlay
        const overlay = document.querySelector('.language-selector-overlay');
        if (overlay) {
            overlay.remove();
        }
    }
    
    // Função para traduzir mensagens
    function translateMessages(targetLanguage) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        const messages = chatMessages.querySelectorAll('.message .message-text');
        if (messages.length === 0) {
            showNotification('Nenhuma mensagem para traduzir.');
            return;
        }
        
        showNotification(`Traduzindo mensagens para ${getLanguageName(targetLanguage)}...`);
        
        // Armazenar textos originais
        const textsToTranslate = [];
        
        messages.forEach((messageElement, index) => {
            // Verificar se a mensagem já tem tradução
            if (!messageElement.dataset.originalText) {
                messageElement.dataset.originalText = messageElement.textContent;
            }
            
            textsToTranslate.push({
                index: index,
                text: messageElement.dataset.originalText
            });
        });
        
        // Simular tradução (em um ambiente real, isso seria uma chamada de API)
        setTimeout(() => {
            textsToTranslate.forEach(item => {
                const messageElement = messages[item.index];
                const translatedText = simulateTranslation(item.text, targetLanguage);
                
                // Adicionar ícone de tradução e texto traduzido
                messageElement.innerHTML = `
                    <div class="translation-container">
                        <div class="translated-text">${translatedText}</div>
                        <div class="translation-info">
                            <span class="translation-icon">🌐</span>
                            <span class="translation-language">Traduzido para ${getLanguageName(targetLanguage)}</span>
                            <button class="show-original-button">Ver original</button>
                        </div>
                    </div>
                `;
                
                // Adicionar evento para mostrar texto original
                const showOriginalButton = messageElement.querySelector('.show-original-button');
                if (showOriginalButton) {
                    showOriginalButton.addEventListener('click', function() {
                        const translationContainer = this.closest('.translation-container');
                        const translatedText = translationContainer.querySelector('.translated-text');
                        
                        if (this.textContent === 'Ver original') {
                            translatedText.textContent = messageElement.dataset.originalText;
                            this.textContent = 'Ver tradução';
                        } else {
                            translatedText.textContent = translatedText.dataset.translatedText || translatedText.textContent;
                            this.textContent = 'Ver original';
                        }
                    });
                    
                    // Armazenar texto traduzido
                    const translatedTextElement = messageElement.querySelector('.translated-text');
                    if (translatedTextElement) {
                        translatedTextElement.dataset.translatedText = translatedText;
                    }
                }
            });
            
            showNotification(`Mensagens traduzidas para ${getLanguageName(targetLanguage)}.`);
        }, 1000);
    }
    
    // Função para simular tradução (em um ambiente real, isso seria uma chamada de API)
    function simulateTranslation(text, targetLanguage) {
        // Esta é apenas uma simulação para demonstração
        // Em um ambiente real, você usaria uma API de tradução como Google Translate
        
        const translations = {
            'en': {
                'Olá': 'Hello',
                'Como vai?': 'How are you?',
                'Tudo bem?': 'All good?',
                'Bom dia': 'Good morning',
                'Boa tarde': 'Good afternoon',
                'Boa noite': 'Good night',
                'Obrigado': 'Thank you',
                'De nada': 'You\'re welcome',
                'Sim': 'Yes',
                'Não': 'No'
            },
            'es': {
                'Olá': 'Hola',
                'Como vai?': '¿Cómo estás?',
                'Tudo bem?': '¿Todo bien?',
                'Bom dia': 'Buenos días',
                'Boa tarde': 'Buenas tardes',
                'Boa noite': 'Buenas noches',
                'Obrigado': 'Gracias',
                'De nada': 'De nada',
                'Sim': 'Sí',
                'Não': 'No'
            },
            'fr': {
                'Olá': 'Bonjour',
                'Como vai?': 'Comment ça va?',
                'Tudo bem?': 'Tout va bien?',
                'Bom dia': 'Bonjour',
                'Boa tarde': 'Bon après-midi',
                'Boa noite': 'Bonne nuit',
                'Obrigado': 'Merci',
                'De nada': 'De rien',
                'Sim': 'Oui',
                'Não': 'Non'
            }
        };
        
        // Verificar se o idioma está disponível
        if (!translations[targetLanguage]) {
            return `[Tradução para ${getLanguageName(targetLanguage)} não disponível: ${text}]`;
        }
        
        // Verificar se a tradução está disponível
        if (translations[targetLanguage][text]) {
            return translations[targetLanguage][text];
        }
        
        // Simular tradução para palavras não conhecidas
        return `[Tradução simulada para ${getLanguageName(targetLanguage)}: ${text}]`;
    }
    
    // Função para obter o nome do idioma a partir do código
    function getLanguageName(languageCode) {
        const language = availableLanguages.find(lang => lang.code === languageCode);
        return language ? language.name : languageCode;
    }
    
    // Função para mostrar notificação
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'translate-notification';
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
});
