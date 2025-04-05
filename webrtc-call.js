/**
 * Implementação de chamadas de voz com WebRTC
 * Este arquivo implementa a funcionalidade real de microfone para chamadas de voz
 */

// Variáveis globais para WebRTC
let localStream = null;
let peerConnection = null;
let remoteStream = null;
let currentCall = null;
let callTimeoutTimer = null;
let callTimerInterval = null;
let callDurationSeconds = 0;
let isMuted = false;

// Elementos da interface
let callUI = null;
let incomingCallUI = null;

// Inicializar o sistema de chamadas WebRTC
function initializeWebRTCCalls() {
    console.log('Inicializando sistema de chamadas WebRTC');

    // Verificar suporte a WebRTC
    if (!checkWebRTCSupport()) {
        console.error('WebRTC não é suportado neste navegador');
        return;
    }

    // Remover qualquer interface de chamada existente
    removeExistingCallUIs();

    // Configurar interface
    setupCallUI();

    // Configurar eventos de socket para sinalização WebRTC
    setupSocketEvents();

    console.log('Sistema de chamadas WebRTC inicializado com sucesso');
}

// Remover interfaces de chamada existentes
function removeExistingCallUIs() {
    // Remover elementos com IDs específicos
    const uiIds = ['webrtcCallUI', 'webrtcIncomingCallUI', 'callUI', 'incomingCallUI'];

    uiIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            console.log(`Removendo interface existente: ${id}`);
            element.remove();
        }
    });

    // Remover qualquer outro elemento que possa estar relacionado a chamadas
    const callElements = document.querySelectorAll('[id*="call"], [id*="Call"]');
    callElements.forEach(element => {
        if (!uiIds.includes(element.id) && element.id.toLowerCase().includes('call')) {
            console.log(`Removendo elemento relacionado a chamada: ${element.id}`);
            element.remove();
        }
    });
}

// Verificar se o navegador suporta WebRTC
function checkWebRTCSupport() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Seu navegador não suporta chamadas de voz. Por favor, use um navegador mais recente como Chrome, Firefox ou Edge.');
        return false;
    }

    if (!window.RTCPeerConnection) {
        alert('Seu navegador não suporta WebRTC. Por favor, use um navegador mais recente como Chrome, Firefox ou Edge.');
        return false;
    }

    return true;
}

// Configurar interface de chamada
function setupCallUI() {
    // Verificar se a interface já existe
    if (document.getElementById('webrtcCallUI')) {
        return;
    }

    // Criar interface de chamada
    callUI = document.createElement('div');
    callUI.id = 'webrtcCallUI';
    callUI.style.display = 'none';
    callUI.style.position = 'fixed';
    callUI.style.top = '50%';
    callUI.style.left = '50%';
    callUI.style.transform = 'translate(-50%, -50%)';
    callUI.style.backgroundColor = '#fff';
    callUI.style.borderRadius = '10px';
    callUI.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';
    callUI.style.padding = '20px';
    callUI.style.zIndex = '1000';
    callUI.style.display = 'flex';
    callUI.style.flexDirection = 'column';
    callUI.style.alignItems = 'center';
    callUI.style.justifyContent = 'center';
    callUI.style.width = '300px';
    callUI.style.height = '400px';

    callUI.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
            <div style="width: 100px; height: 100px; border-radius: 50%; background-color: #f0f0f0; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                <i class="fas fa-user" style="font-size: 50px; color: #666;"></i>
            </div>
            <h3 id="webrtcCallUsername" style="margin: 10px 0;">Usuário</h3>
            <p id="webrtcCallStatus" style="margin: 5px 0; color: #666;">Chamando...</p>
            <div id="webrtcCallTimer" style="font-family: monospace; font-size: 18px; margin: 10px 0;">00:00</div>
        </div>
        <div style="display: flex; gap: 20px;">
            <button id="webrtcToggleMuteButton" style="width: 50px; height: 50px; border-radius: 50%; border: none; background-color: #f0f0f0; cursor: pointer;">
                <i class="fas fa-microphone"></i>
            </button>
            <button id="webrtcEndCallButton" style="width: 50px; height: 50px; border-radius: 50%; border: none; background-color: #ff4d4d; color: white; cursor: pointer;">
                <i class="fas fa-phone-slash"></i>
            </button>
        </div>
        <div id="webrtcCallAudioContainer"></div>
    `;

    // Criar interface de chamada recebida
    incomingCallUI = document.createElement('div');
    incomingCallUI.id = 'webrtcIncomingCallUI';
    incomingCallUI.style.display = 'none';
    incomingCallUI.style.position = 'fixed';
    incomingCallUI.style.top = '50%';
    incomingCallUI.style.left = '50%';
    incomingCallUI.style.transform = 'translate(-50%, -50%)';
    incomingCallUI.style.backgroundColor = '#fff';
    incomingCallUI.style.borderRadius = '10px';
    incomingCallUI.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';
    incomingCallUI.style.padding = '20px';
    incomingCallUI.style.zIndex = '1000';
    incomingCallUI.style.display = 'flex';
    incomingCallUI.style.flexDirection = 'column';
    incomingCallUI.style.alignItems = 'center';
    incomingCallUI.style.justifyContent = 'center';
    incomingCallUI.style.width = '300px';

    incomingCallUI.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
            <div style="width: 80px; height: 80px; border-radius: 50%; background-color: #f0f0f0; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                <i class="fas fa-user" style="font-size: 40px; color: #666;"></i>
            </div>
            <h3 id="webrtcCallerName" style="margin: 10px 0;">Usuário</h3>
            <p style="margin: 5px 0; color: #666;">está chamando...</p>
        </div>
        <div style="display: flex; gap: 20px;">
            <button id="webrtcAcceptCallButton" style="padding: 10px 20px; border-radius: 20px; border: none; background-color: #4CAF50; color: white; cursor: pointer;">
                <i class="fas fa-phone"></i> Atender
            </button>
            <button id="webrtcRejectCallButton" style="padding: 10px 20px; border-radius: 20px; border: none; background-color: #ff4d4d; color: white; cursor: pointer;">
                <i class="fas fa-phone-slash"></i> Rejeitar
            </button>
        </div>
    `;

    // Adicionar interfaces ao corpo do documento
    document.body.appendChild(callUI);
    document.body.appendChild(incomingCallUI);

    // Configurar eventos de clique
    document.getElementById('webrtcToggleMuteButton').addEventListener('click', toggleMute);
    document.getElementById('webrtcEndCallButton').addEventListener('click', endCall);
    document.getElementById('webrtcAcceptCallButton').addEventListener('click', acceptCall);
    document.getElementById('webrtcRejectCallButton').addEventListener('click', rejectCall);
}

