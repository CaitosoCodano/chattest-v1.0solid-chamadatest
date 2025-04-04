/**
 * Correção para a lista de contatos
 */
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se os elementos necessários existem
    const contactsList = document.getElementById('contactsList');
    const darkModeBtn = document.getElementById('darkModeBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    if (!contactsList || !darkModeBtn || !logoutBtn) {
        console.error('Elementos necessários não encontrados');
        return;
    }

    console.log('Aplicando correções para a lista de contatos e botões');

    // Corrigir o botão de modo escuro
    darkModeBtn.onclick = function() {
        console.log('Botão de modo escuro clicado');
        // Alternar a classe dark-mode no body
        document.body.classList.toggle('dark-mode');

        // Salvar a preferência do usuário
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('darkMode', 'enabled');
            this.querySelector('i').className = 'fas fa-sun';
            this.querySelector('span').textContent = 'Modo Claro';
        } else {
            localStorage.setItem('darkMode', 'disabled');
            this.querySelector('i').className = 'fas fa-moon';
            this.querySelector('span').textContent = 'Modo Escuro';
        }
    };

    // Verificar preferência salva
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
        darkModeBtn.querySelector('i').className = 'fas fa-sun';
        darkModeBtn.querySelector('span').textContent = 'Modo Claro';
    }

    // Corrigir o botão de logout
    logoutBtn.onclick = function() {
        console.log('Botão de logout clicado');

        // Desconectar socket
        if (window.socket) {
            window.socket.disconnect();
        }

        // Limpar dados da sessão
        sessionStorage.removeItem('userInfo');
        localStorage.removeItem('lastChat');

        // Redirecionar para login
        window.location.href = 'login.html';
    };

    // Garantir que a função sendMessage esteja disponível globalmente
    if (typeof window.sendMessage !== 'function') {
        window.sendMessage = function() {
            console.log('Usando função sendMessage global');

            // Obter elementos necessários
            const messageInput = document.getElementById('messageInput');
            const chatMessages = document.getElementById('chatMessages');

            // Verificar se há um usuário selecionado e uma mensagem para enviar
            if (!window.currentChatUser || !messageInput.value.trim()) {
                return;
            }

            const messageContent = messageInput.value.trim();
            console.log(`Enviando mensagem para ${window.currentChatUser.username}: ${messageContent}`);

            // Criar elemento de mensagem
            const messageElement = document.createElement('div');
            messageElement.className = 'message sent';

            // Formatar data e hora
            const messageDate = new Date();
            const formattedTime = messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            messageElement.innerHTML = `
                <div class="message-content">
                    <p>${messageContent}</p>
                    <span class="message-time">${formattedTime}</span>
                </div>
            `;

            // Adicionar mensagem à conversa
            chatMessages.appendChild(messageElement);

            // Rolar para a última mensagem
            chatMessages.scrollTop = chatMessages.scrollHeight;

            // Limpar campo de entrada
            messageInput.value = '';

            // Enviar mensagem para o servidor
            if (window.socket) {
                window.socket.emit('sendMessage', {
                    receiverId: window.currentChatUser._id,
                    content: messageContent
                });
            } else {
                // Tentar enviar mensagem via fetch
                fetch('/api/messages', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${window.userInfo.token}`
                    },
                    body: JSON.stringify({
                        receiverId: window.currentChatUser._id,
                        content: messageContent
                    })
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Mensagem enviada com sucesso:', data);
                })
                .catch(error => {
                    console.error('Erro ao enviar mensagem:', error);
                    alert('Erro ao enviar mensagem. Por favor, tente novamente.');
                });
            }
        };
    }

    // Garantir que a função startChatWith esteja disponível globalmente
    if (typeof window.startChatWith !== 'function') {
        window.startChatWith = function(user) {
            console.log(`Iniciando chat com ${user.username} (ID: ${user._id}) via função global`);

            // Obter elementos necessários
            const chatHeader = document.getElementById('chatHeader');
            const chatMessages = document.getElementById('chatMessages');
            const welcomeScreen = document.getElementById('welcomeScreen');
            const systemWelcome = document.getElementById('systemWelcome');
            const activeChat = document.getElementById('activeChat');

            // Definir usuário atual
            window.currentChatUser = user;

            // Salvar a última conversa no localStorage para persistência
            localStorage.setItem('lastChat', JSON.stringify(user));
            sessionStorage.setItem('lastChat', JSON.stringify(user));

            // Usar a URL de avatar armazenada ou gerar uma nova
            const avatarUrl = user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`;

            // Determinar o status do usuário
            let statusClass = 'offline';
            let statusText = 'Offline';

            if (user.status) {
                statusClass = user.status;
                if (user.status === 'online') {
                    statusText = 'Online';
                } else if (user.status === 'away') {
                    statusText = 'Ausente';
                } else {
                    statusText = 'Offline';
                }
            } else if (user.online !== undefined) {
                statusClass = user.online ? 'online' : 'offline';
                statusText = user.online ? 'Online' : 'Offline';
            }

            // Atualizar cabeçalho do chat
            chatHeader.innerHTML = `
                <img src="${avatarUrl}" alt="${user.username}">
                <div class="chat-user-info">
                    <h3>${user.username}</h3>
                    <div class="user-status-container">
                        <span class="status-indicator ${statusClass}"></span>
                        <p class="status-text ${statusClass}">${statusText}</p>
                    </div>
                </div>
            `;

            // Mostrar área de chat e esconder telas de boas-vindas
            welcomeScreen.style.display = 'none';
            systemWelcome.style.display = 'none';
            activeChat.style.display = 'flex';

            // Limpar contador de mensagens não lidas
            if (window.unreadMessageCounts && window.unreadMessageCounts[user._id]) {
                delete window.unreadMessageCounts[user._id];
            }

            // Atualizar o elemento na interface
            const contactElement = contactsList.querySelector(`[data-user-id="${user._id}"]`);
            if (contactElement) {
                const unreadBadge = contactElement.querySelector('.unread-badge');
                if (unreadBadge) {
                    unreadBadge.style.display = 'none';
                }
            }

            // Carregar mensagens
            if (typeof window.loadMessages === 'function') {
                window.loadMessages(user._id, true);
            } else {
                // Tentar carregar mensagens manualmente
                fetch(`/api/messages/${user._id}?markAsRead=true`, {
                    headers: {
                        'Authorization': `Bearer ${window.userInfo.token}`
                    }
                })
                .then(response => response.json())
                .then(messages => {
                    console.log(`Recebidas ${messages.length} mensagens do servidor`);

                    if (messages.length === 0) {
                        chatMessages.innerHTML = '<div class="no-messages">Nenhuma mensagem ainda. Diga olá!</div>';
                    } else {
                        // Exibir mensagens
                        chatMessages.innerHTML = '';

                        // Ordenar mensagens por data
                        const sortedMessages = [...messages].sort((a, b) =>
                            new Date(a.createdAt) - new Date(b.createdAt)
                        );

                        sortedMessages.forEach(message => {
                            const isMyMessage = message.sender._id === window.userInfo._id;
                            const messageElement = document.createElement('div');
                            messageElement.className = `message ${isMyMessage ? 'sent' : 'received'}`;

                            // Formatar data e hora
                            const messageDate = new Date(message.createdAt);
                            const formattedTime = messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                            messageElement.innerHTML = `
                                <div class="message-content">
                                    <p>${message.content}</p>
                                    <span class="message-time">${formattedTime}</span>
                                </div>
                            `;

                            chatMessages.appendChild(messageElement);
                        });

                        // Rolar para a última mensagem
                        chatMessages.scrollTop = chatMessages.scrollHeight;
                    }
                })
                .catch(error => {
                    console.error('Erro ao carregar mensagens:', error);
                    chatMessages.innerHTML = '<div class="error-message">Erro ao carregar mensagens. Tente novamente.</div>';
                });
            }
        };
    }

    // Configurar o botão de enviar mensagem
    const sendButton = document.getElementById('sendButton');
    const messageInput = document.getElementById('messageInput');

    if (sendButton && messageInput) {
        // Adicionar evento de clique para o botão de enviar mensagem
        sendButton.onclick = function() {
            console.log('Botão de enviar mensagem clicado');
            if (typeof window.sendMessage === 'function') {
                window.sendMessage();
            } else if (typeof sendMessage === 'function') {
                sendMessage();
            } else {
                console.error('Função sendMessage não encontrada');
                alert('Erro ao enviar mensagem. Por favor, recarregue a página.');
            }
        };

        // Adicionar evento de tecla para enviar mensagem com Enter
        messageInput.onkeypress = function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (typeof window.sendMessage === 'function') {
                    window.sendMessage();
                } else if (typeof sendMessage === 'function') {
                    sendMessage();
                } else {
                    console.error('Função sendMessage não encontrada');
                    alert('Erro ao enviar mensagem. Por favor, recarregue a página.');
                }
            }
        };
    }

    // Definir a função updateContactsList globalmente
    window.updateContactsList = function(users, unreadCounts = {}) {
        console.log('Usando versão corrigida de updateContactsList');

        // Limpar lista de contatos
        contactsList.innerHTML = '';

        console.log('Atualizando lista de contatos com:', users);
        console.log('Atualizando lista de contatos com contagens:', unreadCounts);

        // Atualizar contagens de mensagens não lidas
        window.unreadMessageCounts = {};

        // Adicionar apenas contagens válidas
        for (const key in unreadCounts) {
            if (unreadCounts[key] > 0) {
                window.unreadMessageCounts[key] = unreadCounts[key];
            }
        }

        console.log('Contagens atualizadas:', window.unreadMessageCounts);

        // Adicionar cada usuário à lista
        const userList = Array.isArray(users) ? users : (users.users || []);
        console.log('Lista de usuários processada:', userList);

        if (userList.length === 0) {
            console.log('Nenhum usuário online encontrado');
            contactsList.innerHTML = '<div class="no-contacts">Nenhum usuário online no momento</div>';
            return;
        }

        // Adicionar cada usuário à lista
        userList.forEach(user => {
            // Verificar se o usuário está online e não é o próprio usuário
            if ((!window.userInfo || user._id !== window.userInfo._id) && user.online) {
                // Verificar se há mensagens não lidas deste usuário
                const unreadCount = window.unreadMessageCounts[user._id] || 0;

                // Criar elemento de contato
                const contact = document.createElement('div');
                contact.className = 'contact';
                contact.dataset.userId = user._id;
                contact.dataset.username = user.username;

                // Usar uma URL de avatar fixa baseada no nome de usuário
                const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`;

                // Adicionar o avatar ao objeto do usuário para uso futuro
                user.avatarUrl = avatarUrl;

                // Simplificar para usar apenas online/offline
                let statusClass = 'offline';
                let statusText = 'Offline';

                // Verificar se o usuário está online (verificar ambas as propriedades)
                if (user.online === true || user.status === 'online') {
                    statusClass = 'online';
                    statusText = 'Online';
                    // Garantir que a propriedade online seja true para consistência
                    user.online = true;
                } else {
                    // Garantir que a propriedade online seja false para consistência
                    user.online = false;
                }

                console.log(`Usuário ${user.username} tem status: ${statusClass} (${statusText})`);

                contact.innerHTML = `
                    <img src="${avatarUrl}" alt="${user.username}">
                    <div class="contact-info">
                        <h3>${user.username}</h3>
                        <p class="status-text ${statusClass}">${statusText}</p>
                    </div>
                    <div class="contact-indicators">
                        <span class="status-indicator ${statusClass}"></span>
                        <span class="unread-badge" style="display: ${unreadCount > 0 ? 'flex' : 'none'}">${unreadCount}</span>
                    </div>
                `;

                // Adicionar evento de clique para iniciar chat - Implementação direta
                contact.onclick = function() {
                    console.log(`Clique no contato ${user.username} (ID: ${user._id})`);

                    // Verificar se o usuário está online antes de iniciar o chat
                    if (user.online === true || user.status === 'online') {
                        // Verificar se a função startChatWith existe
                        if (typeof startChatWith === 'function') {
                            startChatWith(user);
                        } else if (typeof window.startChatWith === 'function') {
                            window.startChatWith(user);
                        } else {
                            console.error('Função startChatWith não encontrada');
                            alert('Erro ao iniciar chat. Por favor, recarregue a página.');
                        }
                    } else {
                        // Mostrar mensagem de erro
                        alert(`${user.username} não está online no momento.`);
                    }
                };

                contactsList.appendChild(contact);
            }
        });
    };
});
