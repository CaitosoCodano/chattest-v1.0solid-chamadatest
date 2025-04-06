/**
 * Script para detecção de dispositivos móveis e adaptação da interface
 * Versão 2.0 - Redesenhado para uma experiência verdadeiramente mobile
 */

// Variáveis globais
let isMobileDevice = false;
let isMobileView = false;
let isChatActive = false;
let deviceInfo = {};

// Função para detectar dispositivo móvel
function detectMobileDevice() {
    // Verificar se é um dispositivo móvel usando User Agent
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // Regex para detectar dispositivos móveis
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

    // Verificar se é um dispositivo móvel
    const isMobile = mobileRegex.test(userAgent);

    // Verificar se é um tablet (iPad ou tablet Android)
    const isTablet = /iPad|Android(?!.*Mobile)/i.test(userAgent);

    // Verificar se é um dispositivo Windows
    const isWindows = /Windows NT|Win64|Win32/i.test(userAgent);

    // Verificar se é um dispositivo Mac
    const isMac = /Macintosh|MacIntel|MacPPC|Mac68K/i.test(userAgent);

    // Verificar se é um dispositivo iOS
    const isIOS = /iPhone|iPad|iPod/i.test(userAgent);

    // Verificar se é um dispositivo Android
    const isAndroid = /Android/i.test(userAgent);

    // Verificar se é um dispositivo móvel com base na largura da tela
    const isMobileWidth = window.innerWidth <= 768;

    // Verificar orientação da tela
    const isLandscape = window.matchMedia('(orientation: landscape)').matches;
    const isPortrait = window.matchMedia('(orientation: portrait)').matches;

    // Determinar se devemos usar a visualização móvel
    isMobileDevice = isMobile || isTablet || isMobileWidth;

    // Salvar informações do dispositivo
    deviceInfo = {
        userAgent,
        isMobile,
        isTablet,
        isWindows,
        isMac,
        isIOS,
        isAndroid,
        isMobileWidth,
        isLandscape,
        isPortrait,
        isMobileDevice,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        pixelRatio: window.devicePixelRatio || 1
    };

    // Registrar informações sobre o dispositivo
    console.log('Detecção de dispositivo:', deviceInfo);

    return deviceInfo;
}

// Função para ativar o modo móvel
function activateMobileView() {
    if (isMobileView) return; // Já está ativo

    console.log('Ativando visualização móvel');

    // Adicionar classe ao body
    document.body.classList.add('mobile-view');

    // Reorganizar a estrutura do DOM para o layout mobile
    reorganizeDOM();

    // Criar barra de navegação móvel se não existir
    createMobileNavBar();

    // Adicionar botão de voltar aos cabeçalhos de chat
    addBackButtons();

    // Atualizar estado
    isMobileView = true;

    // Adicionar listeners para eventos específicos de mobile
    addMobileEventListeners();

    // Disparar evento
    window.dispatchEvent(new CustomEvent('mobileViewActivated', { detail: deviceInfo }));

    // Mostrar notificação de modo mobile
    showMobileNotification();
}

// Função para desativar o modo móvel
function deactivateMobileView() {
    if (!isMobileView) return; // Já está desativado

    console.log('Desativando visualização móvel');

    // Remover classe do body
    document.body.classList.remove('mobile-view');
    document.body.classList.remove('chat-active');

    // Restaurar a estrutura original do DOM
    restoreDOM();

    // Remover barra de navegação móvel
    const mobileNav = document.querySelector('.mobile-nav');
    if (mobileNav) {
        mobileNav.remove();
    }

    // Remover botões de voltar
    const backButtons = document.querySelectorAll('.mobile-back-button');
    backButtons.forEach(button => button.remove());

    // Remover listeners de eventos específicos de mobile
    removeMobileEventListeners();

    // Atualizar estado
    isMobileView = false;
    isChatActive = false;

    // Disparar evento
    window.dispatchEvent(new CustomEvent('mobileViewDeactivated', { detail: deviceInfo }));
}

