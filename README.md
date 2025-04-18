# Chat App

Aplicativo de chat em tempo real com recursos de mensagens, chamadas de voz e compartilhamento de tela.

## Tecnologias

- Node.js
- Express
- Socket.IO
- MongoDB
- WebRTC

## Configuração Local

1. Clone o repositório
2. Instale as dependências: `npm install`
3. Configure o arquivo `.env` com suas variáveis de ambiente
4. Execute o servidor: `npm start`

## Deploy no Render

### Pré-requisitos

- Conta no [Render](https://render.com)
- Banco de dados MongoDB (pode usar [MongoDB Atlas](https://www.mongodb.com/atlas/database))

### Passos para Deploy

1. Crie um novo Web Service no Render
2. Conecte ao seu repositório Git
3. Configure as seguintes variáveis de ambiente no Render:
   - `MONGODB_URI`: URL de conexão do seu banco de dados MongoDB
   - `JWT_SECRET`: Chave secreta para autenticação JWT
   - `PORT`: 10000 (ou a porta que o Render atribuir automaticamente)
4. Use as seguintes configurações:
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`

### Alternativa: Deploy via render.yaml

Este projeto inclui um arquivo `render.yaml` que pode ser usado para configurar automaticamente o deploy no Render.
