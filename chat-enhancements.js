/**
 * Chat App Enhancements
 * Este arquivo contém melhorias para o Chat App sem modificar o código original
 */

document.addEventListener('DOMContentLoaded', function() {
    // Adicionar animações suaves
    addSmoothAnimations();

    // Melhorar layout responsivo
    enhanceResponsiveLayout();
});



/**
 * Configura o indicador de digitação
 */
function setupTypingIndicator() {
    // Adicionar o HTML do indicador de digitação
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator';
        typingIndicator.innerHTML = `
            <span></span>
            <span></span>
            <span></span>
        `;
        typingIndicator.style.display = 'none';
        chatMessages.appendChild(typingIndicator);

        // Adicionar estilos para o indicador de digitação
        const style = document.createElement('style');
        style.textContent = `
            .typing-indicator {
                display: flex;
                align-items: center;
                margin: 10px;
                padding: 5px 10px;
                font-size: 0.8rem;
                color: #666;
            }

            .typing-indicator span {
                height: 8px;
                width: 8px;
                border-radius: 50%;
                background-color: #666;
                margin: 0 2px;
                display: inline-block;
                animation: pulse 1.5s infinite;
            }

            .typing-indicator span:nth-child(2) {
                animation-delay: 0.2s;
            }

            .typing-indicator span:nth-child(3) {
                animation-delay: 0.4s;
            }

            @keyframes pulse {
                0% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.2); opacity: 0.7; }
                100% { transform: scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        // Configurar eventos de Socket.IO para o indicador de digitação
        setupTypingSocketEvents();
    }
}

/**
 * Configura os eventos de Socket.IO para o indicador de digitação
 */
function setupTypingSocketEvents() {
    // Verificar se o socket já está definido
    if (typeof socket !== 'undefined') {
        // Adicionar evento para o input de mensagem
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            let typingTimeout;

            messageInput.addEventListener('input', function() {
                if (currentChatUser) {
                    // Enviar evento de "está digitando"
                    socket.emit('typing', {
                        receiverId: currentChatUser._id
                    });

                    // Limpar o timeout anterior
                    clearTimeout(typingTimeout);

                    // Definir um novo timeout para parar de digitar após 2 segundos
                    typingTimeout = setTimeout(() => {
                        socket.emit('stopTyping', {
                            receiverId: currentChatUser._id
                        });
                    }, 2000);
                }
            });

            // Adicionar evento para quando o usuário parar de digitar
            messageInput.addEventListener('blur', function() {
                if (currentChatUser) {
                    socket.emit('stopTyping', {
                        receiverId: currentChatUser._id
                    });
                    clearTimeout(typingTimeout);
                }
            });
        }

        // Adicionar eventos para receber notificações de digitação
        socket.on('userTyping', function(data) {
            if (currentChatUser && data.userId === currentChatUser._id) {
                const typingIndicator = document.querySelector('.typing-indicator');
                if (typingIndicator) {
                    typingIndicator.style.display = 'flex';
                }
            }
        });

        socket.on('userStoppedTyping', function(data) {
            if (currentChatUser && data.userId === currentChatUser._id) {
                const typingIndicator = document.querySelector('.typing-indicator');
                if (typingIndicator) {
                    typingIndicator.style.display = 'none';
                }
            }
        });
    }
}

/**
 * Adiciona animações suaves à interface
 */
function addSmoothAnimations() {
    // Adicionar estilos para animações
    const style = document.createElement('style');
    style.textContent = `
        /* Animações para mensagens */
        .message {
            animation: message-appear 0.3s ease-out;
            transition: transform 0.2s, box-shadow 0.2s;
        }

        .message:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        @keyframes message-appear {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* Animações para contatos */
        .contact {
            transition: background-color 0.2s, transform 0.2s;
        }

        .contact:hover {
            transform: translateX(5px);
        }

        /* Animações para notificações */
        .notification {
            animation: slide-in 0.5s ease-out, fade-out 0.5s ease-in 4.5s forwards;
        }

        /* Animações para transições de tela */
        .active-chat, .system-welcome {
            animation: fade-in 0.3s ease-out;
        }

        @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        /* Animação para o botão de enviar */
        .chat-input-container button {
            transition: background-color 0.2s, transform 0.2s;
        }

        .chat-input-container button:hover {
            transform: scale(1.05);
        }

        .chat-input-container button:active {
            transform: scale(0.95);
        }
    `;
    document.head.appendChild(style);
}

/**
 * Melhora o layout responsivo
 */
function enhanceResponsiveLayout() {
    // Adicionar estilos para melhorar o layout responsivo
    const style = document.createElement('style');
    style.textContent = `
        @media (max-width: 768px) {
            .container {
                flex-direction: column;
                height: 100vh;
            }

            .sidebar {
                width: 100%;
                height: auto;
                max-height: 40vh;
                overflow-y: auto;
            }

            .chat-container {
                width: 100%;
                height: 60vh;
            }

            .active-chat {
                height: 100%;
            }

            .chat-messages {
                max-height: calc(60vh - 120px);
            }

            .chat-input-container {
                padding: 8px;
            }

            .chat-input-container textarea {
                height: 40px;
            }

            /* Botão para mostrar/esconder a lista de contatos em dispositivos móveis */
            .mobile-toggle {
                display: block;
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background-color: #1877f2;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
                z-index: 1000;
                cursor: pointer;
            }

            .dark-mode .mobile-toggle {
                background-color: var(--dark-accent);
            }

            /* Classe para esconder a sidebar em dispositivos móveis */
            .sidebar-hidden .sidebar {
                display: none;
            }

            .sidebar-hidden .chat-container {
                height: 100vh;
            }

            .sidebar-hidden .chat-messages {
                max-height: calc(100vh - 120px);
            }
        }

        @media (min-width: 769px) {
            .mobile-toggle {
                display: none;
            }
        }
    `;
    document.head.appendChild(style);

    // Adicionar botão para mostrar/esconder a lista de contatos em dispositivos móveis
    const mobileToggle = document.createElement('div');
    mobileToggle.className = 'mobile-toggle';
    mobileToggle.innerHTML = '<i class="fas fa-users"></i>';
    document.body.appendChild(mobileToggle);

    // Adicionar evento de clique para o botão
    mobileToggle.addEventListener('click', function() {
        document.body.classList.toggle('sidebar-hidden');

        // Alternar o ícone
        if (document.body.classList.contains('sidebar-hidden')) {
            mobileToggle.innerHTML = '<i class="fas fa-users"></i>';
        } else {
            mobileToggle.innerHTML = '<i class="fas fa-comment"></i>';
        }
    });

    // Inicialmente, esconder a sidebar em dispositivos móveis se estiver em uma conversa
    if (window.innerWidth <= 768 && currentChatUser) {
        document.body.classList.add('sidebar-hidden');
    }
}
