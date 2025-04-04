/**
 * Seletor de contatos para chamadas em grupo
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando seletor de contatos para chamadas');

    // Criar modal de seleção de contatos
    const contactSelectorModal = document.createElement('div');
    contactSelectorModal.id = 'contactSelectorModal';
    contactSelectorModal.style.position = 'fixed';
    contactSelectorModal.style.top = '0';
    contactSelectorModal.style.left = '0';
    contactSelectorModal.style.width = '100%';
    contactSelectorModal.style.height = '100%';
    contactSelectorModal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    contactSelectorModal.style.display = 'none';
    contactSelectorModal.style.justifyContent = 'center';
    contactSelectorModal.style.alignItems = 'center';
    contactSelectorModal.style.zIndex = '2000';

    // Conteúdo do modal
    const modalContent = document.createElement('div');
    modalContent.className = 'contact-selector-content';
    modalContent.style.backgroundColor = 'white';
    modalContent.style.borderRadius = '10px';
    modalContent.style.padding = '20px';
    modalContent.style.width = '90%';
    modalContent.style.maxWidth = '500px';
    modalContent.style.maxHeight = '80vh';
    modalContent.style.overflowY = 'auto';

    // Título do modal
    const modalTitle = document.createElement('h3');
    modalTitle.textContent = 'Selecionar contatos para chamada';
    modalTitle.style.marginTop = '0';
    modalTitle.style.marginBottom = '20px';
    modalTitle.style.textAlign = 'center';
    modalContent.appendChild(modalTitle);

    // Lista de contatos
    const contactsList = document.createElement('div');
    contactsList.className = 'contacts-selector-list';
    contactsList.style.marginBottom = '20px';
    modalContent.appendChild(contactsList);

    // Botões de ação
    const actionContainer = document.createElement('div');
    actionContainer.className = 'contact-selector-actions';
    actionContainer.style.display = 'flex';
    actionContainer.style.justifyContent = 'space-between';

    // Botão de cancelar
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancelar';
    cancelButton.style.padding = '10px 20px';
    cancelButton.style.backgroundColor = '#f5f5f5';
    cancelButton.style.border = 'none';
    cancelButton.style.borderRadius = '5px';
    cancelButton.style.cursor = 'pointer';

    cancelButton.addEventListener('click', function() {
        hideContactSelector();
    });

    actionContainer.appendChild(cancelButton);

    // Botão de iniciar chamada
    const startCallButton = document.createElement('button');
    startCallButton.textContent = 'Iniciar Chamada';
    startCallButton.style.padding = '10px 20px';
    startCallButton.style.backgroundColor = '#1877f2';
    startCallButton.style.color = 'white';
    startCallButton.style.border = 'none';
    startCallButton.style.borderRadius = '5px';
    startCallButton.style.cursor = 'pointer';

    startCallButton.addEventListener('click', function() {
        startGroupCall();
    });

    actionContainer.appendChild(startCallButton);

    modalContent.appendChild(actionContainer);

    // Adicionar conteúdo ao modal
    contactSelectorModal.appendChild(modalContent);

    // Adicionar modal ao corpo do documento
    document.body.appendChild(contactSelectorModal);

    // Variável para armazenar contatos selecionados
    let selectedContacts = [];

    // Função para mostrar o seletor de contatos
    function showContactSelector() {
        // Limpar seleções anteriores
        selectedContacts = [];

        // Atualizar lista de contatos
        updateContactsList();

        // Mostrar modal
        contactSelectorModal.style.display = 'flex';
    }

    // Função para ocultar o seletor de contatos
    function hideContactSelector() {
        contactSelectorModal.style.display = 'none';
    }

    // Função para atualizar a lista de contatos
    function updateContactsList() {
        // Limpar lista
        contactsList.innerHTML = '';

        // Verificar se há contatos online
        if (!window.onlineUsers || window.onlineUsers.length === 0) {
            const noContacts = document.createElement('div');
            noContacts.textContent = 'Nenhum contato online disponível';
            noContacts.style.textAlign = 'center';
            noContacts.style.padding = '20px';
            noContacts.style.color = '#666';
            contactsList.appendChild(noContacts);
            return;
        }

        // Adicionar cada contato online à lista
        window.onlineUsers.forEach(user => {
            // Verificar se o usuário está online
            if (user.online) {
                // Criar item de contato
                const contactItem = document.createElement('div');
                contactItem.className = 'contact-selector-item';
                contactItem.style.display = 'flex';
                contactItem.style.alignItems = 'center';
                contactItem.style.padding = '10px';
                contactItem.style.borderBottom = '1px solid #eee';
                contactItem.style.cursor = 'pointer';

                // Checkbox para seleção
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.style.marginRight = '10px';
                checkbox.dataset.userId = user._id;

                // Adicionar evento de mudança
                checkbox.addEventListener('change', function() {
                    if (this.checked) {
                        selectedContacts.push(user);
                    } else {
                        selectedContacts = selectedContacts.filter(contact => contact._id !== user._id);
                    }

                    // Atualizar botão de iniciar chamada
                    updateStartCallButton();
                });

                contactItem.appendChild(checkbox);

                // Avatar do contato
                const avatar = document.createElement('img');
                avatar.src = user.avatar || 'https://via.placeholder.com/40';
                avatar.alt = user.username;
                avatar.style.width = '40px';
                avatar.style.height = '40px';
                avatar.style.borderRadius = '50%';
                avatar.style.marginRight = '10px';
                contactItem.appendChild(avatar);

                // Nome do contato
                const username = document.createElement('div');
                username.textContent = user.username;
                username.style.flex = '1';
                contactItem.appendChild(username);

                // Indicador de status
                const statusIndicator = document.createElement('div');
                statusIndicator.className = 'status-indicator online';
                statusIndicator.style.width = '10px';
                statusIndicator.style.height = '10px';
                statusIndicator.style.borderRadius = '50%';
                statusIndicator.style.backgroundColor = '#4CAF50';
                contactItem.appendChild(statusIndicator);

                // Adicionar evento de clique para selecionar/desselecionar
                contactItem.addEventListener('click', function(e) {
                    if (e.target !== checkbox) {
                        checkbox.checked = !checkbox.checked;

                        // Disparar evento de mudança
                        const event = new Event('change');
                        checkbox.dispatchEvent(event);
                    }
                });

                // Adicionar à lista
                contactsList.appendChild(contactItem);
            }
        });
    }

    // Função para atualizar o botão de iniciar chamada
    function updateStartCallButton() {
        startCallButton.textContent = selectedContacts.length > 0
            ? `Iniciar Chamada (${selectedContacts.length})`
            : 'Iniciar Chamada';

        startCallButton.disabled = selectedContacts.length === 0;
        startCallButton.style.opacity = selectedContacts.length === 0 ? '0.5' : '1';
    }

    // Função para iniciar chamada em grupo
    function startGroupCall() {
        if (selectedContacts.length === 0) {
            alert('Selecione pelo menos um contato para iniciar a chamada');
            return;
        }

        console.log(`Iniciando chamada em grupo com ${selectedContacts.length} contatos`);

        // Enviar notificação de chamada para cada contato selecionado
        if (window.socket) {
            // Verificar se temos informações do usuário
            const callerName = window.userInfo ? window.userInfo.username : 'Usuário';

            selectedContacts.forEach(contact => {
                console.log(`Enviando notificação de chamada para ${contact.username}`);
                window.socket.emit('callUser', {
                    targetUserId: contact._id,
                    callerName: callerName
                });
            });
        } else {
            console.error('Socket não disponível para enviar notificação de chamada');
        }

        // Criar interface de chamada
        const callUI = document.createElement('div');
        callUI.id = 'callUI';
        callUI.style.position = 'fixed';
        callUI.style.top = '0';
        callUI.style.left = '0';
        callUI.style.width = '100%';
        callUI.style.height = '100%';
        callUI.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        callUI.style.display = 'flex';
        callUI.style.flexDirection = 'column';
        callUI.style.alignItems = 'center';
        callUI.style.justifyContent = 'center';
        callUI.style.zIndex = '2000';

        // Conteúdo da interface de chamada
        let callContent = `
            <div style="text-align: center; color: white;">
                <h2 style="margin-bottom: 20px; color: white;">Chamada em Grupo</h2>
                <div style="display: flex; flex-wrap: wrap; justify-content: center; margin-bottom: 30px;">
        `;

        // Adicionar avatares dos participantes
        selectedContacts.forEach(contact => {
            callContent += `
                <div style="margin: 10px; text-align: center;">
                    <div style="width: 60px; height: 60px; border-radius: 50%; background-color: #1877f2; margin: 0 auto 5px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                        <img src="${contact.avatar || 'https://via.placeholder.com/60'}" alt="${contact.username}" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    <div style="font-size: 12px;">${contact.username}</div>
                </div>
            `;
        });

        callContent += `
                </div>
                <p style="margin-bottom: 30px; color: #ccc;">Chamando...</p>
                <div style="font-family: monospace; font-size: 24px; margin-bottom: 30px; color: white;">00:00</div>
                <button id="endGroupCallButton" style="width: 60px; height: 60px; border-radius: 50%; background-color: #f44336; border: none; color: white; font-size: 24px; cursor: pointer;">
                    <i class="fas fa-phone-slash"></i>
                </button>
            </div>
        `;

        callUI.innerHTML = callContent;

        // Adicionar interface ao corpo do documento
        document.body.appendChild(callUI);

        // Adicionar evento de clique ao botão de encerrar chamada
        document.getElementById('endGroupCallButton').addEventListener('click', function() {
            callUI.remove();
        });

        // Simular chamada rejeitada após 3 segundos
        setTimeout(() => {
            alert('Nenhum contato atendeu a chamada');
            callUI.remove();
        }, 3000);

        // Ocultar seletor de contatos
        hideContactSelector();
    }

    // Expor funções globalmente
    window.showContactSelector = showContactSelector;
    window.hideContactSelector = hideContactSelector;
});