// Configurar eventos de socket para sinalização WebRTC
function setupSocketEvents() {
    if (!window.socket) {
        console.error('Socket não disponível para chamadas WebRTC');
        return;
    }

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
}

// Iniciar uma chamada
async function startCall(userId, username) {
    try {
        // Verificar se já está em uma chamada
        if (currentCall) {
            alert('Você já está em uma chamada');
            return;
        }

        console.log(`Iniciando chamada para ${username} (${userId})`);

        // Remover qualquer interface de chamada existente
        removeExistingCallUIs();

        // Recriar a interface de chamada
        setupCallUI();

        // Solicitar acesso ao microfone com tratamento de erro detalhado
        try {
            console.log('Solicitando acesso ao microfone...');
            localStream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: false
            });
            console.log('Acesso ao microfone concedido:', localStream);

            // Verificar se o stream tem faixas de áudio
            if (localStream.getAudioTracks().length === 0) {
                throw new Error('Nenhuma faixa de áudio disponível no stream');
            }

            // Verificar se as faixas de áudio estão ativas
            const audioTrack = localStream.getAudioTracks()[0];
            console.log('Faixa de áudio:', audioTrack);
            console.log('Estado da faixa de áudio:', audioTrack.enabled, audioTrack.readyState);

            // Criar um elemento de áudio para teste local (opcional)
            const testAudio = document.createElement('audio');
            testAudio.srcObject = localStream;
            testAudio.volume = 0; // Mudo para evitar feedback
            document.body.appendChild(testAudio);
        } catch (err) {
            console.error('Erro ao acessar o microfone:', err);
            throw err;
        }

        // Configurar a chamada
        currentCall = {
            userId: userId,
            username: username,
            direction: 'outgoing',
            startTime: Date.now()
        };

        // Inicializar conexão WebRTC
        initializePeerConnection();

        // Criar e enviar oferta
        await createAndSendOffer();

        // Mostrar interface de chamada
        showCallUI('Chamando...');

        // Notificar o servidor sobre a chamada
        window.socket.emit('callUser', {
            targetUserId: userId,
            callerName: window.userInfo ? window.userInfo.username : 'Usuário'
        });

        console.log('Notificação de chamada enviada para', userId);

        // Configurar temporizador de timeout
        if (callTimeoutTimer) {
            clearTimeout(callTimeoutTimer);
        }

        callTimeoutTimer = setTimeout(() => {
            if (currentCall && currentCall.direction === 'outgoing') {
                console.log('Timeout da chamada atingido');
                alert('Ninguém atendeu a chamada');
                endCall();
            }
        }, 30000); // 30 segundos

    } catch (error) {
        console.error('Erro ao iniciar chamada:', error);
        alert('Não foi possível acessar o microfone. Verifique as permissões do navegador.');

        // Limpar recursos
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            localStream = null;
        }
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

    // Criar conexão peer
    peerConnection = new RTCPeerConnection(configuration);

    // Adicionar stream de áudio local
    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });

    // Lidar com candidatos ICE
    peerConnection.onicecandidate = event => {
        if (event.candidate && currentCall) {
            console.log('Enviando candidato ICE:', event.candidate);
            window.socket.emit('iceCandidate', {
                targetUserId: currentCall.userId,
                candidate: event.candidate
            });
        }
    };

    // Lidar com mudanças de estado de conexão ICE
    peerConnection.oniceconnectionstatechange = () => {
        console.log('Estado de conexão ICE:', peerConnection.iceConnectionState);

        if (peerConnection.iceConnectionState === 'disconnected' ||
            peerConnection.iceConnectionState === 'failed' ||
            peerConnection.iceConnectionState === 'closed') {
            console.log('Conexão ICE perdida ou fechada');
            endCall();
        }
    };

    // Lidar com stream remoto
    peerConnection.ontrack = event => {
        console.log('Stream remoto recebido:', event.streams[0]);
        remoteStream = event.streams[0];

        // Adicionar áudio remoto à interface
        const audioContainer = document.getElementById('webrtcCallAudioContainer');
        if (audioContainer) {
            // Remover qualquer áudio existente
            audioContainer.innerHTML = '';

            // Criar elemento de áudio
            const audioElement = document.createElement('audio');
            audioElement.autoplay = true;
            audioElement.srcObject = remoteStream;

            audioContainer.appendChild(audioElement);
        }
    };
}

