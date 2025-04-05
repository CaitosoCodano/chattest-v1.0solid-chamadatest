/**
 * Implementação simplificada de chamada de voz
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando sistema simplificado de chamada de voz');

    // Variáveis para chamada
    let callInProgress = false;
    let currentCallUser = null;
    let callAnswered = false;
    let callTimeoutTimer = null;

    // Criar interface de chamada
    const callUI = document.createElement('div');
    callUI.id = 'callUI';
    callUI.style.position = 'fixed';
    callUI.style.top = '0';
    callUI.style.left = '0';
    callUI.style.width = '100%';
    callUI.style.height = '100%';
    callUI.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    callUI.style.display = 'none';
    callUI.style.flexDirection = 'column';
    callUI.style.alignItems = 'center';
    callUI.style.justifyContent = 'center';
    callUI.style.zIndex = '2000';

    // Conteúdo da interface de chamada
    callUI.innerHTML = `
        <div style="text-align: center; color: white;">
            <div id="callAvatar" style="width: 100px; height: 100px; border-radius: 50%; background-color: #1877f2; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 40px; color: white;">
                <i class="fas fa-user"></i>
            </div>
            <h2 id="callUsername" style="margin-bottom: 10px; color: white;">Usuário</h2>
            <p id="callStatus" style="margin-bottom: 30px; color: #ccc;">Chamando...</p>
            <div id="callTimer" style="font-family: monospace; font-size: 24px; margin-bottom: 30px; color: white;">00:00</div>
            <div style="display: flex; gap: 20px;">
                <button id="toggleMuteButton" style="width: 60px; height: 60px; border-radius: 50%; background-color: #333; border: none; color: white; font-size: 24px; cursor: pointer;">
                    <i class="fas fa-microphone"></i>
                </button>
                <button id="endCallButton" style="width: 60px; height: 60px; border-radius: 50%; background-color: #f44336; border: none; color: white; font-size: 24px; cursor: pointer;">
                    <i class="fas fa-phone-slash"></i>
                </button>
            </div>
        </div>
    `;

    // Adicionar interface ao corpo do documento
    document.body.appendChild(callUI);

    // Criar interface de chamada recebida
    const incomingCallUI = document.createElement('div');
    incomingCallUI.id = 'incomingCallUI';
    incomingCallUI.style.position = 'fixed';
    incomingCallUI.style.top = '20px';
    incomingCallUI.style.right = '20px';
    incomingCallUI.style.width = '300px';
    incomingCallUI.style.backgroundColor = 'white';
    incomingCallUI.style.borderRadius = '10px';
    incomingCallUI.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    incomingCallUI.style.padding = '15px';
    incomingCallUI.style.display = 'none';
    incomingCallUI.style.zIndex = '1999';

    // Conteúdo da interface de chamada recebida
    incomingCallUI.innerHTML = `
        <div style="text-align: center;">
            <div style="font-size: 18px; margin-bottom: 10px;">Chamada recebida</div>
            <div id="incomingCallAvatar" style="width: 60px; height: 60px; border-radius: 50%; background-color: #1877f2; margin: 0 auto 10px; display: flex; align-items: center; justify-content: center; font-size: 24px; color: white;">
                <i class="fas fa-user"></i>
            </div>
            <div id="incomingCallUsername" style="margin-bottom: 15px; font-weight: bold;">Usuário</div>
            <div style="display: flex; justify-content: space-between;">
                <button id="rejectCallButton" style="flex: 1; padding: 8px; margin-right: 10px; background-color: #f44336; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Recusar
                </button>
                <button id="acceptCallButton" style="flex: 1; padding: 8px; background-color: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Atender
                </button>
            </div>
        </div>
    `;

    // Adicionar interface ao corpo do documento
    document.body.appendChild(incomingCallUI);

    // Configurar eventos
    document.getElementById('endCallButton').addEventListener('click', endCall);
    document.getElementById('toggleMuteButton').addEventListener('click', toggleMute);
    document.getElementById('acceptCallButton').addEventListener('click', acceptCall);
    document.getElementById('rejectCallButton').addEventListener('click', rejectCall);

    // Função para iniciar chamada
    function startCall() {
        // Verificar se há um chat ativo
        if (!window.currentChatUser) {
            console.error('Nenhum contato selecionado para iniciar chamada');
            return;
        }

        // Verificar se já está em uma chamada
        if (callInProgress) {
            alert('Você já está em uma chamada');
            return;
        }

        console.log(`Iniciando chamada para ${window.currentChatUser.username}`);

        // Configurar dados da chamada
        currentCallUser = window.currentChatUser;
        callInProgress = true;

        // Atualizar interface
        document.getElementById('callUsername').textContent = currentCallUser.username;
        document.getElementById('callStatus').textContent = 'Chamando...';
        document.getElementById('callTimer').textContent = '00:00';

        // Mostrar avatar se disponível
        const avatarContainer = document.getElementById('callAvatar');
        if (currentCallUser.avatar) {
            avatarContainer.innerHTML = `<img src="${currentCallUser.avatar}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
        } else {
            // Usar primeira letra do nome como avatar
            avatarContainer.innerHTML = currentCallUser.username.charAt(0).toUpperCase();
            avatarContainer.style.fontSize = '40px';
        }

        // Mostrar interface de chamada
        callUI.style.display = 'flex';

        // Simular chamada (em um ambiente real, isso seria feito com WebRTC)
        if (window.socket) {
            // Verificar se temos informações do usuário
            const callerName = window.userInfo ? window.userInfo.username : 'Usuário';

            window.socket.emit('callUser', {
                targetUserId: currentCallUser._id,
                callerName: callerName
            });

            // Configurar um temporizador para verificar se a chamada foi atendida
            // Se não for atendida em 10 segundos, mostrar mensagem
            callAnswered = false;

            // Limpar qualquer temporizador existente
            if (callTimeoutTimer) {
                clearTimeout(callTimeoutTimer);
            }

            callTimeoutTimer = setTimeout(() => {
                // Verificar se a chamada já foi atendida
                if (!callAnswered) {
                    alert('Ninguém atendeu a chamada');
                    endCall();
                }
            }, 10000); // 10 segundos
        } else {
            // Simulação sem socket
            setTimeout(() => {
                simulateCallAccepted();
            }, 2000);
        }
    }

    // Função para aceitar chamada
    function acceptCall() {
        // Marcar a chamada como atendida
        callAnswered = true;

        // Ocultar interface de chamada recebida
        incomingCallUI.style.display = 'none';

        // Atualizar interface de chamada
        document.getElementById('callUsername').textContent = currentCallUser.username;
        document.getElementById('callStatus').textContent = 'Conectando...';

        // Mostrar avatar se disponível
        const avatarContainer = document.getElementById('callAvatar');
        if (currentCallUser.avatar) {
            avatarContainer.innerHTML = `<img src="${currentCallUser.avatar}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
        } else {
            // Usar primeira letra do nome como avatar
            avatarContainer.innerHTML = currentCallUser.username.charAt(0).toUpperCase();
            avatarContainer.style.fontSize = '40px';
        }

        // Mostrar interface de chamada
        callUI.style.display = 'flex';

        // Simular conexão após 1 segundo
        setTimeout(() => {
            document.getElementById('callStatus').textContent = 'Conectado';
            startCallTimer();
        }, 1000);

        // Notificar servidor (se implementado)
        if (window.socket && currentCallUser) {
            window.socket.emit('acceptCall', {
                targetUserId: currentCallUser._id
            });
        }
    }

    // Função para rejeitar chamada
    function rejectCall() {
        // Ocultar interface de chamada recebida
        incomingCallUI.style.display = 'none';

        // Resetar estado
        callInProgress = false;
        currentCallUser = null;

        // Notificar servidor (se implementado)
        if (window.socket && currentCallUser) {
            window.socket.emit('rejectCall', {
                targetUserId: currentCallUser._id
            });
        }
    }

    // Função para encerrar chamada
    function endCall() {
        // Ocultar interface de chamada
        callUI.style.display = 'none';

        // Parar temporizador
        stopCallTimer();

        // Limpar o temporizador de timeout
        if (callTimeoutTimer) {
            clearTimeout(callTimeoutTimer);
            callTimeoutTimer = null;
        }

        // Resetar estado
        callInProgress = false;
        callAnswered = false;

        // Guardar o ID do usuário antes de resetar
        const targetUserId = currentCallUser ? currentCallUser._id : null;
        currentCallUser = null;

        // Notificar servidor (se implementado)
        if (window.socket && targetUserId) {
            window.socket.emit('endCall', {
                targetUserId: targetUserId
            });
        }
    }

    // Função para alternar mudo/não mudo
    let isMuted = false;

    function toggleMute() {
        isMuted = !isMuted;

        const muteButton = document.getElementById('toggleMuteButton');
        if (isMuted) {
            muteButton.innerHTML = '<i class="fas fa-microphone-slash"></i>';
        } else {
            muteButton.innerHTML = '<i class="fas fa-microphone"></i>';
        }

        // Em um ambiente real, isso desativaria o áudio
        console.log('Microfone ' + (isMuted ? 'desativado' : 'ativado'));
    }

    // Temporizador de chamada
    let callTimerInterval = null;
    let callDurationSeconds = 0;

    function startCallTimer() {
        callDurationSeconds = 0;
        updateCallTimerDisplay();

        callTimerInterval = setInterval(() => {
            callDurationSeconds++;
            updateCallTimerDisplay();
        }, 1000);
    }

    function stopCallTimer() {
        if (callTimerInterval) {
            clearInterval(callTimerInterval);
            callTimerInterval = null;
        }
        callDurationSeconds = 0;
    }

    function updateCallTimerDisplay() {
        const minutes = Math.floor(callDurationSeconds / 60).toString().padStart(2, '0');
        const seconds = (callDurationSeconds % 60).toString().padStart(2, '0');
        document.getElementById('callTimer').textContent = `${minutes}:${seconds}`;
    }

    // Funções para simular eventos de chamada
    function simulateCallAccepted() {
        // Marcar a chamada como atendida
        callAnswered = true;

        // Limpar o temporizador de timeout
        if (callTimeoutTimer) {
            clearTimeout(callTimeoutTimer);
            callTimeoutTimer = null;
        }

        document.getElementById('callStatus').textContent = 'Conectado';
        startCallTimer();
    }

    function simulateCallRejected() {
        alert('Chamada rejeitada');
        endCall();
    }

    function simulateIncomingCall(callerName, callerId) {
        if (callInProgress) {
            // Já está em uma chamada, rejeitar automaticamente
            return;
        }

        // Configurar dados da chamada
        currentCallUser = {
            _id: callerId || 'simulated-caller-id',
            username: callerName || 'Usuário'
        };
        callInProgress = true;

        // Atualizar interface
        document.getElementById('incomingCallUsername').textContent = currentCallUser.username;

        // Mostrar interface de chamada recebida
        incomingCallUI.style.display = 'block';

        // Reproduzir som de chamada (se implementado)
    }

    // Interceptar eventos de socket (se implementado)
    if (window.socket) {
        window.socket.on('incomingCall', data => {
            console.log('Chamada recebida de:', data.callerName, data.callerId);
            simulateIncomingCall(data.callerName, data.callerId);
        });

        window.socket.on('callAccepted', (data) => {
            console.log('Chamada aceita:', data);
            console.log('Estado atual da chamada:', {
                callInProgress,
                currentCallUser,
                userInfo: window.userInfo,
                callerId: data.callerId,
                accepterId: data.accepterId
            });

            // Verificar se estamos em uma chamada
            if (!callInProgress) {
                console.log('Não estamos em uma chamada ativa');
                return;
            }

            // Verificar se temos informações do usuário atual
            if (!window.userInfo) {
                console.log('Informações do usuário não disponíveis');
                return;
            }

            // Verificar se esta é uma chamada que iniciamos
            // O callerId no evento deve corresponder ao nosso ID de usuário
            if (data.callerId === window.userInfo._id) {
                console.log('Chamada que iniciamos foi aceita pelo destinatário');

                // Forçar atualização da interface
                document.getElementById('callStatus').textContent = 'Conectado';

                // Marcar a chamada como atendida
                callAnswered = true;

                // Limpar o temporizador de timeout
                if (callTimeoutTimer) {
                    clearTimeout(callTimeoutTimer);
                    callTimeoutTimer = null;
                }

                // Iniciar o temporizador de chamada
                startCallTimer();
            } else {
                console.log('Recebido evento callAccepted, mas não é para a chamada atual');
                console.log('ID do chamador no evento:', data.callerId);
                console.log('Nosso ID de usuário:', window.userInfo._id);
            }
        });

        window.socket.on('callConnected', (data) => {
            console.log('Chamada conectada:', data);
            console.log('Estado atual da chamada:', {
                callInProgress,
                currentCallUser,
                userInfo: window.userInfo
            });

            // Marcar a chamada como atendida
            callAnswered = true;

            // Limpar o temporizador de timeout
            if (callTimeoutTimer) {
                clearTimeout(callTimeoutTimer);
                callTimeoutTimer = null;
            }

            // Atualizar a interface para mostrar que a chamada foi conectada
            document.getElementById('callStatus').textContent = 'Conectado';

            // Iniciar o temporizador de chamada se ainda não foi iniciado
            if (!callTimerInterval) {
                startCallTimer();
            }

            // Mostrar a interface de chamada se não estiver visível
            if (callUI.style.display !== 'flex') {
                callUI.style.display = 'flex';
            }
        });

        window.socket.on('callRejected', (data) => {
            console.log('Chamada rejeitada:', data);
            alert(`Chamada rejeitada: ${data.reason || 'Usuário recusou a chamada'}`);
            simulateCallRejected();
        });

        window.socket.on('callFailed', (data) => {
            console.log('Chamada falhou:', data);
            alert(`Chamada falhou: ${data.reason || 'Erro desconhecido'}`);
            endCall();
        });

        window.socket.on('callEnded', (data) => {
            console.log('Chamada encerrada pelo outro usuário:', data);
            alert('Chamada encerrada pelo outro usuário');
            endCall();
        });

        // Evento para chamada em grupo atendida
        window.socket.on('groupCallAnswered', (data) => {
            console.log('Chamada em grupo atendida:', data);

            // Marcar a chamada em grupo como atendida
            if (window.groupCallTimeoutTimer) {
                console.log('Cancelando temporizador de timeout da chamada em grupo');
                clearTimeout(window.groupCallTimeoutTimer);
                window.groupCallTimeoutTimer = null;
            }

            window.groupCallAnswered = true;

            // Verificar se estamos em uma chamada individual ou em grupo
            if (callInProgress) {
                console.log('Estamos em uma chamada individual e recebemos evento de chamada em grupo');
                // Atualizar a interface para mostrar que a chamada foi conectada
                document.getElementById('callStatus').textContent = 'Conectado';

                // Iniciar o temporizador de chamada se ainda não foi iniciado
                if (!callTimerInterval) {
                    startCallTimer();
                }
            } else {
                console.log('Recebido evento de chamada em grupo, mas não estamos em uma chamada individual');
                // Procurar por uma interface de chamada em grupo
                const groupCallUI = document.getElementById('callUI');
                if (groupCallUI) {
                    // Atualizar o status da chamada em grupo
                    const statusElement = groupCallUI.querySelector('p');
                    if (statusElement && statusElement.textContent === 'Chamando...') {
                        statusElement.textContent = 'Conectado';
                    }

                    // Iniciar um temporizador para a chamada em grupo
                    const timerElement = groupCallUI.querySelector('div[style*="font-family: monospace"]');
                    if (timerElement) {
                        let seconds = 0;
                        const groupCallTimer = setInterval(() => {
                            seconds++;
                            const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
                            const secs = (seconds % 60).toString().padStart(2, '0');
                            timerElement.textContent = `${minutes}:${secs}`;
                        }, 1000);

                        // Armazenar o temporizador para poder limpar depois
                        window.groupCallTimerInterval = groupCallTimer;
                    }
                }
            }
        });
    }

    // Expor função globalmente
    window.startCall = startCall;
    window.simulateIncomingCall = simulateIncomingCall;
});
