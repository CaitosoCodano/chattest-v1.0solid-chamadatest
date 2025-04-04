/**
 * Sistema de enquetes para chat
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando sistema de enquetes');
    
    // Criar botão de enquete
    const pollButton = document.createElement('button');
    pollButton.id = 'pollButton';
    pollButton.innerHTML = '📊';
    pollButton.title = 'Criar enquete';
    pollButton.style.background = 'none';
    pollButton.style.border = 'none';
    pollButton.style.fontSize = '20px';
    pollButton.style.cursor = 'pointer';
    pollButton.style.opacity = '0.7';
    pollButton.style.transition = 'opacity 0.2s';
    pollButton.style.position = 'absolute';
    pollButton.style.right = '170px';
    pollButton.style.top = '50%';
    pollButton.style.transform = 'translateY(-50%)';
    
    // Efeito de hover
    pollButton.addEventListener('mouseover', function() {
        this.style.opacity = '1';
    });
    
    pollButton.addEventListener('mouseout', function() {
        this.style.opacity = '0.7';
    });
    
    // Adicionar botão ao campo de mensagem
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        messageInput.parentNode.style.position = 'relative';
        messageInput.parentNode.appendChild(pollButton);
    }
    
    // Criar modal de criação de enquete
    const pollModal = document.createElement('div');
    pollModal.id = 'pollModal';
    pollModal.style.position = 'fixed';
    pollModal.style.top = '0';
    pollModal.style.left = '0';
    pollModal.style.width = '100%';
    pollModal.style.height = '100%';
    pollModal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    pollModal.style.display = 'none';
    pollModal.style.justifyContent = 'center';
    pollModal.style.alignItems = 'center';
    pollModal.style.zIndex = '2000';
    
    // Conteúdo do modal
    const modalContent = document.createElement('div');
    modalContent.className = 'poll-modal-content';
    modalContent.style.backgroundColor = 'white';
    modalContent.style.borderRadius = '10px';
    modalContent.style.padding = '20px';
    modalContent.style.width = '90%';
    modalContent.style.maxWidth = '500px';
    modalContent.style.maxHeight = '80vh';
    modalContent.style.overflowY = 'auto';
    
    // Título do modal
    const modalTitle = document.createElement('h3');
    modalTitle.textContent = 'Criar Enquete';
    modalTitle.style.marginTop = '0';
    modalTitle.style.marginBottom = '20px';
    modalTitle.style.textAlign = 'center';
    modalContent.appendChild(modalTitle);
    
    // Formulário de enquete
    const pollForm = document.createElement('form');
    pollForm.id = 'pollForm';
    
    // Campo de pergunta
    const questionGroup = document.createElement('div');
    questionGroup.className = 'form-group';
    questionGroup.style.marginBottom = '15px';
    
    const questionLabel = document.createElement('label');
    questionLabel.textContent = 'Pergunta:';
    questionLabel.style.display = 'block';
    questionLabel.style.marginBottom = '5px';
    questionLabel.style.fontWeight = 'bold';
    questionGroup.appendChild(questionLabel);
    
    const questionInput = document.createElement('input');
    questionInput.type = 'text';
    questionInput.id = 'pollQuestion';
    questionInput.placeholder = 'Digite sua pergunta...';
    questionInput.style.width = '100%';
    questionInput.style.padding = '8px';
    questionInput.style.borderRadius = '5px';
    questionInput.style.border = '1px solid #ddd';
    questionGroup.appendChild(questionInput);
    
    pollForm.appendChild(questionGroup);
    
    // Container para opções
    const optionsContainer = document.createElement('div');
    optionsContainer.id = 'pollOptionsContainer';
    optionsContainer.style.marginBottom = '15px';
    
    // Título para opções
    const optionsTitle = document.createElement('div');
    optionsTitle.textContent = 'Opções:';
    optionsTitle.style.fontWeight = 'bold';
    optionsTitle.style.marginBottom = '10px';
    optionsContainer.appendChild(optionsTitle);
    
    // Adicionar opções iniciais
    for (let i = 1; i <= 2; i++) {
        addOptionField(optionsContainer, i);
    }
    
    pollForm.appendChild(optionsContainer);
    
    // Botão para adicionar mais opções
    const addOptionButton = document.createElement('button');
    addOptionButton.type = 'button';
    addOptionButton.id = 'addOptionButton';
    addOptionButton.textContent = '+ Adicionar opção';
    addOptionButton.style.backgroundColor = '#f0f0f0';
    addOptionButton.style.border = 'none';
    addOptionButton.style.borderRadius = '5px';
    addOptionButton.style.padding = '8px 15px';
    addOptionButton.style.marginBottom = '20px';
    addOptionButton.style.cursor = 'pointer';
    
    addOptionButton.addEventListener('click', function() {
        const optionCount = optionsContainer.querySelectorAll('.poll-option').length;
        if (optionCount < 10) {
            addOptionField(optionsContainer, optionCount + 1);
        } else {
            alert('Máximo de 10 opções permitidas.');
        }
    });
    
    pollForm.appendChild(addOptionButton);
    
    // Configurações adicionais
    const settingsGroup = document.createElement('div');
    settingsGroup.className = 'form-group';
    settingsGroup.style.marginBottom = '20px';
    
    // Duração da enquete
    const durationLabel = document.createElement('label');
    durationLabel.textContent = 'Duração da enquete:';
    durationLabel.style.display = 'block';
    durationLabel.style.marginBottom = '5px';
    durationLabel.style.fontWeight = 'bold';
    settingsGroup.appendChild(durationLabel);
    
    const durationSelect = document.createElement('select');
    durationSelect.id = 'pollDuration';
    durationSelect.style.width = '100%';
    durationSelect.style.padding = '8px';
    durationSelect.style.borderRadius = '5px';
    durationSelect.style.border = '1px solid #ddd';
    
    const durations = [
        { value: '1h', text: '1 hora' },
        { value: '3h', text: '3 horas' },
        { value: '6h', text: '6 horas' },
        { value: '12h', text: '12 horas' },
        { value: '24h', text: '1 dia' },
        { value: '48h', text: '2 dias' },
        { value: '72h', text: '3 dias' },
        { value: '168h', text: '1 semana' }
    ];
    
    durations.forEach(duration => {
        const option = document.createElement('option');
        option.value = duration.value;
        option.textContent = duration.text;
        durationSelect.appendChild(option);
    });
    
    settingsGroup.appendChild(durationSelect);
    
    // Permitir múltiplas escolhas
    const multipleChoiceContainer = document.createElement('div');
    multipleChoiceContainer.style.marginTop = '10px';
    
    const multipleChoiceCheckbox = document.createElement('input');
    multipleChoiceCheckbox.type = 'checkbox';
    multipleChoiceCheckbox.id = 'multipleChoice';
    multipleChoiceContainer.appendChild(multipleChoiceCheckbox);
    
    const multipleChoiceLabel = document.createElement('label');
    multipleChoiceLabel.htmlFor = 'multipleChoice';
    multipleChoiceLabel.textContent = ' Permitir múltiplas escolhas';
    multipleChoiceLabel.style.marginLeft = '5px';
    multipleChoiceContainer.appendChild(multipleChoiceLabel);
    
    settingsGroup.appendChild(multipleChoiceContainer);
    
    // Permitir que os participantes vejam os resultados antes de votar
    const showResultsContainer = document.createElement('div');
    showResultsContainer.style.marginTop = '10px';
    
    const showResultsCheckbox = document.createElement('input');
    showResultsCheckbox.type = 'checkbox';
    showResultsCheckbox.id = 'showResults';
    showResultsContainer.appendChild(showResultsCheckbox);
    
    const showResultsLabel = document.createElement('label');
    showResultsLabel.htmlFor = 'showResults';
    showResultsLabel.textContent = ' Mostrar resultados antes de votar';
    showResultsLabel.style.marginLeft = '5px';
    showResultsContainer.appendChild(showResultsLabel);
    
    settingsGroup.appendChild(showResultsContainer);
    
    pollForm.appendChild(settingsGroup);
    
    // Botões de ação
    const actionContainer = document.createElement('div');
    actionContainer.className = 'poll-action-container';
    actionContainer.style.display = 'flex';
    actionContainer.style.justifyContent = 'space-between';
    
    // Botão de cancelar
    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.textContent = 'Cancelar';
    cancelButton.style.padding = '10px 20px';
    cancelButton.style.backgroundColor = '#f5f5f5';
    cancelButton.style.border = 'none';
    cancelButton.style.borderRadius = '5px';
    cancelButton.style.cursor = 'pointer';
    
    cancelButton.addEventListener('click', function() {
        hidePollModal();
    });
    
    actionContainer.appendChild(cancelButton);
    
    // Botão de criar
    const createButton = document.createElement('button');
    createButton.type = 'submit';
    createButton.textContent = 'Criar Enquete';
    createButton.style.padding = '10px 20px';
    createButton.style.backgroundColor = '#1877f2';
    createButton.style.color = 'white';
    createButton.style.border = 'none';
    createButton.style.borderRadius = '5px';
    createButton.style.cursor = 'pointer';
    
    actionContainer.appendChild(createButton);
    
    pollForm.appendChild(actionContainer);
    
    // Adicionar formulário ao modal
    modalContent.appendChild(pollForm);
    
    // Adicionar conteúdo ao modal
    pollModal.appendChild(modalContent);
    
    // Adicionar modal ao corpo do documento
    document.body.appendChild(pollModal);
    
    // Adicionar evento de clique ao botão de enquete
    pollButton.addEventListener('click', function() {
        showPollModal();
    });
    
    // Adicionar evento de envio ao formulário
    pollForm.addEventListener('submit', function(e) {
        e.preventDefault();
        createPoll();
    });
    
    // Função para adicionar campo de opção
    function addOptionField(container, index) {
        const optionGroup = document.createElement('div');
        optionGroup.className = 'poll-option';
        optionGroup.style.display = 'flex';
        optionGroup.style.alignItems = 'center';
        optionGroup.style.marginBottom = '10px';
        
        // Campo de texto
        const optionInput = document.createElement('input');
        optionInput.type = 'text';
        optionInput.className = 'poll-option-input';
        optionInput.placeholder = `Opção ${index}`;
        optionInput.style.flex = '1';
        optionInput.style.padding = '8px';
        optionInput.style.borderRadius = '5px';
        optionInput.style.border = '1px solid #ddd';
        optionGroup.appendChild(optionInput);
        
        // Botão de remover (apenas para opções além das duas primeiras)
        if (index > 2) {
            const removeButton = document.createElement('button');
            removeButton.type = 'button';
            removeButton.className = 'remove-option-button';
            removeButton.innerHTML = '✕';
            removeButton.style.marginLeft = '10px';
            removeButton.style.background = 'none';
            removeButton.style.border = 'none';
            removeButton.style.fontSize = '16px';
            removeButton.style.cursor = 'pointer';
            removeButton.style.color = '#f44336';
            
            removeButton.addEventListener('click', function() {
                optionGroup.remove();
                // Renumerar opções
                const options = container.querySelectorAll('.poll-option');
                options.forEach((option, i) => {
                    const input = option.querySelector('input');
                    input.placeholder = `Opção ${i + 1}`;
                });
            });
            
            optionGroup.appendChild(removeButton);
        }
        
        container.appendChild(optionGroup);
    }
    
    // Função para mostrar o modal de enquete
    function showPollModal() {
        if (!window.currentChatUser) {
            alert('Selecione um contato para criar uma enquete.');
            return;
        }
        
        pollModal.style.display = 'flex';
    }
    
    // Função para ocultar o modal de enquete
    function hidePollModal() {
        pollModal.style.display = 'none';
        pollForm.reset();
    }
    
    // Função para criar enquete
    function createPoll() {
        // Obter dados do formulário
        const question = document.getElementById('pollQuestion').value.trim();
        const optionInputs = document.querySelectorAll('.poll-option-input');
        const duration = document.getElementById('pollDuration').value;
        const multipleChoice = document.getElementById('multipleChoice').checked;
        const showResults = document.getElementById('showResults').checked;
        
        // Validar dados
        if (!question) {
            alert('Por favor, digite uma pergunta.');
            return;
        }
        
        const options = [];
        let hasEmptyOption = false;
        
        optionInputs.forEach(input => {
            const optionText = input.value.trim();
            if (optionText) {
                options.push(optionText);
            } else {
                hasEmptyOption = true;
            }
        });
        
        if (options.length < 2) {
            alert('Por favor, adicione pelo menos duas opções.');
            return;
        }
        
        if (hasEmptyOption) {
            alert('Por favor, preencha todas as opções ou remova as vazias.');
            return;
        }
        
        // Criar objeto de enquete
        const pollData = {
            question: question,
            options: options,
            duration: duration,
            multipleChoice: multipleChoice,
            showResults: showResults,
            createdAt: new Date().toISOString(),
            votes: {}
        };
        
        // Enviar enquete para o servidor (se implementado)
        if (window.socket && window.currentChatUser) {
            window.socket.emit('sendPoll', {
                receiverId: window.currentChatUser._id,
                pollData: pollData
            });
        }
        
        // Criar elemento de enquete
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            const pollElement = createPollElement(pollData, true);
            chatMessages.appendChild(pollElement);
            
            // Rolar para a última mensagem
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
        
        // Fechar modal
        hidePollModal();
    }
    
    // Função para criar elemento de enquete
    function createPollElement(pollData, isSent) {
        const pollElement = document.createElement('div');
        pollElement.className = `message ${isSent ? 'sent' : 'received'} poll-message`;
        pollElement.style.width = '100%';
        pollElement.style.maxWidth = '400px';
        
        // Calcular tempo restante
        const createdAt = new Date(pollData.createdAt);
        const durationHours = parseInt(pollData.duration);
        const expiresAt = new Date(createdAt.getTime() + durationHours * 60 * 60 * 1000);
        const now = new Date();
        const isExpired = now > expiresAt;
        
        // Formatar tempo restante
        let timeRemaining = '';
        if (isExpired) {
            timeRemaining = 'Encerrada';
        } else {
            const diffMs = expiresAt - now;
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            
            if (diffHours > 0) {
                timeRemaining = `${diffHours}h ${diffMinutes}m restantes`;
            } else {
                timeRemaining = `${diffMinutes}m restantes`;
            }
        }
        
        // Conteúdo da enquete
        pollElement.innerHTML = `
            <div class="poll-container" style="border: 1px solid #ddd; border-radius: 10px; padding: 15px; background-color: ${isSent ? '#e9f5ff' : '#f0f2f5'};">
                <div class="poll-header" style="margin-bottom: 10px;">
                    <div class="poll-icon" style="font-size: 20px; margin-bottom: 5px;">📊</div>
                    <div class="poll-question" style="font-weight: bold; font-size: 16px;">${pollData.question}</div>
                </div>
                <div class="poll-options" style="margin-bottom: 15px;"></div>
                <div class="poll-footer" style="display: flex; justify-content: space-between; font-size: 12px; color: #666;">
                    <div class="poll-type">${pollData.multipleChoice ? 'Múltipla escolha' : 'Escolha única'}</div>
                    <div class="poll-time-remaining">${timeRemaining}</div>
                </div>
            </div>
        `;
        
        // Adicionar opções
        const optionsContainer = pollElement.querySelector('.poll-options');
        
        pollData.options.forEach((option, index) => {
            // Calcular porcentagem de votos
            const totalVotes = Object.values(pollData.votes).flat().length;
            const optionVotes = Object.values(pollData.votes).flat().filter(vote => vote === index).length;
            const percentage = totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0;
            
            const optionElement = document.createElement('div');
            optionElement.className = 'poll-option';
            optionElement.style.marginBottom = '10px';
            optionElement.style.position = 'relative';
            
            // Determinar se o usuário já votou nesta opção
            const hasVoted = pollData.votes[window.userInfo?.userId]?.includes(index);
            
            // Criar elemento de opção
            optionElement.innerHTML = `
                <div class="poll-option-container" style="display: flex; align-items: center; padding: 8px; border-radius: 5px; background-color: ${hasVoted ? '#e3f2fd' : 'rgba(0, 0, 0, 0.05)'}; cursor: pointer; position: relative; overflow: hidden;">
                    <div class="poll-option-progress" style="position: absolute; top: 0; left: 0; height: 100%; background-color: ${hasVoted ? 'rgba(33, 150, 243, 0.2)' : 'rgba(0, 0, 0, 0.05)'}; width: ${percentage}%; z-index: 1;"></div>
                    <div style="display: flex; align-items: center; width: 100%; position: relative; z-index: 2;">
                        <div class="poll-option-checkbox" style="margin-right: 10px; width: 18px; height: 18px; border: 2px solid #aaa; border-radius: ${pollData.multipleChoice ? '3px' : '50%'}; display: flex; justify-content: center; align-items: center; background-color: ${hasVoted ? '#2196f3' : 'transparent'};">
                            ${hasVoted ? '<span style="color: white; font-size: 12px;">✓</span>' : ''}
                        </div>
                        <div class="poll-option-text" style="flex: 1;">${option}</div>
                        <div class="poll-option-percentage" style="margin-left: 10px;">${percentage}%</div>
                    </div>
                </div>
            `;
            
            // Adicionar evento de clique para votar
            if (!isExpired) {
                optionElement.querySelector('.poll-option-container').addEventListener('click', function() {
                    votePoll(pollData, index, optionsContainer);
                });
            }
            
            optionsContainer.appendChild(optionElement);
        });
        
        return pollElement;
    }
    
    // Função para votar em uma enquete
    function votePoll(pollData, optionIndex, optionsContainer) {
        // Verificar se o usuário está logado
        if (!window.userInfo || !window.userInfo.userId) {
            alert('Você precisa estar logado para votar.');
            return;
        }
        
        // Verificar se a enquete permite múltiplas escolhas
        const userId = window.userInfo.userId;
        
        if (!pollData.votes[userId]) {
            pollData.votes[userId] = [];
        }
        
        // Verificar se o usuário já votou nesta opção
        const hasVoted = pollData.votes[userId].includes(optionIndex);
        
        if (hasVoted) {
            // Remover voto
            pollData.votes[userId] = pollData.votes[userId].filter(vote => vote !== optionIndex);
        } else {
            // Adicionar voto
            if (!pollData.multipleChoice) {
                // Limpar votos anteriores para escolha única
                pollData.votes[userId] = [];
            }
            
            pollData.votes[userId].push(optionIndex);
        }
        
        // Atualizar interface
        updatePollOptions(pollData, optionsContainer);
        
        // Enviar voto para o servidor (se implementado)
        if (window.socket && window.currentChatUser) {
            window.socket.emit('updatePollVote', {
                receiverId: window.currentChatUser._id,
                pollData: pollData
            });
        }
    }
    
    // Função para atualizar opções de enquete
    function updatePollOptions(pollData, optionsContainer) {
        // Limpar opções existentes
        optionsContainer.innerHTML = '';
        
        // Adicionar opções atualizadas
        pollData.options.forEach((option, index) => {
            // Calcular porcentagem de votos
            const totalVotes = Object.values(pollData.votes).flat().length;
            const optionVotes = Object.values(pollData.votes).flat().filter(vote => vote === index).length;
            const percentage = totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0;
            
            const optionElement = document.createElement('div');
            optionElement.className = 'poll-option';
            optionElement.style.marginBottom = '10px';
            optionElement.style.position = 'relative';
            
            // Determinar se o usuário já votou nesta opção
            const hasVoted = pollData.votes[window.userInfo?.userId]?.includes(index);
            
            // Criar elemento de opção
            optionElement.innerHTML = `
                <div class="poll-option-container" style="display: flex; align-items: center; padding: 8px; border-radius: 5px; background-color: ${hasVoted ? '#e3f2fd' : 'rgba(0, 0, 0, 0.05)'}; cursor: pointer; position: relative; overflow: hidden;">
                    <div class="poll-option-progress" style="position: absolute; top: 0; left: 0; height: 100%; background-color: ${hasVoted ? 'rgba(33, 150, 243, 0.2)' : 'rgba(0, 0, 0, 0.05)'}; width: ${percentage}%; z-index: 1;"></div>
                    <div style="display: flex; align-items: center; width: 100%; position: relative; z-index: 2;">
                        <div class="poll-option-checkbox" style="margin-right: 10px; width: 18px; height: 18px; border: 2px solid #aaa; border-radius: ${pollData.multipleChoice ? '3px' : '50%'}; display: flex; justify-content: center; align-items: center; background-color: ${hasVoted ? '#2196f3' : 'transparent'};">
                            ${hasVoted ? '<span style="color: white; font-size: 12px;">✓</span>' : ''}
                        </div>
                        <div class="poll-option-text" style="flex: 1;">${option}</div>
                        <div class="poll-option-percentage" style="margin-left: 10px;">${percentage}%</div>
                    </div>
                </div>
            `;
            
            // Adicionar evento de clique para votar
            optionElement.querySelector('.poll-option-container').addEventListener('click', function() {
                votePoll(pollData, index, optionsContainer);
            });
            
            optionsContainer.appendChild(optionElement);
        });
    }
    
    // Interceptar recebimento de enquetes
    if (window.socket) {
        window.socket.on('receivePoll', function(data) {
            // Verificar se é uma enquete para o chat atual
            if (window.currentChatUser && data.sender._id === window.currentChatUser._id) {
                // Criar elemento de enquete
                const chatMessages = document.getElementById('chatMessages');
                if (chatMessages) {
                    const pollElement = createPollElement(data.pollData, false);
                    chatMessages.appendChild(pollElement);
                    
                    // Rolar para a última mensagem
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                    
                    // Marcar como lida
                    window.socket.emit('markAsRead', {
                        senderId: data.sender._id
                    });
                }
            }
        });
        
        window.socket.on('pollVoteUpdated', function(data) {
            // Atualizar enquete se estiver visível
            if (window.currentChatUser && data.sender._id === window.currentChatUser._id) {
                // Encontrar elemento de enquete e atualizar
                const chatMessages = document.getElementById('chatMessages');
                if (chatMessages) {
                    // Implementação simplificada - em um caso real, você precisaria identificar a enquete específica
                    const pollMessages = chatMessages.querySelectorAll('.poll-message');
                    if (pollMessages.length > 0) {
                        // Atualizar a última enquete (simplificação)
                        const lastPollMessage = pollMessages[pollMessages.length - 1];
                        const optionsContainer = lastPollMessage.querySelector('.poll-options');
                        
                        if (optionsContainer) {
                            updatePollOptions(data.pollData, optionsContainer);
                        }
                    }
                }
            }
        });
    }
});
