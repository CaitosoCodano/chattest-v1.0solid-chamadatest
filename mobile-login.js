/**
 * Script para adaptar a página de login para dispositivos móveis
 */

// Função para detectar dispositivo móvel
function detectMobileDevice() {
    // Verificar se é um dispositivo móvel usando User Agent
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    
    // Regex para detectar dispositivos móveis
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    
    // Verificar se é um dispositivo móvel
    const isMobile = mobileRegex.test(userAgent);
    
    // Verificar se é um dispositivo móvel com base na largura da tela
    const isMobileWidth = window.innerWidth <= 768;
    
    // Determinar se devemos usar a visualização móvel
    const isMobileDevice = isMobile || isMobileWidth;
    
    return isMobileDevice;
}

// Função para adaptar a interface para dispositivos móveis
function adaptLoginForMobile() {
    const isMobileDevice = detectMobileDevice();
    
    if (isMobileDevice) {
        console.log('Adaptando login para dispositivos móveis');
        
        // Adicionar classe ao body
        document.body.classList.add('mobile-view');
        
        // Ajustar largura do container
        const container = document.querySelector('.container');
        if (container) {
            container.style.width = '90%';
            container.style.maxWidth = '400px';
            container.style.padding = '20px';
        }
        
        // Ajustar tamanho dos inputs
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
            input.style.padding = '12px';
            input.style.fontSize = '16px';
        });
        
        // Ajustar tamanho dos botões
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.style.padding = '12px';
            button.style.fontSize = '16px';
        });
        
        // Adicionar meta tag para viewport
        let viewportMeta = document.querySelector('meta[name="viewport"]');
        if (!viewportMeta) {
            viewportMeta = document.createElement('meta');
            viewportMeta.name = 'viewport';
            document.head.appendChild(viewportMeta);
        }
        viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    }
}

// Inicializar quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando adaptação de login para dispositivos móveis');
    
    // Adaptar interface para dispositivos móveis
    adaptLoginForMobile();
    
    // Adicionar evento para redimensionamento da janela
    window.addEventListener('resize', function() {
        adaptLoginForMobile();
    });
});
