/**
 * Implementação simplificada de sinalização WebRTC para chamadas de voz
 */

// Função para registrar eventos de sinalização WebRTC
function registerSimpleWebRTCEvents(io, socket, connectedUsers) {
    console.log('Registrando eventos de sinalização WebRTC para o socket:', socket.id);

    // Iniciar chamada
    socket.on('callUser', (data) => {
        const { targetUserId, callerName } = data;
        const callerId = connectedUsers.get(socket.id);

        if (!callerId) {
            console.error('Usuário não autenticado tentando iniciar chamada');
            return;
        }

        console.log(`Usuário ${callerId} (${callerName}) está chamando ${targetUserId}`);

        // Encontrar o socket do destinatário
        let targetSocketId = null;
        for (const [socketId, userId] of connectedUsers.entries()) {
            if (userId === targetUserId) {
                targetSocketId = socketId;
                break;
            }
        }

        if (targetSocketId) {
            // Enviar notificação de chamada para o destinatário
            io.to(targetSocketId).emit('incomingCall', {
                callerId,
                callerName
            });
            console.log(`Notificação de chamada enviada para ${targetUserId} (socket ${targetSocketId}) de ${callerId} (${callerName})`);
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
        let targetSocketId = null;
        for (const [socketId, userId] of connectedUsers.entries()) {
            if (userId === targetUserId) {
                targetSocketId = socketId;
                break;
            }
        }

        if (targetSocketId) {
            // Notificar o chamador que a chamada foi aceita
            io.to(targetSocketId).emit('callAccepted', { accepterId });
            console.log(`Notificação de aceitação enviada para ${targetUserId} (socket ${targetSocketId})`);
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
        let targetSocketId = null;
        for (const [socketId, userId] of connectedUsers.entries()) {
            if (userId === targetUserId) {
                targetSocketId = socketId;
                break;
            }
        }

        if (targetSocketId) {
            // Notificar o chamador que a chamada foi rejeitada
            io.to(targetSocketId).emit('callRejected', { rejecterId });
            console.log(`Notificação de rejeição enviada para ${targetUserId} (socket ${targetSocketId})`);
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
        let targetSocketId = null;
        for (const [socketId, userId] of connectedUsers.entries()) {
            if (userId === targetUserId) {
                targetSocketId = socketId;
                break;
            }
        }

        if (targetSocketId) {
            // Notificar o outro participante que a chamada foi encerrada
            io.to(targetSocketId).emit('callEnded', { enderId });
            console.log(`Notificação de encerramento enviada para ${targetUserId} (socket ${targetSocketId})`);
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
        let targetSocketId = null;
        for (const [socketId, userId] of connectedUsers.entries()) {
            if (userId === targetUserId) {
                targetSocketId = socketId;
                break;
            }
        }

        if (targetSocketId) {
            // Enviar candidato ICE para o destinatário
            io.to(targetSocketId).emit('iceCandidate', {
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
        let targetSocketId = null;
        for (const [socketId, userId] of connectedUsers.entries()) {
            if (userId === targetUserId) {
                targetSocketId = socketId;
                break;
            }
        }

        if (targetSocketId) {
            // Enviar oferta para o destinatário
            io.to(targetSocketId).emit('offer', {
                senderId,
                offer
            });
            console.log(`Oferta enviada para ${targetUserId} (socket ${targetSocketId})`);
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
        let targetSocketId = null;
        for (const [socketId, userId] of connectedUsers.entries()) {
            if (userId === targetUserId) {
                targetSocketId = socketId;
                break;
            }
        }

        if (targetSocketId) {
            // Enviar resposta para o destinatário
            io.to(targetSocketId).emit('answer', {
                senderId,
                answer
            });
            console.log(`Resposta enviada para ${targetUserId} (socket ${targetSocketId})`);
        }
    });
}

module.exports = registerSimpleWebRTCEvents;
