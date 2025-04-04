const jwt = require('jsonwebtoken');

// Gerar token JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'sua_chave_secreta', {
        expiresIn: '30d' // Token expira em 30 dias
    });
};

module.exports = generateToken;
