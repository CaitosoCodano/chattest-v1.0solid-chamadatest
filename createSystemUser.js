require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Message = require('./models/Message');

// Conectar ao MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/chat-app')
    .then(() => console.log('MongoDB Conectado'))
    .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

const createSystemUser = async () => {
    try {
        // Verificar se o usuário Sistema já existe
        const existingUser = await User.findOne({ username: 'Sistema' });
        
        if (existingUser) {
            console.log('Usuário Sistema já existe:', existingUser._id);
            return existingUser;
        }
        
        // Criar senha aleatória (não será usada para login)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('sistema123', salt);
        
        // Criar usuário Sistema
        const systemUser = new User({
            username: 'Sistema',
            password: hashedPassword,
            avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sistema',
            status: 'online'
        });
        
        await systemUser.save();
        console.log('Usuário Sistema criado com sucesso:', systemUser._id);
        
        // Criar mensagem de boas-vindas
        const welcomeMessage = new Message({
            sender: systemUser._id,
            receiver: systemUser._id, // Mensagem para si mesmo (será exibida para todos)
            content: '👋 Bem-vindo ao Chat App! Aqui você encontrará as novidades e atualizações do sistema.',
            read: false,
            createdAt: new Date()
        });
        
        await welcomeMessage.save();
        
        // Criar mensagem com novidades
        const newsMessage = new Message({
            sender: systemUser._id,
            receiver: systemUser._id,
            content: '🚀 **Novidades da versão 1.0:**\n\n' +
                     '- ✅ Sistema de login e registro\n' +
                     '- ✅ Chat em tempo real\n' +
                     '- ✅ Status de usuário (online, ausente, offline)\n' +
                     '- ✅ Contador de mensagens não lidas\n' +
                     '- ✅ Persistência de mensagens\n' +
                     '- ✅ Notificações de novas mensagens',
            read: false,
            createdAt: new Date(Date.now() + 1000) // 1 segundo depois da mensagem de boas-vindas
        });
        
        await newsMessage.save();
        
        console.log('Mensagens do Sistema criadas com sucesso');
        
        return systemUser;
    } catch (error) {
        console.error('Erro ao criar usuário Sistema:', error);
    } finally {
        // Desconectar do MongoDB
        mongoose.disconnect();
    }
};

createSystemUser();
