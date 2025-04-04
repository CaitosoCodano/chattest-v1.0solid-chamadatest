require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Message = require('./models/Message');

// Conectar ao MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/chat-app')
    .then(() => console.log('MongoDB Conectado'))
    .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

const removeSystemUser = async () => {
    try {
        // Encontrar o usuário Sistema
        const systemUser = await User.findOne({ username: 'Sistema' });
        
        if (!systemUser) {
            console.log('Usuário Sistema não encontrado');
            return;
        }
        
        const systemUserId = systemUser._id;
        console.log(`Encontrado usuário Sistema com ID: ${systemUserId}`);
        
        // Remover todas as mensagens relacionadas ao usuário Sistema
        const messagesResult = await Message.deleteMany({
            $or: [
                { sender: systemUserId },
                { receiver: systemUserId }
            ]
        });
        
        console.log(`Removidas ${messagesResult.deletedCount} mensagens relacionadas ao usuário Sistema`);
        
        // Remover o usuário Sistema
        const userResult = await User.deleteOne({ _id: systemUserId });
        
        if (userResult.deletedCount > 0) {
            console.log('Usuário Sistema removido com sucesso');
        } else {
            console.log('Falha ao remover o usuário Sistema');
        }
    } catch (error) {
        console.error('Erro ao remover usuário Sistema:', error);
    } finally {
        // Desconectar do MongoDB
        mongoose.disconnect();
    }
};

removeSystemUser();
