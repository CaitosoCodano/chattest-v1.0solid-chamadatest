/**
 * Eventos de socket para o servidor
 */
const User = require('./models/User');
const Message = require('./models/Message');

module.exports = function(io, socket, connectedUsers) {
    // Obter o ID do usuário conectado
    const userId = connectedUsers.get(socket.id);

    // Evento para solicitar o status atual do usuário
    socket.on('requestCurrentStatus', async (data) => {
        try {
            console.log(`Usuário ${userId} solicitou seu status atual`);

            // Buscar o usuário para obter informações atualizadas
            const user = await User.findById(userId).select('-password');
            if (!user) {
                console.error(`Usuário ${userId} não encontrado`);
                return;
            }

            // Preparar dados para enviar ao cliente
            const statusData = {
                userId: userId,
                status: user.status
            };

            // Adicionar dados de status personalizado se necessário
            if (user.status === 'custom' && user.customStatus) {
                statusData.customStatus = user.customStatus;
            }

            // Enviar o status atual para o cliente que solicitou
            socket.emit('syncStatus', statusData);
            console.log(`Enviando status atual para o usuário ${userId}`);
        } catch (error) {
            console.error('Erro ao processar solicitação de status atual:', error);
        }
    });

    // Evento de atualização de status
    socket.on('updateStatus', async (statusData) => {
        try {
            console.log(`Usuário ${userId} atualizou seu status para ${statusData.status}`);

            // Buscar o usuário para obter informações atualizadas
            const user = await User.findById(userId).select('-password');
            if (!user) {
                console.error(`Usuário ${userId} não encontrado`);
                return;
            }

            // Preparar dados para enviar aos clientes
            const statusUpdate = {
                userId: userId,
                status: statusData.status
            };

            // Adicionar dados de status personalizado se necessário
            if (statusData.status === 'custom' && statusData.customStatus) {
                statusUpdate.customStatus = statusData.customStatus;
            }

            // Atualizar o status do usuário no banco de dados
            user.status = statusData.status;

            // Atualizar o status personalizado se necessário
            if (statusData.status === 'custom' && statusData.customStatus) {
                user.customStatus = {
                    text: statusData.customStatus.text || '',
                    emoji: statusData.customStatus.emoji || '',
                    expiresAt: statusData.customStatus.expiresAt || null
                };
            }

            // Salvar as alterações no banco de dados
            await user.save();

            // Encontrar todos os sockets do mesmo usuário
            const userSockets = [];
            for (const [socketId, connectedUserId] of connectedUsers.entries()) {
                if (connectedUserId === userId) {
                    userSockets.push(socketId);
                }
            }

            console.log(`Usuário ${userId} tem ${userSockets.length} conexões ativas`);

            // Notificar todos os sockets do mesmo usuário para sincronizar o status
            userSockets.forEach(socketId => {
                if (socketId !== socket.id) { // Não enviar para o socket que fez a atualização
                    io.to(socketId).emit('syncStatus', statusUpdate);
                    console.log(`Sincronizando status para o socket ${socketId} do usuário ${userId}`);
                }
            });

            // Notificar todos os clientes conectados sobre a mudança de status
            io.emit('statusUpdate', statusUpdate);
            console.log(`Notificando todos os clientes sobre a atualização de status de ${user.username}`);
        } catch (error) {
            console.error('Erro ao processar atualização de status:', error);
        }
    });
};