// Função para reorganizar o DOM para layout mobile
function reorganizeDOM() {
    // Verificar se já foi reorganizado
    if (document.querySelector('.contacts-page')) return;

    console.log('Reorganizando DOM para layout mobile');

    // Obter elementos principais
    const container = document.querySelector('.container');
    const sidebar = document.querySelector('.sidebar');
    const chatContainer = document.querySelector('.chat-container');

    if (!container || !sidebar) {
        console.log('Elementos principais não encontrados, não é possível reorganizar');
        return;
    }

    // Criar página de contatos
    const contactsPage = document.createElement('div');
    contactsPage.className = 'page contacts-page';

    // Criar cabeçalho de contatos
    const contactsHeader = document.createElement('div');
    contactsHeader.className = 'mobile-header';
    contactsHeader.innerHTML = `
        <h1 class="mobile-header-title">Contatos</h1>
        <button class="mobile-header-button theme-toggle">
            <i class="fas fa-moon"></i>
        </button>
    `;

    // Adicionar evento para alternar tema
    const themeToggle = contactsHeader.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            const isDarkMode = document.body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isDarkMode ? 'true' : 'false');

            // Atualizar ícone
            const icon = this.querySelector('i');
            if (icon) {
                icon.className = isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
            }
        });

        // Definir ícone inicial
        const isDarkMode = document.body.classList.contains('dark-mode');
        const icon = themeToggle.querySelector('i');
        if (icon) {
            icon.className = isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    // Criar container de contatos
    const contactsContainer = document.createElement('div');
    contactsContainer.className = 'contacts-container';

    // Mover lista de contatos para o novo container
    if (sidebar) {
        // Clonar a lista de contatos para preservar os eventos
        const contactList = sidebar.querySelector('.contact-list');
        if (contactList) {
            contactsContainer.appendChild(contactList.cloneNode(true));
        }
    }

    // Montar página de contatos
    contactsPage.appendChild(contactsHeader);
    contactsPage.appendChild(contactsContainer);

    // Criar página de chat
    const chatPage = document.createElement('div');
    chatPage.className = 'page chat-page';

    // Criar cabeçalho de chat
    const chatHeader = document.createElement('div');
    chatHeader.className = 'mobile-header';
    chatHeader.innerHTML = `
        <button class="mobile-header-button mobile-back-button">
            <i class="fas fa-arrow-left"></i>
        </button>
        <h1 class="mobile-header-title">Chat</h1>
        <button class="mobile-header-button call-button">
            <i class="fas fa-phone"></i>
        </button>
        <button class="mobile-header-button menu-button">
            <i class="fas fa-ellipsis-v"></i>
        </button>
    `;

    // Adicionar evento para botão de voltar
    const backButton = chatHeader.querySelector('.mobile-back-button');
    if (backButton) {
        backButton.addEventListener('click', function() {
            showContacts();
        });
    }

    // Adicionar evento para botão de chamada
    const callButton = chatHeader.querySelector('.call-button');
    if (callButton) {
        callButton.addEventListener('click', function() {
            if (window.currentChatUser && window.webrtcCall && typeof window.webrtcCall.startCall === 'function') {
                window.webrtcCall.startCall(window.currentChatUser._id, window.currentChatUser.username);
            } else {
                alert('Selecione um contato para iniciar uma chamada');
            }
        });
    }

    // Adicionar evento para botão de menu
    const menuButton = chatHeader.querySelector('.menu-button');
    if (menuButton) {
        menuButton.addEventListener('click', function() {
            // Implementar menu de opções
            const chatMenuBtn = document.getElementById('chatMenuBtn');
            if (chatMenuBtn) {
                chatMenuBtn.click();
            }
        });
    }

    // Mover conteúdo do chat para a nova página
    if (chatContainer) {
        // Clonar o conteúdo do chat para preservar os eventos
        const chatContent = document.createElement('div');
        chatContent.className = 'chat-content';

        // Clonar mensagens e input
        const messagesContainer = chatContainer.querySelector('.messages-container');
        const messageInputContainer = chatContainer.querySelector('.message-input-container');

        if (messagesContainer) {
            chatContent.appendChild(messagesContainer.cloneNode(true));
        }

        if (messageInputContainer) {
            chatContent.appendChild(messageInputContainer.cloneNode(true));
        }

        chatPage.appendChild(chatHeader);
        chatPage.appendChild(chatContent);
    }

    // Limpar container principal
    if (container) {
        container.innerHTML = '';

        // Adicionar páginas ao container
        container.appendChild(contactsPage);
        container.appendChild(chatPage);
    }

    // Restaurar eventos
    restoreEvents();
}

// Função para restaurar a estrutura original do DOM
function restoreDOM() {
    // Implementar se necessário
    console.log('Restaurando DOM para layout desktop');
}

