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
let pendingIceCandidates = []; // Candidatos ICE pendentes

// Variáveis para monitoramento do microfone
let micMonitorActive = false;
let micMonitorNode = null;
let micMonitorGainNode = null;
let audioContext = null;

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

    // Limpar recursos existentes
    cleanupWebRTCResources();

    // Remover qualquer interface de chamada existente
    removeExistingCallUIs();

    // Configurar interface
    setupCallUI();

    // Configurar eventos de socket para sinalização WebRTC
    setupSocketEvents();

    console.log('Sistema de chamadas WebRTC inicializado com sucesso');
}

// Limpar recursos WebRTC existentes
function cleanupWebRTCResources() {
    console.log('Limpando recursos WebRTC existentes');

    // Parar streams existentes
    if (localStream) {
        localStream.getTracks().forEach(track => {
            track.stop();
            console.log(`Faixa parada: ${track.kind}`);
        });
        localStream = null;
    }

    if (remoteStream) {
        remoteStream.getTracks().forEach(track => {
            track.stop();
            console.log(`Faixa remota parada: ${track.kind}`);
        });
        remoteStream = null;
    }

    // Fechar conexão peer existente
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
        console.log('Conexão peer fechada');
    }

    // Parar monitoramento do microfone
    if (micMonitorActive) {
        stopMicrophoneMonitor();
    }

    // Limpar contexto de áudio
    if (audioContext && audioContext.state !== 'closed') {
        try {
            audioContext.close();
            console.log('Contexto de áudio fechado');
        } catch (e) {
            console.error('Erro ao fechar contexto de áudio:', e);
        }
        audioContext = null;
    }

    // Limpar temporizadores
    if (callTimeoutTimer) {
        clearTimeout(callTimeoutTimer);
        callTimeoutTimer = null;
    }

    if (callTimerInterval) {
        clearInterval(callTimerInterval);
        callTimerInterval = null;
    }

    // Resetar variáveis
    callDurationSeconds = 0;
    isMuted = false;
    pendingIceCandidates = [];
    currentCall = null;

    console.log('Recursos WebRTC limpos com sucesso');
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

            <!-- Indicadores de status de áudio -->
            <div style="display: flex; justify-content: center; gap: 15px; margin-top: 5px;">
                <div id="micStatus" style="display: flex; align-items: center; font-size: 12px; color: #4CAF50;">
                    <i class="fas fa-microphone" style="margin-right: 5px;"></i> Microfone ativo
                </div>
                <div id="speakerStatus" style="display: flex; align-items: center; font-size: 12px; color: #4CAF50;">
                    <i class="fas fa-volume-up" style="margin-right: 5px;"></i> Alto-falante ativo
                </div>
            </div>
        </div>
        <div style="display: flex; gap: 20px;" class="call-controls">
            <button id="webrtcToggleMuteButton" style="width: 50px; height: 50px; border-radius: 50%; border: none; background-color: #4CAF50; color: white; cursor: pointer;">
                <i class="fas fa-microphone"></i>
            </button>
            <button id="webrtcToggleMonitorButton" style="width: 50px; height: 50px; border-radius: 50%; border: none; background-color: #9e9e9e; color: white; cursor: pointer;" title="Ativar monitoramento do microfone">
                <i class="fas fa-headphones-alt"></i>
            </button>
            <button id="webrtcEndCallButton" style="width: 50px; height: 50px; border-radius: 50%; border: none; background-color: #ff4d4d; color: white; cursor: pointer;">
                <i class="fas fa-phone-slash"></i>
            </button>
        </div>
        <div id="webrtcCallAudioContainer"></div>

        <!-- Mensagem de ajuda -->
        <div style="margin-top: 15px; font-size: 12px; color: #666; text-align: center;">
            Se não ouvir o outro usuário, verifique se o volume do seu dispositivo está ligado.
            <button id="webrtcDiagnosticsButton" style="margin-top: 10px; padding: 5px 10px; background-color: #f0f0f0; border: 1px solid #ddd; border-radius: 4px; cursor: pointer;">
                Executar diagnóstico
            </button>
        </div>
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
    document.getElementById('webrtcToggleMonitorButton').addEventListener('click', toggleMicrophoneMonitor);
    document.getElementById('webrtcEndCallButton').addEventListener('click', endCall);
    document.getElementById('webrtcAcceptCallButton').addEventListener('click', acceptCall);
    document.getElementById('webrtcRejectCallButton').addEventListener('click', rejectCall);
    document.getElementById('webrtcDiagnosticsButton').addEventListener('click', runDiagnostics);

    // Verificar configuração de monitoramento do microfone
    const savedMonitorState = localStorage.getItem('micMonitorActive');
    if (savedMonitorState === 'true') {
        micMonitorActive = true;
        updateMonitorButton();
    }
}

