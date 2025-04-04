const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Verificar se a variável de ambiente está definida
        if (!process.env.MONGODB_URI) {
            console.warn('Aviso: MONGODB_URI não está definido. Usando conexão local como fallback.');
        }

        // Imprimir informações de debug (sem expor credenciais)
        const mongoUriMasked = process.env.MONGODB_URI
            ? process.env.MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')
            : 'mongodb://localhost:27017/chat-app';
        console.log(`Tentando conectar ao MongoDB: ${mongoUriMasked}`);

        // Tentar conectar com opções adicionais para melhor compatibilidade
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chat-app', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000, // Aumentado para 10 segundos
            socketTimeoutMS: 60000, // Aumentado para 60 segundos
            family: 4, // Usar IPv4, evita problemas em alguns ambientes
            retryWrites: true,
            w: 'majority',
            maxPoolSize: 10,
            minPoolSize: 2
        });

        console.log(`MongoDB Conectado: ${conn.connection.host}`);
        console.log(`Nome do banco de dados: ${conn.connection.name}`);
        console.log(`Estado da conexão: ${mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado'}`);

        // Adicionar manipuladores de eventos para monitorar a conexão
        mongoose.connection.on('error', err => {
            console.error('Erro na conexão MongoDB:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB desconectado. Tentando reconectar...');
            // Tentar reconectar após 5 segundos
            setTimeout(() => {
                console.log('Tentando reconectar ao MongoDB...');
                mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chat-app', {
                    useNewUrlParser: true,
                    useUnifiedTopology: true
                }).catch(err => {
                    console.error('Falha na tentativa de reconexão:', err);
                });
            }, 5000);
        });

        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconectado com sucesso');
        });

        // Verificar conexão com o banco de dados
        try {
            // Tentar uma operação simples para verificar se a conexão está funcionando
            await mongoose.connection.db.admin().ping();
            console.log('Conexão com MongoDB verificada com sucesso');
        } catch (pingError) {
            console.warn('Aviso: Não foi possível verificar a conexão com o MongoDB:', pingError.message);
        }

        return conn;
    } catch (error) {
        console.error(`Erro ao conectar ao MongoDB: ${error.message}`);
        console.error('Detalhes completos do erro:', error);

        // Verificar problemas comuns
        if (error.name === 'MongoServerSelectionError') {
            console.error('Erro de seleção de servidor MongoDB. Verifique se o servidor está acessível e se a string de conexão está correta.');
        } else if (error.name === 'MongoParseError') {
            console.error('Erro de parse da string de conexão MongoDB. Verifique se a string de conexão está formatada corretamente.');
        } else if (error.name === 'MongoNetworkError') {
            console.error('Erro de rede MongoDB. Verifique sua conexão de rede e se o servidor MongoDB está acessível.');
        }

        // Em ambiente de produção, não encerrar o processo para permitir retry
        if (process.env.NODE_ENV === 'production') {
            console.error('Falha na conexão com o MongoDB, mas continuando execução em modo de produção');
            // Tentar novamente após 10 segundos em produção
            setTimeout(() => {
                console.log('Tentando reconectar ao MongoDB após falha...');
                connectDB().catch(err => {
                    console.error('Falha na tentativa de reconexão:', err);
                });
            }, 10000);
            return null;
        } else {
            // Em desenvolvimento, encerrar para notificar o desenvolvedor
            console.error('Encerrando aplicação devido a falha na conexão com o MongoDB');
            process.exit(1);
        }
    }
};

module.exports = connectDB;