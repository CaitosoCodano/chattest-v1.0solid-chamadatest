/**
 * Servidor de sinalização WebRTC para chamadas de voz
 * Este arquivo implementa a sinalização WebRTC no lado do servidor
 */

// Importar o modelo User
const User = require('./models/User');

const registerWebRTCSignalingServer = (io, socket, connectedUsers) => {
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
        console.log('Dados da chamada:', data);
        console.log('Usuários conectados:', Array.from(connectedUsers.entries()));

        // Encontrar o socket do destinatário
        let targetSocketId = null;
        for (const [socketId, userId] of connectedUsers.entries()) {
            if (userId === targetUserId) {
                targetSocketId = socketId;
                console.log(`Encontrado socket ${socketId} para o usuário ${userId}`);
                break;
            }
        }

        if (!targetSocketId) {
            console.log(`Não foi encontrado socket para o usuário ${targetUserId}`);
            socket.emit('callRejected', {
                reason: 'Usuário não está online ou não foi possível encontrar o socket',
                targetUserId
            });
            return;
        }

        // Enviar notificação de chamada para o destinatário
        io.to(targetSocketId).emit('incomingCall', {
            callerId,
            callerName,
            targetUserId,
            timestamp: Date.now()
        });
        console.log(`Notificação de chamada enviada para ${targetUserId} (socket ${targetSocketId}) de ${callerId} (${callerName})`);
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
        console.log('Dados da aceitação:', data);
        console.log('Usuários conectados:', Array.from(connectedUsers.entries()));

        // Encontrar o socket do chamador
        let targetSocketId = null;
        for (const [socketId, userId] of connectedUsers.entries()) {
            if (userId === targetUserId) {
                targetSocketId = socketId;
                console.log(`Encontrado socket ${socketId} para o usuário ${userId}`);
                break;
            }
        }

        if (!targetSocketId) {
            console.log(`Não foi encontrado socket para o usuário ${targetUserId}. Tentando buscar por todos os sockets.`);
            // Tentar encontrar qualquer socket que possa estar relacionado ao chamador
            for (const [socketId, userId] of connectedUsers.entries()) {
                console.log(`Verificando socket ${socketId} para usuário ${userId}`);
            }

            socket.emit('callFailed', {
                reason: 'O usuário que iniciou a chamada não está mais disponível',
                targetUserId
            });
            return;
        }

        // Buscar o nome do usuário que aceitou a chamada
        // Vamos usar o MongoDB para buscar o nome do usuário

        // Buscar o nome do usuário de forma assíncrona
        User.findById(accepterId)
            .then(user => {
                const accepterName = user ? user.username : 'Usuário';
                console.log(`Nome do usuário que aceitou a chamada: ${accepterName}`);

                // Notificar o chamador que a chamada foi aceita
                io.to(targetSocketId).emit('callAccepted', {
                    accepterId,
                    accepterName, // Usar o nome real do usuário
                    callerId: targetUserId,
                    message: 'Chamada aceita com sucesso',
                    timestamp: Date.now()
                });
                console.log(`Notificação de aceitação enviada para ${targetUserId} (socket ${targetSocketId})`);
            })
            .catch(err => {
                console.error('Erro ao buscar nome do usuário:', err);

                // Notificar o chamador que a chamada foi aceita (com nome padrão)
                io.to(targetSocketId).emit('callAccepted', {
                    accepterId,
                    accepterName: 'Usuário', // Nome padrão em caso de erro
                    callerId: targetUserId,
                    message: 'Chamada aceita com sucesso',
                    timestamp: Date.now()
                });
                console.log(`Notificação de aceitação enviada para ${targetUserId} (socket ${targetSocketId}) com nome padrão`);
            });

        // Notificar o aceitador que a chamada foi conectada com sucesso
        socket.emit('callConnected', {
            targetUserId,
            message: 'Chamada conectada com sucesso'
        });

        // Notificar todos os sockets que uma chamada em grupo foi atendida
        // Isso é usado para evitar a mensagem "Nenhum contato atendeu a chamada"
        io.emit('groupCallAnswered', {
            accepterId,
            callerId: targetUserId
        });
        console.log(`Notificação de chamada em grupo atendida enviada para todos os sockets`);
    });

    // Rejeitar chamada
    socket.on('callRejected', (data) => {
        const { targetUserId, reason } = data;
        const rejecterId = connectedUsers.get(socket.id);

        if (!rejecterId) {
            console.error('Usuário não autenticado tentando rejeitar chamada');
            return;
        }

        console.log(`Usuário ${rejecterId} rejeitou chamada de ${targetUserId}: ${reason}`);

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
            io.to(targetSocketId).emit('callRejected', {
                rejecterId,
                reason: reason || 'Chamada rejeitada pelo usuário'
            });
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

        // Encontrar o socket do outro usuário
        let targetSocketId = null;
        for (const [socketId, userId] of connectedUsers.entries()) {
            if (userId === targetUserId) {
                targetSocketId = socketId;
                break;
            }
        }

        if (targetSocketId) {
            // Notificar o outro usuário que a chamada foi encerrada
            io.to(targetSocketId).emit('callEnded', {
                enderId,
                message: 'Chamada encerrada pelo outro usuário'
            });
            console.log(`Notificação de encerramento enviada para ${targetUserId} (socket ${targetSocketId})`);
        }
    });

    // Sinalização WebRTC - Oferta
    socket.on('offer', (data) => {
        const { targetUserId, offer } = data;
        const senderId = connectedUsers.get(socket.id);

        if (!senderId) {
            console.error('Usuário não autenticado tentando enviar oferta');
            return;
        }

        console.log(`Usuário ${senderId} enviou oferta para ${targetUserId}`);

        // Encontrar o socket do destinatário
        let targetSocketId = null;
        for (const [socketId, userId] of connectedUsers.entries()) {
            if (userId === targetUserId) {
                targetSocketId = socketId;
                break;
            }
        }

        if (targetSocketId) {
            // Encaminhar oferta para o destinatário
            io.to(targetSocketId).emit('offer', {
                senderId,
                offer
            });
            console.log(`Oferta encaminhada para ${targetUserId} (socket ${targetSocketId})`);
        }
    });

    // Sinalização WebRTC - Resposta
    socket.on('answer', (data) => {
        const { targetUserId, answer } = data;
        const senderId = connectedUsers.get(socket.id);

        if (!senderId) {
            console.error('Usuário não autenticado tentando enviar resposta');
            return;
        }

        console.log(`Usuário ${senderId} enviou resposta para ${targetUserId}`);

        // Encontrar o socket do destinatário
        let targetSocketId = null;
        for (const [socketId, userId] of connectedUsers.entries()) {
            if (userId === targetUserId) {
                targetSocketId = socketId;
                break;
            }
        }

        if (targetSocketId) {
            // Encaminhar resposta para o destinatário
            io.to(targetSocketId).emit('answer', {
                senderId,
                answer
            });
            console.log(`Resposta encaminhada para ${targetUserId} (socket ${targetSocketId})`);
        }
    });

    // Sinalização WebRTC - Candidato ICE
    socket.on('iceCandidate', (data) => {
        const { targetUserId, candidate } = data;
        const senderId = connectedUsers.get(socket.id);

        if (!senderId) {
            console.error('Usuário não autenticado tentando enviar candidato ICE');
            return;
        }

        console.log(`Usuário ${senderId} enviou candidato ICE para ${targetUserId}`);

        // Encontrar o socket do destinatário
        let targetSocketId = null;
        for (const [socketId, userId] of connectedUsers.entries()) {
            if (userId === targetUserId) {
                targetSocketId = socketId;
                break;
            }
        }

        if (targetSocketId) {
            // Encaminhar candidato ICE para o destinatário
            io.to(targetSocketId).emit('iceCandidate', {
                senderId,
                candidate
            });
            console.log(`Candidato ICE encaminhado para ${targetUserId} (socket ${targetSocketId})`);
        }
    });
};

module.exports = registerWebRTCSignalingServer;