// Função para executar diagnósticos
async function runDiagnostics() {
    console.log('Executando diagnósticos de chamada...');

    // Verificar se temos a ferramenta de diagnóstico
    if (!window.webrtcDiagnostics) {
        console.error('Ferramenta de diagnóstico não disponível');
        alert('Ferramenta de diagnóstico não disponível. Verifique se o arquivo webrtc-diagnostics.js está carregado.');
        return;
    }

    try {
        // Executar diagnóstico completo
        const results = await window.webrtcDiagnostics.runFullDiagnostics();

        // Exibir resultados
        console.log('Resultados do diagnóstico:', results);

        // Criar mensagem para o usuário
        let message = 'Resultados do diagnóstico:\n\n';

        // Microfone
        message += '🎤 Microfone: ' + (results.microphone.success ? '✅ Funcionando' : '❌ Problema') + '\n';
        if (!results.microphone.success) {
            message += '   - ' + results.microphone.error + '\n';
        }

        // Reprodução de áudio
        message += '🔊 Alto-falante: ' + (results.audioPlayback.success ? '✅ Funcionando' : '❌ Problema') + '\n';
        if (!results.audioPlayback.success) {
            message += '   - ' + results.audioPlayback.error + '\n';
        }

        // Conexão WebRTC
        if (results.connection.supported) {
            message += '🌐 Conexão WebRTC: ' + (results.connection.connected ? '✅ Conectado' : '❌ Problema') + '\n';
            if (!results.connection.connected && results.connection.error) {
                message += '   - ' + results.connection.error + '\n';
            }

            // Stream remoto
            if (results.connection.remoteStream) {
                message += '📡 Stream remoto: ' + (results.connection.remoteStream.available ? '✅ Disponível' : '❌ Indisponível') + '\n';
                if (results.connection.remoteStream.available) {
                    message += '   - Faixas de áudio: ' + results.connection.remoteStream.audioTracksCount + '\n';
                }
            }

            // Elemento de áudio
            if (results.connection.audioElement) {
                message += '🔈 Elemento de áudio: ' + (!results.connection.audioElement.paused ? '✅ Reproduzindo' : '❌ Pausado') + '\n';
                message += '   - Volume: ' + Math.round(results.connection.audioElement.volume * 100) + '%\n';
                message += '   - Mudo: ' + (results.connection.audioElement.muted ? 'Sim' : 'Não') + '\n';
            }
        } else {
            message += '🌐 Conexão WebRTC: ❌ Não suportada\n';
        }

        // Exibir mensagem
        alert(message);

        // Tentar corrigir problemas automaticamente
        if (results.connection.remoteStream && results.connection.remoteStream.available) {
            if (results.connection.audioElement && results.connection.audioElement.paused) {
                console.log('Tentando reproduzir áudio automaticamente...');
                const audioElement = document.getElementById('remoteAudio');
                if (audioElement) {
                    audioElement.play().catch(e => {
                        console.error('Erro ao reproduzir áudio:', e);
                    });
                }
            }
        }

    } catch (error) {
        console.error('Erro ao executar diagnóstico:', error);
        alert('Erro ao executar diagnóstico: ' + (error.message || 'Erro desconhecido'));
    }
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
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' },
            // Servidores TURN públicos gratuitos (podem ter limitações)
            {
                urls: 'turn:openrelay.metered.ca:80',
                username: 'openrelayproject',
                credential: 'openrelayproject'
            },
            {
                urls: 'turn:openrelay.metered.ca:443',
                username: 'openrelayproject',
                credential: 'openrelayproject'
            },
            {
                urls: 'turn:openrelay.metered.ca:443?transport=tcp',
                username: 'openrelayproject',
                credential: 'openrelayproject'
            },
            // Servidores TURN adicionais
            {
                urls: 'turn:relay.metered.ca:80',
                username: 'e7d69958f8c4c5e4868651',
                credential: 'Yzf5HYPrMGBfkM/E'
            },
            {
                urls: 'turn:relay.metered.ca:443',
                username: 'e7d69958f8c4c5e4868651',
                credential: 'Yzf5HYPrMGBfkM/E'
            },
            {
                urls: 'turn:relay.metered.ca:443?transport=tcp',
                username: 'e7d69958f8c4c5e4868651',
                credential: 'Yzf5HYPrMGBfkM/E'
            }
        ],
        iceCandidatePoolSize: 10,
        bundlePolicy: 'max-bundle',
        rtcpMuxPolicy: 'require',
        sdpSemantics: 'unified-plan'
    };

    console.log('Inicializando conexão WebRTC com configuração:', configuration);

    // Criar conexão peer
    peerConnection = new RTCPeerConnection(configuration);

    // Adicionar stream de áudio local com configurações avançadas
    localStream.getTracks().forEach(track => {
        console.log(`Adicionando faixa ${track.kind} à conexão peer:`, track);

        // Configurar parâmetros de áudio se for uma faixa de áudio
        if (track.kind === 'audio') {
            // Tentar obter e configurar as restrições de áudio
            try {
                const constraints = {
                    autoGainControl: true,
                    echoCancellation: true,
                    noiseSuppression: true,
                    channelCount: 1,
                    sampleRate: 48000,
                    sampleSize: 16
                };

                track.applyConstraints(constraints)
                    .then(() => console.log('Restrições de áudio aplicadas com sucesso'))
                    .catch(e => console.error('Erro ao aplicar restrições de áudio:', e));
            } catch (e) {
                console.error('Erro ao configurar restrições de áudio:', e);
            }
        }

        // Adicionar a faixa à conexão peer
        const sender = peerConnection.addTrack(track, localStream);

        // Configurar parâmetros de envio se disponível
        if (sender && sender.setParameters && sender.getParameters) {
            try {
                const parameters = sender.getParameters();
                if (!parameters.degradationPreference) {
                    parameters.degradationPreference = 'maintain-quality';
                }
                if (parameters.encodings && parameters.encodings.length > 0) {
                    parameters.encodings.forEach(encoding => {
                        encoding.priority = 'high';
                        encoding.networkPriority = 'high';
                    });
                }
                sender.setParameters(parameters)
                    .then(() => console.log('Parâmetros de envio configurados com sucesso'))
                    .catch(e => console.error('Erro ao configurar parâmetros de envio:', e));
            } catch (e) {
                console.error('Erro ao configurar parâmetros de envio:', e);
            }
        }
    });

    // Lidar com candidatos ICE
    peerConnection.onicecandidate = event => {
        if (event.candidate && currentCall) {
            console.log('Candidato ICE gerado:', event.candidate);

            // Enviar candidato ICE para o outro usuário
            window.socket.emit('iceCandidate', {
                targetUserId: currentCall.userId,
                candidate: event.candidate
            });

            console.log('Candidato ICE enviado para', currentCall.userId);
        } else if (!event.candidate) {
            console.log('Coleta de candidatos ICE concluída');
        }
    };

    // Lidar com estado de coleta de candidatos ICE
    peerConnection.onicegatheringstatechange = () => {
        console.log('Estado de coleta de candidatos ICE:', peerConnection.iceGatheringState);
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
        console.log('Faixas de áudio no stream remoto:', event.streams[0].getAudioTracks());
        remoteStream = event.streams[0];

        // Adicionar áudio remoto à interface
        const audioContainer = document.getElementById('webrtcCallAudioContainer');
        if (audioContainer) {
            // Remover qualquer áudio existente
            audioContainer.innerHTML = '';

            // Verificar se o stream tem faixas de áudio
            if (remoteStream.getAudioTracks().length === 0) {
                console.error('Stream remoto não tem faixas de áudio');
                updateSpeakerStatus(false, 'Sem áudio');

                // Tentar novamente em 2 segundos
                setTimeout(() => {
                    if (remoteStream && remoteStream.getAudioTracks().length > 0) {
                        console.log('Faixas de áudio encontradas após atraso');
                        setupRemoteAudio(audioContainer);
                    } else {
                        console.error('Ainda sem faixas de áudio após atraso');
                    }
                }, 2000);

                return;
            }

            setupRemoteAudio(audioContainer);
        }
    };

    // Lidar com mudanças de estado de conexão
    peerConnection.onconnectionstatechange = () => {
        console.log('Estado de conexão WebRTC:', peerConnection.connectionState);

        if (peerConnection.connectionState === 'connected') {
            console.log('Conexão WebRTC estabelecida com sucesso!');
            // Verificar se temos áudio remoto
            if (remoteStream && remoteStream.getAudioTracks().length > 0) {
                console.log('Faixas de áudio disponíveis no stream remoto');
            } else {
                console.warn('Conexão estabelecida, mas sem faixas de áudio');
            }
        } else if (peerConnection.connectionState === 'failed' ||
                   peerConnection.connectionState === 'disconnected' ||
                   peerConnection.connectionState === 'closed') {
            console.error('Conexão WebRTC falhou ou foi fechada');
            alert('A conexão de chamada foi perdida. Tentando reconectar...');
            // Tentar reconectar
            if (currentCall) {
                setTimeout(() => {
                    if (currentCall) {
                        createAndSendOffer();
                    }
                }, 1000);
            }
        }
    };

    // Atualizar status do microfone
    updateMicrophoneStatus(true);
}