// Criar e enviar oferta SDP
async function createAndSendOffer() {
    try {
        if (!peerConnection || !currentCall) {
            console.error('Conexão peer ou chamada atual não disponível');
            return;
        }

        // Criar oferta
        const offer = await peerConnection.createOffer({
            offerToReceiveAudio: true
        });

        // Definir descrição local
        await peerConnection.setLocalDescription(offer);

        console.log('Oferta criada:', offer);

        // Enviar oferta para o destinatário
        window.socket.emit('offer', {
            targetUserId: currentCall.userId,
            offer: offer
        });

    } catch (error) {
        console.error('Erro ao criar oferta:', error);
        alert('Erro ao estabelecer conexão de chamada');
        endCall();
    }
}

// Lidar com chamada recebida
function handleIncomingCall(data) {
    const { callerId, callerName } = data;

    console.log(`Chamada recebida de ${callerName} (${callerId})`);

    // Verificar se já está em uma chamada
    if (currentCall) {
        console.log('Já está em uma chamada, rejeitando automaticamente');
        window.socket.emit('callRejected', {
            targetUserId: callerId,
            reason: 'Ocupado'
        });
        return;
    }

    // Configurar a chamada
    currentCall = {
        userId: callerId,
        username: callerName,
        direction: 'incoming'
    };

    // Mostrar interface de chamada recebida
    document.getElementById('webrtcCallerName').textContent = callerName;
    incomingCallUI.style.display = 'flex';

    // Reproduzir som de chamada (se implementado)
    if (window.playRingtone) {
        window.playRingtone();
    }
}

// Aceitar chamada recebida
async function acceptCall() {
    try {
        // Verificar se temos uma chamada atual
        if (!currentCall) {
            console.error('Tentando aceitar chamada, mas não há chamada atual');
            return;
        }

        console.log('Aceitando chamada de', currentCall.username);

        // Remover qualquer interface de chamada existente, exceto a atual
        removeExistingCallUIs();

        // Parar som de chamada (se implementado)
        if (window.stopRingtone) {
            window.stopRingtone();
        }

        // Ocultar interface de chamada recebida
        if (incomingCallUI) {
            incomingCallUI.style.display = 'none';
        }

        // Solicitar acesso ao microfone com tratamento de erro detalhado
        try {
            console.log('Solicitando acesso ao microfone...');
            localStream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: false
            });
            console.log('Acesso ao microfone concedido:', localStream);

            // Verificar se o stream tem faixas de áudio
            if (localStream.getAudioTracks().length === 0) {
                throw new Error('Nenhuma faixa de áudio disponível no stream');
            }

            // Verificar se as faixas de áudio estão ativas
            const audioTrack = localStream.getAudioTracks()[0];
            console.log('Faixa de áudio:', audioTrack);
            console.log('Estado da faixa de áudio:', audioTrack.enabled, audioTrack.readyState);
        } catch (err) {
            console.error('Erro ao acessar o microfone:', err);
            throw err;
        }

        // Inicializar conexão WebRTC
        initializePeerConnection();

        // Mostrar interface de chamada
        showCallUI('Conectando...');

        // Notificar o servidor que a chamada foi aceita
        window.socket.emit('acceptCall', {
            targetUserId: currentCall.userId
        });

        console.log('Notificação de aceitação enviada para', currentCall.userId);

        // Forçar atualização da interface após um curto período
        setTimeout(() => {
            showCallUI('Conectado');
            startCallTimer();
        }, 2000);

    } catch (error) {
        console.error('Erro ao aceitar chamada:', error);
        alert('Não foi possível acessar o microfone. Verifique as permissões do navegador.');
        rejectCall();
    }
}

