require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/database');
const User = require('./models/User');
const Message = require('./models/Message');

// Função para limpar os dados
async function cleanData() {
    try {
        console.log('Conectando ao banco de dados...');
        await connectDB();
        console.log('Conectado ao banco de dados com sucesso!');

        // Limpar todas as mensagens
        console.log('Limpando todas as mensagens...');
        const deleteMessagesResult = await Message.deleteMany({});
        console.log(`${deleteMessagesResult.deletedCount} mensagens foram removidas.`);

        // Redefinir os dados dos usuários
        console.log('Redefinindo os dados dos usuários...');
        
        // Atualizar todos os usuários para offline e remover status personalizados
        const updateUsersResult = await User.updateMany(
            {}, 
            { 
                $set: { 
                    online: false,
                    status: 'offline',
                    customStatus: {
                        text: '',
                        emoji: '',
                        expiresAt: null
                    },
                    lastActivity: new Date()
                } 
            }
        );
        
        console.log(`${updateUsersResult.modifiedCount} usuários foram atualizados.`);
        
        // Listar todos os usuários
        const users = await User.find({}).select('-password');
        console.log('\nUsuários no sistema:');
        users.forEach(user => {
            console.log(`- ${user.username} (ID: ${user._id})`);
        });

        console.log('\nLimpeza concluída com sucesso!');
        process.exit(0);
    } catch (error) {
        console.error('Erro ao limpar os dados:', error);
        process.exit(1);
    }
}

// Executar a função
cleanData();