// Função para configurar o áudio remoto
function setupRemoteAudio(container) {
    if (!remoteStream) {
        console.error('Stream remoto não disponível');
        return;
    }

    console.log('Configurando áudio remoto com stream:', remoteStream);
    console.log('Faixas de áudio no stream remoto:', remoteStream.getAudioTracks());

    // Remover qualquer elemento de áudio existente
    const existingAudio = document.getElementById('remoteAudio');
    if (existingAudio) {
        console.log('Removendo elemento de áudio existente');
        existingAudio.pause();
        existingAudio.srcObject = null;
        existingAudio.remove();
    }

    // Criar elemento de áudio com controles e configurações avançadas
    const audioElement = document.createElement('audio');
    audioElement.id = 'remoteAudio';
    audioElement.autoplay = true;
    audioElement.playsInline = true; // Importante para iOS
    audioElement.controls = true; // Adicionar controles para debug
    audioElement.volume = 1.0; // Volume máximo
    audioElement.srcObject = remoteStream;

    // Configurações adicionais para garantir a reprodução
    audioElement.setAttribute('playsinline', ''); // Redundante, mas importante para iOS
    audioElement.muted = false;

    // Adicionar atributos para debug
    audioElement.setAttribute('data-debug', 'remote-audio');
    audioElement.style.display = 'block'; // Tornar visível para debug
    audioElement.style.width = '100%';

    // Adicionar evento para verificar se o áudio está sendo reproduzido
    audioElement.onplay = () => {
        console.log('Áudio remoto está sendo reproduzido');
        // Atualizar status do alto-falante
        updateSpeakerStatus(true);
    };

    audioElement.onerror = (e) => {
        console.error('Erro ao reproduzir áudio remoto:', e);
        // Atualizar status do alto-falante
        updateSpeakerStatus(false, e.message);
    };

    // Adicionar evento para verificar se há dados de áudio
    audioElement.onloadedmetadata = () => {
        console.log('Metadados de áudio carregados:', audioElement.duration);
    };

    // Adicionar evento para verificar se o áudio está tocando
    audioElement.onplaying = () => {
        console.log('Áudio remoto está tocando');
    };

    // Adicionar evento para verificar quando o áudio é pausado
    audioElement.onpause = () => {
        console.log('Áudio remoto foi pausado');
    };

    // Adicionar evento para verificar quando o áudio termina
    audioElement.onended = () => {
        console.log('Áudio remoto terminou');
    };

    // Verificar se o áudio está sendo reproduzido periodicamente
    const audioCheckInterval = setInterval(() => {
        if (!remoteStream || !audioElement) {
            console.log('Stream remoto ou elemento de áudio não disponível, limpando intervalo');
            clearInterval(audioCheckInterval);
            return;
        }

        // Verificar estado do elemento de áudio
        console.log('Estado do áudio remoto:', {
            paused: audioElement.paused,
            ended: audioElement.ended,
            readyState: audioElement.readyState,
            currentTime: audioElement.currentTime,
            volume: audioElement.volume,
            muted: audioElement.muted
        });

        if (audioElement.paused) {
            console.warn('Áudio remoto está pausado, tentando reproduzir novamente');
            audioElement.play().catch(e => {
                console.error('Erro ao retomar reprodução de áudio:', e);
            });
            updateSpeakerStatus(false, 'Pausado');
        } else {
            // Verificar se há atividade de áudio
            if (remoteStream.getAudioTracks().length > 0) {
                const audioTrack = remoteStream.getAudioTracks()[0];
                console.log('Estado da faixa de áudio remota:', {
                    enabled: audioTrack.enabled,
                    muted: audioTrack.muted,
                    readyState: audioTrack.readyState
                });

                if (audioTrack.enabled && audioTrack.readyState === 'live') {
                    updateSpeakerStatus(true);
                } else {
                    updateSpeakerStatus(false, 'Faixa inativa');
                }
            }
        }
    }, 2000);

    // Adicionar ao container
    container.appendChild(audioElement);
    console.log('Elemento de áudio adicionado ao container');

    // Forçar a reprodução (importante para alguns navegadores)
    console.log('Tentando iniciar reprodução de áudio remoto...');
    audioElement.play().then(() => {
        console.log('Reprodução de áudio iniciada com sucesso');
        updateSpeakerStatus(true);
    }).catch(e => {
        console.error('Erro ao iniciar reprodução de áudio:', e);
        // Atualizar status do alto-falante
        updateSpeakerStatus(false, 'Erro de reprodução');

        // Tentar novamente com interação do usuário
        alert('Clique em OK para ativar o áudio da chamada');
        audioElement.play().then(() => {
            console.log('Reprodução de áudio iniciada após interação do usuário');
            updateSpeakerStatus(true);
        }).catch(e2 => {
            console.error('Falha na segunda tentativa de reprodução de áudio:', e2);
            updateSpeakerStatus(false, 'Falha na reprodução');

            // Tentar uma abordagem alternativa
            tryAlternativeAudioPlayback(remoteStream, container);
        });
    });

    return audioElement;
}

