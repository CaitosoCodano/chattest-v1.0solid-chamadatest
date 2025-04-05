require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const connectDB = require('./config/database');
const User = require('./models/User');
const Message = require('./models/Message');
const generateToken = require('./utils/generateToken');
const { protect } = require('./middleware/auth');
const setupTypingEvents = require('./typing-events');
const registerSocketEvents = require('./socket-events');
const registerWebRTCEvents = require('./webrtc-signaling');
const registerSimpleWebRTCEvents = require('./simple-webrtc-signaling');
const registerWebRTCSignalingServer = require('./webrtc-signaling-server');

// Inicialização do Express e Socket.IO
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Conectar ao MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '/')));

// Configurar CORS
const corsOptions = require('./cors-config');
app.use(cors(corsOptions));

// Adicionar middleware para logs de requisições
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Middleware para capturar erros de JSON inválido
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.error('Erro de JSON inválido:', err);
        return res.status(400).json({ message: 'JSON inválido', error: err.message });
    }
    next(err);
});

// Armazenar usuários conectados
const connectedUsers = new Map();

// Socket.IO
io.on('connection', (socket) => {
    // Configurar eventos de digitação
    setupTypingEvents(io, socket, connectedUsers);
    // Configurar eventos de WebRTC para chamadas de voz
    // registerWebRTCEvents(io, socket, connectedUsers); // Implementação original
    registerSimpleWebRTCEvents(io, socket, connectedUsers); // Implementação simplificada
    registerWebRTCSignalingServer(io, socket, connectedUsers); // Implementação com microfone real
    console.log('Novo usuário conectado:', socket.id);

    socket.on('authenticate', async ({ token }) => {
        try {
            // Verificar token JWT
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sua_chave_secreta');
            const user = await User.findById(decoded.id);

            if (user) {
                // Atualizar status para online
                user.online = true;
                user.status = 'online';
                await user.save();
                connectedUsers.set(socket.id, user._id.toString());

                console.log(`Usuário ${user.username} (${user._id}) conectado e definido como online`);
                console.log(`Usuários conectados: ${Array.from(connectedUsers.values()).join(', ')}`);

                // Notificar todos os usuários (incluindo este) que este usuário está online
                io.emit('userConnected', {
                    userId: user._id,
                    username: user.username,
                    avatar: user.avatar,
                    online: true
                });

                // Obter todos os usuários, excluindo o próprio usuário
                const allUsers = await User.find({
                    _id: { $ne: user._id } // Excluir o próprio usuário
                }).select('-password');

                // Verificar quais usuários estão realmente conectados usando o mapa connectedUsers
                const connectedUserIds = Array.from(connectedUsers.values());
                console.log('IDs de usuários conectados:', connectedUserIds);

                // Filtrar apenas usuários que estão no mapa de usuários conectados
                const verifiedOnlineUsers = allUsers.filter(u => {
                    const isConnected = connectedUserIds.includes(u._id.toString());
                    if (isConnected) {
                        // Garantir que o status no banco de dados esteja correto
                        if (!u.online) {
                            console.log(`Corrigindo status do usuário ${u.username}: definindo como online`);
                            // Atualizar status assincronamente
                            User.updateOne({ _id: u._id }, { online: true, status: 'online' }).exec();
                        }
                    } else {
                        // Usuário não está conectado, mas pode estar marcado como online no banco de dados
                        if (u.online) {
                            console.log(`Corrigindo status do usuário ${u.username}: definindo como offline`);
                            // Atualizar status assincronamente
                            User.updateOne({ _id: u._id }, { online: false, status: 'offline' }).exec();
                        }
                    }
                    return isConnected;
                });

                console.log(`Encontrados ${verifiedOnlineUsers.length} outros usuários online`);
                if (verifiedOnlineUsers.length > 0) {
                    verifiedOnlineUsers.forEach(u => {
                        console.log(`- ${u.username} (${u._id}) está online`);
                    });
                }

                // Verificar todos os usuários no banco de dados
                const allUsersInDb = await User.find({}).select('username online');
                console.log(`Total de ${allUsersInDb.length} usuários no banco de dados:`);
                allUsersInDb.forEach(u => {
                    console.log(`- ${u.username}: ${u.online ? 'online' : 'offline'}`);
                });

                // Obter contagem de mensagens não lidas para cada usuário
                const unreadCounts = {};
                for (const otherUser of verifiedOnlineUsers) {
                    if (otherUser._id.toString() !== user._id.toString()) {
                        try {
                            const count = await Message.countDocuments({
                                sender: otherUser._id,
                                receiver: user._id,
                                read: false
                            });

                            console.log(`Mensagens não lidas de ${otherUser.username} para ${user.username}: ${count}`);

                            if (count > 0) {
                                unreadCounts[otherUser._id.toString()] = count;
                            }
                        } catch (error) {
                            console.error('Erro ao contar mensagens não lidas:', error);
                        }
                    }
                }

                // Enviar lista de usuários online com contagem de mensagens não lidas
                socket.emit('onlineUsers', { users: verifiedOnlineUsers, unreadCounts });

                // Enviar lista atualizada para todos os usuários a cada nova conexão
                // Isso garante que todos os clientes tenham a lista mais recente
                io.emit('updateUsersList', verifiedOnlineUsers);

                // Registrar eventos adicionais de socket
                registerSocketEvents(io, socket, connectedUsers);
            }
        } catch (error) {
            console.error('Erro na autenticação:', error);
            socket.emit('authError', { message: 'Falha na autenticação' });
        }
    });

    // Manipulador para quando o usuário retorna para a aba
    socket.on('userReturned', async () => {
        const userId = connectedUsers.get(socket.id);
        if (userId) {
            console.log(`Usuário ${userId} retornou para a aba`);
            // Não alteramos mais o status automaticamente
            // O status é controlado exclusivamente pelo usuário através da interface de status personalizado
        }
    });

    // Manipulador para solicitação de lista de usuários online
    socket.on('requestOnlineUsers', async () => {
        const userId = connectedUsers.get(socket.id);
        if (userId) {
            try {
                // Obter o usuário atual
                const user = await User.findById(userId);
                if (user) {
                    console.log(`Usuário ${user.username} solicitou lista de usuários online`);

                    // Obter todos os usuários, excluindo o próprio usuário
                    const allUsers = await User.find({
                        _id: { $ne: user._id } // Excluir o próprio usuário
                    }).select('-password');

                    // Verificar quais usuários estão realmente conectados usando o mapa connectedUsers
                    const connectedUserIds = Array.from(connectedUsers.values());
                    console.log('IDs de usuários conectados (solicitação):', connectedUserIds);

                    // Filtrar apenas usuários que estão no mapa de usuários conectados
                    const verifiedOnlineUsers = allUsers.filter(u => connectedUserIds.includes(u._id.toString()));

                    console.log(`Enviando ${verifiedOnlineUsers.length} usuários online para ${user.username}`);

                    // Obter contagem de mensagens não lidas
                    const unreadCounts = {};
                    for (const otherUser of verifiedOnlineUsers) {
                        if (otherUser._id.toString() !== user._id.toString()) {
                            try {
                                const count = await Message.countDocuments({
                                    sender: otherUser._id,
                                    receiver: user._id,
                                    read: false,
                                    deletedFor: { $ne: user._id }
                                });

                                if (count > 0) {
                                    unreadCounts[otherUser._id] = count;
                                }
                            } catch (error) {
                                console.error(`Erro ao contar mensagens não lidas de ${otherUser.username}:`, error);
                            }
                        }
                    }

                    // Enviar lista atualizada para o cliente que solicitou
                    socket.emit('onlineUsers', { users: verifiedOnlineUsers, unreadCounts });
                }
            } catch (error) {
                console.error('Erro ao processar solicitação de usuários online:', error);
            }
        }
    });

    socket.on('sendMessage', async (data) => {
        try {
            const senderId = connectedUsers.get(socket.id);
            if (!senderId) {
                console.error('Usuário não autenticado tentando enviar mensagem');
                socket.emit('messageError', { error: 'Você precisa estar autenticado para enviar mensagens' });
                return;
            }

            console.log(`Processando nova mensagem de ${senderId} para ${data.receiverId}: ${data.content}`);

            // Criar nova mensagem
            const message = new Message({
                sender: senderId,
                receiver: data.receiverId,
                content: data.content,
                read: false // Marcar como não lida inicialmente
            });

            // Salvar mensagem no banco de dados
            await message.save();
            console.log(`Nova mensagem salva: ${message._id} de ${senderId} para ${data.receiverId}`);

            // Obter mensagem com informações do remetente e destinatário
            const populatedMessage = await Message.findById(message._id)
                .populate('sender', 'username avatar status')
                .populate('receiver', 'username avatar status');

            console.log(`Mensagem populada: De ${populatedMessage.sender.username} para ${populatedMessage.receiver.username}`);

            // Enviar confirmação para o remetente primeiro
            socket.emit('messageSent', populatedMessage);
            console.log(`Confirmação enviada para o remetente ${populatedMessage.sender.username}`);

            // Encontrar todos os sockets do destinatário
            const receiverSockets = [];
            for (const [socketId, userId] of connectedUsers.entries()) {
                if (userId.toString() === data.receiverId) {
                    receiverSockets.push(socketId);
                }
            }

            console.log(`Encontrados ${receiverSockets.length} sockets para o destinatário ${data.receiverId}`);

            // Contar todas as mensagens não lidas
            const unreadCount = await Message.countDocuments({
                sender: senderId,
                receiver: data.receiverId,
                read: false
            });

            console.log(`Total de mensagens não lidas de ${senderId} para ${data.receiverId}: ${unreadCount}`);

            // Verificar se o destinatário está online ou ausente
            const receiver = await User.findById(data.receiverId);
            const receiverStatus = receiver ? receiver.status : 'offline';

            console.log(`Status do destinatário ${data.receiverId}: ${receiverStatus}`);

            if (receiverSockets.length > 0) {
                // Destinatário está conectado (online ou away), enviar para todos os sockets
                for (const socketId of receiverSockets) {
                    try {
                        // Enviar a nova mensagem
                        console.log(`Enviando mensagem para socket ${socketId}: ${populatedMessage.content}`);
                        io.to(socketId).emit('newMessage', populatedMessage);

                        // Enviar atualização de contagem de mensagens não lidas
                        io.to(socketId).emit('unreadMessages', {
                            userId: senderId,
                            count: unreadCount
                        });

                        console.log(`Enviado para socket ${socketId}: ${unreadCount} mensagens não lidas`);
                    } catch (socketError) {
                        console.error(`Erro ao enviar para socket ${socketId}:`, socketError);
                    }
                }
            } else {
                // Destinatário não está conectado ou está ausente sem socket ativo
                console.log(`Destinatário ${data.receiverId} não está online ou está ausente, mensagem ficará pendente`);

                // Mesmo assim, atualizar a contagem de mensagens não lidas para todos os usuários conectados
                // Isso garante que quando o usuário voltar, ele verá as mensagens não lidas
                io.emit('updateUnreadCount', {
                    receiverId: data.receiverId,
                    senderId: senderId,
                    count: unreadCount
                });
            }
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            socket.emit('messageError', { error: 'Erro ao enviar mensagem' });
        }
    });

    socket.on('disconnect', async () => {
        const userId = connectedUsers.get(socket.id);
        if (userId) {
            console.log(`Usuário ${userId} desconectado (socket ${socket.id})`);

            try {
                // Buscar o usuário no banco de dados
                const user = await User.findById(userId);
                if (user) {
                    // Atualizar status para offline
                    user.online = false;
                    user.status = 'offline';
                    await user.save();

                    // Notificar outros usuários
                    io.emit('userStatusChanged', {
                        userId: userId,
                        online: false
                    });

                    // Obter lista atualizada de usuários online, excluindo o usuário que acabou de desconectar
                    const onlineUsers = await User.find({
                        online: true,
                        _id: { $ne: userId } // Excluir o usuário que acabou de desconectar
                    }).select('-password');

                    // Enviar lista atualizada para todos
                    io.emit('updateUsersList', onlineUsers);
                }
            } catch (error) {
                console.error('Erro ao atualizar status do usuário desconectado:', error);
            }

            // Remover o usuário da lista de usuários conectados
            connectedUsers.delete(socket.id);
        }
    });
});

