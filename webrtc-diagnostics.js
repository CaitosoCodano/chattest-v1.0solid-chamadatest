/**
 * Ferramentas de diagnóstico para WebRTC
 * Este arquivo fornece funções para diagnosticar problemas com WebRTC
 */

// Verificar o estado da conexão WebRTC
function checkWebRTCConnection() {
    console.log('=== DIAGNÓSTICO DE CONEXÃO WEBRTC ===');
    
    // Verificar se o WebRTC é suportado
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('WebRTC não é suportado neste navegador');
        return {
            supported: false,
            error: 'WebRTC não é suportado neste navegador'
        };
    }
    
    // Verificar se temos uma conexão peer
    if (!window.peerConnection) {
        console.warn('Não há conexão peer ativa');
        return {
            supported: true,
            connected: false,
            error: 'Não há conexão peer ativa'
        };
    }
    
    // Verificar o estado da conexão
    const connectionState = window.peerConnection.connectionState;
    const iceConnectionState = window.peerConnection.iceConnectionState;
    const signalingState = window.peerConnection.signalingState;
    
    console.log('Estado da conexão:', connectionState);
    console.log('Estado da conexão ICE:', iceConnectionState);
    console.log('Estado de sinalização:', signalingState);
    
    // Verificar se temos streams
    const localStreamInfo = getStreamInfo(window.localStream, 'local');
    const remoteStreamInfo = getStreamInfo(window.remoteStream, 'remote');
    
    console.log('Stream local:', localStreamInfo);
    console.log('Stream remoto:', remoteStreamInfo);
    
    // Verificar elementos de áudio
    const remoteAudio = document.getElementById('remoteAudio');
    let audioElementInfo = null;
    
    if (remoteAudio) {
        audioElementInfo = {
            paused: remoteAudio.paused,
            muted: remoteAudio.muted,
            volume: remoteAudio.volume,
            readyState: remoteAudio.readyState,
            srcObject: !!remoteAudio.srcObject
        };
        console.log('Elemento de áudio remoto:', audioElementInfo);
    } else {
        console.warn('Elemento de áudio remoto não encontrado');
    }
    
    // Verificar candidatos ICE
    const localCandidates = window.peerConnection.localDescription ? 'Disponível' : 'Não disponível';
    const remoteCandidates = window.peerConnection.remoteDescription ? 'Disponível' : 'Não disponível';
    
    console.log('Descrição local:', localCandidates);
    console.log('Descrição remota:', remoteCandidates);
    
    // Verificar se há erros
    let error = null;
    let connected = false;
    
    if (connectionState === 'connected' && iceConnectionState === 'connected') {
        connected = true;
    } else if (connectionState === 'failed' || iceConnectionState === 'failed') {
        error = 'Conexão falhou';
    } else if (connectionState === 'disconnected' || iceConnectionState === 'disconnected') {
        error = 'Conexão desconectada';
    } else if (!remoteStreamInfo.available) {
        error = 'Stream remoto não disponível';
    } else if (audioElementInfo && audioElementInfo.paused) {
        error = 'Áudio remoto está pausado';
    }
    
    console.log('=== FIM DO DIAGNÓSTICO ===');
    
    return {
        supported: true,
        connected,
        connectionState,
        iceConnectionState,
        signalingState,
        localStream: localStreamInfo,
        remoteStream: remoteStreamInfo,
        audioElement: audioElementInfo,
        localCandidates,
        remoteCandidates,
        error
    };
}

// Obter informações sobre um stream
function getStreamInfo(stream, type) {
    if (!stream) {
        return {
            available: false,
            type,
            error: 'Stream não disponível'
        };
    }
    
    const audioTracks = stream.getAudioTracks();
    const audioTrackInfo = audioTracks.map(track => ({
        id: track.id,
        kind: track.kind,
        label: track.label,
        enabled: track.enabled,
        muted: track.muted,
        readyState: track.readyState
    }));
    
    return {
        available: true,
        type,
        id: stream.id,
        active: stream.active,
        audioTracks: audioTrackInfo,
        audioTracksCount: audioTracks.length
    };
}

// Testar acesso ao microfone
async function testMicrophone() {
    console.log('=== TESTE DE MICROFONE ===');
    
    try {
        // Solicitar acesso ao microfone
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Verificar se o stream tem faixas de áudio
        const audioTracks = stream.getAudioTracks();
        
        if (audioTracks.length === 0) {
            console.error('Nenhuma faixa de áudio disponível');
            return {
                success: false,
                error: 'Nenhuma faixa de áudio disponível'
            };
        }
        
        // Obter informações sobre as faixas de áudio
        const audioTrackInfo = audioTracks.map(track => ({
            id: track.id,
            kind: track.kind,
            label: track.label,
            enabled: track.enabled,
            muted: track.muted,
            readyState: track.readyState
        }));
        
        console.log('Faixas de áudio:', audioTrackInfo);
        
        // Parar o stream
        stream.getTracks().forEach(track => track.stop());
        
        console.log('=== FIM DO TESTE DE MICROFONE ===');
        
        return {
            success: true,
            audioTracks: audioTrackInfo
        };
    } catch (error) {
        console.error('Erro ao acessar o microfone:', error);
        
        console.log('=== FIM DO TESTE DE MICROFONE ===');
        
        return {
            success: false,
            error: error.message || 'Erro ao acessar o microfone'
        };
    }
}

// Testar reprodução de áudio
async function testAudioPlayback() {
    console.log('=== TESTE DE REPRODUÇÃO DE ÁUDIO ===');
    
    try {
        // Criar um elemento de áudio
        const audioElement = document.createElement('audio');
        audioElement.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
        
        // Tentar reproduzir o áudio
        await audioElement.play();
        
        console.log('Reprodução de áudio bem-sucedida');
        
        // Parar a reprodução
        audioElement.pause();
        
        console.log('=== FIM DO TESTE DE REPRODUÇÃO DE ÁUDIO ===');
        
        return {
            success: true
        };
    } catch (error) {
        console.error('Erro ao reproduzir áudio:', error);
        
        console.log('=== FIM DO TESTE DE REPRODUÇÃO DE ÁUDIO ===');
        
        return {
            success: false,
            error: error.message || 'Erro ao reproduzir áudio'
        };
    }
}

// Executar diagnóstico completo
async function runFullDiagnostics() {
    console.log('=== INICIANDO DIAGNÓSTICO COMPLETO ===');
    
    const microphoneTest = await testMicrophone();
    const audioPlaybackTest = await testAudioPlayback();
    const connectionTest = checkWebRTCConnection();
    
    const results = {
        microphone: microphoneTest,
        audioPlayback: audioPlaybackTest,
        connection: connectionTest,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
    };
    
    console.log('Resultados do diagnóstico:', results);
    console.log('=== FIM DO DIAGNÓSTICO COMPLETO ===');
    
    return results;
}

// Exportar funções
window.webrtcDiagnostics = {
    checkConnection: checkWebRTCConnection,
    testMicrophone: testMicrophone,
    testAudioPlayback: testAudioPlayback,
    runFullDiagnostics: runFullDiagnostics
};