// Função para tentar uma abordagem alternativa de reprodução de áudio
function tryAlternativeAudioPlayback(stream, container) {
    console.log('Tentando abordagem alternativa para reprodução de áudio');

    try {
        // Criar um contexto de áudio para reprodução manual
        const altAudioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Criar fonte de mídia a partir do stream
        const source = altAudioContext.createMediaStreamSource(stream);

        // Conectar diretamente à saída de áudio
        source.connect(altAudioContext.destination);

        console.log('Abordagem alternativa de reprodução de áudio configurada');
        updateSpeakerStatus(true, 'Usando método alternativo');

        // Adicionar um elemento de áudio oculto como fallback
        const fallbackAudio = document.createElement('audio');
        fallbackAudio.id = 'fallbackAudio';
        fallbackAudio.autoplay = true;
        fallbackAudio.srcObject = stream;
        fallbackAudio.style.display = 'none';
        container.appendChild(fallbackAudio);

        return true;
    } catch (error) {
        console.error('Erro na abordagem alternativa de reprodução de áudio:', error);
        updateSpeakerStatus(false, 'Falha em todos os métodos');
        return false;
    }
}

// Criar e enviar oferta SDP
async function createAndSendOffer() {
    try {
        if (!peerConnection || !currentCall) {
            console.error('Conexão peer ou chamada atual não disponível');
            return;
        }

        // Verificar se já temos uma descrição local
        if (peerConnection.signalingState !== 'stable') {
            console.log('Estado de sinalização não estável, aguardando...');
            // Aguardar até que o estado de sinalização esteja estável
            await new Promise(resolve => {
                const checkState = () => {
                    if (peerConnection.signalingState === 'stable') {
                        resolve();
                    } else {
                        setTimeout(checkState, 500);
                    }
                };
                checkState();
            });
        }

        console.log('Criando oferta SDP...');

        // Criar oferta com configurações específicas
        const offer = await peerConnection.createOffer({
            offerToReceiveAudio: true,
            voiceActivityDetection: true
        });

        // Modificar SDP para melhorar a qualidade de áudio
        let sdp = offer.sdp;

        // Aumentar a prioridade do áudio
        sdp = sdp.replace('a=group:BUNDLE 0', 'a=group:BUNDLE audio');
        sdp = sdp.replace('a=mid:0', 'a=mid:audio');

        // Definir codec de áudio de alta qualidade
        if (sdp.includes('opus/48000/2')) {
            console.log('Configurando codec Opus para alta qualidade');
            // Adicionar parâmetros para melhorar a qualidade do áudio
            const opusLine = sdp.match(/a=rtpmap:(\d+) opus\/48000\/2/i);
            if (opusLine && opusLine.length > 1) {
                const opusPayloadType = opusLine[1];
                const fmtpLine = `a=fmtp:${opusPayloadType} minptime=10;useinbandfec=1;stereo=1;maxaveragebitrate=510000`;

                // Verificar se já existe uma linha fmtp para opus
                const existingFmtp = new RegExp(`a=fmtp:${opusPayloadType}.*`, 'g');
                if (sdp.match(existingFmtp)) {
                    // Substituir a linha existente
                    sdp = sdp.replace(existingFmtp, fmtpLine);
                } else {
                    // Adicionar nova linha após a linha rtpmap do opus
                    sdp = sdp.replace(opusLine[0], `${opusLine[0]}\r\n${fmtpLine}`);
                }
            }
        }

        // Atualizar SDP na oferta
        offer.sdp = sdp;
        console.log('SDP modificado para melhorar qualidade de áudio');

        // Definir descrição local
        await peerConnection.setLocalDescription(offer);

        console.log('Oferta criada e definida como descrição local');

        // Enviar oferta para o destinatário
        window.socket.emit('offer', {
            targetUserId: currentCall.userId,
            offer: offer
        });

        console.log('Oferta enviada para', currentCall.userId);

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

            // Iniciar monitoramento do microfone se ativado
            if (micMonitorActive) {
                startMicrophoneMonitor();
            }
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

    // Iniciar monitoramento do microfone se ativado
    if (micMonitorActive) {
        startMicrophoneMonitor();
    }

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
async function handleIceCandidate(data) {
    const { senderId, candidate } = data;

    console.log('Candidato ICE recebido de', senderId);

    if (!peerConnection || !currentCall || currentCall.userId !== senderId) {
        console.error('Recebido candidato ICE, mas não estamos em uma chamada com este usuário');
        return;
    }

    try {
        // Verificar se já temos uma descrição remota
        if (!peerConnection.remoteDescription || !peerConnection.remoteDescription.type) {
            // Ainda não temos uma descrição remota, armazenar o candidato para adicionar mais tarde
            console.log('Armazenando candidato ICE para adicionar mais tarde');
            pendingIceCandidates.push(new RTCIceCandidate(candidate));
            return;
        }

        // Adicionar candidato ICE à conexão peer
        console.log('Adicionando candidato ICE à conexão');
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        console.log('Candidato ICE adicionado com sucesso');
    } catch (error) {
        console.error('Erro ao adicionar candidato ICE:', error);
        // Armazenar o candidato para tentar adicionar mais tarde
        pendingIceCandidates.push(new RTCIceCandidate(candidate));
    }
}

// Lidar com oferta SDP recebida
async function handleOffer(data) {
    const { senderId, offer } = data;

    console.log('Oferta recebida de', senderId);
    console.log('Conteúdo da oferta:', offer);

    if (!peerConnection || !currentCall || currentCall.userId !== senderId) {
        console.error('Recebido oferta, mas não estamos em uma chamada com este usuário');
        return;
    }

    try {
        // Verificar se a oferta tem um SDP válido
        if (!offer || !offer.sdp) {
            console.error('Oferta SDP inválida recebida');
            return;
        }

        // Verificar se já temos uma descrição remota
        if (peerConnection.currentRemoteDescription) {
            console.log('Já temos uma descrição remota, ignorando oferta duplicada');
            return;
        }

        console.log('Definindo descrição remota da oferta...');

        // Definir descrição remota
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

        console.log('Descrição remota definida com sucesso');

        // Adicionar candidatos ICE pendentes
        if (pendingIceCandidates.length > 0) {
            console.log(`Adicionando ${pendingIceCandidates.length} candidatos ICE pendentes`);
            for (const candidate of pendingIceCandidates) {
                try {
                    await peerConnection.addIceCandidate(candidate);
                } catch (e) {
                    console.error('Erro ao adicionar candidato ICE pendente:', e);
                }
            }
            pendingIceCandidates = [];
        }

        console.log('Criando resposta...');

        // Criar resposta com configurações específicas
        const answer = await peerConnection.createAnswer({
            voiceActivityDetection: true
        });

        // Modificar SDP para melhorar a qualidade de áudio
        let sdp = answer.sdp;

        // Aumentar a prioridade do áudio
        sdp = sdp.replace('a=group:BUNDLE 0', 'a=group:BUNDLE audio');
        sdp = sdp.replace('a=mid:0', 'a=mid:audio');

        // Definir codec de áudio de alta qualidade
        if (sdp.includes('opus/48000/2')) {
            console.log('Configurando codec Opus para alta qualidade na resposta');
            // Adicionar parâmetros para melhorar a qualidade do áudio
            const opusLine = sdp.match(/a=rtpmap:(\d+) opus\/48000\/2/i);
            if (opusLine && opusLine.length > 1) {
                const opusPayloadType = opusLine[1];
                const fmtpLine = `a=fmtp:${opusPayloadType} minptime=10;useinbandfec=1;stereo=1;maxaveragebitrate=510000`;

                // Verificar se já existe uma linha fmtp para opus
                const existingFmtp = new RegExp(`a=fmtp:${opusPayloadType}.*`, 'g');
                if (sdp.match(existingFmtp)) {
                    // Substituir a linha existente
                    sdp = sdp.replace(existingFmtp, fmtpLine);
                } else {
                    // Adicionar nova linha após a linha rtpmap do opus
                    sdp = sdp.replace(opusLine[0], `${opusLine[0]}\r\n${fmtpLine}`);
                }
            }
        }

        // Atualizar SDP na resposta
        answer.sdp = sdp;
        console.log('SDP modificado para melhorar qualidade de áudio na resposta');

        // Definir descrição local
        await peerConnection.setLocalDescription(answer);

        console.log('Resposta criada e definida como descrição local');

        // Enviar resposta para o remetente
        window.socket.emit('answer', {
            targetUserId: senderId,
            answer: answer
        });

        console.log('Resposta enviada para', senderId);

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
    console.log('Conteúdo da resposta:', answer);

    if (!peerConnection || !currentCall || currentCall.userId !== senderId) {
        console.error('Recebido resposta, mas não estamos em uma chamada com este usuário');
        return;
    }

    try {
        // Verificar se a resposta tem um SDP válido
        if (!answer || !answer.sdp) {
            console.error('Resposta SDP inválida recebida');
            return;
        }

        // Verificar se já temos uma descrição remota
        if (peerConnection.currentRemoteDescription) {
            console.log('Já temos uma descrição remota, ignorando resposta duplicada');
            return;
        }

        console.log('Definindo descrição remota...');

        // Definir descrição remota
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));

        console.log('Descrição remota definida com sucesso');
        console.log('Estado de sinalização:', peerConnection.signalingState);
        console.log('Estado de conexão ICE:', peerConnection.iceConnectionState);

        // Verificar se temos candidatos ICE pendentes para adicionar
        if (pendingIceCandidates && pendingIceCandidates.length > 0) {
            console.log(`Adicionando ${pendingIceCandidates.length} candidatos ICE pendentes`);
            for (const candidate of pendingIceCandidates) {
                try {
                    await peerConnection.addIceCandidate(candidate);
                } catch (e) {
                    console.error('Erro ao adicionar candidato ICE pendente:', e);
                }
            }
            pendingIceCandidates = [];
        }
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

    // Parar monitoramento do microfone
    stopMicrophoneMonitor();

    // Limpar contexto de áudio
    if (audioContext && audioContext.state !== 'closed') {
        audioContext.close().catch(e => console.error('Erro ao fechar contexto de áudio:', e));
        audioContext = null;
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

        // Adicionar feedback visual
        if (isMuted) {
            muteButton.style.backgroundColor = '#ff4d4d';
            muteButton.style.color = 'white';
        } else {
            muteButton.style.backgroundColor = '#4CAF50';
            muteButton.style.color = 'white';
        }
    }

    // Ativar/desativar faixas de áudio
    localStream.getAudioTracks().forEach(track => {
        track.enabled = !isMuted;
        console.log(`Faixa de áudio ${track.label} ${track.enabled ? 'ativada' : 'desativada'}`);
    });

    // Adicionar feedback visual na interface de chamada
    const callStatus = document.getElementById('webrtcCallStatus');
    if (callStatus) {
        if (isMuted) {
            callStatus.innerHTML = 'Conectado <span style="color: #ff4d4d;">(Mudo)</span>';
        } else {
            callStatus.textContent = 'Conectado';
        }
    }

    // Atualizar status do microfone
    if (window.updateMicrophoneStatus) {
        window.updateMicrophoneStatus(!isMuted);
    }

    // Notificar o usuário
    console.log('Microfone ' + (isMuted ? 'desativado' : 'ativado'));

    // Criar um indicador visual de volume (opcional)
    if (!isMuted && localStream) {
        startVolumeMetering();
    } else {
        stopVolumeMetering();
    }
}

// Variáveis para medição de volume
let mediaStreamSource = null;
let analyser = null;
let volumeMeterInterval = null;

// Iniciar medição de volume
function startVolumeMetering() {
    // Parar qualquer medição existente
    stopVolumeMetering();

    try {
        // Criar contexto de áudio
        audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Criar fonte de stream
        mediaStreamSource = audioContext.createMediaStreamSource(localStream);

        // Criar analisador
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        mediaStreamSource.connect(analyser);

        // Criar buffer para dados
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        // Criar ou obter elemento para indicador de volume
        let volumeIndicator = document.getElementById('volumeIndicator');
        if (!volumeIndicator) {
            volumeIndicator = document.createElement('div');
            volumeIndicator.id = 'volumeIndicator';
            volumeIndicator.style.position = 'absolute';
            volumeIndicator.style.bottom = '10px';
            volumeIndicator.style.left = '50%';
            volumeIndicator.style.transform = 'translateX(-50%)';
            volumeIndicator.style.width = '80%';
            volumeIndicator.style.height = '5px';
            volumeIndicator.style.backgroundColor = '#ddd';
            volumeIndicator.style.borderRadius = '2px';

            const volumeLevel = document.createElement('div');
            volumeLevel.id = 'volumeLevel';
            volumeLevel.style.width = '0%';
            volumeLevel.style.height = '100%';
            volumeLevel.style.backgroundColor = '#4CAF50';
            volumeLevel.style.borderRadius = '2px';
            volumeLevel.style.transition = 'width 0.1s';

            volumeIndicator.appendChild(volumeLevel);

            // Adicionar ao container de chamada
            const callUI = document.getElementById('webrtcCallUI');
            if (callUI) {
                callUI.style.position = 'relative';
                callUI.appendChild(volumeIndicator);
            }
        }

        // Atualizar indicador de volume periodicamente
        volumeMeterInterval = setInterval(() => {
            // Obter dados de volume
            analyser.getByteFrequencyData(dataArray);

            // Calcular volume médio
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i];
            }
            const average = sum / bufferLength;

            // Normalizar para porcentagem (0-100)
            const volume = Math.min(100, Math.max(0, average * 100 / 256));

            // Atualizar indicador visual
            const volumeLevel = document.getElementById('volumeLevel');
            if (volumeLevel) {
                volumeLevel.style.width = `${volume}%`;

                // Mudar cor com base no volume
                if (volume > 50) {
                    volumeLevel.style.backgroundColor = '#ff9800';
                } else if (volume > 75) {
                    volumeLevel.style.backgroundColor = '#ff5722';
                } else {
                    volumeLevel.style.backgroundColor = '#4CAF50';
                }
            }
        }, 100);

    } catch (error) {
        console.error('Erro ao iniciar medição de volume:', error);
    }
}