// Rotas da API

// Rota de registro
app.post('/api/register', async (req, res) => {
    console.log('Recebida requisição para registro de usuário');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);

    try {
        // Verificar se o corpo da requisição está vazio
        if (!req.body || Object.keys(req.body).length === 0) {
            console.error('Corpo da requisição vazio ou inválido');
            return res.status(400).json({ message: 'Dados de registro inválidos ou ausentes' });
        }

        const { username, password } = req.body;

        // Validar campos obrigatórios
        if (!username || !password) {
            console.error('Campos obrigatórios ausentes:', { username: !!username, password: !!password });
            return res.status(400).json({ message: 'Nome de usuário e senha são obrigatórios' });
        }

        // Validar tamanho da senha
        if (password.length < 6) {
            console.error('Senha muito curta');
            return res.status(400).json({ message: 'A senha deve ter pelo menos 6 caracteres' });
        }

        // Adicionar um sufixo aleatório ao nome de usuário para testes
        // se o parâmetro test=true estiver presente
        let finalUsername = username;
        if (req.query.test === 'true') {
            const randomSuffix = Math.floor(Math.random() * 10000);
            finalUsername = `${username}_${randomSuffix}`;
            console.log(`Modo de teste ativado. Nome de usuário modificado para: ${finalUsername}`);
        }

        // Verificar se o usuário já existe
        console.log(`Verificando se o usuário ${finalUsername} já existe...`);
        const userExists = await User.findOne({ username: finalUsername });
        if (userExists) {
            console.log(`Usuário ${finalUsername} já existe`);
            return res.status(400).json({ message: 'Usuário já existe' });
        }

        // Criar novo usuário com avatar fixo
        console.log(`Criando novo usuário: ${finalUsername}`);
        const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${finalUsername}`;

        try {
            const user = await User.create({
                username: finalUsername,
                password,
                avatar: avatar
            });

            if (user) {
                console.log(`Usuário ${finalUsername} criado com sucesso. ID: ${user._id}`);
                const token = generateToken(user._id);
                console.log(`Token gerado para ${finalUsername}`);

                return res.status(201).json({
                    _id: user._id,
                    username: user.username,
                    avatar: user.avatar,
                    token: token
                });
            } else {
                console.error('Falha ao criar usuário - retorno nulo');
                return res.status(400).json({ message: 'Dados de usuário inválidos' });
            }
        } catch (createError) {
            console.error('Erro ao criar usuário:', createError);
            return res.status(400).json({ message: `Erro ao criar usuário: ${createError.message}` });
        }
    } catch (error) {
        console.error('Erro geral na rota de registro:', error);
        return res.status(500).json({ message: 'Erro interno do servidor', error: error.message });
    }
});

// Rota de login
app.post('/api/login', async (req, res) => {
    console.log('Recebida requisição para login de usuário');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);

    try {
        // Verificar se o corpo da requisição está vazio
        if (!req.body || Object.keys(req.body).length === 0) {
            console.error('Corpo da requisição vazio ou inválido');
            return res.status(400).json({ message: 'Dados de login inválidos ou ausentes' });
        }

        const { username, password } = req.body;

        // Validar campos obrigatórios
        if (!username || !password) {
            console.error('Campos obrigatórios ausentes:', { username: !!username, password: !!password });
            return res.status(400).json({ message: 'Nome de usuário e senha são obrigatórios' });
        }

        // Verificar se o usuário existe
        console.log(`Verificando credenciais para o usuário: ${username}`);
        const user = await User.findOne({ username });

        if (!user) {
            console.log(`Usuário não encontrado: ${username}`);
            return res.status(401).json({ message: 'Usuário ou senha inválidos' });
        }

        // Verificar senha
        const isMatch = await user.matchPassword(password);
        if (isMatch) {
            console.log(`Login bem-sucedido para o usuário: ${username}`);
            const token = generateToken(user._id);
            console.log(`Token gerado para ${username}`);

            return res.json({
                _id: user._id,
                username: user.username,
                avatar: user.avatar,
                token: token
            });
        } else {
            console.log(`Senha incorreta para o usuário: ${username}`);
            return res.status(401).json({ message: 'Usuário ou senha inválidos' });
        }
    } catch (error) {
        console.error('Erro na rota de login:', error);
        return res.status(500).json({ message: 'Erro interno do servidor', error: error.message });
    }
});

// Rota para obter perfil do usuário
app.get('/api/users/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'Usuário não encontrado' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Rota para obter mensagens
app.get('/api/messages/:userId', protect, async (req, res) => {
    // Verificar se as mensagens devem ser marcadas como lidas
    const markAsRead = req.query.markAsRead === 'true';
    try {
        const currentUserId = req.user._id;
        const otherUserId = req.params.userId;
        console.log(`Carregando mensagens entre ${currentUserId} e ${otherUserId}`);

        // Buscar mensagens que não foram excluídas pelo usuário atual
        const messages = await Message.find({
            $or: [
                { sender: otherUserId, receiver: currentUserId },
                { sender: currentUserId, receiver: otherUserId }
            ],
            deletedFor: { $ne: currentUserId } // Não incluir mensagens excluídas pelo usuário atual
        })
        .populate('replyTo') // Incluir informações sobre mensagens respondidas
        .populate('sender', 'username avatar status')
        .populate('receiver', 'username avatar status')
        .sort('createdAt') // Ordenar por data crescente para mostrar as mais antigas primeiro
        .limit(100); // Aumentar o limite para mostrar mais mensagens

        console.log(`Encontradas ${messages.length} mensagens entre ${currentUserId} e ${otherUserId}`);

        // Imprimir detalhes das mensagens para depuração
        messages.forEach((msg, index) => {
            console.log(`Mensagem ${index + 1}: De ${msg.sender.username} para ${msg.receiver.username}: ${msg.content.substring(0, 20)}... (lida: ${msg.read})`);
        });

        // Contar mensagens não lidas
        const unreadCount = await Message.countDocuments({
            sender: otherUserId,
            receiver: currentUserId,
            read: false
        });

        console.log(`${unreadCount} mensagens não lidas de ${otherUserId} para ${currentUserId}`);

        // Marcar mensagens recebidas como lidas apenas se markAsRead for true
        if (unreadCount > 0 && markAsRead) {
            const updateResult = await Message.updateMany(
                {
                    sender: otherUserId,
                    receiver: currentUserId,
                    read: false
                },
                { read: true }
            );

            console.log(`Marcadas ${updateResult.modifiedCount} mensagens como lidas`);

            // Notificar o remetente que as mensagens foram lidas
            for (const [socketId, userId] of connectedUsers.entries()) {
                if (userId.toString() === otherUserId) {
                    io.to(socketId).emit('messagesRead', {
                        userId: currentUserId
                    });
                    console.log(`Notificado usuário ${otherUserId} (socket ${socketId}) que suas mensagens foram lidas`);
                }
            }

            // Enviar contagem zero para o usuário atual
            for (const [socketId, userId] of connectedUsers.entries()) {
                if (userId.toString() === currentUserId) {
                    io.to(socketId).emit('unreadMessages', {
                        userId: otherUserId,
                        count: 0
                    });
                    console.log(`Enviada contagem zero para ${currentUserId} (socket ${socketId})`);
                }
            }
        }

        res.json(messages);
    } catch (error) {
        console.error('Erro ao obter mensagens:', error);
        res.status(400).json({ message: error.message });
    }
});

// Rota para limpar todas as mensagens de uma conversa (apenas para o usuário que solicitou)
app.delete('/api/messages/:userId/clear', protect, async (req, res) => {
    try {
        const currentUserId = req.user._id;
        const otherUserId = req.params.userId;

        console.log(`Tentando limpar conversa entre ${currentUserId} e ${otherUserId}`);
        console.log('Usuário autenticado:', req.user.username);

        // Verificar se o usuário existe
        const otherUser = await User.findById(otherUserId);
        if (!otherUser) {
            console.error(`Usuário ${otherUserId} não encontrado`);
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        console.log(`Marcando mensagens como excluídas para ${req.user.username} na conversa com ${otherUser.username}`);

        // Marcar as mensagens como excluídas apenas para o usuário atual
        // Primeiro, encontramos todas as mensagens entre os dois usuários
        const messages = await Message.find({
            $or: [
                { sender: currentUserId, receiver: otherUserId },
                { sender: otherUserId, receiver: currentUserId }
            ],
            deletedFor: { $ne: currentUserId } // Apenas mensagens que ainda não foram excluídas pelo usuário
        });

        // Contamos quantas mensagens serão afetadas
        const count = messages.length;
        console.log(`Encontradas ${count} mensagens para marcar como excluídas`);

        // Atualizar cada mensagem para adicionar o ID do usuário atual ao array deletedFor
        let updatedCount = 0;
        for (const message of messages) {
            const result = await Message.updateOne(
                { _id: message._id },
                { $addToSet: { deletedFor: currentUserId } }
            );
            if (result.modifiedCount > 0) {
                updatedCount++;
            }
        }

        console.log(`Marcadas ${updatedCount} mensagens como excluídas para o usuário ${req.user.username}`);

        // Simular o resultado para manter compatibilidade com o código existente
        const result = { deletedCount: updatedCount };

        console.log(`Excluídas ${result.deletedCount} mensagens para ${req.user.username}`);

        // Responder ao cliente
        res.json({
            message: 'Conversa limpa com sucesso',
            deletedCount: result.deletedCount,
            success: true
        });

        // Notificar apenas o usuário que solicitou a exclusão
        try {
            // Encontrar todos os sockets do usuário atual
            for (const [socketId, userId] of connectedUsers.entries()) {
                if (userId.toString() === currentUserId.toString()) {
                    io.to(socketId).emit('conversationCleared', {
                        userId: otherUserId,
                        deletedCount: result.deletedCount
                    });
                }
            }
        } catch (socketError) {
            console.error('Erro ao notificar cliente:', socketError);
            // Não falhar a requisição se houver erro ao notificar
        }
    } catch (error) {
        console.error('Erro ao limpar conversa:', error);
        res.status(400).json({ message: error.message, success: false });
    }
});

// Rota para excluir mensagens específicas
app.post('/api/messages/delete', protect, async (req, res) => {
    try {
        const { messageIds, userId } = req.body;
        const currentUserId = req.user._id;

        if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
            return res.status(400).json({ message: 'IDs de mensagens inválidos' });
        }

        // Verificar se o usuário existe
        const otherUser = await User.findById(userId);
        if (!otherUser) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        // Excluir as mensagens especificadas
        // Nota: Como estamos usando IDs gerados pelo cliente, precisamos adaptar esta lógica
        // Em um ambiente real, usaríamos os IDs reais do banco de dados

        // Obter todas as mensagens entre os dois usuários
        const messages = await Message.find({
            $or: [
                { sender: currentUserId, receiver: userId },
                { sender: userId, receiver: currentUserId }
            ]
        }).sort({ createdAt: 1 });

        // Mapear os IDs do cliente para os IDs do banco de dados
        // Neste exemplo simplificado, vamos excluir as últimas N mensagens
        const count = Math.min(messageIds.length, messages.length);
        const messagesToDelete = messages.slice(-count);

        // Excluir as mensagens
        for (const message of messagesToDelete) {
            await Message.findByIdAndDelete(message._id);
        }

        console.log(`Excluídas ${messagesToDelete.length} mensagens entre ${currentUserId} e ${userId}`);

        res.json({ message: 'Mensagens excluídas com sucesso', deletedCount: messagesToDelete.length });
    } catch (error) {
        console.error('Erro ao excluir mensagens:', error);
        res.status(400).json({ message: error.message });
    }
});

// Rota para adicionar uma reação a uma mensagem
app.post('/api/messages/:messageId/react', protect, async (req, res) => {
    try {
        const { messageId } = req.params;
        const { reaction } = req.body;
        const userId = req.user._id;
        const username = req.user.username;

        if (!reaction) {
            return res.status(400).json({ message: 'Reação não especificada' });
        }

        // Verificar se a mensagem existe
        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: 'Mensagem não encontrada' });
        }

        // Verificar se o usuário tem acesso à mensagem
        if (!message.sender.equals(userId) && !message.receiver.equals(userId)) {
            return res.status(403).json({ message: 'Acesso negado' });
        }

        // Verificar se a mensagem foi excluída para o usuário
        if (message.deletedFor.includes(userId)) {
            return res.status(404).json({ message: 'Mensagem não encontrada' });
        }

        // Inicializar o Map de reações se não existir
        if (!message.reactions) {
            message.reactions = new Map();
        }

        // Obter a lista atual de usuários para esta reação
        let reactors = message.reactions.get(reaction) || [];

        // Verificar se o usuário já reagiu com este emoji
        const existingReactionIndex = reactors.findIndex(r => r.userId.toString() === userId.toString());

        if (existingReactionIndex !== -1) {
            // Remover a reação se o usuário já reagiu com este emoji
            reactors.splice(existingReactionIndex, 1);
            if (reactors.length === 0) {
                message.reactions.delete(reaction);
            } else {
                message.reactions.set(reaction, reactors);
            }
        } else {
            // Adicionar a reação
            reactors.push({ userId, username });
            message.reactions.set(reaction, reactors);
        }

        // Salvar a mensagem atualizada
        await message.save();

        // Notificar os usuários sobre a reação
        const otherUserId = message.sender.equals(userId) ? message.receiver : message.sender;

        // Encontrar sockets para notificar
        for (const [socketId, connectedUserId] of connectedUsers.entries()) {
            if (connectedUserId.toString() === otherUserId.toString() ||
                connectedUserId.toString() === userId.toString()) {
                io.to(socketId).emit('messageReaction', {
                    messageId: message._id,
                    reactions: Object.fromEntries(message.reactions),
                    userId,
                    username,
                    reaction
                });
            }
        }

        res.json({
            message: 'Reação atualizada com sucesso',
            reactions: Object.fromEntries(message.reactions)
        });
    } catch (error) {
        console.error('Erro ao adicionar reação:', error);
        res.status(400).json({ message: error.message });
    }
});

// Rota para responder a uma mensagem
app.post('/api/messages/:messageId/reply', protect, async (req, res) => {
    try {
        const { messageId } = req.params;
        const { content, receiverId } = req.body;
        const senderId = req.user._id;

        if (!content) {
            return res.status(400).json({ message: 'Conteúdo da mensagem não especificado' });
        }

        if (!receiverId) {
            return res.status(400).json({ message: 'Destinatário não especificado' });
        }

        // Verificar se a mensagem original existe
        const originalMessage = await Message.findById(messageId);
        if (!originalMessage) {
            return res.status(404).json({ message: 'Mensagem original não encontrada' });
        }

        // Verificar se o usuário tem acesso à mensagem original
        if (!originalMessage.sender.equals(senderId) && !originalMessage.receiver.equals(senderId)) {
            return res.status(403).json({ message: 'Acesso negado' });
        }

        // Verificar se a mensagem foi excluída para o usuário
        if (originalMessage.deletedFor.includes(senderId)) {
            return res.status(404).json({ message: 'Mensagem original não encontrada' });
        }

        // Criar a nova mensagem de resposta
        const newMessage = new Message({
            sender: senderId,
            receiver: receiverId,
            content,
            replyTo: messageId
        });

        // Salvar a nova mensagem
        await newMessage.save();

        // Populate sender and receiver
        const populatedMessage = await Message.findById(newMessage._id)
            .populate('sender', 'username avatar status')
            .populate('receiver', 'username avatar status')
            .populate('replyTo');

        console.log(`Nova mensagem de resposta salva: ${newMessage._id} de ${senderId} para ${receiverId}`);
        console.log(`Mensagem populada: De ${populatedMessage.sender.username} para ${populatedMessage.receiver.username}`);

        // Enviar confirmação para o remetente
        for (const [socketId, userId] of connectedUsers.entries()) {
            if (userId.toString() === senderId.toString()) {
                io.to(socketId).emit('messageSent', populatedMessage);
                console.log(`Confirmação enviada para o remetente ${populatedMessage.sender.username}`);
            }
        }

        // Enviar a mensagem para o destinatário se estiver online
        let receiverSockets = [];
        for (const [socketId, userId] of connectedUsers.entries()) {
            if (userId.toString() === receiverId.toString()) {
                receiverSockets.push(socketId);
            }
        }

        console.log(`Encontrados ${receiverSockets.length} sockets para o destinatário ${receiverId}`);

        // Atualizar contagem de mensagens não lidas
        const unreadCount = await Message.countDocuments({
            sender: senderId,
            receiver: receiverId,
            read: false,
            deletedFor: { $ne: receiverId }
        });

        console.log(`Total de mensagens não lidas de ${senderId} para ${receiverId}: ${unreadCount}`);

        // Verificar o status do destinatário
        const receiver = await User.findById(receiverId);
        console.log(`Status do destinatário ${receiverId}: ${receiver.status || 'desconhecido'}`);

        if (receiverSockets.length > 0) {
            // Destinatário está online, enviar a mensagem diretamente
            for (const socketId of receiverSockets) {
                io.to(socketId).emit('newMessage', populatedMessage);
                console.log(`Enviando mensagem para socket ${socketId}: ${content}`);

                // Enviar atualização de contagem de mensagens não lidas
                io.to(socketId).emit('updateUnreadCount', {
                    senderId,
                    receiverId,
                    count: unreadCount
                });
                console.log(`Enviado para socket ${socketId}: ${unreadCount} mensagens não lidas`);
            }
        } else if (receiver.status !== 'online') {
            // Destinatário está offline ou ausente, enviar notificação para todos os clientes
            io.emit('updateUnreadCount', {
                senderId,
                receiverId,
                count: unreadCount
            });
            console.log(`Destinatário offline/ausente. Enviando atualização de contagem para todos os clientes.`);
        }

        res.status(201).json(populatedMessage);
    } catch (error) {
        console.error('Erro ao responder mensagem:', error);
        res.status(400).json({ message: error.message });
    }
});

// Rota para fixar/desafixar uma mensagem
app.post('/api/messages/:messageId/pin', protect, async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user._id;

        // Verificar se a mensagem existe
        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: 'Mensagem não encontrada' });
        }

        // Verificar se o usuário tem acesso à mensagem
        if (!message.sender.equals(userId) && !message.receiver.equals(userId)) {
            return res.status(403).json({ message: 'Acesso negado' });
        }

        // Verificar se a mensagem foi excluída para o usuário
        if (message.deletedFor.includes(userId)) {
            return res.status(404).json({ message: 'Mensagem não encontrada' });
        }

        // Alternar o estado de fixado
        message.isPinned = !message.isPinned;
        await message.save();

        // Notificar os usuários sobre a mudança
        const otherUserId = message.sender.equals(userId) ? message.receiver : message.sender;

        // Encontrar sockets para notificar
        for (const [socketId, connectedUserId] of connectedUsers.entries()) {
            if (connectedUserId.toString() === otherUserId.toString() ||
                connectedUserId.toString() === userId.toString()) {
                io.to(socketId).emit('messagePinned', {
                    messageId: message._id,
                    isPinned: message.isPinned,
                    userId
                });
            }
        }

        res.json({
            message: message.isPinned ? 'Mensagem fixada com sucesso' : 'Mensagem desafixada com sucesso',
            isPinned: message.isPinned
        });
    } catch (error) {
        console.error('Erro ao fixar/desafixar mensagem:', error);
        res.status(400).json({ message: error.message });
    }
});

// Rota para atualizar o status do usuário
app.post('/api/users/status', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const { status, customStatus } = req.body;

        // Verificar se o status é válido
        if (!['online', 'away', 'busy', 'invisible', 'offline', 'custom'].includes(status)) {
            return res.status(400).json({ message: 'Status inválido' });
        }

        // Atualizar o status do usuário
        const updateData = { status };

        // Adicionar status personalizado se necessário
        if (status === 'custom' && customStatus) {
            updateData.customStatus = {
                text: customStatus.text || '',
                emoji: customStatus.emoji || '',
                expiresAt: customStatus.expiresAt || null
            };
        }

        const user = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        console.log(`Status do usuário ${user.username} atualizado para ${status}`);

        res.json({
            message: 'Status atualizado com sucesso',
            user
        });
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        res.status(400).json({ message: error.message });
    }
});

// Rota para obter todos os usuários
app.get('/api/users', protect, async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Rota para obter um usuário específico
app.get('/api/users/:userId', protect, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        res.json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Rota de debug para verificar avatares
app.get('/api/debug/avatars', async (req, res) => {
    try {
        const users = await User.find({});
        const usersWithAvatars = users.map(user => ({
            _id: user._id,
            username: user.username,
            avatar: user.avatar,
            online: user.online
        }));
        res.json(usersWithAvatars);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Removemos a verificação automática de status
// O status é controlado exclusivamente pelo usuário através da interface de status personalizado

const PORT = process.env.PORT || 3001;

// Importar verificador de saúde
const checkHealth = require('./health-check');

// Adicionar rota de verificação de saúde para o Render
app.get('/health', async (req, res) => {
    try {
        // Verificar saúde do servidor e suas dependências
        const health = await checkHealth();

        // Definir código de status com base no status geral
        const statusCode = health.status === 'ok' ? 200 : 503;

        res.status(statusCode).json(health);
    } catch (error) {
        console.error('Erro na rota /health:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erro ao verificar status do servidor',
            error: process.env.NODE_ENV === 'production' ? null : error.message
        });
    }
});

// Adicionar rota raiz para verificação
app.get('/', (req, res) => {
    try {
        res.sendFile(path.join(__dirname, 'index.html'));
    } catch (error) {
        console.error('Erro na rota raiz:', error);
        res.status(500).send('Erro ao carregar a página inicial. Por favor, tente novamente mais tarde.');
    }
});

// Adicionar rota de fallback para lidar com erros 404
app.use((req, res, next) => {
    res.status(404).send('Página não encontrada');
});

// Middleware para tratamento de erros global
app.use((err, req, res, next) => {
    console.error('Erro não tratado:', err);

    // Determinar o código de status apropriado
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

    // Enviar resposta de erro
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? '🚀' : err.stack,
        error: process.env.NODE_ENV === 'production' ? 'Erro interno do servidor' : err.toString()
    });
});

// Iniciar o servidor
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`MongoDB URI: ${process.env.MONGODB_URI ? 'Configurado' : 'Não configurado'}`);
    console.log(`JWT Secret: ${process.env.JWT_SECRET ? 'Configurado' : 'Não configurado'}`);
    console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);

    // Verificar conexão com o MongoDB
    const isConnected = mongoose.connection.readyState === 1;
    console.log(`Estado da conexão MongoDB: ${isConnected ? 'Conectado' : 'Desconectado'}`);

    if (!isConnected) {
        console.warn('Aviso: Servidor iniciado, mas a conexão com o MongoDB não está ativa.');
    }
});
