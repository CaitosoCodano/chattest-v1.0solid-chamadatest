/**
 * Sistema de mensagens de voz
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando sistema de mensagens de voz');
    
    // Variáveis para gravação de áudio
    let mediaRecorder = null;
    let audioChunks = [];
    let isRecording = false;
    let recordingTimer = null;
    let recordingDuration = 0;
    
    // Adicionar botão de mensagem de voz ao campo de mensagem
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    
    if (messageInput && sendButton) {
        // Criar container para o botão
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'voice-message-button-container';
        buttonContainer.style.position = 'absolute';
        buttonContainer.style.right = '80px';
        buttonContainer.style.top = '50%';
        buttonContainer.style.transform = 'translateY(-50%)';
        
        // Criar botão
        const voiceButton = document.createElement('button');
        voiceButton.className = 'voice-message-button';
        voiceButton.innerHTML = '🎤';
        voiceButton.title = 'Gravar mensagem de voz';
        voiceButton.style.background = 'none';
        voiceButton.style.border = 'none';
        voiceButton.style.fontSize = '20px';
        voiceButton.style.cursor = 'pointer';
        voiceButton.style.opacity = '0.7';
        voiceButton.style.transition = 'opacity 0.2s, color 0.2s';
        
        // Efeito de hover
        voiceButton.addEventListener('mouseover', function() {
            if (!isRecording) {
                this.style.opacity = '1';
            }
        });
        
        voiceButton.addEventListener('mouseout', function() {
            if (!isRecording) {
                this.style.opacity = '0.7';
            }
        });
        
        // Criar indicador de gravação
        const recordingIndicator = document.createElement('div');
        recordingIndicator.className = 'recording-indicator';
        recordingIndicator.style.display = 'none';
        recordingIndicator.style.position = 'absolute';
        recordingIndicator.style.left = '0';
        recordingIndicator.style.right = '0';
        recordingIndicator.style.top = '-30px';
        recordingIndicator.style.textAlign = 'center';
        recordingIndicator.style.color = '#f44336';
        recordingIndicator.style.fontWeight = 'bold';
        recordingIndicator.textContent = 'Gravando: 0:00';
        
        // Adicionar evento de clique para iniciar/parar gravação
        voiceButton.addEventListener('click', function() {
            if (isRecording) {
                stopRecording();
            } else {
                startRecording();
            }
        });
        
        // Adicionar botão e indicador ao container
        buttonContainer.appendChild(voiceButton);
        buttonContainer.appendChild(recordingIndicator);
        
        // Adicionar container ao campo de mensagem
        messageInput.parentNode.style.position = 'relative';
        messageInput.parentNode.appendChild(buttonContainer);
    }
    
    // Função para iniciar gravação
    async function startRecording() {
        try {
            // Verificar se o navegador suporta gravação de áudio
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                showNotification('Seu navegador não suporta gravação de áudio.');
                return;
            }
            
            // Solicitar permissão para acessar o microfone
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Criar gravador de mídia
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];
            
            // Configurar eventos
            mediaRecorder.ondataavailable = function(e) {
                audioChunks.push(e.data);
            };
            
            mediaRecorder.onstop = function() {
                // Criar blob de áudio
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                
                // Enviar mensagem de voz
                sendVoiceMessage(audioBlob);
                
                // Parar todas as faixas de áudio
                stream.getTracks().forEach(track => track.stop());
            };
            
            // Iniciar gravação
            mediaRecorder.start();
            isRecording = true;
            
            // Atualizar interface
            const voiceButton = document.querySelector('.voice-message-button');
            const recordingIndicator = document.querySelector('.recording-indicator');
            
            if (voiceButton) {
                voiceButton.style.color = '#f44336';
                voiceButton.style.opacity = '1';
                voiceButton.title = 'Parar gravação';
            }
            
            if (recordingIndicator) {
                recordingIndicator.style.display = 'block';
            }
            
            // Iniciar temporizador
            recordingDuration = 0;
            recordingTimer = setInterval(updateRecordingTime, 1000);
            
            showNotification('Gravação iniciada. Clique no microfone para parar.');
        } catch (error) {
            console.error('Erro ao iniciar gravação:', error);
            showNotification('Não foi possível acessar o microfone. Verifique as permissões do navegador.');
        }
    }
    
    // Função para parar gravação
    function stopRecording() {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
            isRecording = false;
            
            // Parar temporizador
            clearInterval(recordingTimer);
            
            // Atualizar interface
            const voiceButton = document.querySelector('.voice-message-button');
            const recordingIndicator = document.querySelector('.recording-indicator');
            
            if (voiceButton) {
                voiceButton.style.color = '';
                voiceButton.style.opacity = '0.7';
                voiceButton.title = 'Gravar mensagem de voz';
            }
            
            if (recordingIndicator) {
                recordingIndicator.style.display = 'none';
            }
        }
    }
    
    // Função para atualizar o tempo de gravação
    function updateRecordingTime() {
        recordingDuration++;
        
        const minutes = Math.floor(recordingDuration / 60);
        const seconds = recordingDuration % 60;
        
        const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        const recordingIndicator = document.querySelector('.recording-indicator');
        if (recordingIndicator) {
            recordingIndicator.textContent = `Gravando: ${timeString}`;
        }
        
        // Limitar gravação a 2 minutos
        if (recordingDuration >= 120) {
            stopRecording();
            showNotification('Tempo máximo de gravação atingido (2 minutos).');
        }
    }
    
    // Função para enviar mensagem de voz
    function sendVoiceMessage(audioBlob) {
        if (!window.currentChatUser) {
            showNotification('Selecione um contato para enviar a mensagem de voz.');
            return;
        }
        
        // Criar URL para o blob de áudio
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Criar elemento de áudio
        const audio = document.createElement('audio');
        audio.src = audioUrl;
        audio.controls = true;
        audio.style.width = '100%';
        audio.style.maxWidth = '300px';
        
        // Criar elemento de mensagem
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            const messageElement = document.createElement('div');
            messageElement.className = 'message sent voice-message';
            
            // Formatar duração
            const minutes = Math.floor(recordingDuration / 60);
            const seconds = recordingDuration % 60;
            const durationString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            messageElement.innerHTML = `
                <div class="message-content">
                    <div class="voice-message-container">
                        <div class="voice-message-icon">🎤</div>
                        <div class="voice-message-player"></div>
                        <div class="voice-message-duration">${durationString}</div>
                    </div>
                    <div class="message-meta">
                        <span class="message-time">${new Date().toLocaleTimeString()}</span>
                    </div>
                </div>
            `;
            
            // Adicionar player de áudio
            const playerContainer = messageElement.querySelector('.voice-message-player');
            playerContainer.appendChild(audio);
            
            // Adicionar mensagem ao chat
            chatMessages.appendChild(messageElement);
            
            // Rolar para a última mensagem
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // Enviar para o servidor (se implementado)
            // Nota: Enviar arquivos de áudio requer implementação adicional no servidor
            if (window.socket) {
                // Converter blob para base64
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = function() {
                    const base64data = reader.result.split(',')[1];
                    
                    // Enviar mensagem de voz
                    window.socket.emit('sendVoiceMessage', {
                        receiverId: window.currentChatUser._id,
                        audioData: base64data,
                        duration: recordingDuration
                    });
                };
            }
        }
    }
    
    // Função para mostrar notificação
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'voice-message-notification';
        notification.textContent = message;
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.left = '50%';
        notification.style.transform = 'translateX(-50%)';
        notification.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        notification.style.color = 'white';
        notification.style.padding = '10px 20px';
        notification.style.borderRadius = '5px';
        notification.style.zIndex = '1000';
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s';
        
        document.body.appendChild(notification);
        
        // Mostrar notificação
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 10);
        
        // Remover notificação após 3 segundos
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
    
    // Interceptar recebimento de mensagens para tratar mensagens de voz
    if (window.socket) {
        window.socket.on('voiceMessage', function(data) {
            // Verificar se é uma mensagem para o chat atual
            if (window.currentChatUser && data.sender._id === window.currentChatUser._id) {
                // Converter base64 para blob
                const binaryString = atob(data.audioData);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                const audioBlob = new Blob([bytes.buffer], { type: 'audio/webm' });
                
                // Criar URL para o blob de áudio
                const audioUrl = URL.createObjectURL(audioBlob);
                
                // Criar elemento de áudio
                const audio = document.createElement('audio');
                audio.src = audioUrl;
                audio.controls = true;
                audio.style.width = '100%';
                audio.style.maxWidth = '300px';
                
                // Criar elemento de mensagem
                const chatMessages = document.getElementById('chatMessages');
                if (chatMessages) {
                    const messageElement = document.createElement('div');
                    messageElement.className = 'message received voice-message';
                    
                    // Formatar duração
                    const minutes = Math.floor(data.duration / 60);
                    const seconds = data.duration % 60;
                    const durationString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                    
                    messageElement.innerHTML = `
                        <div class="message-content">
                            <div class="voice-message-container">
                                <div class="voice-message-icon">🎤</div>
                                <div class="voice-message-player"></div>
                                <div class="voice-message-duration">${durationString}</div>
                            </div>
                            <div class="message-meta">
                                <span class="message-time">${new Date(data.timestamp).toLocaleTimeString()}</span>
                            </div>
                        </div>
                    `;
                    
                    // Adicionar player de áudio
                    const playerContainer = messageElement.querySelector('.voice-message-player');
                    playerContainer.appendChild(audio);
                    
                    // Adicionar mensagem ao chat
                    chatMessages.appendChild(messageElement);
                    
                    // Rolar para a última mensagem
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                    
                    // Marcar como lida
                    window.socket.emit('markAsRead', {
                        senderId: data.sender._id
                    });
                }
            }
        });
    }
});
