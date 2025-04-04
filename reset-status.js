require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/database');
const User = require('./models/User');

// Função para redefinir o status de todos os usuários
async function resetUserStatus() {
    try {
        console.log('Conectando ao banco de dados...');
        await connectDB();
        console.log('Conectado ao banco de dados com sucesso!');

        // Atualizar todos os usuários para offline
        const result = await User.updateMany(
            {}, 
            { 
                $set: { 
                    online: false,
                    status: 'offline'
                } 
            }
        );
        
        console.log(`${result.modifiedCount} usuários foram atualizados para offline.`);
        
        // Listar todos os usuários
        const users = await User.find({}).select('username online status');
        console.log('\nUsuários no sistema:');
        users.forEach(user => {
            console.log(`- ${user.username}: online=${user.online}, status=${user.status}`);
        });

        console.log('\nRedefinição concluída com sucesso!');
        process.exit(0);
    } catch (error) {
        console.error('Erro ao redefinir status dos usuários:', error);
        process.exit(1);
    }
}

// Executar a função
resetUserStatus();
