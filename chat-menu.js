/**
 * Menu de opções para o chat
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando menu do chat');

    // Elementos do menu
    const chatMenuBtn = document.getElementById('chatMenuBtn');
    const chatMenuDropdown = document.getElementById('chatMenuDropdown');
    const callBtn = document.getElementById('callBtn');
    const clearChatBtn = document.getElementById('clearChatBtn');
    const selectMessagesBtn = document.getElementById('selectMessagesBtn');

    // Verificar se os elementos existem
    if (!chatMenuBtn || !chatMenuDropdown) {
        console.error('Elementos do menu não encontrados');
        return;
    }

    // Verificar se os botões existem
    if (!clearChatBtn || !selectMessagesBtn) {
        console.error('Botões do menu não encontrados');
    }

    // Evento de clique para o botão de menu
    chatMenuBtn.addEventListener('click', function(e) {
        e.stopPropagation(); // Evitar que o clique se propague para o documento
        chatMenuDropdown.style.display = chatMenuDropdown.style.display === 'block' ? 'none' : 'block';
    });

    // Fechar o menu ao clicar fora dele
    document.addEventListener('click', function(e) {
        if (chatMenuDropdown.style.display === 'block' && !chatMenuDropdown.contains(e.target) && e.target !== chatMenuBtn) {
            chatMenuDropdown.style.display = 'none';
        }
    });

    // Evento de tecla Escape para fechar o menu
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && chatMenuDropdown.style.display === 'block') {
            chatMenuDropdown.style.display = 'none';
        }
    });

    // Iniciar chamada
    callBtn.addEventListener('click', function() {
        console.log('Abrindo seletor de contatos para chamada');

        // Fechar o menu
        chatMenuDropdown.style.display = 'none';

        // Mostrar seletor de contatos
        if (typeof window.showContactSelector === 'function') {
            window.showContactSelector();
        } else {
            console.error('Função showContactSelector não encontrada');
            alert('Erro ao abrir seletor de contatos. Tente novamente.');
        }
    });



    // Limpar conversa
    clearChatBtn.addEventListener('click', function() {
        console.log('Limpando conversa');

        // Fechar o menu
        chatMenuDropdown.style.display = 'none';

        // Verificar se há um chat ativo
        if (!window.currentChatUser) {
            alert('Selecione um contato para limpar a conversa');
            return;
        }

        // Confirmar antes de limpar
        if (confirm(`Deseja realmente limpar a conversa com ${window.currentChatUser.username}?`)) {
            // Limpar mensagens do chat
            const chatMessages = document.getElementById('chatMessages');
            if (chatMessages) {
                chatMessages.innerHTML = '';
            }

            // Limpar mensagens do localStorage
            if (window.userInfo && window.currentChatUser) {
                const chatKey = `chat_${window.userInfo.userId}_${window.currentChatUser._id}`;
                localStorage.removeItem(chatKey);
                console.log(`Conversa com ${window.currentChatUser.username} limpa com sucesso`);
            }
        }
    });

    // Selecionar mensagens
    selectMessagesBtn.addEventListener('click', function() {
        console.log('Selecionando mensagens');

        // Fechar o menu
        chatMenuDropdown.style.display = 'none';

        // Verificar se há um chat ativo
        if (!window.currentChatUser) {
            alert('Selecione um contato para selecionar mensagens');
            return;
        }

        // Verificar se há mensagens
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages || chatMessages.children.length === 0) {
            alert('Não há mensagens para selecionar');
            return;
        }

        // Ativar modo de seleção
        const messages = chatMessages.querySelectorAll('.message');
        let selectionMode = true;
        let selectedMessages = [];

        // Adicionar classe de seleção a todas as mensagens
        messages.forEach(message => {
            message.classList.add('selectable');

            // Adicionar evento de clique para selecionar/desselecionar
            message.addEventListener('click', function() {
                if (!selectionMode) return;

                if (this.classList.contains('selected')) {
                    this.classList.remove('selected');
                    selectedMessages = selectedMessages.filter(m => m !== this);
                } else {
                    this.classList.add('selected');
                    selectedMessages.push(this);
                }

                // Atualizar contador de seleção
                updateSelectionCounter();
            });
        });

        // Criar barra de seleção
        const selectionBar = document.createElement('div');
        selectionBar.className = 'selection-bar';
        selectionBar.style.position = 'fixed';
        selectionBar.style.bottom = '0';
        selectionBar.style.left = '0';
        selectionBar.style.width = '100%';
        selectionBar.style.backgroundColor = '#f5f5f5';
        selectionBar.style.padding = '10px';
        selectionBar.style.boxShadow = '0 -2px 5px rgba(0, 0, 0, 0.1)';
        selectionBar.style.display = 'flex';
        selectionBar.style.justifyContent = 'space-between';
        selectionBar.style.alignItems = 'center';
        selectionBar.style.zIndex = '1000';

        selectionBar.innerHTML = `
            <div class="selection-counter">0 mensagens selecionadas</div>
            <div class="selection-actions">
                <button id="copySelectedBtn" class="selection-action-btn">Copiar</button>
                <button id="deleteSelectedBtn" class="selection-action-btn">Excluir</button>
                <button id="cancelSelectionBtn" class="selection-action-btn">Cancelar</button>
            </div>
        `;

        document.body.appendChild(selectionBar);

        // Estilizar botões
        const actionButtons = selectionBar.querySelectorAll('.selection-action-btn');
        actionButtons.forEach(button => {
            button.style.padding = '5px 10px';
            button.style.marginLeft = '10px';
            button.style.backgroundColor = '#1877f2';
            button.style.color = 'white';
            button.style.border = 'none';
            button.style.borderRadius = '5px';
            button.style.cursor = 'pointer';
        });

        // Função para atualizar contador de seleção
        function updateSelectionCounter() {
            const counter = selectionBar.querySelector('.selection-counter');
            counter.textContent = `${selectedMessages.length} mensagens selecionadas`;
        }

        // Evento de clique para copiar mensagens selecionadas
        document.getElementById('copySelectedBtn').addEventListener('click', function() {
            if (selectedMessages.length === 0) {
                alert('Selecione pelo menos uma mensagem para copiar');
                return;
            }

            // Extrair texto das mensagens selecionadas
            const textToCopy = selectedMessages.map(message => {
                const messageText = message.querySelector('.message-text');
                return messageText ? messageText.textContent : '';
            }).join('\n');

            // Copiar para a área de transferência
            navigator.clipboard.writeText(textToCopy)
                .then(() => {
                    alert('Mensagens copiadas para a área de transferência');
                    exitSelectionMode();
                })
                .catch(err => {
                    console.error('Erro ao copiar mensagens:', err);
                    alert('Erro ao copiar mensagens');
                });
        });

        // Evento de clique para excluir mensagens selecionadas
        document.getElementById('deleteSelectedBtn').addEventListener('click', function() {
            if (selectedMessages.length === 0) {
                alert('Selecione pelo menos uma mensagem para excluir');
                return;
            }

            if (confirm(`Deseja realmente excluir ${selectedMessages.length} mensagens?`)) {
                // Remover mensagens selecionadas
                selectedMessages.forEach(message => {
                    message.remove();
                });

                alert('Mensagens excluídas com sucesso');
                exitSelectionMode();
            }
        });

        // Evento de clique para cancelar seleção
        document.getElementById('cancelSelectionBtn').addEventListener('click', function() {
            exitSelectionMode();
        });

        // Função para sair do modo de seleção
        function exitSelectionMode() {
            selectionMode = false;

            // Remover classe de seleção de todas as mensagens
            messages.forEach(message => {
                message.classList.remove('selectable');
                message.classList.remove('selected');
            });

            // Remover barra de seleção
            selectionBar.remove();
        }
    });
});