// Rejeitar chamada recebida
function rejectCall() {
    console.log('Rejeitando chamada de', currentCall ? currentCall.username : 'desconhecido');

    // Parar som de chamada (se implementado)
    if (window.stopRingtone) {
        window.stopRingtone();
    }

    // Ocultar interface de chamada recebida
    incomingCallUI.style.display = 'none';

    // Notificar o servidor que a chamada foi rejeitada
    if (currentCall) {
        window.socket.emit('callRejected', {
            targetUserId: currentCall.userId,
            reason: 'Rejeitado pelo usuário'
        });
    }

    // Limpar chamada atual
    currentCall = null;
}

// Lidar com chamada aceita
function handleCallAccepted(data) {
    console.log('Chamada aceita:', data);
    console.log('Estado atual da chamada:', currentCall);

    // Verificar se estamos em uma chamada de saída
    if (!currentCall) {
        console.error('Recebido evento callAccepted, mas não estamos em uma chamada');
        return;
    }

    if (currentCall.direction !== 'outgoing') {
        console.error('Recebido evento callAccepted, mas não estamos em uma chamada de saída');
        console.log('Direção atual da chamada:', currentCall.direction);
        return;
    }

    // Limpar temporizador de timeout
    if (callTimeoutTimer) {
        clearTimeout(callTimeoutTimer);
        callTimeoutTimer = null;
    }

    // Atualizar interface
    const statusElement = document.getElementById('webrtcCallStatus');
    if (statusElement) {
        statusElement.textContent = 'Conectado';
    } else {
        console.error('Elemento webrtcCallStatus não encontrado');
    }

    // Forçar atualização da interface
    showCallUI('Conectado');

    // Iniciar temporizador de chamada
    startCallTimer();

    // Notificar o usuário
    console.log('Chamada conectada com', currentCall.username);
}

// Lidar com chamada rejeitada
function handleCallRejected(data) {
    console.log('Chamada rejeitada:', data);

    // Limpar temporizador de timeout
    if (callTimeoutTimer) {
        clearTimeout(callTimeoutTimer);
        callTimeoutTimer = null;
    }

    // Mostrar mensagem
    alert(`Chamada rejeitada: ${data.reason || 'Usuário ocupado'}`);

    // Encerrar chamada
    endCall();
}

// Lidar com candidato ICE recebido
function handleIceCandidate(data) {
    const { senderId, candidate } = data;

    console.log('Candidato ICE recebido de', senderId);

    if (!peerConnection || !currentCall || currentCall.userId !== senderId) {
        console.error('Recebido candidato ICE, mas não estamos em uma chamada com este usuário');
        return;
    }

    try {
        // Adicionar candidato ICE à conexão peer
        peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
        console.error('Erro ao adicionar candidato ICE:', error);
    }
}

// Lidar com oferta SDP recebida
async function handleOffer(data) {
    const { senderId, offer } = data;

    console.log('Oferta recebida de', senderId);

    if (!peerConnection || !currentCall || currentCall.userId !== senderId) {
        console.error('Recebido oferta, mas não estamos em uma chamada com este usuário');
        return;
    }

    try {
        // Definir descrição remota
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

        // Criar resposta
        const answer = await peerConnection.createAnswer();

        // Definir descrição local
        await peerConnection.setLocalDescription(answer);

        console.log('Resposta criada:', answer);

        // Enviar resposta para o remetente
        window.socket.emit('answer', {
            targetUserId: senderId,
            answer: answer
        });

    } catch (error) {
        console.error('Erro ao processar oferta:', error);
        alert('Erro ao estabelecer conexão de chamada');
        endCall();
    }
}

