const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Verificar se a variável de ambiente está definida
        if (!process.env.MONGODB_URI) {
            console.warn('Aviso: MONGODB_URI não está definido. Usando conexão local como fallback.');
        }

        // Tentar conectar com opções adicionais para melhor compatibilidade
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chat-app', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // Timeout após 5 segundos
            socketTimeoutMS: 45000, // Fechar sockets após 45 segundos de inatividade
            family: 4 // Usar IPv4, evita problemas em alguns ambientes
        });

        console.log(`MongoDB Conectado: ${conn.connection.host}`);

        // Adicionar manipuladores de eventos para monitorar a conexão
        mongoose.connection.on('error', err => {
            console.error('Erro na conexão MongoDB:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB desconectado. Tentando reconectar...');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconectado com sucesso');
        });

        return conn;
    } catch (error) {
        console.error(`Erro ao conectar ao MongoDB: ${error.message}`);
        console.error('Detalhes completos do erro:', error);

        // Em ambiente de produção, não encerrar o processo para permitir retry
        if (process.env.NODE_ENV === 'production') {
            console.error('Falha na conexão com o MongoDB, mas continuando execução em modo de produção');
            return null;
        } else {
            // Em desenvolvimento, encerrar para notificar o desenvolvedor
            process.exit(1);
        }
    }
};

module.exports = connectDB;