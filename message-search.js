/**
 * Sistema de pesquisa de mensagens
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando sistema de pesquisa de mensagens');
    
    // Criar botão de pesquisa
    const searchButton = document.createElement('button');
    searchButton.id = 'searchButton';
    searchButton.innerHTML = '🔍';
    searchButton.title = 'Pesquisar mensagens';
    searchButton.style.background = 'none';
    searchButton.style.border = 'none';
    searchButton.style.fontSize = '20px';
    searchButton.style.cursor = 'pointer';
    searchButton.style.opacity = '0.7';
    searchButton.style.transition = 'opacity 0.2s';
    searchButton.style.position = 'absolute';
    searchButton.style.right = '140px';
    searchButton.style.top = '50%';
    searchButton.style.transform = 'translateY(-50%)';
    
    // Efeito de hover
    searchButton.addEventListener('mouseover', function() {
        this.style.opacity = '1';
    });
    
    searchButton.addEventListener('mouseout', function() {
        this.style.opacity = '0.7';
    });
    
    // Adicionar botão ao campo de mensagem
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        messageInput.parentNode.style.position = 'relative';
        messageInput.parentNode.appendChild(searchButton);
    }
    
    // Criar painel de pesquisa
    const searchPanel = document.createElement('div');
    searchPanel.id = 'searchPanel';
    searchPanel.style.position = 'fixed';
    searchPanel.style.top = '0';
    searchPanel.style.left = '0';
    searchPanel.style.width = '100%';
    searchPanel.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
    searchPanel.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
    searchPanel.style.padding = '10px';
    searchPanel.style.zIndex = '1000';
    searchPanel.style.display = 'none';
    
    // Adicionar campo de pesquisa
    const searchForm = document.createElement('form');
    searchForm.className = 'search-form';
    searchForm.style.display = 'flex';
    searchForm.style.alignItems = 'center';
    searchForm.style.gap = '10px';
    
    // Ícone de pesquisa
    const searchIcon = document.createElement('div');
    searchIcon.innerHTML = '🔍';
    searchIcon.style.fontSize = '20px';
    searchForm.appendChild(searchIcon);
    
    // Campo de texto
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.id = 'searchInput';
    searchInput.placeholder = 'Pesquisar mensagens...';
    searchInput.style.flex = '1';
    searchInput.style.padding = '8px';
    searchInput.style.border = 'none';
    searchInput.style.borderBottom = '1px solid #ddd';
    searchInput.style.fontSize = '16px';
    searchForm.appendChild(searchInput);
    
    // Botão de fechar
    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.innerHTML = '✕';
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.fontSize = '20px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.opacity = '0.7';
    closeButton.style.transition = 'opacity 0.2s';
    
    closeButton.addEventListener('click', function() {
        hideSearchPanel();
    });
    
    searchForm.appendChild(closeButton);
    searchPanel.appendChild(searchForm);
    
    // Adicionar resultados da pesquisa
    const searchResults = document.createElement('div');
    searchResults.id = 'searchResults';
    searchResults.style.maxHeight = '300px';
    searchResults.style.overflowY = 'auto';
    searchResults.style.marginTop = '10px';
    searchResults.style.display = 'none';
    searchPanel.appendChild(searchResults);
    
    // Adicionar painel ao corpo do documento
    document.body.appendChild(searchPanel);
    
    // Adicionar evento de clique ao botão de pesquisa
    searchButton.addEventListener('click', function() {
        showSearchPanel();
    });
    
    // Adicionar evento de envio ao formulário de pesquisa
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
            searchMessages(searchTerm);
        }
    });
    
    // Adicionar evento de tecla ao campo de pesquisa
    searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Escape') {
            hideSearchPanel();
        } else {
            const searchTerm = this.value.trim();
            if (searchTerm.length >= 2) {
                searchMessages(searchTerm);
            } else {
                searchResults.style.display = 'none';
            }
        }
    });
    
    // Função para mostrar o painel de pesquisa
    function showSearchPanel() {
        searchPanel.style.display = 'block';
        searchInput.focus();
    }
    
    // Função para ocultar o painel de pesquisa
    function hideSearchPanel() {
        searchPanel.style.display = 'none';
        searchResults.style.display = 'none';
        searchInput.value = '';
    }
    
    // Função para pesquisar mensagens
    function searchMessages(searchTerm) {
        // Verificar se há um chat ativo
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) {
            showNoResults('Nenhum chat ativo.');
            return;
        }
        
        // Obter todas as mensagens
        const messages = chatMessages.querySelectorAll('.message');
        if (messages.length === 0) {
            showNoResults('Nenhuma mensagem para pesquisar.');
            return;
        }
        
        // Filtrar mensagens que contêm o termo de pesquisa
        const results = [];
        
        messages.forEach((message, index) => {
            const messageText = message.querySelector('.message-text');
            if (messageText) {
                const text = messageText.textContent.toLowerCase();
                if (text.includes(searchTerm.toLowerCase())) {
                    results.push({
                        element: message,
                        text: messageText.textContent,
                        index: index
                    });
                }
            }
        });
        
        // Mostrar resultados
        if (results.length > 0) {
            showResults(results, searchTerm);
        } else {
            showNoResults(`Nenhum resultado encontrado para "${searchTerm}".`);
        }
    }
    
    // Função para mostrar resultados da pesquisa
    function showResults(results, searchTerm) {
        searchResults.innerHTML = '';
        searchResults.style.display = 'block';
        
        // Adicionar cabeçalho
        const header = document.createElement('div');
        header.className = 'search-results-header';
        header.textContent = `${results.length} resultado(s) encontrado(s)`;
        header.style.fontWeight = 'bold';
        header.style.marginBottom = '10px';
        header.style.padding = '5px';
        header.style.borderBottom = '1px solid #ddd';
        searchResults.appendChild(header);
        
        // Adicionar resultados
        results.forEach(result => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            resultItem.style.padding = '10px';
            resultItem.style.borderBottom = '1px solid #eee';
            resultItem.style.cursor = 'pointer';
            resultItem.style.transition = 'background-color 0.2s';
            
            // Destacar termo de pesquisa
            const highlightedText = result.text.replace(
                new RegExp(searchTerm, 'gi'),
                match => `<span style="background-color: yellow; font-weight: bold;">${match}</span>`
            );
            
            resultItem.innerHTML = highlightedText;
            
            // Efeito de hover
            resultItem.addEventListener('mouseover', function() {
                this.style.backgroundColor = '#f5f5f5';
            });
            
            resultItem.addEventListener('mouseout', function() {
                this.style.backgroundColor = 'transparent';
            });
            
            // Adicionar evento de clique para rolar até a mensagem
            resultItem.addEventListener('click', function() {
                scrollToMessage(result.element);
                highlightMessage(result.element);
            });
            
            searchResults.appendChild(resultItem);
        });
    }
    
    // Função para mostrar mensagem de nenhum resultado
    function showNoResults(message) {
        searchResults.innerHTML = '';
        searchResults.style.display = 'block';
        
        const noResults = document.createElement('div');
        noResults.className = 'search-no-results';
        noResults.textContent = message;
        noResults.style.padding = '20px';
        noResults.style.textAlign = 'center';
        noResults.style.color = '#666';
        
        searchResults.appendChild(noResults);
    }
    
    // Função para rolar até a mensagem
    function scrollToMessage(messageElement) {
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            // Calcular posição da mensagem
            const messageRect = messageElement.getBoundingClientRect();
            const chatRect = chatMessages.getBoundingClientRect();
            
            // Rolar até a mensagem
            chatMessages.scrollTop = messageElement.offsetTop - chatMessages.offsetTop - 50;
            
            // Fechar painel de pesquisa
            hideSearchPanel();
        }
    }
    
    // Função para destacar mensagem
    function highlightMessage(messageElement) {
        // Remover destaque de todas as mensagens
        const messages = document.querySelectorAll('.message');
        messages.forEach(message => {
            message.style.boxShadow = '';
            message.style.transition = '';
        });
        
        // Adicionar destaque à mensagem
        messageElement.style.boxShadow = '0 0 10px rgba(255, 215, 0, 0.8)';
        messageElement.style.transition = 'box-shadow 0.3s';
        
        // Remover destaque após 3 segundos
        setTimeout(() => {
            messageElement.style.boxShadow = '';
        }, 3000);
    }
});
