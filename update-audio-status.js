/**
 * Funções para atualizar o status do microfone e do alto-falante
 */

// Atualizar status do microfone
function updateMicrophoneStatus(isActive, errorMessage = null) {
    const micStatus = document.getElementById('micStatus');
    if (!micStatus) return;
    
    if (isActive) {
        micStatus.innerHTML = '<i class="fas fa-microphone" style="margin-right: 5px;"></i> Microfone ativo';
        micStatus.style.color = '#4CAF50';
    } else {
        micStatus.innerHTML = `<i class="fas fa-microphone-slash" style="margin-right: 5px;"></i> Microfone ${errorMessage || 'inativo'}`;
        micStatus.style.color = '#ff4d4d';
    }
}

// Atualizar status do alto-falante
function updateSpeakerStatus(isActive, errorMessage = null) {
    const speakerStatus = document.getElementById('speakerStatus');
    if (!speakerStatus) return;
    
    if (isActive) {
        speakerStatus.innerHTML = '<i class="fas fa-volume-up" style="margin-right: 5px;"></i> Alto-falante ativo';
        speakerStatus.style.color = '#4CAF50';
    } else {
        speakerStatus.innerHTML = `<i class="fas fa-volume-mute" style="margin-right: 5px;"></i> Alto-falante ${errorMessage || 'inativo'}`;
        speakerStatus.style.color = '#ff4d4d';
    }
}

// Exportar funções
window.updateMicrophoneStatus = updateMicrophoneStatus;
window.updateSpeakerStatus = updateSpeakerStatus;