// Lidar com resposta SDP recebida
async function handleAnswer(data) {
    const { senderId, answer } = data;

    console.log('Resposta recebida de', senderId);

    if (!peerConnection || !currentCall || currentCall.userId !== senderId) {
        console.error('Recebido resposta, mas não estamos em uma chamada com este usuário');
        return;
    }

    try {
        // Definir descrição remota
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
        console.error('Erro ao processar resposta:', error);
        alert('Erro ao estabelecer conexão de chamada');
        endCall();
    }
}

// Lidar com chamada encerrada pelo outro usuário
function handleCallEnded(data) {
    console.log('Chamada encerrada pelo outro usuário:', data);

    // Mostrar mensagem
    alert('O outro usuário encerrou a chamada');

    // Encerrar chamada localmente
    endCall(false); // Não notificar o servidor, pois a chamada já foi encerrada
}

// Encerrar chamada
function endCall(notifyServer = true) {
    console.log('Encerrando chamada');

    // Limpar temporizador de timeout
    if (callTimeoutTimer) {
        clearTimeout(callTimeoutTimer);
        callTimeoutTimer = null;
    }

    // Parar temporizador de chamada
    stopCallTimer();

    // Ocultar interfaces
    callUI.style.display = 'none';
    incomingCallUI.style.display = 'none';

    // Notificar o servidor que a chamada foi encerrada
    if (notifyServer && currentCall) {
        window.socket.emit('endCall', {
            targetUserId: currentCall.userId
        });
    }

    // Fechar conexão peer
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }

    // Parar streams
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }

    remoteStream = null;

    // Limpar chamada atual
    currentCall = null;

    // Resetar estado de mudo
    isMuted = false;
    const muteButton = document.getElementById('webrtcToggleMuteButton');
    if (muteButton) {
        muteButton.innerHTML = '<i class="fas fa-microphone"></i>';
    }
}

// Alternar mudo/não mudo
function toggleMute() {
    if (!localStream) return;

    isMuted = !isMuted;

    // Atualizar botão
    const muteButton = document.getElementById('webrtcToggleMuteButton');
    if (muteButton) {
        muteButton.innerHTML = isMuted ?
            '<i class="fas fa-microphone-slash"></i>' :
            '<i class="fas fa-microphone"></i>';
    }

    // Ativar/desativar faixas de áudio
    localStream.getAudioTracks().forEach(track => {
        track.enabled = !isMuted;
    });

    console.log('Microfone ' + (isMuted ? 'desativado' : 'ativado'));
}

// Mostrar interface de chamada
function showCallUI(status) {
    // Verificar se a interface existe
    if (!callUI || !document.body.contains(callUI)) {
        console.error('Interface de chamada não encontrada, recriando...');
        setupCallUI();
    }

    // Verificar se temos uma chamada atual
    if (!currentCall) {
        console.error('Tentando mostrar interface de chamada, mas não há chamada atual');
        return;
    }

    // Verificar se os elementos existem
    const usernameElement = document.getElementById('webrtcCallUsername');
    const statusElement = document.getElementById('webrtcCallStatus');
    const timerElement = document.getElementById('webrtcCallTimer');

    if (!usernameElement || !statusElement || !timerElement) {
        console.error('Elementos da interface de chamada não encontrados');
        console.log('Elementos encontrados:', {
            usernameElement: !!usernameElement,
            statusElement: !!statusElement,
            timerElement: !!timerElement
        });
        return;
    }

    // Atualizar interface
    usernameElement.textContent = currentCall.username;
    statusElement.textContent = status || 'Chamando...';
    timerElement.textContent = '00:00';

    // Mostrar interface
    callUI.style.display = 'flex';

    // Trazer para frente
    callUI.style.zIndex = '1000';

    console.log('Interface de chamada atualizada:', {
        username: currentCall.username,
        status: status || 'Chamando...'
    });
}

// Temporizador de chamada
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
    document.getElementById('webrtcCallTimer').textContent = `${minutes}:${seconds}`;
}

// Exportar funções
window.webrtcCall = {
    initialize: initializeWebRTCCalls,
    startCall: startCall,
    endCall: endCall,
    isCallActive: () => !!currentCall
};

// Inicializar automaticamente quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se o script Font Awesome está carregado
    if (!document.querySelector('link[href*="font-awesome"]')) {
        // Adicionar Font Awesome
        const fontAwesome = document.createElement('link');
        fontAwesome.rel = 'stylesheet';
        fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
        document.head.appendChild(fontAwesome);
    }

    // Inicializar sistema de chamadas WebRTC
    setTimeout(initializeWebRTCCalls, 1000); // Atraso para garantir que o socket esteja disponível
});
