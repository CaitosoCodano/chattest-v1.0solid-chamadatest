/**
 * Implementação simplificada de chamada de voz usando WebRTC
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando sistema simplificado de chamada de voz');

    // Variáveis globais
    let localStream = null;
    let peerConnection = null;
    let callInProgress = false;
    let currentCallUser = null;

    // Elementos da UI
    const callButton = document.createElement('button');
    callButton.id = 'callButton';
    callButton.className = 'call-button';
    callButton.innerHTML = '<i class="fas fa-phone"></i> Chamar';
    callButton.title = 'Iniciar chamada de voz';
    callButton.style.display = 'none'; // Inicialmente oculto
    callButton.style.backgroundColor = '#4CAF50';
    callButton.style.color = 'white';
    callButton.style.border = 'none';
    callButton.style.borderRadius = '5px';
    callButton.style.padding = '8px 12px';
    callButton.style.cursor = 'pointer';
    callButton.style.marginLeft = '10px';
    callButton.style.fontWeight = 'bold';

    const callUI = document.createElement('div');
    callUI.id = 'callUI';
    callUI.className = 'call-ui';
    callUI.style.display = 'none';
    callUI.innerHTML = `
        <div class="call-header">
            <span id="callStatus">Chamando...</span>
        </div>
        <div class="call-controls">
            <button id="endCallButton" class="call-control-button">
                Encerrar Chamada
            </button>
        </div>
    `;

    const incomingCallUI = document.createElement('div');
    incomingCallUI.id = 'incomingCallUI';
    incomingCallUI.className = 'incoming-call-ui';
    incomingCallUI.style.display = 'none';
    incomingCallUI.innerHTML = `
        <div class="incoming-call-header">
            <span>Chamada recebida de <span id="callerName">Usuário</span></span>
        </div>
        <div class="incoming-call-controls">
            <button id="acceptCallButton" class="call-control-button">
                Atender
            </button>
            <button id="rejectCallButton" class="call-control-button">
                Rejeitar
            </button>
        </div>
    `;

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
        }

        .call-ui, .incoming-call-ui {
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #f5f5f5;
            border-radius: 5px;
            padding: 15px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
            z-index: 1000;
        }

        .call-header, .incoming-call-header {
            margin-bottom: 15px;
            font-weight: bold;
        }

        .call-controls, .incoming-call-controls {
            display: flex;
            justify-content: center;
            gap: 10px;
        }

        .call-control-button {
            padding: 8px 15px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }

        #endCallButton, #rejectCallButton {
            background-color: #f44336;
            color: white;
        }

        #acceptCallButton {
            background-color: #4CAF50;
            color: white;
        }
    `;

    // Adicionar elementos ao DOM
    document.head.appendChild(style);
    document.body.appendChild(callUI);
    document.body.appendChild(incomingCallUI);

    // Função para mostrar o botão de chamada quando um chat está aberto
    function updateCallButtonVisibility() {
        const chatHeader = document.getElementById('chatHeader');
        const activeChat = document.getElementById('activeChat');

        // Verificar se o chat está ativo e visível
        if (chatHeader && window.currentChatUser && activeChat && activeChat.style.display !== 'none') {
            console.log('Chat aberto com:', window.currentChatUser.username);

            // Verificar se o botão já existe no DOM
            if (!document.getElementById('callButton')) {
                console.log('Adicionando botão de chamada ao cabeçalho');

                // Adicionar o botão ao cabeçalho do chat
                const userInfoElement = chatHeader.querySelector('.chat-user-info');
                if (userInfoElement) {
                    console.log('Elemento de informações do usuário encontrado, adicionando botão após ele');
                    userInfoElement.parentNode.insertBefore(callButton, userInfoElement.nextSibling);
                } else {
                    console.log('Elemento de informações do usuário não encontrado, adicionando botão ao final do cabeçalho');
                    chatHeader.appendChild(callButton);
                }

                // Garantir que o botão esteja visível
                callButton.style.display = 'inline-block';
                callButton.style.marginLeft = '10px';
                callButton.style.position = 'absolute';
                callButton.style.right = '10px';
                callButton.style.top = '50%';
                callButton.style.transform = 'translateY(-50%)';
            } else {
                // Botão já existe, apenas garantir que esteja visível
                callButton.style.display = 'inline-block';
            }
        } else {
            // Chat não está aberto ou não está visível
            if (document.getElementById('callButton')) {
                console.log('Chat não está aberto ou usuário não definido, ocultando botão');
                callButton.style.display = 'none';
            }
        }
    }

    // Observar mudanças no DOM para detectar quando o chat é aberto
    const observer = new MutationObserver(function() {
        updateCallButtonVisibility();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Verificar periodicamente se o botão de chamada deve ser exibido
    setInterval(updateCallButtonVisibility, 1000);

    // Escutar o evento personalizado 'chatStarted'
    document.addEventListener('chatStarted', function(event) {
        console.log('Evento chatStarted recebido:', event.detail.user);
        // Atualizar a visibilidade do botão de chamada
        setTimeout(updateCallButtonVisibility, 100);
        setTimeout(updateCallButtonVisibility, 500);
    });

    // Configurar eventos
    callButton.addEventListener('click', startCall);
    document.getElementById('endCallButton').addEventListener('click', endCall);
    document.getElementById('acceptCallButton').addEventListener('click', acceptCall);
    document.getElementById('rejectCallButton').addEventListener('click', rejectCall);

    // Iniciar chamada
    async function startCall() {
        if (!window.currentChatUser) {
            alert('Selecione um contato para iniciar uma chamada');
            return;
        }

        if (callInProgress) {
            alert('Você já está em uma chamada');
            return;
        }

        try {
            console.log('Solicitando acesso ao microfone...');
            localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log('Acesso ao microfone concedido');

            currentCallUser = window.currentChatUser;
            callInProgress = true;

            // Mostrar interface de chamada
            callUI.style.display = 'block';
            document.getElementById('callStatus').textContent = `Chamando ${currentCallUser.username}...`;

            // Inicializar conexão WebRTC
            initializePeerConnection();

            // Notificar o servidor sobre a chamada
            if (window.socket) {
                window.socket.emit('callUser', {
                    targetUserId: currentCallUser._id,
                    callerName: window.userInfo.username
                });
                console.log(`Iniciando chamada para ${currentCallUser.username}`);
            } else {
                alert('Erro: Socket não disponível');
                endCall();
            }
        } catch (error) {
            console.error('Erro ao iniciar chamada:', error);
            alert('Não foi possível acessar o microfone. Verifique as permissões do navegador.');
            endCall();
        }
    }

    // Aceitar chamada
    async function acceptCall() {
        try {
            console.log('Aceitando chamada...');
            localStream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Ocultar notificação de chamada recebida
            incomingCallUI.style.display = 'none';

            // Mostrar interface de chamada
            callUI.style.display = 'block';
            document.getElementById('callStatus').textContent = 'Conectando...';

            // Inicializar conexão WebRTC
            initializePeerConnection();

            // Notificar o servidor que a chamada foi aceita
            if (window.socket) {
                window.socket.emit('acceptCall', {
                    targetUserId: currentCallUser._id
                });
            }
        } catch (error) {
            console.error('Erro ao aceitar chamada:', error);
            alert('Não foi possível acessar o microfone. Verifique as permissões do navegador.');
            rejectCall();
        }
    }

    // Rejeitar chamada
    function rejectCall() {
        console.log('Rejeitando chamada...');

        // Notificar o servidor que a chamada foi rejeitada
        if (window.socket && currentCallUser) {
            window.socket.emit('rejectCall', {
                targetUserId: currentCallUser._id
            });
        }

        // Ocultar notificação de chamada recebida
        incomingCallUI.style.display = 'none';

        // Resetar estado
        currentCallUser = null;
        callInProgress = false;
    }

    // Encerrar chamada
    function endCall() {
        console.log('Encerrando chamada...');

        // Notificar o servidor que a chamada foi encerrada
        if (window.socket && currentCallUser) {
            window.socket.emit('endCall', {
                targetUserId: currentCallUser._id
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

        // Ocultar interfaces
        callUI.style.display = 'none';
        incomingCallUI.style.display = 'none';

        // Resetar estado
        currentCallUser = null;
        callInProgress = false;
    }

    // Inicializar conexão WebRTC
    function initializePeerConnection() {
        console.log('Inicializando conexão WebRTC...');

        // Configuração de servidores STUN/TURN
        const configuration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        };

        peerConnection = new RTCPeerConnection(configuration);

        // Adicionar stream de áudio local
        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
        });

        // Lidar com candidatos ICE
        peerConnection.onicecandidate = event => {
            if (event.candidate && window.socket && currentCallUser) {
                window.socket.emit('iceCandidate', {
                    targetUserId: currentCallUser._id,
                    candidate: event.candidate
                });
            }
        };

        // Lidar com mudanças de estado de conexão
        peerConnection.onconnectionstatechange = () => {
            console.log('Estado da conexão:', peerConnection.connectionState);

            if (peerConnection.connectionState === 'connected') {
                document.getElementById('callStatus').textContent = 'Chamada conectada';
            } else if (['disconnected', 'failed', 'closed'].includes(peerConnection.connectionState)) {
                endCall();
            }
        };

        // Lidar com streams remotos
        peerConnection.ontrack = event => {
            console.log('Stream remoto recebido');
            const remoteAudio = document.createElement('audio');
            remoteAudio.id = 'remoteAudio';
            remoteAudio.autoplay = true;
            remoteAudio.srcObject = event.streams[0];
            document.body.appendChild(remoteAudio);
        };

        // Criar oferta se for o chamador
        if (callInProgress && document.getElementById('callStatus').textContent.includes('Chamando')) {
            createAndSendOffer();
        }
    }

    // Criar e enviar oferta
    async function createAndSendOffer() {
        try {
            console.log('Criando oferta...');
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);

            if (window.socket && currentCallUser) {
                window.socket.emit('offer', {
                    targetUserId: currentCallUser._id,
                    offer: offer
                });
            }
        } catch (error) {
            console.error('Erro ao criar oferta:', error);
            endCall();
        }
    }

    // Configurar eventos de socket para sinalização WebRTC
    if (window.socket) {
        // Chamada recebida
        window.socket.on('incomingCall', data => {
            console.log('Chamada recebida de:', data.callerName);

            if (callInProgress) {
                // Já está em uma chamada, rejeitar automaticamente
                window.socket.emit('rejectCall', {
                    targetUserId: data.callerId
                });
                return;
            }

            // Configurar dados da chamada
            currentCallUser = { _id: data.callerId, username: data.callerName };
            callInProgress = true;

            // Mostrar notificação de chamada recebida
            document.getElementById('callerName').textContent = data.callerName;
            incomingCallUI.style.display = 'block';

            // Reproduzir som de chamada (opcional)
            // Pode ser implementado posteriormente
        });

        // Chamada aceita
        window.socket.on('callAccepted', () => {
            console.log('Chamada aceita');
            document.getElementById('callStatus').textContent = 'Conectando...';
        });

        // Chamada rejeitada
        window.socket.on('callRejected', () => {
            console.log('Chamada rejeitada');
            alert('Chamada rejeitada');
            endCall();
        });

        // Chamada encerrada
        window.socket.on('callEnded', () => {
            console.log('Chamada encerrada pelo outro usuário');
            alert('Chamada encerrada pelo outro usuário');
            endCall();
        });

        // Candidato ICE recebido
        window.socket.on('iceCandidate', data => {
            console.log('Candidato ICE recebido');
            if (peerConnection) {
                peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate))
                    .catch(error => console.error('Erro ao adicionar candidato ICE:', error));
            }
        });

        // Oferta recebida
        window.socket.on('offer', async data => {
            console.log('Oferta recebida');
            if (peerConnection && callInProgress) {
                try {
                    await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
                    const answer = await peerConnection.createAnswer();
                    await peerConnection.setLocalDescription(answer);

                    window.socket.emit('answer', {
                        targetUserId: currentCallUser._id,
                        answer: answer
                    });
                } catch (error) {
                    console.error('Erro ao processar oferta:', error);
                    endCall();
                }
            }
        });

        // Resposta recebida
        window.socket.on('answer', async data => {
            console.log('Resposta recebida');
            if (peerConnection && callInProgress) {
                try {
                    await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
                } catch (error) {
                    console.error('Erro ao processar resposta:', error);
                    endCall();
                }
            }
        });
    } else {
        console.error('Socket não disponível para chamadas de voz');
    }

    // Verificar se o navegador suporta WebRTC
    function checkWebRTCSupport() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.error('WebRTC não é suportado neste navegador');
            return false;
        }
        return true;
    }

    // Função de inicialização
    function init() {
        // Verificar suporte a WebRTC
        if (!checkWebRTCSupport()) {
            console.error('WebRTC não é suportado, chamadas de voz não estarão disponíveis');
            return;
        }

        console.log('Sistema de chamada de voz inicializado com sucesso');

        // Verificar imediatamente se o botão deve ser exibido
        updateCallButtonVisibility();

        // Verificar novamente após um curto período (para garantir que todos os elementos foram carregados)
        setTimeout(updateCallButtonVisibility, 1000);
        setTimeout(updateCallButtonVisibility, 3000);
    }

    // Inicializar o sistema
    init();
});
