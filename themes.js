/**
 * Sistema de temas personalizados para o chat
 */
document.addEventListener('DOMContentLoaded', function() {
    // Elementos principais
    const themeToggleBtn = document.createElement('button');
    themeToggleBtn.id = 'themeToggleBtn';
    themeToggleBtn.className = 'sidebar-btn theme-btn';
    themeToggleBtn.innerHTML = '<i class="fas fa-palette"></i><span>Temas</span>';
    themeToggleBtn.title = 'Mudar tema';

    // Temas disponíveis
    const themes = [
        { id: 'default', name: 'Padrão', icon: '🌈' },
        { id: 'dark', name: 'Escuro', icon: '🌙' },
        { id: 'midnight', name: 'Meia-noite', icon: '✨' },
        { id: 'ocean', name: 'Oceano', icon: '🌊' },
        { id: 'forest', name: 'Floresta', icon: '🌲' },
        { id: 'sunset', name: 'Pôr do Sol', icon: '🌇' },
        { id: 'lavender', name: 'Lavanda', icon: '🌼' },
        { id: 'coffee', name: 'Café', icon: '☕' }
    ];

    // Tema atual
    let currentTheme = localStorage.getItem('theme') || 'default';

    // Aplicar tema salvo
    applyTheme(currentTheme);

    // Adicionar botão à sidebar
    const profileActions = document.querySelector('.profile-actions');
    if (profileActions) {
        profileActions.appendChild(themeToggleBtn);
    }

    // Adicionar evento de clique para abrir o seletor de temas
    themeToggleBtn.addEventListener('click', function() {
        openThemeSelector();
    });

    /**
     * Abre o seletor de temas
     */
    function openThemeSelector() {
        // Verificar se o seletor já existe
        let themeSelector = document.getElementById('themeSelector');

        if (themeSelector) {
            // Se já existe, apenas alternar visibilidade
            themeSelector.classList.toggle('show');
            return;
        }

        // Criar o seletor de temas
        themeSelector = document.createElement('div');
        themeSelector.id = 'themeSelector';
        themeSelector.className = 'theme-selector';

        // Adicionar título
        const title = document.createElement('h3');
        title.textContent = 'Escolha um tema';
        themeSelector.appendChild(title);

        // Adicionar temas
        const themeGrid = document.createElement('div');
        themeGrid.className = 'theme-grid';

        themes.forEach(theme => {
            const themeItem = document.createElement('div');
            themeItem.className = `theme-item ${theme.id === currentTheme ? 'active' : ''}`;
            themeItem.dataset.theme = theme.id;

            themeItem.innerHTML = `
                <div class="theme-icon">${theme.icon}</div>
                <div class="theme-name">${theme.name}</div>
            `;

            // Adicionar evento de clique
            themeItem.addEventListener('click', function() {
                // Atualizar tema atual
                currentTheme = theme.id;
                localStorage.setItem('theme', currentTheme);

                // Atualizar classe ativa
                document.querySelectorAll('.theme-item').forEach(item => {
                    item.classList.remove('active');
                });
                themeItem.classList.add('active');

                // Aplicar tema
                applyTheme(currentTheme);

                // Fechar seletor após um breve delay
                setTimeout(() => {
                    themeSelector.classList.remove('show');
                }, 300);
            });

            themeGrid.appendChild(themeItem);
        });

        themeSelector.appendChild(themeGrid);

        // Adicionar botão para fechar
        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-theme-selector';
        closeBtn.innerHTML = '<i class="fas fa-times"></i>';
        closeBtn.addEventListener('click', function() {
            themeSelector.classList.remove('show');
        });

        themeSelector.appendChild(closeBtn);

        // Adicionar ao corpo do documento
        document.body.appendChild(themeSelector);

        // Mostrar o seletor
        setTimeout(() => {
            themeSelector.classList.add('show');
        }, 10);

        // Fechar ao clicar fora
        document.addEventListener('click', function closeThemeSelector(e) {
            if (!themeSelector.contains(e.target) && e.target !== themeToggleBtn) {
                themeSelector.classList.remove('show');
                document.removeEventListener('click', closeThemeSelector);
            }
        });
    }

    /**
     * Aplica o tema selecionado
     */
    function applyTheme(themeId) {
        // Remover classes de tema anteriores
        document.body.classList.remove(
            'dark-mode',
            'theme-midnight',
            'theme-ocean',
            'theme-forest',
            'theme-sunset',
            'theme-lavender',
            'theme-coffee'
        );

        // Aplicar o tema selecionado
        switch (themeId) {
            case 'dark':
                document.body.classList.add('dark-mode');
                break;
            case 'midnight':
                document.body.classList.add('theme-midnight');
                break;
            case 'ocean':
                document.body.classList.add('theme-ocean');
                break;
            case 'forest':
                document.body.classList.add('theme-forest');
                break;
            case 'sunset':
                document.body.classList.add('theme-sunset');
                break;
            case 'lavender':
                document.body.classList.add('theme-lavender');
                break;
            case 'coffee':
                document.body.classList.add('theme-coffee');
                break;
            default:
                // Tema padrão, não adiciona classe
                break;
        }

        // Atualizar ícone do botão de modo escuro
        const darkModeBtn = document.getElementById('darkModeBtn');
        if (darkModeBtn) {
            if (themeId === 'dark' || themeId === 'midnight') {
                darkModeBtn.querySelector('i').className = 'fas fa-sun';
                darkModeBtn.querySelector('span').textContent = 'Modo Claro';
            } else {
                darkModeBtn.querySelector('i').className = 'fas fa-moon';
                darkModeBtn.querySelector('span').textContent = 'Modo Escuro';
            }
        }
    }

    // Adicionar estilos para os temas
    const style = document.createElement('style');
    style.textContent = `
        /* Seletor de temas */
        .theme-selector {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0.9);
            background-color: white;
            border-radius: 12px;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
            padding: 20px;
            z-index: 1000;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s;
            max-width: 90%;
            width: 400px;
        }

        .theme-selector.show {
            opacity: 1;
            visibility: visible;
            transform: translate(-50%, -50%) scale(1);
        }

        .theme-selector h3 {
            margin-top: 0;
            margin-bottom: 15px;
            text-align: center;
            color: #333;
            font-size: 18px;
        }

        .theme-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
        }

        .theme-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 10px;
            border-radius: 8px;
            cursor: pointer;
            transition: background-color 0.2s;
        }

        .theme-item:hover {
            background-color: #f5f5f5;
        }

        .theme-item.active {
            background-color: #e7f3ff;
            border: 2px solid #1877f2;
        }

        .theme-icon {
            font-size: 24px;
            margin-bottom: 5px;
        }

        .theme-name {
            font-size: 12px;
            color: #333;
        }

        .close-theme-selector {
            position: absolute;
            top: 10px;
            right: 10px;
            background: none;
            border: none;
            color: #666;
            font-size: 16px;
            cursor: pointer;
            padding: 5px;
            border-radius: 50%;
        }

        .close-theme-selector:hover {
            background-color: rgba(0, 0, 0, 0.05);
        }

        /* Tema Meia-noite (Midnight) - Azul escuro elegante */
        .theme-midnight {
            --primary-color: #3a4a6d;
            --primary-hover: #2c3a57;
            --secondary-color: #4a5f8b;
            --text-color: #e0e6f2;
            --text-secondary: #a0b0d0;
            --bg-primary: #1a2133;
            --bg-secondary: #2a3347;
            --border-color: #3a4a6d;
            --sent-message-bg: #4a5f8b;
            --received-message-bg: #2a3347;
            --hover-color: rgba(255, 255, 255, 0.1);
            --active-color: #4a5f8b;
            --input-bg: #2a3347;
            --input-text: #e0e6f2;
            --input-placeholder: #a0b0d0;
            --input-border: #3a4a6d;
            --scrollbar-thumb: #4a5f8b;
            --scrollbar-track: #2a3347;
            --notification-bg: #4a5f8b;
            --notification-text: #e0e6f2;
        }

        /* Tema Oceano (Ocean) - Tons de azul e turquesa */
        .theme-ocean {
            --primary-color: #0288d1;
            --primary-hover: #0277bd;
            --secondary-color: #4fc3f7;
            --text-color: #263238;
            --text-secondary: #546e7a;
            --bg-primary: #e1f5fe;
            --bg-secondary: #ffffff;
            --border-color: #b3e5fc;
            --sent-message-bg: #0288d1;
            --received-message-bg: #e1f5fe;
            --hover-color: rgba(79, 195, 247, 0.2);
            --active-color: #4fc3f7;
            --input-bg: #ffffff;
            --input-text: #263238;
            --input-placeholder: #90a4ae;
            --input-border: #b3e5fc;
            --scrollbar-thumb: #4fc3f7;
            --scrollbar-track: #e1f5fe;
            --notification-bg: #0288d1;
            --notification-text: #ffffff;
        }

        /* Tema Floresta (Forest) - Tons de verde e marrom */
        .theme-forest {
            --primary-color: #2e7d32;
            --primary-hover: #1b5e20;
            --secondary-color: #81c784;
            --text-color: #212121;
            --text-secondary: #555555;
            --bg-primary: #e8f5e9;
            --bg-secondary: #ffffff;
            --border-color: #c8e6c9;
            --sent-message-bg: #2e7d32;
            --received-message-bg: #e8f5e9;
            --hover-color: rgba(129, 199, 132, 0.2);
            --active-color: #81c784;
            --input-bg: #ffffff;
            --input-text: #212121;
            --input-placeholder: #757575;
            --input-border: #c8e6c9;
            --scrollbar-thumb: #81c784;
            --scrollbar-track: #e8f5e9;
            --notification-bg: #2e7d32;
            --notification-text: #ffffff;
        }

        /* Tema Pôr do Sol (Sunset) - Tons de laranja e vermelho */
        .theme-sunset {
            --primary-color: #e64a19;
            --primary-hover: #d84315;
            --secondary-color: #ffab91;
            --text-color: #212121;
            --text-secondary: #555555;
            --bg-primary: #fbe9e7;
            --bg-secondary: #ffffff;
            --border-color: #ffccbc;
            --sent-message-bg: #e64a19;
            --received-message-bg: #fbe9e7;
            --hover-color: rgba(255, 171, 145, 0.2);
            --active-color: #ffab91;
            --input-bg: #ffffff;
            --input-text: #212121;
            --input-placeholder: #757575;
            --input-border: #ffccbc;
            --scrollbar-thumb: #ffab91;
            --scrollbar-track: #fbe9e7;
            --notification-bg: #e64a19;
            --notification-text: #ffffff;
        }

        /* Tema Lavanda (Lavender) - Tons de roxo e lilás */
        .theme-lavender {
            --primary-color: #7b1fa2;
            --primary-hover: #6a1b9a;
            --secondary-color: #ce93d8;
            --text-color: #212121;
            --text-secondary: #555555;
            --bg-primary: #f3e5f5;
            --bg-secondary: #ffffff;
            --border-color: #e1bee7;
            --sent-message-bg: #7b1fa2;
            --received-message-bg: #f3e5f5;
            --hover-color: rgba(206, 147, 216, 0.2);
            --active-color: #ce93d8;
            --input-bg: #ffffff;
            --input-text: #212121;
            --input-placeholder: #757575;
            --input-border: #e1bee7;
            --scrollbar-thumb: #ce93d8;
            --scrollbar-track: #f3e5f5;
            --notification-bg: #7b1fa2;
            --notification-text: #ffffff;
        }

        /* Tema Café (Coffee) - Tons de marrom e bege */
        .theme-coffee {
            --primary-color: #795548;
            --primary-hover: #5d4037;
            --secondary-color: #bcaaa4;
            --text-color: #212121;
            --text-secondary: #555555;
            --bg-primary: #efebe9;
            --bg-secondary: #ffffff;
            --border-color: #d7ccc8;
            --sent-message-bg: #795548;
            --received-message-bg: #efebe9;
            --hover-color: rgba(188, 170, 164, 0.2);
            --active-color: #bcaaa4;
            --input-bg: #ffffff;
            --input-text: #212121;
            --input-placeholder: #757575;
            --input-border: #d7ccc8;
            --scrollbar-thumb: #bcaaa4;
            --scrollbar-track: #efebe9;
            --notification-bg: #795548;
            --notification-text: #ffffff;
        }

        /* Aplicação dos temas */
        .theme-midnight,
        .theme-ocean,
        .theme-forest,
        .theme-sunset,
        .theme-lavender,
        .theme-coffee {
            color: var(--text-color);
            background-color: var(--bg-primary);
        }

        /* Sidebar */
        .theme-midnight .sidebar,
        .theme-ocean .sidebar,
        .theme-forest .sidebar,
        .theme-sunset .sidebar,
        .theme-lavender .sidebar,
        .theme-coffee .sidebar {
            background-color: var(--bg-secondary);
            border-right: 1px solid var(--border-color);
        }

        /* Profile sidebar */
        .theme-midnight .profile-sidebar,
        .theme-ocean .profile-sidebar,
        .theme-forest .profile-sidebar,
        .theme-sunset .profile-sidebar,
        .theme-lavender .profile-sidebar,
        .theme-coffee .profile-sidebar {
            background-color: var(--primary-color);
            color: white;
            border-bottom: 1px solid var(--border-color);
        }

        /* Profile avatar */
        .theme-midnight .profile-avatar span,
        .theme-ocean .profile-avatar span,
        .theme-forest .profile-avatar span,
        .theme-sunset .profile-avatar span,
        .theme-lavender .profile-avatar span,
        .theme-coffee .profile-avatar span {
            color: white;
        }

        /* Sidebar buttons */
        .theme-midnight .sidebar-btn,
        .theme-ocean .sidebar-btn,
        .theme-forest .sidebar-btn,
        .theme-sunset .sidebar-btn,
        .theme-lavender .sidebar-btn,
        .theme-coffee .sidebar-btn {
            color: white;
        }

        .theme-midnight .sidebar-btn:hover,
        .theme-ocean .sidebar-btn:hover,
        .theme-forest .sidebar-btn:hover,
        .theme-sunset .sidebar-btn:hover,
        .theme-lavender .sidebar-btn:hover,
        .theme-coffee .sidebar-btn:hover {
            background-color: var(--hover-color);
        }

        /* Search input */
        .theme-midnight .search-container input,
        .theme-ocean .search-container input,
        .theme-forest .search-container input,
        .theme-sunset .search-container input,
        .theme-lavender .search-container input,
        .theme-coffee .search-container input {
            background-color: var(--input-bg);
            color: var(--input-text);
            border: 1px solid var(--input-border);
        }

        .theme-midnight .search-container input::placeholder,
        .theme-ocean .search-container input::placeholder,
        .theme-forest .search-container input::placeholder,
        .theme-sunset .search-container input::placeholder,
        .theme-lavender .search-container input::placeholder,
        .theme-coffee .search-container input::placeholder {
            color: var(--input-placeholder);
        }

        /* Contacts */
        .theme-midnight .contact,
        .theme-ocean .contact,
        .theme-forest .contact,
        .theme-sunset .contact,
        .theme-lavender .contact,
        .theme-coffee .contact {
            border-bottom: 1px solid var(--border-color);
        }

        .theme-midnight .contact:hover,
        .theme-ocean .contact:hover,
        .theme-forest .contact:hover,
        .theme-sunset .contact:hover,
        .theme-lavender .contact:hover,
        .theme-coffee .contact:hover {
            background-color: var(--hover-color);
        }

        .theme-midnight .contact.active,
        .theme-ocean .contact.active,
        .theme-forest .contact.active,
        .theme-sunset .contact.active,
        .theme-lavender .contact.active,
        .theme-coffee .contact.active {
            background-color: var(--active-color);
            border-left: 3px solid var(--primary-color);
        }

        .theme-midnight .contact-info h3,
        .theme-ocean .contact-info h3,
        .theme-forest .contact-info h3,
        .theme-sunset .contact-info h3,
        .theme-lavender .contact-info h3,
        .theme-coffee .contact-info h3 {
            color: var(--text-color);
        }

        .theme-midnight .contact-info p,
        .theme-ocean .contact-info p,
        .theme-forest .contact-info p,
        .theme-sunset .contact-info p,
        .theme-lavender .contact-info p,
        .theme-coffee .contact-info p {
            color: var(--text-secondary);
        }

        /* Chat area */
        .theme-midnight .chat-container,
        .theme-ocean .chat-container,
        .theme-forest .chat-container,
        .theme-sunset .chat-container,
        .theme-lavender .chat-container,
        .theme-coffee .chat-container {
            background-color: var(--bg-primary);
        }

        .theme-midnight .chat-header,
        .theme-ocean .chat-header,
        .theme-forest .chat-header,
        .theme-sunset .chat-header,
        .theme-lavender .chat-header,
        .theme-coffee .chat-header {
            background-color: var(--bg-secondary);
            border-bottom: 1px solid var(--border-color);
        }

        .theme-midnight .chat-header h3,
        .theme-ocean .chat-header h3,
        .theme-forest .chat-header h3,
        .theme-sunset .chat-header h3,
        .theme-lavender .chat-header h3,
        .theme-coffee .chat-header h3 {
            color: var(--text-color);
        }

        /* Messages */
        .theme-midnight .message,
        .theme-ocean .message,
        .theme-forest .message,
        .theme-sunset .message,
        .theme-lavender .message,
        .theme-coffee .message {
            background-color: var(--received-message-bg);
            color: var(--text-color);
        }

        .theme-midnight .message.sent,
        .theme-ocean .message.sent,
        .theme-forest .message.sent,
        .theme-sunset .message.sent,
        .theme-lavender .message.sent,
        .theme-coffee .message.sent {
            background-color: var(--sent-message-bg);
            color: white;
        }

        .theme-midnight .message-time,
        .theme-ocean .message-time,
        .theme-forest .message-time,
        .theme-sunset .message-time,
        .theme-lavender .message-time,
        .theme-coffee .message-time {
            color: var(--text-secondary);
        }

        .theme-midnight .message.sent .message-time,
        .theme-ocean .message.sent .message-time,
        .theme-forest .message.sent .message-time,
        .theme-sunset .message.sent .message-time,
        .theme-lavender .message.sent .message-time,
        .theme-coffee .message.sent .message-time {
            color: rgba(255, 255, 255, 0.8);
        }

        /* Input area */
        .theme-midnight .chat-input-container,
        .theme-ocean .chat-input-container,
        .theme-forest .chat-input-container,
        .theme-sunset .chat-input-container,
        .theme-lavender .chat-input-container,
        .theme-coffee .chat-input-container {
            background-color: var(--bg-secondary);
            border-top: 1px solid var(--border-color);
        }

        .theme-midnight .chat-input-container textarea,
        .theme-ocean .chat-input-container textarea,
        .theme-forest .chat-input-container textarea,
        .theme-sunset .chat-input-container textarea,
        .theme-lavender .chat-input-container textarea,
        .theme-coffee .chat-input-container textarea {
            background-color: var(--input-bg);
            color: var(--input-text);
            border: 1px solid var(--input-border);
        }

        .theme-midnight .chat-input-container textarea::placeholder,
        .theme-ocean .chat-input-container textarea::placeholder,
        .theme-forest .chat-input-container textarea::placeholder,
        .theme-sunset .chat-input-container textarea::placeholder,
        .theme-lavender .chat-input-container textarea::placeholder,
        .theme-coffee .chat-input-container textarea::placeholder {
            color: var(--input-placeholder);
        }

        .theme-midnight .chat-input-container button,
        .theme-ocean .chat-input-container button,
        .theme-forest .chat-input-container button,
        .theme-sunset .chat-input-container button,
        .theme-lavender .chat-input-container button,
        .theme-coffee .chat-input-container button {
            background-color: var(--primary-color);
            color: white;
        }

        .theme-midnight .chat-input-container button:hover,
        .theme-ocean .chat-input-container button:hover,
        .theme-forest .chat-input-container button:hover,
        .theme-sunset .chat-input-container button:hover,
        .theme-lavender .chat-input-container button:hover,
        .theme-coffee .chat-input-container button:hover {
            background-color: var(--primary-hover);
        }

        /* Scrollbar */
        .theme-midnight *::-webkit-scrollbar-thumb,
        .theme-ocean *::-webkit-scrollbar-thumb,
        .theme-forest *::-webkit-scrollbar-thumb,
        .theme-sunset *::-webkit-scrollbar-thumb,
        .theme-lavender *::-webkit-scrollbar-thumb,
        .theme-coffee *::-webkit-scrollbar-thumb {
            background-color: var(--scrollbar-thumb);
        }

        .theme-midnight *::-webkit-scrollbar-track,
        .theme-ocean *::-webkit-scrollbar-track,
        .theme-forest *::-webkit-scrollbar-track,
        .theme-sunset *::-webkit-scrollbar-track,
        .theme-lavender *::-webkit-scrollbar-track,
        .theme-coffee *::-webkit-scrollbar-track {
            background-color: var(--scrollbar-track);
        }

        /* Notifications */
        .theme-midnight .notification,
        .theme-ocean .notification,
        .theme-forest .notification,
        .theme-sunset .notification,
        .theme-lavender .notification,
        .theme-coffee .notification {
            background-color: var(--notification-bg);
            color: var(--notification-text);
        }

        /* Welcome screen */
        .theme-midnight .welcome-card,
        .theme-ocean .welcome-card,
        .theme-forest .welcome-card,
        .theme-sunset .welcome-card,
        .theme-lavender .welcome-card,
        .theme-coffee .welcome-card {
            background-color: var(--bg-secondary);
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
        }

        .theme-midnight .welcome-card h3,
        .theme-ocean .welcome-card h3,
        .theme-forest .welcome-card h3,
        .theme-sunset .welcome-card h3,
        .theme-lavender .welcome-card h3,
        .theme-coffee .welcome-card h3 {
            color: var(--primary-color);
            border-bottom: 2px solid var(--border-color);
        }

        .theme-midnight .welcome-card p,
        .theme-ocean .welcome-card p,
        .theme-forest .welcome-card p,
        .theme-sunset .welcome-card p,
        .theme-lavender .welcome-card p,
        .theme-coffee .welcome-card p {
            color: var(--text-secondary);
        }

        /* Modo escuro para o seletor de temas */
        .dark-mode .theme-selector {
            background-color: #2d2d2d;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.4);
        }

        .dark-mode .theme-selector h3 {
            color: #e0e0e0;
        }

        .dark-mode .theme-item:hover {
            background-color: #3a3a3a;
        }

        .dark-mode .theme-item.active {
            background-color: #1e3a5f;
            border-color: #4a9eff;
        }

        .dark-mode .theme-name {
            color: #e0e0e0;
        }

        .dark-mode .close-theme-selector {
            color: #b0b0b0;
        }

        .dark-mode .close-theme-selector:hover {
            background-color: rgba(255, 255, 255, 0.1);
        }

        /* Responsividade */
        @media (max-width: 768px) {
            .theme-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }
    `;
    document.head.appendChild(style);
});
