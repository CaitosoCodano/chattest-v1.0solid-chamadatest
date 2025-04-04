const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        default: 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
    },
    status: {
        type: String,
        enum: ['offline', 'online', 'away', 'busy', 'invisible', 'custom'],
        default: 'offline'
    },
    customStatus: {
        text: {
            type: String,
            default: ''
        },
        emoji: {
            type: String,
            default: ''
        },
        expiresAt: {
            type: Date,
            default: null
        }
    },
    lastActivity: {
        type: Date,
        default: Date.now
    },
    online: {
        type: Boolean,
        default: false
    },
    // Rastrear última visualização de cada conversa
    lastViewed: {
        type: Map,
        of: Date,
        default: {}
    }
}, {
    timestamps: true
});

// Método para verificar senha
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Middleware para hash da senha antes de salvar
userSchema.pre('save', async function(next) {
    // Só faz hash da senha se ela foi modificada (ou é nova)
    if (!this.isModified('password')) {
        return next();
    }

    // Gerar salt
    const salt = await bcrypt.genSalt(10);
    // Hash da senha
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

module.exports = mongoose.model('User', userSchema);
