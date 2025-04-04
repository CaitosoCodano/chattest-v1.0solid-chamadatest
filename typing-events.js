/**
 * Eventos de digitação para o Chat App
 * Este arquivo contém funções para lidar com eventos de digitação
 */

// Função para configurar eventos de digitação no Socket.IO
function setupTypingEvents(io, socket, connectedUsers) {
    // Evento quando um usuário começa a digitar
    socket.on('typing', async (data) => {
        try {
            const senderId = connectedUsers.get(socket.id);
            if (!senderId) {
                console.error('Usuário não autenticado tentando enviar evento de digitação');
                return;
            }
            
            const receiverId = data.receiverId;
            console.log(`Usuário ${senderId} está digitando para ${receiverId}`);
            
            // Encontrar todos os sockets do destinatário
            const receiverSockets = [];
            for (const [socketId, userId] of connectedUsers.entries()) {
                if (userId.toString() === receiverId) {
                    receiverSockets.push(socketId);
                }
            }
            
            // Enviar evento de digitação para todos os sockets do destinatário
            for (const socketId of receiverSockets) {
                io.to(socketId).emit('userTyping', {
                    userId: senderId
                });
            }
        } catch (error) {
            console.error('Erro ao processar evento de digitação:', error);
        }
    });
    
    // Evento quando um usuário para de digitar
    socket.on('stopTyping', async (data) => {
        try {
            const senderId = connectedUsers.get(socket.id);
            if (!senderId) {
                console.error('Usuário não autenticado tentando enviar evento de parar de digitar');
                return;
            }
            
            const receiverId = data.receiverId;
            console.log(`Usuário ${senderId} parou de digitar para ${receiverId}`);
            
            // Encontrar todos os sockets do destinatário
            const receiverSockets = [];
            for (const [socketId, userId] of connectedUsers.entries()) {
                if (userId.toString() === receiverId) {
                    receiverSockets.push(socketId);
                }
            }
            
            // Enviar evento de parar de digitar para todos os sockets do destinatário
            for (const socketId of receiverSockets) {
                io.to(socketId).emit('userStoppedTyping', {
                    userId: senderId
                });
            }
        } catch (error) {
            console.error('Erro ao processar evento de parar de digitar:', error);
        }
    });
}

module.exports = setupTypingEvents;
