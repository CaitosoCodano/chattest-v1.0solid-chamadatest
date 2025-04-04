/**
 * Implementação de sinalização WebRTC para chamadas de voz
 */

// Função para registrar eventos de sinalização WebRTC
function registerWebRTCEvents(io, socket, connectedUsers) {
    // Iniciar chamada
    socket.on('callUser', (data) => {
        const { targetUserId, callerName, callerAvatar } = data;
        const callerId = connectedUsers.get(socket.id);
        
        if (!callerId) {
            console.error('Usuário não autenticado tentando iniciar chamada');
            return;
        }
        
        console.log(`Usuário ${callerId} está chamando ${targetUserId}`);
        
        // Encontrar o socket do destinatário
        let targetSocket = null;
        for (const [socketId, userId] of connectedUsers.entries()) {
            if (userId === targetUserId) {
                targetSocket = io.sockets.sockets.get(socketId);
                break;
            }
        }
        
        if (targetSocket) {
            // Enviar notificação de chamada para o destinatário
            targetSocket.emit('incomingCall', {
                callerId,
                callerName,
                callerAvatar
            });
            console.log(`Notificação de chamada enviada para ${targetUserId}`);
        } else {
            // Destinatário não está online
            socket.emit('callRejected', { reason: 'Usuário offline' });
            console.log(`Usuário ${targetUserId} não está online para receber chamada`);
        }
    });
    
    // Aceitar chamada
    socket.on('acceptCall', (data) => {
        const { targetUserId } = data;
        const accepterId = connectedUsers.get(socket.id);
        
        if (!accepterId) {
            console.error('Usuário não autenticado tentando aceitar chamada');
            return;
        }
        
        console.log(`Usuário ${accepterId} aceitou chamada de ${targetUserId}`);
        
        // Encontrar o socket do chamador
        let targetSocket = null;
        for (const [socketId, userId] of connectedUsers.entries()) {
            if (userId === targetUserId) {
                targetSocket = io.sockets.sockets.get(socketId);
                break;
            }
        }
        
        if (targetSocket) {
            // Notificar o chamador que a chamada foi aceita
            targetSocket.emit('callAccepted', { accepterId });
            console.log(`Notificação de aceitação enviada para ${targetUserId}`);
        }
    });
    
    // Rejeitar chamada
    socket.on('rejectCall', (data) => {
        const { targetUserId } = data;
        const rejecterId = connectedUsers.get(socket.id);
        
        if (!rejecterId) {
            console.error('Usuário não autenticado tentando rejeitar chamada');
            return;
        }
        
        console.log(`Usuário ${rejecterId} rejeitou chamada de ${targetUserId}`);
        
        // Encontrar o socket do chamador
        let targetSocket = null;
        for (const [socketId, userId] of connectedUsers.entries()) {
            if (userId === targetUserId) {
                targetSocket = io.sockets.sockets.get(socketId);
                break;
            }
        }
        
        if (targetSocket) {
            // Notificar o chamador que a chamada foi rejeitada
            targetSocket.emit('callRejected', { rejecterId });
            console.log(`Notificação de rejeição enviada para ${targetUserId}`);
        }
    });
    
    // Encerrar chamada
    socket.on('endCall', (data) => {
        const { targetUserId } = data;
        const enderId = connectedUsers.get(socket.id);
        
        if (!enderId) {
            console.error('Usuário não autenticado tentando encerrar chamada');
            return;
        }
        
        console.log(`Usuário ${enderId} encerrou chamada com ${targetUserId}`);
        
        // Encontrar o socket do outro participante
        let targetSocket = null;
        for (const [socketId, userId] of connectedUsers.entries()) {
            if (userId === targetUserId) {
                targetSocket = io.sockets.sockets.get(socketId);
                break;
            }
        }
        
        if (targetSocket) {
            // Notificar o outro participante que a chamada foi encerrada
            targetSocket.emit('callEnded', { enderId });
            console.log(`Notificação de encerramento enviada para ${targetUserId}`);
        }
    });
    
    // Sinalização ICE
    socket.on('iceCandidate', (data) => {
        const { targetUserId, candidate } = data;
        const senderId = connectedUsers.get(socket.id);
        
        if (!senderId) {
            console.error('Usuário não autenticado tentando enviar candidato ICE');
            return;
        }
        
        // Encontrar o socket do destinatário
        let targetSocket = null;
        for (const [socketId, userId] of connectedUsers.entries()) {
            if (userId === targetUserId) {
                targetSocket = io.sockets.sockets.get(socketId);
                break;
            }
        }
        
        if (targetSocket) {
            // Enviar candidato ICE para o destinatário
            targetSocket.emit('iceCandidate', {
                senderId,
                candidate
            });
        }
    });
    
    // Oferta SDP
    socket.on('offer', (data) => {
        const { targetUserId, offer } = data;
        const senderId = connectedUsers.get(socket.id);
        
        if (!senderId) {
            console.error('Usuário não autenticado tentando enviar oferta');
            return;
        }
        
        // Encontrar o socket do destinatário
        let targetSocket = null;
        for (const [socketId, userId] of connectedUsers.entries()) {
            if (userId === targetUserId) {
                targetSocket = io.sockets.sockets.get(socketId);
                break;
            }
        }
        
        if (targetSocket) {
            // Enviar oferta para o destinatário
            targetSocket.emit('offer', {
                senderId,
                offer
            });
        }
    });
    
    // Resposta SDP
    socket.on('answer', (data) => {
        const { targetUserId, answer } = data;
        const senderId = connectedUsers.get(socket.id);
        
        if (!senderId) {
            console.error('Usuário não autenticado tentando enviar resposta');
            return;
        }
        
        // Encontrar o socket do destinatário
        let targetSocket = null;
        for (const [socketId, userId] of connectedUsers.entries()) {
            if (userId === targetUserId) {
                targetSocket = io.sockets.sockets.get(socketId);
                break;
            }
        }
        
        if (targetSocket) {
            // Enviar resposta para o destinatário
            targetSocket.emit('answer', {
                senderId,
                answer
            });
        }
    });
}

module.exports = registerWebRTCEvents;
