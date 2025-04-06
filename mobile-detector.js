/**
 * Script para detecção de dispositivos móveis e adaptação da interface
 */

// Variáveis globais
let isMobileDevice = false;
let isMobileView = false;
let isChatActive = false;

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
    
    // Determinar se devemos usar a visualização móvel
    isMobileDevice = isMobile || isTablet;
    
    // Registrar informações sobre o dispositivo
    console.log('Detecção de dispositivo:', {
        userAgent,
        isMobile,
        isTablet,
        isWindows,
        isMac,
        isIOS,
        isAndroid,
        isMobileWidth,
        isMobileDevice
    });
    
    return {
        isMobile,
        isTablet,
        isWindows,
        isMac,
        isIOS,
        isAndroid,
        isMobileWidth,
        isMobileDevice
    };
}

// Função para ativar o modo móvel
function activateMobileView() {
    if (isMobileView) return; // Já está ativo
    
    console.log('Ativando visualização móvel');
    
    // Adicionar classe ao body
    document.body.classList.add('mobile-view');
    
    // Criar barra de navegação móvel se não existir
    createMobileNavBar();
    
    // Adicionar botão de voltar aos cabeçalhos de chat
    addBackButtons();
    
    // Atualizar estado
    isMobileView = true;
    
    // Disparar evento
    window.dispatchEvent(new CustomEvent('mobileViewActivated'));
}

// Função para desativar o modo móvel
function deactivateMobileView() {
    if (!isMobileView) return; // Já está desativado
    
    console.log('Desativando visualização móvel');
    
    // Remover classe do body
    document.body.classList.remove('mobile-view');
    document.body.classList.remove('chat-active');
    
    // Remover barra de navegação móvel
    const mobileNav = document.querySelector('.mobile-nav');
    if (mobileNav) {
        mobileNav.remove();
    }
    
    // Remover botões de voltar
    const backButtons = document.querySelectorAll('.back-to-contacts');
    backButtons.forEach(button => button.remove());
    
    // Atualizar estado
    isMobileView = false;
    isChatActive = false;
    
    // Disparar evento
    window.dispatchEvent(new CustomEvent('mobileViewDeactivated'));
}

// Função para criar a barra de navegação móvel
function createMobileNavBar() {
    // Verificar se já existe
    if (document.querySelector('.mobile-nav')) return;
    
    // Criar barra de navegação
    const navBar = document.createElement('div');
    navBar.className = 'mobile-nav';
    
    // Adicionar itens de navegação
    navBar.innerHTML = `
        <a href="#" class="nav-item active" data-nav="contacts">
            <i class="fas fa-users"></i>
            <span>Contatos</span>
        </a>
        <a href="#" class="nav-item" data-nav="chat">
            <i class="fas fa-comment"></i>
            <span>Chat</span>
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
                alert('Selecione um contato para iniciar uma chamada');
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
}

// Função para mostrar o chat
function showChat() {
    document.body.classList.add('chat-active');
    isChatActive = true;
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
    
    // Adicionar opções
    settingsMenu.innerHTML = `
        <div style="background-color: white; width: 80%; max-width: 400px; border-radius: 10px; padding: 20px; color: black;">
            <h2 style="text-align: center; margin-bottom: 20px;">Configurações</h2>
            
            <div style="margin-bottom: 15px;">
                <label style="display: flex; align-items: center; cursor: pointer;">
                    <input type="checkbox" id="darkModeToggle" ${document.body.classList.contains('dark-mode') ? 'checked' : ''} style="margin-right: 10px;">
                    Modo Escuro
                </label>
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: flex; align-items: center; cursor: pointer;">
                    <input type="checkbox" id="desktopModeToggle" ${!isMobileView ? 'checked' : ''} style="margin-right: 10px;">
                    Modo Desktop
                </label>
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: flex; align-items: center; cursor: pointer;">
                    <input type="checkbox" id="notificationsToggle" checked style="margin-right: 10px;">
                    Notificações
                </label>
            </div>
            
            <div style="margin-top: 20px; text-align: center;">
                <button id="logoutButton" style="background-color: #ff4d4d; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                    Sair
                </button>
                <button id="closeSettingsButton" style="background-color: #ddd; color: black; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-left: 10px;">
                    Fechar
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
    // Adicionar botão de voltar ao cabeçalho do chat
    const chatHeaders = document.querySelectorAll('.chat-header');
    
    chatHeaders.forEach(header => {
        // Verificar se já existe um botão de voltar
        if (header.querySelector('.back-to-contacts')) return;
        
        // Criar botão de voltar
        const backButton = document.createElement('button');
        backButton.className = 'back-to-contacts';
        backButton.innerHTML = '<i class="fas fa-arrow-left"></i>';
        backButton.title = 'Voltar para contatos';
        
        // Adicionar evento
        backButton.addEventListener('click', function() {
            showContacts();
        });
        
        // Adicionar ao início do cabeçalho
        header.insertBefore(backButton, header.firstChild);
    });
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

// Inicializar quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando detector de dispositivos móveis');
    
    // Detectar tipo de dispositivo
    const deviceInfo = detectMobileDevice();
    
    // Verificar tamanho da tela e aplicar modo apropriado
    checkScreenSize();
    
    // Adicionar evento para redimensionamento da janela
    window.addEventListener('resize', function() {
        checkScreenSize();
    });
    
    // Adicionar evento para quando um chat é iniciado
    document.addEventListener('chatStarted', function() {
        if (isMobileView) {
            showChat();
            
            // Atualizar navegação
            const navItems = document.querySelectorAll('.nav-item');
            navItems.forEach(item => {
                item.classList.remove('active');
                if (item.getAttribute('data-nav') === 'chat') {
                    item.classList.add('active');
                }
            });
            
            // Adicionar botão de voltar se necessário
            addBackButtons();
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
    showChat
};