// Função para restaurar eventos após reorganização do DOM
function restoreEvents() {
    // Restaurar eventos de clique nos contatos
    const contactItems = document.querySelectorAll('.contact-item');
    contactItems.forEach(item => {
        item.addEventListener('click', function() {
            const userId = this.getAttribute('data-user-id');
            const username = this.getAttribute('data-username');

            if (userId && username) {
                // Atualizar título do chat
                const chatTitle = document.querySelector('.chat-page .mobile-header-title');
                if (chatTitle) {
                    chatTitle.textContent = username;
                }

                // Mostrar chat
                showChat();

                // Iniciar chat com o usuário selecionado
                if (window.startChat && typeof window.startChat === 'function') {
                    window.startChat(userId, username);
                }
            }
        });
    });
}

// Função para adicionar listeners de eventos específicos para mobile
function addMobileEventListeners() {
    // Adicionar listener para orientação da tela
    window.addEventListener('orientationchange', handleOrientationChange);

    // Adicionar listener para redimensionamento da tela
    window.addEventListener('resize', handleResize);

    // Adicionar listener para eventos de toque
    document.addEventListener('touchstart', handleTouchStart);
}

// Função para remover listeners de eventos específicos para mobile
function removeMobileEventListeners() {
    // Remover listener para orientação da tela
    window.removeEventListener('orientationchange', handleOrientationChange);

    // Remover listener para redimensionamento da tela
    window.removeEventListener('resize', handleResize);

    // Remover listener para eventos de toque
    document.removeEventListener('touchstart', handleTouchStart);
}

// Função para lidar com mudança de orientação da tela
function handleOrientationChange() {
    console.log('Orientação da tela alterada');

    // Atualizar informações do dispositivo
    detectMobileDevice();
}

// Função para lidar com redimensionamento da tela
function handleResize() {
    // Atualizar informações do dispositivo
    detectMobileDevice();

    // Verificar se devemos ativar ou desativar o modo mobile
    checkScreenSize();
}

// Variáveis para controle de gestos
let touchStartX = 0;
let touchStartY = 0;

// Função para lidar com eventos de toque
function handleTouchStart(e) {
    // Salvar posição inicial do toque
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;

    // Adicionar listeners para movimento e fim do toque
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
}

// Função para lidar com movimento de toque
function handleTouchMove(e) {
    // Implementar se necessário
}

// Função para lidar com fim de toque
function handleTouchEnd(e) {
    // Calcular distância do movimento
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    // Verificar se foi um gesto horizontal
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        // Gesto da direita para a esquerda (abrir chat)
        if (deltaX < 0 && !isChatActive && window.currentChatUser) {
            showChat();
        }
        // Gesto da esquerda para a direita (voltar para contatos)
        else if (deltaX > 0 && isChatActive) {
            showContacts();
        }
    }

    // Remover listeners
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
}

// Função para mostrar notificação de modo mobile
function showMobileNotification() {
    // Verificar se já mostramos a notificação antes
    if (localStorage.getItem('mobileNotificationShown') === 'true') {
        return;
    }

    // Criar notificação
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas fa-mobile-alt"></i>
        </div>
        <div class="notification-content">
            <h3 class="notification-title">Modo Mobile Ativado</h3>
            <p class="notification-message">Interface otimizada para dispositivos móveis.</p>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;

    // Adicionar evento para fechar notificação
    const closeButton = notification.querySelector('.notification-close');
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            notification.remove();
            localStorage.setItem('mobileNotificationShown', 'true');
        });
    }

    // Adicionar notificação ao body
    document.body.appendChild(notification);

    // Remover notificação após 5 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
            localStorage.setItem('mobileNotificationShown', 'true');
        }
    }, 5000);
}

// Função para criar a barra de navegação móvel
function createMobileNavBar() {
    // Verificar se já existe
    if (document.querySelector('.mobile-nav')) return;

    // Criar barra de navegação
    const navBar = document.createElement('div');
    navBar.className = 'mobile-nav';

    // Obter contagem de mensagens não lidas
    let unreadCount = 0;
    try {
        const unreadCounts = JSON.parse(localStorage.getItem('unreadCounts') || '{}');
        unreadCount = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);
    } catch (e) {
        console.error('Erro ao obter contagem de mensagens não lidas:', e);
    }

    // Adicionar itens de navegação
    navBar.innerHTML = `
        <a href="#" class="nav-item active" data-nav="contacts">
            <i class="fas fa-users"></i>
            <span>Contatos</span>
        </a>
        <a href="#" class="nav-item" data-nav="chat">
            <i class="fas fa-comment"></i>
            <span>Chat</span>
            ${unreadCount > 0 ? `<span class="nav-badge">${unreadCount}</span>` : ''}
        </a>
        <a href="#" class="nav-item" data-nav="call">
            <i class="fas fa-phone"></i>
            <span>Chamada</span>
        </a>
        <a href="#" class="nav-item" data-nav="settings">
            <i class="fas fa-cog"></i>
            <span>Ajustes</span>
        </a>
    `;

    // Adicionar eventos aos itens de navegação
    navBar.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();

            // Remover classe active de todos os itens
            navBar.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));

            // Adicionar classe active ao item clicado
            this.classList.add('active');

            // Executar ação com base no item clicado
            const navType = this.getAttribute('data-nav');
            handleNavigation(navType);
        });
    });

    // Adicionar ao body
    document.body.appendChild(navBar);
}

