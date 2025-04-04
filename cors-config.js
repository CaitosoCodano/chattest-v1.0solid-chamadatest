// Configuração do CORS para o servidor
const corsOptions = {
    origin: function (origin, callback) {
        // Permitir qualquer origem em desenvolvimento
        // Em produção, você pode querer restringir isso
        callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
};

module.exports = corsOptions;
