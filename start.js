// Script de inicialização para o Render
require('dotenv').config();
const { spawn } = require('child_process');
const path = require('path');

// Configurar variáveis de ambiente para produção
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Verificar variáveis de ambiente críticas
console.log('Verificando variáveis de ambiente...');
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    console.warn(`Aviso: As seguintes variáveis de ambiente estão faltando: ${missingVars.join(', ')}`);
    console.warn('O aplicativo pode não funcionar corretamente sem elas.');
} else {
    console.log('Todas as variáveis de ambiente necessárias estão configuradas.');
}

// Iniciar o servidor com tratamento de erros
console.log('Iniciando o servidor...');
const server = spawn('node', ['server.js'], {
    stdio: 'inherit',
    env: process.env
});

server.on('error', (err) => {
    console.error('Erro ao iniciar o servidor:', err);
    process.exit(1);
});

server.on('close', (code) => {
    if (code !== 0) {
        console.error(`O servidor encerrou com código de saída ${code}`);
        process.exit(code);
    }
    console.log('Servidor encerrado normalmente');
});

// Tratamento de sinais para encerramento limpo
process.on('SIGTERM', () => {
    console.log('Recebido SIGTERM, encerrando graciosamente...');
    server.kill('SIGTERM');
});

process.on('SIGINT', () => {
    console.log('Recebido SIGINT, encerrando graciosamente...');
    server.kill('SIGINT');
});

console.log(`Servidor iniciado no ambiente: ${process.env.NODE_ENV}`);