// Parar medição de volume
function stopVolumeMetering() {
    if (volumeMeterInterval) {
        clearInterval(volumeMeterInterval);
        volumeMeterInterval = null;
    }

    if (mediaStreamSource) {
        mediaStreamSource.disconnect();
        mediaStreamSource = null;
    }

    if (audioContext) {
        if (audioContext.state !== 'closed') {
            audioContext.close().catch(e => console.error('Erro ao fechar contexto de áudio:', e));
        }
        audioContext = null;
    }

    analyser = null;

    // Ocultar indicador de volume
    const volumeIndicator = document.getElementById('volumeIndicator');
    if (volumeIndicator) {
        volumeIndicator.style.display = 'none';
    }
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
    // Limpar qualquer temporizador existente
    if (callTimerInterval) {
        clearInterval(callTimerInterval);
        callTimerInterval = null;
    }

    // Resetar contador
    callDurationSeconds = 0;
    updateCallTimerDisplay();

    // Registrar o tempo de início
    const startTime = Date.now();

    // Iniciar novo temporizador
    callTimerInterval = setInterval(() => {
        // Calcular a duração com base no tempo real decorrido
        const elapsedTime = Date.now() - startTime;
        callDurationSeconds = Math.floor(elapsedTime / 1000);
        updateCallTimerDisplay();
    }, 1000);

    console.log('Temporizador de chamada iniciado');
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

// Função para iniciar o monitoramento do microfone (ouvir a própria voz)
function startMicrophoneMonitor() {
    if (!localStream || !micMonitorActive) {
        console.log('Não é possível iniciar o monitoramento do microfone: stream não disponível ou monitoramento desativado');
        return;
    }

    try {
        // Criar contexto de áudio se não existir
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        // Criar nó de fonte de mídia
        if (!micMonitorNode) {
            micMonitorNode = audioContext.createMediaStreamSource(localStream);
        }

        // Criar nó de ganho para controlar o volume
        if (!micMonitorGainNode) {
            micMonitorGainNode = audioContext.createGain();
            // Obter volume salvo ou usar padrão
            const savedVolume = localStorage.getItem('micMonitorVolume');
            micMonitorGainNode.gain.value = savedVolume ? parseFloat(savedVolume) : 0.5; // Volume em 50% para evitar feedback
        }

        // Conectar nós
        micMonitorNode.connect(micMonitorGainNode);
        micMonitorGainNode.connect(audioContext.destination);

        console.log('Monitoramento do microfone iniciado - agora você pode ouvir sua própria voz');

        // Adicionar controle de volume
        addVolumeControl();

    } catch (error) {
        console.error('Erro ao iniciar monitoramento do microfone:', error);
    }
}

// Função para parar o monitoramento do microfone
function stopMicrophoneMonitor() {
    if (micMonitorGainNode) {
        micMonitorGainNode.disconnect();
        micMonitorGainNode = null;
    }

    if (micMonitorNode) {
        micMonitorNode.disconnect();
        micMonitorNode = null;
    }

    // Remover controle de volume
    const volumeControl = document.getElementById('micMonitorVolumeControl');
    if (volumeControl) {
        volumeControl.remove();
    }

    console.log('Monitoramento do microfone parado');
}

// Função para adicionar controle de volume
function addVolumeControl() {
    // Verificar se já existe
    if (document.getElementById('micMonitorVolumeControl')) {
        return;
    }

    // Verificar se a interface de chamada existe
    const callControls = document.querySelector('.call-controls');
    if (!callControls) {
        console.log('Interface de chamada não encontrada, não é possível adicionar controle de volume');
        return;
    }

    // Criar container
    const volumeControl = document.createElement('div');
    volumeControl.id = 'micMonitorVolumeControl';
    volumeControl.style.marginTop = '15px';
    volumeControl.style.width = '100%';
    volumeControl.style.textAlign = 'center';
    volumeControl.style.fontSize = '12px';
    volumeControl.style.color = '#666';

    // Obter volume atual
    const currentVolume = micMonitorGainNode ? Math.round(micMonitorGainNode.gain.value * 100) : 50;

    // Criar HTML do controle
    volumeControl.innerHTML = `
        <div style="margin-bottom: 5px;">Volume do monitoramento: <span id="volumeValue">${currentVolume}%</span></div>
        <input type="range" id="volumeSlider" min="0" max="100" value="${currentVolume}" style="width: 80%;">
    `;

    // Adicionar ao final da interface de chamada
    const callUI = document.getElementById('webrtcCallUI');
    if (callUI) {
        callUI.appendChild(volumeControl);

        // Adicionar evento ao slider
        const slider = document.getElementById('volumeSlider');
        if (slider) {
            slider.addEventListener('input', function() {
                if (micMonitorGainNode) {
                    // Converter valor de 0-100 para 0-1
                    const volume = this.value / 100;
                    micMonitorGainNode.gain.value = volume;

                    // Atualizar valor exibido
                    const volumeValue = document.getElementById('volumeValue');
                    if (volumeValue) {
                        volumeValue.textContent = `${this.value}%`;
                    }

                    // Salvar preferência
                    localStorage.setItem('micMonitorVolume', volume.toString());

                    console.log(`Volume do monitoramento ajustado para ${this.value}%`);
                }
            });
        }
    }
}

// Função para alternar o monitoramento do microfone
function toggleMicrophoneMonitor() {
    micMonitorActive = !micMonitorActive;

    // Salvar preferência
    localStorage.setItem('micMonitorActive', micMonitorActive.toString());

    if (micMonitorActive) {
        startMicrophoneMonitor();
    } else {
        stopMicrophoneMonitor();
    }

    // Atualizar botão de monitoramento
    updateMonitorButton();

    return micMonitorActive;
}

// Função para atualizar o botão de monitoramento
function updateMonitorButton() {
    const monitorButton = document.getElementById('webrtcToggleMonitorButton');
    if (monitorButton) {
        if (micMonitorActive) {
            monitorButton.innerHTML = '<i class="fas fa-headphones"></i>';
            monitorButton.style.backgroundColor = '#4CAF50';
            monitorButton.title = 'Desativar monitoramento do microfone';
        } else {
            monitorButton.innerHTML = '<i class="fas fa-headphones-alt"></i>';
            monitorButton.style.backgroundColor = '#9e9e9e';
            monitorButton.title = 'Ativar monitoramento do microfone';
        }
    }
}

// Exportar funções
window.webrtcCall = {
    initialize: initializeWebRTCCalls,
    startCall: startCall,
    endCall: endCall,
    isCallActive: () => !!currentCall,
    toggleMicrophoneMonitor: toggleMicrophoneMonitor
};

// NÃO inicializar automaticamente - apenas exportar as funções
// Isso evita que o exemplo de chamada apareça automaticamente

// Adicionar Font Awesome se necessário
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    if (!document.querySelector('link[href*="font-awesome"]')) {
        const fontAwesome = document.createElement('link');
        fontAwesome.rel = 'stylesheet';
        fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
        document.head.appendChild(fontAwesome);
    }
} else {
    document.addEventListener('DOMContentLoaded', () => {
        if (!document.querySelector('link[href*="font-awesome"]')) {
            const fontAwesome = document.createElement('link');
            fontAwesome.rel = 'stylesheet';
            fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
            document.head.appendChild(fontAwesome);
        }
    });
}
