/**
 * Este arquivo gera um som de chamada usando a Web Audio API
 * como alternativa a baixar um arquivo MP3
 */

// Função para criar um som de chamada
function createRingtone() {
    // Verificar se o navegador suporta a Web Audio API
    if (!window.AudioContext && !window.webkitAudioContext) {
        console.error('Web Audio API não é suportada neste navegador');
        return null;
    }
    
    // Criar contexto de áudio
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContext();
    
    // Função para criar um tom de chamada
    function createTone(frequency, duration) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        
        // Configurar envelope de amplitude
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.1);
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + duration - 0.1);
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration);
        
        // Conectar nós
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        return {
            start: function(time) {
                oscillator.start(time);
                oscillator.stop(time + duration);
            }
        };
    }
    
    // Criar padrão de toque de telefone (dois tons alternados)
    function createRingPattern() {
        const highTone = createTone(1200, 0.5);
        const lowTone = createTone(800, 0.5);
        
        return {
            play: function() {
                const now = audioContext.currentTime;
                highTone.start(now);
                lowTone.start(now + 0.6);
                highTone.start(now + 1.2);
                lowTone.start(now + 1.8);
            }
        };
    }
    
    // Criar som de chamada completo
    const ringPattern = createRingPattern();
    let interval = null;
    
    return {
        play: function() {
            // Tocar o padrão imediatamente
            ringPattern.play();
            
            // Repetir o padrão a cada 3 segundos
            interval = setInterval(() => {
                ringPattern.play();
            }, 3000);
            
            // Retornar o controle do som
            return {
                stop: function() {
                    if (interval) {
                        clearInterval(interval);
                        interval = null;
                    }
                }
            };
        }
    };
}

// Exportar a função para uso global
window.createRingtone = createRingtone;