// Função para lidar com a navegação móvel
function handleNavigation(navType) {
    switch (navType) {
        case 'contacts':
            showContacts();
            break;
        case 'chat':
            if (window.currentChatUser) {
                showChat();
            } else {
                alert('Selecione um contato para iniciar um chat');
            }
            break;
        case 'call':
            if (window.currentChatUser) {
                if (window.webrtcCall && typeof window.webrtcCall.startCall === 'function') {
                    window.webrtcCall.startCall(window.currentChatUser._id, window.currentChatUser.username);
                } else {
                    alert('Função de chamada não disponível');
                }
            } else {
                // Abrir ambiente de teste de chamada
                window.open('voice-call-test.html', '_blank');
            }
            break;
        case 'settings':
            toggleSettings();
            break;
    }
}

// Função para mostrar a lista de contatos
function showContacts() {
    document.body.classList.remove('chat-active');
    isChatActive = false;

    // Atualizar navegação
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-nav') === 'contacts') {
            item.classList.add('active');
        }
    });
}

// Função para mostrar o chat
function showChat() {
    document.body.classList.add('chat-active');
    isChatActive = true;

    // Atualizar navegação
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-nav') === 'chat') {
            item.classList.add('active');
        }
    });

    // Rolar para o final das mensagens
    const messagesContainer = document.querySelector('.messages-container');
    if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

// Função para alternar configurações
function toggleSettings() {
    // Implementar menu de configurações
    const settingsMenu = document.createElement('div');
    settingsMenu.className = 'settings-menu';
    settingsMenu.style.position = 'fixed';
    settingsMenu.style.top = '0';
    settingsMenu.style.left = '0';
    settingsMenu.style.width = '100%';
    settingsMenu.style.height = '100%';
    settingsMenu.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    settingsMenu.style.zIndex = '1000';
    settingsMenu.style.display = 'flex';
    settingsMenu.style.flexDirection = 'column';
    settingsMenu.style.alignItems = 'center';
    settingsMenu.style.justifyContent = 'center';

    // Determinar cores com base no modo escuro
    const isDarkMode = document.body.classList.contains('dark-mode');
    const bgColor = isDarkMode ? '#1e1e1e' : 'white';
    const textColor = isDarkMode ? '#e4e6eb' : 'black';
    const borderColor = isDarkMode ? '#3a3b3c' : '#ddd';

    // Adicionar opções
    settingsMenu.innerHTML = `
        <div style="background-color: ${bgColor}; width: 80%; max-width: 400px; border-radius: 10px; padding: 20px; color: ${textColor}; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
            <h2 style="text-align: center; margin-bottom: 20px;">Configurações</h2>

            <div style="margin-bottom: 15px; padding: 10px; border-bottom: 1px solid ${borderColor};">
                <label style="display: flex; align-items: center; cursor: pointer;">
                    <input type="checkbox" id="darkModeToggle" ${isDarkMode ? 'checked' : ''} style="margin-right: 10px;">
                    <span style="flex: 1;">Modo Escuro</span>
                    <i class="fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}" style="margin-left: 10px;"></i>
                </label>
            </div>

            <div style="margin-bottom: 15px; padding: 10px; border-bottom: 1px solid ${borderColor};">
                <label style="display: flex; align-items: center; cursor: pointer;">
                    <input type="checkbox" id="desktopModeToggle" ${!isMobileView ? 'checked' : ''} style="margin-right: 10px;">
                    <span style="flex: 1;">Modo Desktop</span>
                    <i class="fas fa-desktop" style="margin-left: 10px;"></i>
                </label>
            </div>

            <div style="margin-bottom: 15px; padding: 10px; border-bottom: 1px solid ${borderColor};">
                <label style="display: flex; align-items: center; cursor: pointer;">
                    <input type="checkbox" id="notificationsToggle" checked style="margin-right: 10px;">
                    <span style="flex: 1;">Notificações</span>
                    <i class="fas fa-bell" style="margin-left: 10px;"></i>
                </label>
            </div>

            <div style="margin-bottom: 15px; padding: 10px; border-bottom: 1px solid ${borderColor};">
                <a href="voice-call-test.html" target="_blank" style="display: flex; align-items: center; text-decoration: none; color: ${textColor}; cursor: pointer;">
                    <span style="flex: 1;">Ambiente de Teste de Chamada</span>
                    <i class="fas fa-external-link-alt" style="margin-left: 10px;"></i>
                </a>
            </div>

            <div style="margin-top: 20px; text-align: center; display: flex; justify-content: space-between;">
                <button id="logoutButton" style="background-color: #ff4d4d; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; flex: 1; margin-right: 10px;">
                    <i class="fas fa-sign-out-alt" style="margin-right: 5px;"></i> Sair
                </button>
                <button id="closeSettingsButton" style="background-color: ${isDarkMode ? '#3a3b3c' : '#ddd'}; color: ${textColor}; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; flex: 1;">
                    <i class="fas fa-times" style="margin-right: 5px;"></i> Fechar
                </button>
            </div>
        </div>
    `;

    // Adicionar eventos
    document.body.appendChild(settingsMenu);

    // Evento para alternar modo escuro
    document.getElementById('darkModeToggle').addEventListener('change', function() {
        if (this.checked) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('darkMode', 'true');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('darkMode', 'false');
        }

        // Fechar e reabrir o menu para atualizar as cores
        settingsMenu.remove();
        toggleSettings();
    });

    // Evento para alternar modo desktop
    document.getElementById('desktopModeToggle').addEventListener('change', function() {
        if (this.checked) {
            deactivateMobileView();
            localStorage.setItem('forceMobileView', 'false');
        } else {
            activateMobileView();
            localStorage.setItem('forceMobileView', 'true');
        }
    });

    // Evento para botão de logout
    document.getElementById('logoutButton').addEventListener('click', function() {
        if (confirm('Tem certeza que deseja sair?')) {
            localStorage.removeItem('token');
            sessionStorage.removeItem('userInfo');
            window.location.href = 'login.html';
        }
    });

    // Evento para fechar menu
    document.getElementById('closeSettingsButton').addEventListener('click', function() {
        settingsMenu.remove();
    });

    // Evento para fechar ao clicar fora
    settingsMenu.addEventListener('click', function(e) {
        if (e.target === settingsMenu) {
            settingsMenu.remove();
        }
    });
}

