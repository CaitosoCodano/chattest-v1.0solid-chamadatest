/**
 * Implementação de chamada de voz usando WebRTC
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando sistema de chamada de voz');

    // Variáveis globais
    let localStream = null;
    let peerConnection = null;
    let currentCall = {
        active: false,
        userId: null,
        username: null,
        direction: null // 'outgoing' ou 'incoming'
    };

    // Elementos da UI
    const callButton = document.createElement('button');
    callButton.id = 'callButton';
    callButton.className = 'call-button';
    callButton.innerHTML = '<i class="fas fa-phone"></i>';
    callButton.title = 'Iniciar chamada de voz';

    const callInterface = document.createElement('div');
    callInterface.id = 'callInterface';
    callInterface.className = 'call-interface';
    callInterface.style.display = 'none';
    callInterface.innerHTML = `
        <div class="call-header">
            <span id="callStatus">Chamada em andamento...</span>
            <span id="callTimer">00:00</span>
        </div>
        <div class="call-user-info">
            <img id="callUserAvatar" src="" alt="Avatar">
            <span id="callUsername">Usuário</span>
        </div>
        <div class="call-controls">
            <button id="toggleMuteButton" class="call-control-button">
                <i class="fas fa-microphone"></i>
            </button>
            <button id="endCallButton" class="call-control-button end-call">
                <i class="fas fa-phone-slash"></i>
            </button>
        </div>
    `;

    const incomingCallNotification = document.createElement('div');
    incomingCallNotification.id = 'incomingCallNotification';
    incomingCallNotification.className = 'incoming-call-notification';
    incomingCallNotification.style.display = 'none';
    incomingCallNotification.innerHTML = `
        <div class="incoming-call-header">
            <span>Chamada recebida</span>
        </div>
        <div class="incoming-call-user-info">
            <img id="incomingCallUserAvatar" src="" alt="Avatar">
            <span id="incomingCallUsername">Usuário</span>
        </div>
        <div class="incoming-call-controls">
            <button id="acceptCallButton" class="call-control-button accept-call">
                <i class="fas fa-phone"></i>
            </button>
            <button id="rejectCallButton" class="call-control-button reject-call">
                <i class="fas fa-phone-slash"></i>
            </button>
        </div>
    `;

    // Adicionar elementos à página
    function setupUI() {
        // Adicionar botão de chamada ao cabeçalho do chat
        const chatHeader = document.getElementById('chatHeader');
        if (chatHeader) {
            // Verificar se o botão já existe
            if (!document.getElementById('callButton')) {
                // Adicionar o botão após o nome do usuário
                const usernameElement = chatHeader.querySelector('.chat-header-username');
                if (usernameElement) {
                    usernameElement.parentNode.insertBefore(callButton, usernameElement.nextSibling);
                } else {
                    chatHeader.appendChild(callButton);
                }
            }
        }

        // Adicionar interface de chamada e notificação de chamada recebida ao corpo
        document.body.appendChild(callInterface);
        document.body.appendChild(incomingCallNotification);

        // Adicionar estilos CSS
        const style = document.createElement('style');
        style.textContent = `
            .call-button {
                background-color: #4CAF50;
                color: white;
                border: none;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                cursor: pointer;
                margin-left: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .call-interface {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background-color: #f5f5f5;
                border-radius: 10px;
                padding: 20px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                z-index: 1000;
                width: 300px;
                text-align: center;
            }

            .call-header {
                display: flex;
                justify-content: space-between;
                margin-bottom: 20px;
            }

            .call-user-info {
                margin-bottom: 20px;
            }

            .call-user-info img {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                margin-bottom: 10px;
            }

            .call-controls {
                display: flex;
                justify-content: center;
                gap: 20px;
            }

            .call-control-button {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: #f0f0f0;
            }

            .end-call, .reject-call {
                background-color: #f44336;
                color: white;
            }

            .accept-call {
                background-color: #4CAF50;
                color: white;
            }

            .incoming-call-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background-color: #f5f5f5;
                border-radius: 10px;
                padding: 15px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                z-index: 1000;
                width: 250px;
                text-align: center;
            }

            .incoming-call-header {
                margin-bottom: 10px;
                font-weight: bold;
            }

            .incoming-call-user-info {
                margin-bottom: 15px;
            }

            .incoming-call-user-info img {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                margin-bottom: 5px;
            }

            .incoming-call-controls {
                display: flex;
                justify-content: center;
                gap: 15px;
            }

            #callTimer {
                font-family: monospace;
            }
        `;
        document.head.appendChild(style);
    }

    // Configurar eventos
    function setupEventListeners() {
        // Botão para iniciar chamada
        callButton.addEventListener('click', startCall);

        // Botões de controle de chamada
        document.getElementById('toggleMuteButton').addEventListener('click', toggleMute);
        document.getElementById('endCallButton').addEventListener('click', endCall);

        // Botões de chamada recebida
        document.getElementById('acceptCallButton').addEventListener('click', acceptCall);
        document.getElementById('rejectCallButton').addEventListener('click', rejectCall);

        // Eventos de socket para sinalização WebRTC
        if (window.socket) {
            // Chamada recebida
            window.socket.on('incomingCall', handleIncomingCall);

            // Resposta à chamada
            window.socket.on('callAccepted', handleCallAccepted);
            window.socket.on('callRejected', handleCallRejected);

            // Sinalização WebRTC
            window.socket.on('iceCandidate', handleIceCandidate);
            window.socket.on('offer', handleOffer);
            window.socket.on('answer', handleAnswer);

            // Fim da chamada
            window.socket.on('callEnded', handleCallEnded);
        } else {
            console.error('Socket não disponível para chamadas de voz');
        }
    }

    // Iniciar uma chamada
    async function startCall() {
        if (!window.currentChatUser) {
            alert('Selecione um contato para iniciar uma chamada');
            return;
        }

        if (currentCall.active) {
            alert('Você já está em uma chamada');
            return;
        }

        try {
            // Solicitar acesso ao microfone
            localStream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Configurar a chamada
            currentCall = {
                active: true,
                userId: window.currentChatUser._id,
                username: window.currentChatUser.username,
                direction: 'outgoing'
            };

            // Inicializar conexão WebRTC
            initializePeerConnection();

            // Criar e enviar oferta
            createAndSendOffer();

            // Mostrar interface de chamada
            showCallInterface('Chamando...');

            // Notificar o servidor sobre a chamada
            window.socket.emit('callUser', {
                targetUserId: currentCall.userId,
                callerName: window.userInfo.username,
                callerAvatar: window.userInfo.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${window.userInfo.username}`
            });

            console.log(`Iniciando chamada para ${currentCall.username}`);
        } catch (error) {
            console.error('Erro ao iniciar chamada:', error);
            alert('Não foi possível acessar o microfone. Verifique as permissões do navegador.');
            resetCall();
        }
    }

    // Inicializar conexão WebRTC
    function initializePeerConnection() {
        // Configuração de servidores STUN/TURN para atravessar NAT/firewall
        const configuration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
                // Em um ambiente de produção, você deve adicionar servidores TURN
            ]
        };

        peerConnection = new RTCPeerConnection(configuration);

        // Adicionar stream de áudio local
        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
        });

        // Lidar com candidatos ICE
        peerConnection.onicecandidate = event => {
            if (event.candidate) {
                window.socket.emit('iceCandidate', {
                    targetUserId: currentCall.userId,
                    candidate: event.candidate
                });
            }
        };

        // Lidar com mudanças de estado de conexão
        peerConnection.onconnectionstatechange = event => {
            console.log('Estado da conexão:', peerConnection.connectionState);

            if (peerConnection.connectionState === 'connected') {
                // A chamada foi estabelecida
                updateCallStatus('Chamada conectada');
                startCallTimer();
            } else if (peerConnection.connectionState === 'disconnected' ||
                       peerConnection.connectionState === 'failed' ||
                       peerConnection.connectionState === 'closed') {
                // A chamada foi encerrada
                endCall();
            }
        };

        // Lidar com streams remotos
        peerConnection.ontrack = event => {
            const remoteAudio = document.createElement('audio');
            remoteAudio.id = 'remoteAudio';
            remoteAudio.autoplay = true;
            remoteAudio.srcObject = event.streams[0];
            document.body.appendChild(remoteAudio);
        };
    }

    // Criar e enviar oferta
    async function createAndSendOffer() {
        try {
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);

            window.socket.emit('offer', {
                targetUserId: currentCall.userId,
                offer: offer
            });
        } catch (error) {
            console.error('Erro ao criar oferta:', error);
            endCall();
        }
    }

    // Lidar com chamada recebida
    function handleIncomingCall(data) {
        if (currentCall.active) {
            // Já está em uma chamada, rejeitar automaticamente
            window.socket.emit('rejectCall', {
                targetUserId: data.callerId
            });
            return;
        }

        // Configurar a chamada
        currentCall = {
            active: true,
            userId: data.callerId,
            username: data.callerName,
            direction: 'incoming'
        };

        // Mostrar notificação de chamada recebida
        document.getElementById('incomingCallUsername').textContent = data.callerName;
        document.getElementById('incomingCallUserAvatar').src = data.callerAvatar;
        incomingCallNotification.style.display = 'block';

        // Reproduzir som de chamada
        playRingtone();

        console.log(`Chamada recebida de ${data.callerName}`);
    }

    // Aceitar chamada recebida
    async function acceptCall() {
        try {
            // Solicitar acesso ao microfone
            localStream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Inicializar conexão WebRTC
            initializePeerConnection();

            // Ocultar notificação de chamada recebida
            incomingCallNotification.style.display = 'none';

            // Mostrar interface de chamada
            showCallInterface('Conectando...');

            // Notificar o servidor que a chamada foi aceita
            window.socket.emit('acceptCall', {
                targetUserId: currentCall.userId
            });

            // Parar o som de chamada
            stopRingtone();

            console.log(`Chamada de ${currentCall.username} aceita`);
        } catch (error) {
            console.error('Erro ao aceitar chamada:', error);
            alert('Não foi possível acessar o microfone. Verifique as permissões do navegador.');
            rejectCall();
        }
    }

    // Rejeitar chamada recebida
    function rejectCall() {
        // Notificar o servidor que a chamada foi rejeitada
        window.socket.emit('rejectCall', {
            targetUserId: currentCall.userId
        });

        // Ocultar notificação de chamada recebida
        incomingCallNotification.style.display = 'none';

        // Parar o som de chamada
        stopRingtone();

        // Resetar estado da chamada
        resetCall();

        console.log(`Chamada de ${currentCall.username} rejeitada`);
    }

    // Lidar com chamada aceita
    function handleCallAccepted() {
        updateCallStatus('Conectando...');
        console.log('Chamada aceita pelo destinatário');
    }

    // Lidar com chamada rejeitada
    function handleCallRejected() {
        alert('Chamada rejeitada');
        endCall();
        console.log('Chamada rejeitada pelo destinatário');
    }

    // Lidar com candidato ICE
    function handleIceCandidate(data) {
        if (peerConnection) {
            peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate))
                .catch(error => console.error('Erro ao adicionar candidato ICE:', error));
        }
    }

    // Lidar com oferta
    async function handleOffer(data) {
        if (peerConnection && currentCall.active) {
            try {
                await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
                const answer = await peerConnection.createAnswer();
                await peerConnection.setLocalDescription(answer);

                window.socket.emit('answer', {
                    targetUserId: currentCall.userId,
                    answer: answer
                });
            } catch (error) {
                console.error('Erro ao processar oferta:', error);
                endCall();
            }
        }
    }

    // Lidar com resposta
    async function handleAnswer(data) {
        if (peerConnection && currentCall.active) {
            try {
                await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
            } catch (error) {
                console.error('Erro ao processar resposta:', error);
                endCall();
            }
        }
    }

    // Lidar com fim da chamada
    function handleCallEnded() {
        alert('Chamada encerrada pelo outro usuário');
        endCall(false); // Não notificar o servidor, pois a chamada já foi encerrada
    }

    // Encerrar chamada
    function endCall(notifyServer = true) {
        if (notifyServer && currentCall.active) {
            window.socket.emit('endCall', {
                targetUserId: currentCall.userId
            });
        }

        // Fechar conexão WebRTC
        if (peerConnection) {
            peerConnection.close();
            peerConnection = null;
        }

        // Parar streams de áudio
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            localStream = null;
        }

        // Remover elemento de áudio remoto
        const remoteAudio = document.getElementById('remoteAudio');
        if (remoteAudio) {
            remoteAudio.remove();
        }

        // Ocultar interface de chamada
        callInterface.style.display = 'none';
        incomingCallNotification.style.display = 'none';

        // Parar o temporizador
        stopCallTimer();

        // Resetar estado da chamada
        resetCall();

        console.log('Chamada encerrada');
    }

    // Alternar mudo/não mudo
    function toggleMute() {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;

                const muteButton = document.getElementById('toggleMuteButton');
                if (audioTrack.enabled) {
                    muteButton.innerHTML = '<i class="fas fa-microphone"></i>';
                    muteButton.title = 'Desativar microfone';
                } else {
                    muteButton.innerHTML = '<i class="fas fa-microphone-slash"></i>';
                    muteButton.title = 'Ativar microfone';
                }
            }
        }
    }

    // Mostrar interface de chamada
    function showCallInterface(status) {
        document.getElementById('callStatus').textContent = status;
        document.getElementById('callUsername').textContent = currentCall.username;
        document.getElementById('callUserAvatar').src = window.currentChatUser.avatarUrl ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentCall.username}`;

        callInterface.style.display = 'block';
    }

    // Atualizar status da chamada
    function updateCallStatus(status) {
        document.getElementById('callStatus').textContent = status;
    }

    // Resetar estado da chamada
    function resetCall() {
        currentCall = {
            active: false,
            userId: null,
            username: null,
            direction: null
        };
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

    // Som de chamada
    let ringtone = null;

    function playRingtone() {
        try {
            // Usar o gerador de som em vez de um arquivo MP3
            if (window.createRingtone) {
                ringtone = window.createRingtone().play();
            } else {
                console.error('Gerador de som de chamada não encontrado');
            }
        } catch (error) {
            console.error('Erro ao reproduzir som de chamada:', error);
        }
    }

    function stopRingtone() {
        if (ringtone && ringtone.stop) {
            ringtone.stop();
            ringtone = null;
        }
    }

    // Verificar se o navegador suporta WebRTC
    function checkWebRTCSupport() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.error('WebRTC não é suportado neste navegador');
            return false;
        }
        return true;
    }

    // Inicializar o sistema de chamada de voz
    function initialize() {
        if (!checkWebRTCSupport()) {
            console.error('WebRTC não é suportado, chamadas de voz não estarão disponíveis');
            return;
        }

        setupUI();
        setupEventListeners();

        // Observar mudanças no DOM para detectar quando o chat é aberto
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' || mutation.type === 'attributes') {
                    const chatHeader = document.getElementById('chatHeader');
                    if (chatHeader && window.currentChatUser) {
                        // Verificar se o botão já existe
                        if (!document.getElementById('callButton')) {
                            setupUI();
                        }
                    }
                }
            });
        });

        // Configurar observador para o corpo do documento
        observer.observe(document.body, { childList: true, subtree: true });

        console.log('Sistema de chamada de voz inicializado com sucesso');
    }

    // Inicializar quando o DOM estiver pronto
    initialize();
});
