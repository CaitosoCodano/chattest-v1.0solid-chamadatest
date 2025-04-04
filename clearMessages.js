require('dotenv').config();
const mongoose = require('mongoose');

// Conectar ao MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/chat-app')
    .then(() => console.log('MongoDB Conectado'))
    .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Limpar coleção de mensagens
mongoose.connection.collection('messages').deleteMany({})
    .then(result => {
        console.log(`${result.deletedCount} mensagens removidas`);
        mongoose.connection.close();
        process.exit(0);
    })
    .catch(err => {
        console.error('Erro ao limpar mensagens:', err);
        mongoose.connection.close();
        process.exit(1);
    });