// Função para adicionar botões de voltar
function addBackButtons() {
    // Já implementado na reorganização do DOM
    console.log('Botões de voltar já adicionados na reorganização do DOM');
}

// Função para verificar e aplicar o modo móvel com base na largura da tela
function checkScreenSize() {
    const width = window.innerWidth;
    const forceMobileView = localStorage.getItem('forceMobileView') === 'true';
    const forceDesktopView = localStorage.getItem('forceMobileView') === 'false';

    // Verificar se devemos forçar um modo específico
    if (forceMobileView) {
        activateMobileView();
    } else if (forceDesktopView) {
        deactivateMobileView();
    } else {
        // Caso contrário, decidir com base na largura da tela e no tipo de dispositivo
        if (width <= 768 || isMobileDevice) {
            activateMobileView();
        } else {
            deactivateMobileView();
        }
    }
}

// Função para aplicar o modo escuro se necessário
function applyDarkMode() {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

// Inicializar quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando detector de dispositivos móveis');

    // Aplicar modo escuro se necessário
    applyDarkMode();

    // Detectar tipo de dispositivo
    detectMobileDevice();

    // Verificar tamanho da tela e aplicar modo apropriado
    checkScreenSize();

    // Adicionar evento para redimensionamento da janela
    window.addEventListener('resize', function() {
        checkScreenSize();
    });

    // Adicionar evento para quando um chat é iniciado
    document.addEventListener('chatStarted', function(e) {
        if (isMobileView) {
            // Atualizar título do chat se disponível
            const chatTitle = document.querySelector('.chat-page .mobile-header-title');
            if (chatTitle && e.detail && e.detail.username) {
                chatTitle.textContent = e.detail.username;
            }

            // Mostrar chat
            showChat();
        }
    });
});

// Exportar funções
window.mobileDetector = {
    isMobileDevice: () => isMobileDevice,
    isMobileView: () => isMobileView,
    activateMobileView,
    deactivateMobileView,
    showContacts,
    showChat,
    toggleSettings,
    deviceInfo: () => deviceInfo
};
