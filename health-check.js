// Script para verificar a saúde do servidor e suas dependências
const mongoose = require('mongoose');

/**
 * Verifica a saúde do servidor e suas dependências
 * @returns {Object} Objeto com informações de saúde
 */
const checkHealth = async () => {
    const health = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        memory: process.memoryUsage(),
        dependencies: {
            mongodb: {
                status: 'unknown',
                details: {}
            }
        }
    };

    // Verificar conexão com o MongoDB
    try {
        const isConnected = mongoose.connection.readyState === 1;
        health.dependencies.mongodb.status = isConnected ? 'connected' : 'disconnected';
        health.dependencies.mongodb.details = {
            host: mongoose.connection.host,
            database: mongoose.connection.name,
            readyState: mongoose.connection.readyState
        };

        if (isConnected) {
            try {
                // Tentar uma operação simples para verificar se a conexão está funcionando
                await mongoose.connection.db.admin().ping();
                health.dependencies.mongodb.status = 'healthy';
                health.dependencies.mongodb.details.ping = 'success';
            } catch (pingError) {
                health.dependencies.mongodb.status = 'unhealthy';
                health.dependencies.mongodb.details.ping = 'failed';
                health.dependencies.mongodb.details.pingError = pingError.message;
            }
        }
    } catch (error) {
        health.dependencies.mongodb.status = 'error';
        health.dependencies.mongodb.details.error = error.message;
    }

    // Verificar status geral
    if (health.dependencies.mongodb.status !== 'healthy' && 
        health.dependencies.mongodb.status !== 'connected') {
        health.status = 'degraded';
    }

    return health;
};

module.exports = checkHealth;
